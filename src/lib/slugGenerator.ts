import { supabase } from '@/integrations/supabase/client';

export function generateSlugFromName(expert: { slug?: string | null; first_name?: string | null; last_name?: string | null; id: string }): string {
  if (expert.slug) return expert.slug;

  const name = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();
  if (!name) return expert.id;

  return name
    .toLowerCase()
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôöő]/g, 'o')
    .replace(/[úùûüű]/g, 'u')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function resolveSlugToId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .eq('is_verified_expert', true)
    .maybeSingle();

  return data?.id || null;
}

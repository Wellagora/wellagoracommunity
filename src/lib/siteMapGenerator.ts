import { supabase } from '@/integrations/supabase/client';
import type { SitemapEntry } from '@/types/seo';

export async function generateSitemapXML(baseUrl: string): Promise<string> {
  try {
    // Get all published programs
    const { data: programs } = await supabase
      .from('expert_contents')
      .select('id, slug, updated_at, is_published')
      .eq('is_published', true);

    // Get all verified experts with profiles
    const { data: experts } = await supabase
      .from('profiles')
      .select('id, slug, is_verified_expert, updated_at')
      .eq('is_verified_expert', true);

    // Static pages (always include)
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'weekly' as const },
      { path: '/programs', priority: 0.8, changefreq: 'daily' as const },
      { path: '/community', priority: 0.7, changefreq: 'weekly' as const },
      { path: '/events', priority: 0.7, changefreq: 'weekly' as const },
      { path: '/contact', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/help', priority: 0.5, changefreq: 'monthly' as const },
    ];

    const entries: SitemapEntry[] = [];

    // Add static pages
    staticPages.forEach(page => {
      entries.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });

    // Add expert profile pages
    experts?.forEach(expert => {
      entries.push({
        loc: `${baseUrl}/expert/${expert.slug || expert.id}`,
        lastmod: expert.updated_at || new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      });
    });

    // Add program detail pages
    programs?.forEach(program => {
      entries.push({
        loc: `${baseUrl}/programs/${program.slug || program.id}`,
        lastmod: program.updated_at || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    });

    return generateSitemapXMLString(entries);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

function generateSitemapXMLString(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlset = entries
    .map(entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`)
    .join('\n');

  return `${xmlHeader}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

import { supabase } from '@/integrations/supabase/client';

export type TranslationLocale = 'hu' | 'en' | 'de';

type TranslateContentRequest = {
  text: string;
  targetLanguages: Array<Exclude<TranslationLocale, 'hu'>>;
};

type TranslateContentResponse = Record<string, string>;

export async function translateContent(req: TranslateContentRequest): Promise<TranslateContentResponse> {
  const { data, error } = await supabase.functions.invoke('translate-content', {
    body: req,
  });

  if (error) throw error;

  const translations = (data as any)?.translations ?? data;
  return (translations || {}) as TranslateContentResponse;
}

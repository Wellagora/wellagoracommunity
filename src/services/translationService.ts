import { supabase } from '@/integrations/supabase/client';

interface TranslationResult {
  en: string;
  de: string;
}

/**
 * Translate Hungarian text to English and German using Lovable AI
 */
export async function translateText(hungarianText: string): Promise<TranslationResult> {
  if (!hungarianText || hungarianText.trim() === '') {
    return { en: '', de: '' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-content', {
      body: {
        text: hungarianText,
        targetLanguages: ['en', 'de']
      }
    });

    if (error) {
      console.error('Translation function error:', error);
      return { en: hungarianText, de: hungarianText };
    }

    return {
      en: data?.en || hungarianText,
      de: data?.de || hungarianText
    };
  } catch (error) {
    console.error('Translation error:', error);
    return { en: hungarianText, de: hungarianText };
  }
}

/**
 * Translate expert content (title and description) and save to database
 */
export async function translateContent(
  contentId: string,
  title: string,
  description: string
): Promise<void> {
  try {
    const [titleTranslations, descTranslations] = await Promise.all([
      translateText(title),
      translateText(description)
    ]);

    const { error } = await supabase
      .from('expert_contents')
      .update({
        title_en: titleTranslations.en,
        title_de: titleTranslations.de,
        description_en: descTranslations.en,
        description_de: descTranslations.de
      })
      .eq('id', contentId);

    if (error) {
      console.error('Failed to save content translations:', error);
    }
  } catch (error) {
    console.error('Content translation error:', error);
  }
}

/**
 * Translate expert profile fields (specialty/bio) and save to database
 */
export async function translateExpertProfile(
  profileId: string,
  expertTitle?: string,
  bio?: string
): Promise<void> {
  try {
    const updates: Record<string, string> = {};
    
    if (expertTitle) {
      const titleTrans = await translateText(expertTitle);
      updates.expert_title_en = titleTrans.en;
      updates.expert_title_de = titleTrans.de;
    }
    
    if (bio) {
      const bioTrans = await translateText(bio);
      updates.bio_en = bioTrans.en;
      updates.bio_de = bioTrans.de;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) {
        console.error('Failed to save profile translations:', error);
      }
    }
  } catch (error) {
    console.error('Profile translation error:', error);
  }
}

/**
 * Batch translate all untranslated content (admin function)
 */
export async function translateAllUntranslatedContent(): Promise<{
  contentsTranslated: number;
  profilesTranslated: number;
}> {
  let contentsTranslated = 0;
  let profilesTranslated = 0;

  // Translate expert contents
  const { data: contents } = await supabase
    .from('expert_contents')
    .select('id, title, description')
    .is('title_en', null)
    .not('title', 'is', null);

  for (const content of contents || []) {
    if (content.title) {
      await translateContent(content.id, content.title, content.description || '');
      contentsTranslated++;
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Translate expert profiles
  const { data: experts } = await supabase
    .from('profiles')
    .select('id, expert_title, bio')
    .is('expert_title_en', null)
    .not('expert_title', 'is', null);

  for (const expert of experts || []) {
    if (expert.expert_title) {
      await translateExpertProfile(expert.id, expert.expert_title, expert.bio || undefined);
      profilesTranslated++;
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return { contentsTranslated, profilesTranslated };
}

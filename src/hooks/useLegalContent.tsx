import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LegalSection {
  id: string;
  section_key: string;
  translations: Record<string, string>;
  display_order: number;
}

export const useLegalContent = (contentType: 'impressum' | 'privacy_policy', language: string) => {
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [contentType, language]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_content')
        .select('id, section_key, translations, display_order')
        .eq('content_type', contentType)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSections((data as LegalSection[]) || []);
    } catch (error) {
      console.error('Error loading legal content:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const getTranslation = (section: LegalSection): string => {
    return section.translations[language] || section.translations['en'] || '';
  };

  return { sections, loading, getTranslation };
};
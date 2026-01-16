import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type LocalizedRecord = Record<string, unknown>;

/**
 * Hook for accessing localized content from database records
 * Automatically returns the correct language version based on current locale
 * 
 * Database Schema:
 * - Base field (e.g., 'title') = Hungarian (HU) content
 * - Suffix fields (e.g., 'title_en', 'title_de') = Translated content
 * 
 * Priority chain:
 * - HU: base field → (no fallback needed, it IS Hungarian)
 * - EN: field_en → base field (Hungarian fallback)
 * - DE: field_de → base field (Hungarian fallback)
 */
export function useLocalizedContent() {
  const { language } = useLanguage();

  /**
   * Get a localized field value from a database record
   * Tries language-specific field first, falls back to base field (Hungarian)
   */
  const getLocalizedField = useCallback((
    item: LocalizedRecord | null | undefined,
    fieldName: string
  ): string => {
    if (!item) return '';
    
    // For Hungarian - the base field IS Hungarian, use it directly
    if (language === 'hu') {
      const huValue = item[fieldName];
      // Return base field for Hungarian
      return typeof huValue === 'string' ? huValue : '';
    }
    
    // For English, try _en suffix first
    if (language === 'en') {
      const enValue = item[`${fieldName}_en`];
      if (enValue && typeof enValue === 'string' && enValue.trim() !== '') {
        return enValue;
      }
    }
    
    // For German, try _de suffix first
    if (language === 'de') {
      const deValue = item[`${fieldName}_de`];
      if (deValue && typeof deValue === 'string' && deValue.trim() !== '') {
        return deValue;
      }
    }
    
    // Fallback to base field (Hungarian) for all languages
    const baseValue = item[fieldName];
    return typeof baseValue === 'string' ? baseValue : '';
  }, [language]);

  /**
   * Get multiple localized fields at once
   */
  const getLocalizedFields = useCallback((
    item: LocalizedRecord | null | undefined,
    fieldNames: string[]
  ): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const field of fieldNames) {
      result[field] = getLocalizedField(item, field);
    }
    return result;
  }, [getLocalizedField]);

  /**
   * Check if translated content exists for a field
   */
  const hasTranslation = useCallback((
    item: LocalizedRecord | null | undefined,
    fieldName: string
  ): boolean => {
    if (!item) return false;
    
    if (language === 'en') {
      const val = item[`${fieldName}_en`];
      return typeof val === 'string' && val.trim() !== '';
    }
    if (language === 'de') {
      const val = item[`${fieldName}_de`];
      return typeof val === 'string' && val.trim() !== '';
    }
    
    // Hungarian always has translation (it's the base/original)
    return true;
  }, [language]);

  return {
    language,
    getLocalizedField,
    getLocalizedFields,
    hasTranslation
  };
}

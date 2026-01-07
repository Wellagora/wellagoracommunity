import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import huTranslations from '@/locales/hu.json';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';
import { logger } from '@/lib/logger';

export type Language = 'hu' | 'en' | 'de';

const translations: Record<Language, any> = {
  hu: huTranslations,
  en: enTranslations,
  de: deTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('hu');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved && ['hu', 'en', 'de'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch (error) {
      logger.warn('Failed to read language from localStorage', error, 'Language');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      logger.warn('Failed to save language to localStorage', error, 'Language');
    }
  };

  const t = (key: string): string => {
    const langTranslations = translations[language] || {};
    const fallbackTranslations = translations['en'] || {}; // English as fallback
    const baseFallbackTranslations = translations['hu'] || {}; // Hungarian as final fallback

    // Helper function to find value in a translation object
    const findValue = (obj: any, searchKey: string): string | undefined => {
      // Try flat key lookup first (e.g., "nav.home")
      if (obj && searchKey in obj) {
        const val = obj[searchKey];
        if (typeof val === 'string') {
          return val;
        }
      }

      // Fallback: try nested object lookup (e.g., { nav: { home: "..." } })
      const segments = searchKey.split('.');
      let val: any = obj;

      for (const segment of segments) {
        if (val && typeof val === 'object' && segment in val) {
          val = val[segment];
        } else {
          return undefined;
        }
      }

      return typeof val === 'string' ? val : undefined;
    };

    // Try current language first
    let result = findValue(langTranslations, key);
    if (result) return result;

    // Fallback to English
    result = findValue(fallbackTranslations, key);
    if (result) return result;

    // Final fallback to Hungarian
    result = findValue(baseFallbackTranslations, key);
    if (result) return result;

    // Key not found anywhere - return the key itself
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  // Return fallback if context is not available (outside provider or during HMR)
  if (!context) {
    console.warn('useLanguage called outside of LanguageProvider, using fallback');
    return {
      language: 'hu' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      isLoading: false,
    };
  }
  
  return context;
};

export const useTranslation = useLanguage;

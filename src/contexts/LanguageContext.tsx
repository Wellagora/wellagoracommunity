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

    // First try flat key lookup (e.g., "nav.home")
    if (langTranslations && typeof langTranslations[key] === 'string') {
      return langTranslations[key] as string;
    }

    // Then try nested object lookup (e.g., { nav: { home: "..." } })
    const segments = key.split('.');
    let value: Record<string, unknown> | string | undefined = langTranslations as Record<string, unknown>;

    for (const segment of segments) {
      if (value && typeof value === 'object' && segment in value) {
        value = (value as Record<string, unknown>)[segment] as Record<string, unknown> | string | undefined;
      } else {
        logger.debug('Translation missing', { key, language }, 'Language');
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
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

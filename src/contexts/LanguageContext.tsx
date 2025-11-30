import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import huTranslations from '@/locales/hu.json';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';

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
      console.warn('Failed to read language from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage', error);
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
    let value: any = langTranslations;

    for (const segment of segments) {
      value = value?.[segment];
      if (value === undefined || value === null) {
        console.warn(`Translation missing: ${key} (${language})`);
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
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;

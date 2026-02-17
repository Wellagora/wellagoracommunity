import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import huTranslations from '@/locales/hu.json';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';
import adminHuTranslations from '@/locales/admin.hu.json';
import adminEnTranslations from '@/locales/admin.en.json';
import adminDeTranslations from '@/locales/admin.de.json';
import { logger } from '@/lib/logger';

export type Language = 'hu' | 'en' | 'de';

// Merge main translations with admin translations
const translations: Record<Language, any> = {
  hu: { ...huTranslations, ...adminHuTranslations },
  en: { ...enTranslations, ...adminEnTranslations },
  de: { ...deTranslations, ...adminDeTranslations },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default to Hungarian — primary target market
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

  // Update browser tab title and HTML lang attribute when language changes
  useEffect(() => {
    const titles: Record<Language, string> = {
      hu: 'WellAgora — Fenntartható közösségek, megosztott tudás',
      en: 'WellAgora — Sustainable Communities, Shared Knowledge',
      de: 'WellAgora — Nachhaltige Gemeinschaften, Geteiltes Wissen',
    };
    document.title = titles[language];
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      logger.warn('Failed to save language to localStorage', error, 'Language');
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langTranslations = translations[language] || {};
    const fallbackTranslations = translations['en'] || {}; // English as fallback
    const baseFallbackTranslations = translations['hu'] || {}; // Hungarian as final fallback

    // Helper function to find value in a translation object
    const findValue = (obj: any, searchKey: string): string | undefined => {
      if (!obj) return undefined;

      // Try exact flat key match first (e.g., "nav.home" as a single key)
      if (searchKey in obj) {
        const val = obj[searchKey];
        if (typeof val === 'string') {
          return val;
        }
      }

      // Try progressively longer flat key prefixes with nested navigation
      // e.g., for "expert_studio.cards.programs.title":
      // - Try "expert_studio.cards.programs.title" (done above)
      // - Try "expert_studio.cards.programs" then navigate ["title"]
      // - Try "expert_studio.cards" then navigate ["programs", "title"]
      // - Try "expert_studio" then navigate ["cards", "programs", "title"]
      const segments = searchKey.split('.');
      
      for (let i = segments.length - 1; i > 0; i--) {
        const flatKey = segments.slice(0, i).join('.');
        const remainingSegments = segments.slice(i);
        
        if (flatKey in obj) {
          let val = obj[flatKey];
          
          // Navigate remaining segments
          for (const segment of remainingSegments) {
            if (val && typeof val === 'object' && segment in val) {
              val = val[segment];
            } else {
              val = undefined;
              break;
            }
          }
          
          if (typeof val === 'string') {
            return val;
          }
        }
      }

      // Finally, try pure nested object lookup (e.g., { expert: { studio: { ... } } })
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

    // Fallback to English
    if (!result) result = findValue(fallbackTranslations, key);

    // Final fallback to Hungarian
    if (!result) result = findValue(baseFallbackTranslations, key);

    // Key not found anywhere - return the key itself
    if (!result) return key;

    // Interpolate {{variable}} placeholders
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }

    return result;
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
    // useLanguage called outside of LanguageProvider, using fallback
    return {
      language: 'hu' as Language, // Default to Hungarian — primary target market
      setLanguage: () => {},
      t: (key: string, _params?: Record<string, string | number>) => key,
      isLoading: false,
    };
  }
  
  return context;
};

export const useTranslation = useLanguage;

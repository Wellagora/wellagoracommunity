import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'de' | 'hu' | 'cs' | 'sk' | 'hr' | 'ro' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation cache
const translationCache: Record<Language, Record<string, string>> = {} as any;

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  // Load translations for a specific language
  const loadTranslations = async (lang: Language) => {
    if (translationCache[lang]) {
      setTranslations(translationCache[lang]);
      return;
    }

    try {
      const module = await import(`@/locales/${lang}.json`);
      const loadedTranslations = module.default;
      translationCache[lang] = loadedTranslations;
      setTranslations(loadedTranslations);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English
      if (lang !== 'en') {
        loadTranslations('en');
      }
    }
  };

  // Initialize language from user profile or browser
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      let initialLang: Language = 'en';
      
      if (profile && (profile as any).preferred_language) {
        initialLang = (profile as any).preferred_language as Language;
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0] as Language;
        const supportedLanguages: Language[] = ['en', 'de', 'hu', 'cs', 'sk', 'hr', 'ro', 'pl'];
        if (supportedLanguages.includes(browserLang)) {
          initialLang = browserLang;
        }
      }
      
      setLanguageState(initialLang);
      await loadTranslations(initialLang);
      setIsLoading(false);
    };

    initializeLanguage();
  }, [profile]);

  // Update language and save to database
  const setLanguage = async (lang: Language) => {
    setIsLoading(true);
    setLanguageState(lang);
    await loadTranslations(lang);
    
    // Save to user profile if authenticated
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: lang })
          .eq('id', user.id);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
    
    setIsLoading(false);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};
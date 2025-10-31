import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Supported language codes for the application
type Language = 'en' | 'de' | 'hu' | 'cs' | 'sk' | 'hr' | 'ro' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

// Create the context with undefined as default
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation cache
const translationCache: Record<Language, Record<string, string>> = {} as any;

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.error('useLanguage hook called outside LanguageProvider');
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Get auth state independently
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
    }
  }, [user]);

  // Load translations for a specific language
  const loadTranslations = async (lang: Language) => {
    if (translationCache[lang]) {
      setTranslations(translationCache[lang]);
      return;
    }

    try {
      // Load main translations
      const mainModule = await import(`@/locales/${lang}.json`);
      let loadedTranslations = { ...mainModule.default };
      
      // Try to load admin translations if available
      try {
        const adminModule = await import(`@/locales/admin.${lang}.json`);
        loadedTranslations = { ...loadedTranslations, ...adminModule.default };
      } catch {
        // Admin translations not available for this language, skip
      }
      
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

  const value = { language, setLanguage, t, isLoading };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
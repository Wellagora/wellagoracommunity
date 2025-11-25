import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Supported language codes for the application
type Language = 'en' | 'de' | 'hu' | 'cs' | 'sk' | 'hr' | 'ro' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

// Create the context with a default value
const defaultContextValue: LanguageContextType = {
  language: 'hu',
  setLanguage: async () => {},
  t: (key: string) => key,
  isLoading: true
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

// Translation cache
const translationCache: Record<Language, Record<string, string>> = {} as any;

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hu');
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
        .maybeSingle()
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
      // Load main translations - Vite imports JSON directly without .default
      const mainModule = await import(`@/locales/${lang}.json`);
      let loadedTranslations = mainModule.default || mainModule;
      
      // Try to load admin translations if available
      try {
        const adminModule = await import(`@/locales/admin.${lang}.json`);
        const adminTranslations = adminModule.default || adminModule;
        loadedTranslations = { ...loadedTranslations, ...adminTranslations };
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
      
      let initialLang: Language = 'hu';
      
      if (profile && (profile as any).preferred_language) {
        initialLang = (profile as any).preferred_language as Language;
      } else if (!profile) {
        // If not authenticated, try to detect from browser or default to Hungarian
        const browserLang = navigator.language.split('-')[0] as Language;
        const supportedLangs: Language[] = ['en', 'de', 'hu', 'cs', 'sk', 'hr', 'ro', 'pl'];
        initialLang = supportedLangs.includes(browserLang) ? browserLang : 'hu';
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

  // Translation function with fallback to English
  const t = (key: string): string => {
    // First try the current language
    if (translations[key]) {
      return translations[key];
    }
    
    // Fallback to English if available
    if (translationCache['en']?.[key]) {
      return translationCache['en'][key];
    }
    
    // Return key if no translation found
    return key;
  };

  const value = { language, setLanguage, t, isLoading };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
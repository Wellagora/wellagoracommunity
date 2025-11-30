import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Supported language codes for the application
type Language = 'en' | 'de' | 'hu';

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

// Supported languages for easy reference
const SUPPORTED_LANGUAGES: Language[] = ['en', 'de', 'hu'];

// Language mapping for browser language detection
const LANGUAGE_MAP: Record<string, Language> = {
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en', 'en-AU': 'en',
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de', 'de-CH': 'de',
  'hu': 'hu', 'hu-HU': 'hu',
};

// Detect browser language with fallback
const detectBrowserLanguage = (): Language => {
  try {
    // Try navigator.languages first (more accurate)
    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        // Try exact match first
        if (LANGUAGE_MAP[lang]) {
          return LANGUAGE_MAP[lang];
        }
        // Try base language (e.g., 'en' from 'en-US')
        const baseLang = lang.split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(baseLang as Language)) {
          return baseLang as Language;
        }
      }
    }
    
    // Fallback to navigator.language
    const browserLang = navigator.language;
    if (LANGUAGE_MAP[browserLang]) {
      return LANGUAGE_MAP[browserLang];
    }
    
    const baseLang = browserLang.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(baseLang as Language)) {
      return baseLang as Language;
    }
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
  }
  
  // Default to Hungarian
  return 'hu';
};

// LocalStorage key for language preference
const LANGUAGE_STORAGE_KEY = 'wellagora_language';

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

  // Initialize language with priority chain
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      let initialLang: Language;
      
      // Priority chain: User Profile → LocalStorage → Browser → Default (en)
      if (profile && (profile as any).preferred_language) {
        // 1. User has set a preferred language in their profile (highest priority)
        initialLang = (profile as any).preferred_language as Language;
        // Update localStorage to match profile
        localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLang);
      } else if (!user) {
        // 2. Not authenticated - check localStorage first, then browser
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as Language)) {
          initialLang = storedLang as Language;
        } else {
          // 3. Detect from browser
          initialLang = detectBrowserLanguage();
          localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLang);
        }
      } else {
        // 4. Authenticated but no preferred_language set - use browser detection
        initialLang = detectBrowserLanguage();
        // Save detected language to user profile
        try {
          await supabase
            .from('profiles')
            .update({ preferred_language: initialLang })
            .eq('id', user.id);
        } catch (error) {
          console.error('Failed to save auto-detected language:', error);
        }
      }
      
      setLanguageState(initialLang);
      await loadTranslations(initialLang);
      setIsLoading(false);
    };

    initializeLanguage();
  }, [profile, user]);

  // Update language and save to profile/localStorage
  const setLanguage = async (lang: Language) => {
    setIsLoading(true);
    setLanguageState(lang);
    await loadTranslations(lang);
    
    // Save to localStorage for non-authenticated users
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    
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
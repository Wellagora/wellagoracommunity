import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Temporary hardcoded translations for seed events
 * This will be replaced by database fields once auto-translation is implemented
 */
const EVENT_TRANSLATIONS: Record<string, { 
  title: { en: string; de: string }; 
  description?: { en: string; de: string } 
}> = {
  "Wellness Hétvége": {
    title: { en: "Wellness Weekend", de: "Wellness-Wochenende" },
    description: { 
      en: "Two days of wellbeing and relaxation.", 
      de: "Zwei Tage Wohlbefinden und Entspannung." 
    }
  },
  "Közösségi Főzés": {
    title: { en: "Community Cooking", de: "Gemeinschaftskochen" },
    description: { 
      en: "Online community cooking program.", 
      de: "Online-Gemeinschaftskochprogramm." 
    }
  },
  "Tavaszi Kertészkedés": {
    title: { en: "Spring Gardening", de: "Frühlingsgärtnerei" },
    description: { 
      en: "Practical gardening in the Káli Basin.", 
      de: "Praktisches Gärtnern im Káli-Becken." 
    }
  },
  "Közösségi kertészkedés": {
    title: { en: "Community Gardening", de: "Gemeinschaftsgärtnern" },
    description: {
      en: "Spring planting in the community garden.",
      de: "Frühlingsanbau im Gemeinschaftsgarten."
    }
  },
  "Káli történetmesélés": {
    title: { en: "Káli Storytelling", de: "Káli Geschichtenerzählen" },
    description: {
      en: "Sharing local stories and memories.",
      de: "Austausch von lokalen Geschichten und Erinnerungen."
    }
  },
  "Zero Waste Workshop": {
    title: { en: "Zero Waste Workshop", de: "Zero Waste Workshop" },
    description: {
      en: "Learn the zero waste lifestyle.",
      de: "Lerne den Zero-Waste-Lebensstil."
    }
  }
};

interface LocalizedEventData {
  title: string;
  title_en?: string | null;
  title_de?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_de?: string | null;
}

/**
 * Hook to get localized event title and description
 * First checks database fields (title_en, title_de), 
 * then falls back to hardcoded translations for seed events,
 * finally falls back to Hungarian original
 */
export function useLocalizedEvent() {
  const { language } = useLanguage();

  const getLocalizedTitle = (event: LocalizedEventData): string => {
    if (language === "hu") return event.title;

    // First try database fields
    if (language === "en" && event.title_en) return event.title_en;
    if (language === "de" && event.title_de) return event.title_de;

    // Fallback to hardcoded translations for seed events
    const translation = EVENT_TRANSLATIONS[event.title];
    if (translation) {
      return language === "en" ? translation.title.en : translation.title.de;
    }

    // Final fallback: return Hungarian
    return event.title;
  };

  const getLocalizedDescription = (event: LocalizedEventData): string | null => {
    if (!event.description) return null;
    if (language === "hu") return event.description;

    // First try database fields
    if (language === "en" && event.description_en) return event.description_en;
    if (language === "de" && event.description_de) return event.description_de;

    // Fallback to hardcoded translations for seed events
    const translation = EVENT_TRANSLATIONS[event.title];
    if (translation?.description) {
      return language === "en" ? translation.description.en : translation.description.de;
    }

    // Final fallback: return Hungarian
    return event.description;
  };

  return { getLocalizedTitle, getLocalizedDescription };
}

export default useLocalizedEvent;

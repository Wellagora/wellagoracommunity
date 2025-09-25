import { useState, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  // Update selected language when context language changes
  useEffect(() => {
    const lang = languages.find(l => l.code === language) || languages[0];
    setSelectedLanguage(lang);
  }, [language]);

  const handleLanguageSelect = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    setLanguage(language.code as any);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-glass backdrop-blur-md border border-white/20 rounded-xl hover:border-primary/40 transition-all duration-300 text-white"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:block">{selectedLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-premium min-w-[180px] z-50 overflow-hidden">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors ${
                selectedLanguage.code === language.code ? 'bg-primary/20 text-primary' : 'text-foreground'
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
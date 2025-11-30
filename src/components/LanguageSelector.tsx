import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSelector = () => {
  const { language, setLanguage, isLoading } = useLanguage();
  
  const selectedLanguage = languages.find(l => l.code === language) || languages[0];

  const handleLanguageSelect = async (langCode: string) => {
    if (langCode !== language && !isLoading) {
      await setLanguage(langCode as any);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 hover:bg-accent/10 transition-colors"
          disabled={isLoading}
        >
          <Globe className="w-4 h-4" />
          <span className="text-base">{selectedLanguage.flag}</span>
          <span className="font-medium">{selectedLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
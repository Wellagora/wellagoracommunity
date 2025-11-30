import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

type Language = 'en' | 'de' | 'hu';

const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  'hu': { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  'en': { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  'de': { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
};

export const LanguageSwitcher = () => {
  const { language, setLanguage, isLoading } = useLanguage();

  const handleLanguageChange = async (lang: Language) => {
    if (lang !== language && !isLoading) {
      await setLanguage(lang);
    }
  };

  const currentLanguage = LANGUAGES[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-accent/10 transition-colors"
          disabled={isLoading}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.nativeName}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(LANGUAGES) as Language[]).map((lang) => {
          const langInfo = LANGUAGES[lang];
          const isActive = language === lang;
          
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{langInfo.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{langInfo.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{langInfo.name}</span>
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

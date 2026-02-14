import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface WellBotWidgetProps {
  children: React.ReactNode;
}

const CONTEXT_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  '/': {
    hu: ['Hogyan működik a WellAgora?', 'Milyen programok lesznek?', 'Szeretnék szakértő lenni'],
    en: ['How does WellAgora work?', 'What programs will be available?', 'I want to become an expert'],
    de: ['Wie funktioniert WellAgora?', 'Welche Programme wird es geben?', 'Ich möchte Experte werden'],
  },
  '/piacer': {
    hu: ['Milyen programot ajánlasz?', 'Melyik szakértő foglalkozik kertészkedéssel?'],
    en: ['Which program do you recommend?', 'Which expert does gardening?'],
    de: ['Welches Programm empfiehlst du?', 'Welcher Experte beschäftigt sich mit Gärtnern?'],
  },
  '/programs': {
    hu: ['Milyen programot ajánlasz?', 'Melyik szakértő foglalkozik kertészkedéssel?'],
    en: ['Which program do you recommend?', 'Which expert does gardening?'],
    de: ['Welches Programm empfiehlst du?', 'Welcher Experte beschäftigt sich mit Gärtnern?'],
  },
  '/events': {
    hu: ['Mikor lesz a következő esemény?', 'Hogyan szervezhetek eseményt?'],
    en: ['When is the next event?', 'How can I organize an event?'],
    de: ['Wann ist die nächste Veranstaltung?', 'Wie kann ich eine Veranstaltung organisieren?'],
  },
  '/community': {
    hu: ['Hogyan írhatok posztot?', 'Ki az aktív a közösségben?'],
    en: ['How can I write a post?', 'Who is active in the community?'],
    de: ['Wie kann ich einen Beitrag schreiben?', 'Wer ist aktiv in der Community?'],
  },
  '/expert-studio': {
    hu: ['Hogyan hozzak létre programot?', 'Milyen árat érdemes kérni?', 'Hogyan működik a Stripe?'],
    en: ['How do I create a program?', 'What price should I set?', 'How does Stripe work?'],
    de: ['Wie erstelle ich ein Programm?', 'Welchen Preis soll ich festlegen?', 'Wie funktioniert Stripe?'],
  },
  '/profile': {
    hu: ['Hogyan töltsem ki a profilomat?', 'Mit jelent a WellPont?'],
    en: ['How should I fill out my profile?', 'What are WellPoints?'],
    de: ['Wie fülle ich mein Profil aus?', 'Was sind WellPunkte?'],
  },
};

function getSuggestions(pathname: string, lang: string): string[] {
  const key = Object.keys(CONTEXT_SUGGESTIONS).find(k => pathname.startsWith(k) && k !== '/') || '/';
  const langKey = lang === 'hu' ? 'hu' : lang === 'de' ? 'de' : 'en';
  return CONTEXT_SUGGESTIONS[key]?.[langKey] || CONTEXT_SUGGESTIONS['/'][langKey];
}

export function WellBotWidget({ children }: WellBotWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('wellbot-open') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUsed, setHasUsed] = useState(() => !!localStorage.getItem('wellbot-used'));
  const location = useLocation();
  const { language } = useLanguage();
  const { user, profile } = useAuth();

  useEffect(() => {
    localStorage.setItem('wellbot-open', isOpen.toString());
    if (isOpen && !hasUsed) {
      localStorage.setItem('wellbot-used', 'true');
      setHasUsed(true);
    }
  }, [isOpen, hasUsed]);

  // Auto-open for new users (onboarding)
  useEffect(() => {
    if (user && profile && !localStorage.getItem('wellbot_onboarding_done')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('wellbot_onboarding_done', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const suggestions = getSuggestions(location.pathname, language);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-breathe flex items-center justify-center group"
        aria-label="Open WellBot"
        title={language === 'hu' ? 'Kérdezz a WellBot-tól!' : language === 'de' ? 'Frag den WellBot!' : 'Ask WellBot!'}
      >
        <Bot className="h-7 w-7" />
        {!hasUsed && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
            1
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 border border-gray-200/50",
        isFullscreen 
          ? "inset-4" 
          : isMinimized 
            ? "bottom-6 right-6 w-80 h-14"
            : "bottom-6 right-6 w-[380px] h-[500px] max-h-[80vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">WellBot</span>
          <span className="flex items-center gap-1 text-xs text-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
            Online
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            aria-label={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
          {/* Context-aware suggestion chips */}
          <div className="flex-shrink-0 px-3 py-2 border-t bg-gray-50/80 flex gap-2 overflow-x-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  const textarea = document.querySelector<HTMLTextAreaElement>('.wellbot-widget textarea');
                  if (textarea) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                    nativeInputValueSetter?.call(textarea, s);
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => {
                      const form = textarea.closest('form');
                      const sendBtn = textarea.parentElement?.querySelector('button[type="submit"], button:last-child') as HTMLButtonElement;
                      if (sendBtn && !sendBtn.disabled) sendBtn.click();
                    }, 100);
                  }
                }}
                className="flex-shrink-0 text-xs px-3 py-1.5 bg-white border border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-400 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

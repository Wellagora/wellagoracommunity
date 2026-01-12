import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  Users,
  MapPin
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import WellBotAvatar from "./WellBotAvatar";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIAssistantChat = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isDemoMode } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarMood, setAvatarMood] = useState<"neutral" | "thinking" | "happy" | "greeting">("greeting");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset greeting after initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvatarMood("neutral");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Conversational response prefixes for humanization
  const getConversationalPrefix = (): string => {
    const prefixes = language === 'hu' 
      ? [
          'Szerintem számodra ez érdekes lehet... ',
          'A mi 127 tagunk közül sokan szeretik ezt... ',
          'Hadd mutassam be neked... ',
          'Örömmel segítek! '
        ]
      : language === 'de'
      ? [
          'Ich denke, das könnte dich interessieren... ',
          'Viele unserer 127 Mitglieder mögen das... ',
          'Lass mich dir zeigen... ',
          'Ich helfe dir gerne! '
        ]
      : [
          'I think this might interest you... ',
          'Many of our 127 members love this... ',
          'Let me show you... ',
          'Happy to help! '
        ];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  };

  // Community Concierge Intelligence - Enhanced demo responses with humanized tone
  const getDemoResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    const prefix = getConversationalPrefix();
    
    // Expert recommendations based on topic
    if (lowerMsg.includes('kenyér') || lowerMsg.includes('kovász') || lowerMsg.includes('bread') || lowerMsg.includes('baking') || lowerMsg.includes('brot')) {
      setAvatarMood("happy");
      return language === 'hu' 
        ? `${prefix}🍞 Kovács János a mi kenyérsütő mesterünk! A közösség kedvence - 127 tagunk közül sokan már elvégezték a kovászkenyér kurzusát. A Káli Panzió szponzorációjának köszönhetően most ingyen kipróbálhatod!\n\n👉 Nézd meg a Programok oldalon!`
        : language === 'de'
        ? `${prefix}🍞 János Kovács ist unser Brotback-Meister! Der Liebling der Gemeinschaft - viele unserer 127 Mitglieder haben seinen Kurs absolviert. Dank Káli Panzió kannst du ihn kostenlos ausprobieren!\n\n👉 Schau auf der Programm-Seite!`
        : `${prefix}🍞 János Kovács is our bread baking master! A community favorite - many of our 127 members have completed his course. Thanks to Káli Panzió sponsorship, you can try it for free!\n\n👉 Check the Programs page!`;
    }
    
    if (lowerMsg.includes('gyógynövény') || lowerMsg.includes('herb') || lowerMsg.includes('kräuter') || lowerMsg.includes('kert') || lowerMsg.includes('garden')) {
      setAvatarMood("happy");
      return language === 'hu'
        ? `${prefix}🌿 Sophie Wagner a mi gyógynövény-szakértőnk! Imádják a tagjaink - különösen a balatoni táj növényvilágáról tud mesélni órákig. 5 szponzorunk támogatásával ingyenes túrákat is tart!\n\n👉 Ismerkedj meg vele a Szakértők galériában!`
        : language === 'de'
        ? `${prefix}🌿 Sophie Wagner ist unsere Kräuter-Expertin! Unsere Mitglieder lieben sie - sie kann stundenlang über die Pflanzenwelt der Balaton-Region erzählen. Mit Unterstützung unserer 5 Sponsoren bietet sie kostenlose Touren!\n\n👉 Lerne sie in der Experten-Galerie kennen!`
        : `${prefix}🌿 Sophie Wagner is our herbs expert! Our members love her - she can talk for hours about the plant life of the Balaton region. With support from our 5 sponsors, she offers free tours!\n\n👉 Meet her in the Experts Gallery!`;
    }

    // Voucher/Coupon explanation
    if (lowerMsg.includes('kupon') || lowerMsg.includes('voucher') || lowerMsg.includes('gutschein') || lowerMsg.includes('hogyan működik')) {
      setAvatarMood("happy");
      return language === 'hu'
        ? `${prefix}🎫 Ez az egyik kedvenc témám! A kuponrendszerünk összeköti a közösséget:\n\n🏨 **Szponzorok** (pl. Káli Panzió) krediteket vásárolnak\n👤 **Tagok** (mint Te!) ingyenes kuponokat kapnak\n🎓 **Szakértők** megkapják a programdíjat\n\nÍgy mindenki nyer - a tudás körforgásban marad a közösségben! 🌿\n\n👉 Nézd meg a "Szponzorált" programokat a Piactéren!`
        : language === 'de'
        ? `${prefix}🎫 Das ist eines meiner Lieblingsthemen! Unser Gutscheinsystem verbindet die Gemeinschaft:\n\n🏨 **Sponsoren** (z.B. Káli Panzió) kaufen Credits\n👤 **Mitglieder** (wie Du!) erhalten kostenlose Gutscheine\n🎓 **Experten** werden bezahlt\n\nSo gewinnt jeder - Wissen bleibt in der Gemeinschaft! 🌿\n\n👉 Schau dir die "Gesponsert"-Programme im Marktplatz an!`
        : `${prefix}🎫 This is one of my favorite topics! Our voucher system connects the community:\n\n🏨 **Sponsors** (e.g. Káli Panzió) purchase credits\n👤 **Members** (like you!) receive free vouchers\n🎓 **Experts** get paid\n\nEveryone wins - knowledge stays in the community! 🌿\n\n👉 Check out "Sponsored" programs in the Marketplace!`;
    }

    // Popular expert question
    if (lowerMsg.includes('népszerű') || lowerMsg.includes('popular') || lowerMsg.includes('beliebt') || lowerMsg.includes('legjobb') || lowerMsg.includes('best')) {
      setAvatarMood("happy");
      return language === 'hu'
        ? `${prefix}⭐ A közösségünk kedvencei - a 127 tagunk szerint:\n\n🥇 **Kovács János** - Kovászkenyér mester (4.9⭐)\n🥈 **Sophie Wagner** - Gyógynövények (4.8⭐)\n🥉 **Nagy Éva** - Méhészkedés (4.7⭐)\n\nMind a hárman igazi kincsek! 5 szponzorunk támogatásával sok programjuk ingyenes.\n\n👉 Ismerkedj meg velük a Szakértők oldalon!`
        : language === 'de'
        ? `${prefix}⭐ Die Favoriten unserer Gemeinschaft - laut unseren 127 Mitgliedern:\n\n🥇 **János Kovács** - Sauerteig-Meister (4.9⭐)\n🥈 **Sophie Wagner** - Kräuter (4.8⭐)\n🥉 **Éva Nagy** - Imkerei (4.7⭐)\n\nAlle drei sind echte Schätze! Dank 5 Sponsoren sind viele Programme kostenlos.\n\n👉 Lerne sie auf der Experten-Seite kennen!`
        : `${prefix}⭐ Our community favorites - according to our 127 members:\n\n🥇 **János Kovács** - Sourdough Master (4.9⭐)\n🥈 **Sophie Wagner** - Herbs Expert (4.8⭐)\n🥉 **Éva Nagy** - Beekeeping (4.7⭐)\n\nAll three are true treasures! Thanks to 5 sponsors, many programs are free.\n\n👉 Meet them on the Experts page!`;
    }

    // Programs in a location
    if (lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') || lowerMsg.includes('budapest') || lowerMsg.includes('balaton')) {
      setAvatarMood("happy");
      const location = lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') ? 'Bécs/Wien' : 
                       lowerMsg.includes('budapest') ? 'Budapest' : 'Balaton';
      return language === 'hu'
        ? `${prefix}📍 Remek választás! ${location} környékén jelenleg 3 aktív programunk van - és a legtöbb szponzorált, szóval ingyen csatlakozhatsz!\n\n👉 Nézd meg a Programok oldalt és szűrj helyszín szerint!`
        : language === 'de'
        ? `${prefix}📍 Tolle Wahl! In der Nähe von ${location} haben wir 3 aktive Programme - die meisten sind gesponsert, also kannst du kostenlos teilnehmen!\n\n👉 Besuche die Programm-Seite und filtere nach Standort!`
        : `${prefix}📍 Great choice! Near ${location}, we have 3 active programs - most are sponsored, so you can join for free!\n\n👉 Check the Programs page and filter by location!`;
    }

    // Learning/Programs general
    if (lowerMsg.includes('tanul') || lowerMsg.includes('learn') || lowerMsg.includes('lernen') || lowerMsg.includes('program')) {
      setAvatarMood("happy");
      return language === 'hu' 
        ? `${prefix}📚 A mi 12 szakértőnk fantasztikus programokat kínál: kovászkenyér sütés, gyógynövénygyűjtés, méhészkedés, hagyományos kézművesség... A lista hosszú!\n\n5 szponzorunk jóvoltából sok program ingyenes a 127 tagunknak.\n\n👉 Fedezd fel a Programok oldalon!`
        : language === 'de'
        ? `${prefix}📚 Unsere 12 Experten bieten fantastische Programme: Sauerteigbrot, Kräutersammeln, Imkerei, traditionelles Handwerk... Die Liste ist lang!\n\nDank 5 Sponsoren sind viele Programme für unsere 127 Mitglieder kostenlos.\n\n👉 Entdecke sie auf der Programm-Seite!`
        : `${prefix}📚 Our 12 experts offer fantastic programs: sourdough baking, herb gathering, beekeeping, traditional crafts... The list goes on!\n\nThanks to 5 sponsors, many programs are free for our 127 members.\n\n👉 Discover them on the Programs page!`;
    }

    // Free programs
    if (lowerMsg.includes('ingyenes') || lowerMsg.includes('free') || lowerMsg.includes('kostenlos') || lowerMsg.includes('gratis')) {
      setAvatarMood("happy");
      return language === 'hu'
        ? `${prefix}🎉 Jó hírem van! 5 szponzorunk - köztük a Káli Panzió és helyi vállalkozások - lehetővé teszik, hogy a 127 tagunk ingyen tanulhasson a szakértőktől.\n\nKeresd a "Szponzorált" címkét!\n\n👉 Nézd meg a Piactéren!`
        : language === 'de'
        ? `${prefix}🎉 Gute Nachrichten! Unsere 5 Sponsoren - darunter Káli Panzió - ermöglichen es unseren 127 Mitgliedern, kostenlos von Experten zu lernen.\n\nSuche nach dem "Gesponsert"-Label!\n\n👉 Schau im Marktplatz!`
        : `${prefix}🎉 Good news! Our 5 sponsors - including Káli Panzió - make it possible for our 127 members to learn from experts for free.\n\nLook for the "Sponsored" label!\n\n👉 Check the Marketplace!`;
    }

    // Default personalized welcome
    setAvatarMood("neutral");
    return language === 'hu'
      ? `Szia! 👋 Én WellBot vagyok, a WellAgora digitális házigazdája. 🏠\n\nNem csak egy gép vagyok - azért születtem, hogy segítsek neked felfedezni a 127 tagú közösségünk értékeit.\n\nMiben segíthetek ma?\n• 🎓 Szakértőket mutatok be\n• 📚 Programokat ajánlok\n• 🎫 Elmagyarázom a kuponrendszert`
      : language === 'de'
      ? `Hallo! 👋 Ich bin WellBot, der digitale Gastgeber von WellAgora. 🏠\n\nIch bin nicht nur eine Maschine - ich wurde geboren, um dir zu helfen, die Werte unserer 127-köpfigen Gemeinschaft zu entdecken.\n\nWie kann ich dir heute helfen?\n• 🎓 Experten vorstellen\n• 📚 Programme empfehlen\n• 🎫 Das Gutscheinsystem erklären`
      : `Hi! 👋 I'm WellBot, WellAgora's digital host. 🏠\n\nI'm not just a machine - I was born to help you discover the treasures of our 127-member community.\n\nHow can I help you today?\n• 🎓 Introduce experts\n• 📚 Recommend programs\n• 🎫 Explain the voucher system`;
  };

  // Community Concierge quick-start chips
  const quickActions = [
    { 
      icon: HelpCircle, 
      title: language === 'hu' ? 'Hogyan működik a kupon?' : language === 'de' ? 'Wie funktioniert der Gutschein?' : 'How do vouchers work?', 
      query: language === 'hu' ? 'Hogyan működik a kuponrendszer?' : language === 'de' ? 'Wie funktioniert das Gutscheinsystem?' : 'How does the voucher system work?'
    },
    { 
      icon: Users, 
      title: language === 'hu' ? 'Ki a legnépszerűbb szakértő?' : language === 'de' ? 'Wer ist der beliebteste Experte?' : 'Who is the most popular expert?', 
      query: language === 'hu' ? 'Ki a legnépszerűbb szakértő?' : language === 'de' ? 'Wer ist der beliebteste Experte?' : 'Who is the most popular expert?'
    },
    { 
      icon: MapPin, 
      title: language === 'hu' ? 'Programok Bécsben?' : language === 'de' ? 'Programme in Wien?' : 'Programs in Vienna?', 
      query: language === 'hu' ? 'Milyen programok vannak Bécsben?' : language === 'de' ? 'Welche Programme gibt es in Wien?' : 'What programs are available in Vienna?'
    }
  ];
  // Load conversation history on mount (skip in demo mode)
  useEffect(() => {
    const loadConversationHistory = async () => {
      // In demo mode, skip Supabase and show empty chat
      if (isDemoMode || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: conversations, error: convError } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false })
          .limit(1);

        if (convError) throw convError;

        if (conversations && conversations.length > 0) {
          const convId = conversations[0].id;
          setConversationId(convId);

          const { data: messagesData, error: msgError } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('timestamp', { ascending: false }); // Newest first

          if (msgError) throw msgError;

          if (messagesData && messagesData.length > 0) {
            const loadedMessages: Message[] = messagesData.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'ai',
              timestamp: new Date(msg.timestamp)
            }));

            setMessages(loadedMessages);
          }
        }
      } catch (error) {
        setError(t('wellbot.error_message'));
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationHistory();
  }, [user, t, isDemoMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date()
    };

    // Add new message at the beginning (newest first)
    setMessages(prev => [userMessage, ...prev]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    // DEMO MODE: Return mock response instead of calling edge function
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getDemoResponse(content),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [aiResponse, ...prev]);
      setIsTyping(false);
      return;
    }

    try {
      // For API call, we need chronological order
      const chronologicalMessages = [...messages].reverse();
      const conversationHistory = [...chronologicalMessages, userMessage].map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: conversationHistory,
          language: language,
          conversationId: conversationId,
          projectId: null
        }
      });

      if (error) {
        throw error;
      }

      if (!data || typeof (data as any).message !== 'string') {
        throw new Error('Invalid response');
      }

      const payload = data as {
        message: string;
        conversationId?: string;
        error?: string;
      };

      if (payload.error) {
        if (payload.error.includes('Rate limit')) {
          setError(t('wellbot.rate_limit_error'));
          toast({
            title: t('error'),
            description: t('wellbot.rate_limit_error'),
            variant: 'destructive',
          });
        } else if (payload.error.includes('Payment required')) {
          setError(t('wellbot.payment_error'));
          toast({
            title: t('error'),
            description: t('wellbot.payment_error'),
            variant: 'destructive',
          });
        } else {
          throw new Error(payload.error);
        }
        setIsTyping(false);
        return;
      }

      if (payload.conversationId && !conversationId) {
        setConversationId(payload.conversationId);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: payload.message,
        sender: 'ai',
        timestamp: new Date()
      };

      // Add AI response at the beginning (newest first)
      setMessages(prev => [aiResponse, ...prev]);
    } catch (error) {
      setError(t('wellbot.error_message'));
      toast({
        title: t('error'),
        description: t('wellbot.error_message'),
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSendMessage(action.query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-3.5rem)] max-w-3xl mx-auto bg-[hsl(var(--background))]">
      {/* STICKY HEADER - WellBot Community Concierge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-5">
          {/* Custom WellBot Mascot Avatar */}
          <div className="relative flex-shrink-0">
            <WellBotAvatar size="lg" mood={avatarMood} />
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-sky-500 bg-clip-text text-transparent">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                  {language === 'hu' ? 'Digitális Házigazda' : language === 'de' ? 'Digitaler Gastgeber' : 'Digital Host'}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs text-emerald-600">{t('wellbot.online')}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {language === 'hu' 
                ? 'A WellAgora házigazdája vagyok! Segítek megtalálni a tökéletes szakértőt és programot. 🏠'
                : language === 'de'
                ? 'Ich bin der Gastgeber von WellAgora! Ich helfe dir, den perfekten Experten und das Programm zu finden. 🏠'
                : 'I\'m WellAgora\'s host! I help you find the perfect expert and program. 🏠'}
            </p>
          </div>
        </div>

        {/* Quick-Start Chips - Community Concierge Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="gap-2 text-sm bg-white/80 backdrop-blur-sm border-amber-200 text-amber-700 
                  hover:bg-amber-50 hover:border-amber-400 hover:text-amber-800 
                  shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all duration-200"
                disabled={isTyping}
              >
                <action.icon className="h-4 w-4" />
                {action.title}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* INPUT FIELD - Below header, sticky */}
      <div className="sticky top-[180px] z-20 bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        {error && (
          <Alert variant="destructive" className="mb-3 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex items-center justify-between text-red-700">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1 text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hu' 
              ? 'Kérdezz a programokról, szakértőkről...' 
              : language === 'de' 
              ? 'Fragen Sie nach Programmen, Experten...' 
              : 'Ask about programs, experts...'}
            className="pr-14 resize-none min-h-[52px] max-h-[120px] bg-white/95 border-indigo-200 
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 
              placeholder:text-slate-400 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 bottom-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 shadow-md"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'hu' ? 'Enter küldés, Shift+Enter új sor' : language === 'de' ? 'Enter senden, Shift+Enter neue Zeile' : 'Enter to send, Shift+Enter for new line'}
        </p>
      </div>

      {/* SCROLLABLE MESSAGES AREA - Chat bubbles with organic premium style */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[hsl(var(--background))]">
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 items-start"
            >
              <div className="bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full p-2.5 flex-shrink-0 shadow-[0_4px_12px_rgb(99,102,241,0.25)]">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </motion.div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl rounded-tl-none shadow-[0_4px_16px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-indigo-700">{t('wellbot.typing')}</span>
                  <div className="flex gap-1">
                    <motion.div 
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          /* Empty State - Community Concierge Welcome */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center py-16"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 mb-6">
              <div className="flex justify-center mb-4">
                <WellBotAvatar size="xl" mood={avatarMood} />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-500 to-sky-500 bg-clip-text text-transparent">
                {language === 'hu' ? 'Szia! WellBot vagyok' : language === 'de' ? 'Hallo! Ich bin WellBot' : 'Hi! I\'m WellBot'}
              </h3>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
                {language === 'hu' 
                  ? 'A WellAgora digitális házigazdája! 🏠 Segítek felfedezni a közösségünk kincseit - szakértőket, programokat, és a szponzorációs rendszert.'
                  : language === 'de'
                  ? 'Der digitale Gastgeber von WellAgora! 🏠 Ich helfe dir, die Schätze unserer Gemeinschaft zu entdecken - Experten, Programme und das Sponsoring-System.'
                  : 'WellAgora\'s digital host! 🏠 I help you discover our community\'s treasures - experts, programs, and the sponsorship system.'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* Messages - Chat bubbles with role-based colors */
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex gap-3 items-start ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot Avatar - Humanized mascot */}
                {message.sender === "ai" && (
                  <WellBotAvatar size="sm" mood="neutral" />
                )}
                
                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  {message.sender === "ai" && (
                    <span className="text-xs font-medium bg-gradient-to-r from-amber-500 to-sky-500 bg-clip-text text-transparent mb-1">WellBot</span>
                  )}
                  <div
                    className={`p-4 rounded-[1.25rem] whitespace-pre-wrap break-words text-sm leading-relaxed ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-tr-sm shadow-[0_4px_16px_rgb(14,165,233,0.3)]"
                        : "bg-amber-50/80 border border-amber-100 text-slate-700 rounded-tl-sm shadow-[0_4px_16px_rgb(0,0,0,0.05)]"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-slate-400 mt-1.5">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AIAssistantChat;

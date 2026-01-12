import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles,
  BookOpen,
  Gift,
  Star,
  Loader2,
  AlertCircle,
  Leaf,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Community Concierge Intelligence - Enhanced demo responses
  const getDemoResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Expert recommendations based on topic
    if (lowerMsg.includes('kenyér') || lowerMsg.includes('kovász') || lowerMsg.includes('bread') || lowerMsg.includes('baking') || lowerMsg.includes('brot')) {
      return language === 'hu' 
        ? '🍞 A mi közösségünkben Kovács János a kenyérsütés mestere! 127 tagunk közül sokan már elvégezték a kovászkenyér kurzusát. A Káli Panzió szponzorációjának köszönhetően ez a program most ingyenesen elérhető. Látogass el a Programok oldalra!'
        : language === 'de'
        ? '🍞 In unserer Gemeinschaft ist János Kovács der Meister des Brotbackens! Viele unserer 127 Mitglieder haben seinen Sauerteigkurs absolviert. Dank der Sponsoring von Káli Panzió ist dieses Programm kostenlos. Besuchen Sie die Programm-Seite!'
        : '🍞 In our community, János Kovács is the bread baking master! Many of our 127 members have completed his sourdough course. Thanks to Káli Panzió sponsorship, this program is now free. Visit the Programs page!';
    }
    
    if (lowerMsg.includes('gyógynövény') || lowerMsg.includes('herb') || lowerMsg.includes('kräuter') || lowerMsg.includes('kert') || lowerMsg.includes('garden')) {
      return language === 'hu'
        ? '🌿 Sophie Wagner a gyógynövények és kertészkedés szakértője közösségünkben! Különösen a balatoni táj növényvilágát ismeri kiválóan. 5 szponzorunk támogatásával több ingyenes túrát is szervez. Nézd meg a Szakértők galériát!'
        : language === 'de'
        ? '🌿 Sophie Wagner ist unsere Expertin für Kräuter und Gartenbau! Sie kennt die Pflanzenwelt der Balaton-Region besonders gut. Mit Unterstützung unserer 5 Sponsoren organisiert sie kostenlose Touren. Besuchen Sie die Experten-Galerie!'
        : '🌿 Sophie Wagner is our herbs and gardening expert! She knows the plant life of the Balaton region especially well. With support from our 5 sponsors, she organizes free tours. Check out the Experts Gallery!';
    }

    // Voucher/Coupon explanation
    if (lowerMsg.includes('kupon') || lowerMsg.includes('voucher') || lowerMsg.includes('gutschein') || lowerMsg.includes('hogyan működik')) {
      return language === 'hu'
        ? '🎫 A kuponrendszerünk egyszerű háromszög:\n\n1️⃣ **Szponzorok** (pl. Káli Panzió) krediteket vásárolnak\n2️⃣ **Tagok** (Te!) ingyenes kuponokat kapnak a szponzorált programokhoz\n3️⃣ **Szakértők** megkapják a programdíjat a szponzortól\n\nÍgy mindenki nyer! Nézd meg a Piactéren a "Szponzorált" címkés programokat.'
        : language === 'de'
        ? '🎫 Unser Gutscheinsystem ist ein einfaches Dreieck:\n\n1️⃣ **Sponsoren** (z.B. Káli Panzió) kaufen Credits\n2️⃣ **Mitglieder** (Du!) erhalten kostenlose Gutscheine\n3️⃣ **Experten** werden vom Sponsor bezahlt\n\nSo gewinnt jeder! Schauen Sie sich die "Gesponsert"-Programme im Marktplatz an.'
        : '🎫 Our voucher system is a simple triangle:\n\n1️⃣ **Sponsors** (e.g. Káli Panzió) purchase credits\n2️⃣ **Members** (You!) receive free vouchers for sponsored programs\n3️⃣ **Experts** get paid by the sponsor\n\nEveryone wins! Check out "Sponsored" programs in the Marketplace.';
    }

    // Popular expert question
    if (lowerMsg.includes('népszerű') || lowerMsg.includes('popular') || lowerMsg.includes('beliebt') || lowerMsg.includes('legjobb') || lowerMsg.includes('best')) {
      return language === 'hu'
        ? '⭐ A 127 tagunk kedvenc szakértői:\n\n1️⃣ **Kovács János** - Kovászkenyér mester (4.9⭐)\n2️⃣ **Sophie Wagner** - Gyógynövények (4.8⭐)\n3️⃣ **Nagy Éva** - Méhészkedés alapjai (4.7⭐)\n\nMindegyikük programjait 5 szponzorunk támogatja. Látogass el a Szakértők oldalra!'
        : language === 'de'
        ? '⭐ Die Lieblingsexperten unserer 127 Mitglieder:\n\n1️⃣ **János Kovács** - Sauerteig-Meister (4.9⭐)\n2️⃣ **Sophie Wagner** - Kräuter (4.8⭐)\n3️⃣ **Éva Nagy** - Imkerei-Grundlagen (4.7⭐)\n\nAlle Programme werden von 5 Sponsoren unterstützt. Besuchen Sie die Experten-Seite!'
        : '⭐ Favorite experts of our 127 members:\n\n1️⃣ **János Kovács** - Sourdough Master (4.9⭐)\n2️⃣ **Sophie Wagner** - Herbs Expert (4.8⭐)\n3️⃣ **Éva Nagy** - Beekeeping Basics (4.7⭐)\n\nAll programs supported by 5 sponsors. Visit the Experts page!';
    }

    // Programs in a location
    if (lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') || lowerMsg.includes('budapest') || lowerMsg.includes('balaton')) {
      const location = lowerMsg.includes('bécs') || lowerMsg.includes('vienna') || lowerMsg.includes('wien') ? 'Bécs/Wien' : 
                       lowerMsg.includes('budapest') ? 'Budapest' : 'Balaton';
      return language === 'hu'
        ? `📍 ${location} környékén jelenleg 3 aktív programunk van! A legtöbb szponzorált, így ingyen csatlakozhatsz. Nézd meg a Programok oldalt és szűrj helyszín szerint!`
        : language === 'de'
        ? `📍 In der Nähe von ${location} haben wir derzeit 3 aktive Programme! Die meisten sind gesponsert, also kannst du kostenlos teilnehmen. Besuche die Programm-Seite und filtere nach Standort!`
        : `📍 Near ${location}, we currently have 3 active programs! Most are sponsored, so you can join for free. Check the Programs page and filter by location!`;
    }

    // Learning/Programs general
    if (lowerMsg.includes('tanul') || lowerMsg.includes('learn') || lowerMsg.includes('lernen') || lowerMsg.includes('program')) {
      return language === 'hu' 
        ? '📚 A mi közösségünkben 12 szakértőnk kínál programokat: kovászkenyér sütés, gyógynövénygyűjtés, méhészkedés, hagyományos kézművesség és még sok más! 5 szponzorunk támogatásával sok program ingyenes. Látogass el a Programok oldalra!'
        : language === 'de'
        ? '📚 In unserer Gemeinschaft bieten 12 Experten Programme an: Sauerteigbrot, Kräutersammeln, Imkerei, traditionelles Handwerk und vieles mehr! Mit Unterstützung von 5 Sponsoren sind viele Programme kostenlos. Besuchen Sie die Programm-Seite!'
        : '📚 In our community, 12 experts offer programs: sourdough baking, herb gathering, beekeeping, traditional crafts and much more! With support from 5 sponsors, many programs are free. Visit the Programs page!';
    }

    // Free programs
    if (lowerMsg.includes('ingyenes') || lowerMsg.includes('free') || lowerMsg.includes('kostenlos') || lowerMsg.includes('gratis')) {
      return language === 'hu'
        ? '🎉 Kiváló hír! 5 szponzorunk - köztük a Káli Panzió és helyi vállalkozások - támogatja programjainkat. A 127 tagunk így ingyen vehet részt sok programon. Nézd meg a "Szponzorált" címkével ellátott programokat a Piactéren!'
        : language === 'de'
        ? '🎉 Tolle Neuigkeiten! Unsere 5 Sponsoren - darunter Káli Panzió und lokale Unternehmen - unterstützen unsere Programme. So können unsere 127 Mitglieder kostenlos teilnehmen. Schauen Sie sich die "Gesponsert"-Programme im Marktplatz an!'
        : '🎉 Great news! Our 5 sponsors - including Káli Panzió and local businesses - support our programs. This way our 127 members can join many programs for free. Check out programs with the "Sponsored" label in the Marketplace!';
    }

    // Default community concierge response
    return language === 'hu'
      ? '👋 Szia! WellBot vagyok, a közösségi kalauzod. A mi közösségünkben 127 tag, 12 szakértő és 5 szponzor dolgozik együtt a helyi tudás megőrzéséért.\n\nMiben segíthetek?\n• Programok és kurzusok ajánlása\n• Szakértők bemutatása\n• A szponzorációs rendszer magyarázata\n\nLátogass el a Programok vagy Szakértők oldalra!'
      : language === 'de'
      ? '👋 Hallo! Ich bin WellBot, dein Gemeinschaftsführer. In unserer Gemeinschaft arbeiten 127 Mitglieder, 12 Experten und 5 Sponsoren zusammen, um lokales Wissen zu bewahren.\n\nWie kann ich helfen?\n• Programm- und Kursempfehlungen\n• Expertenvorstellungen\n• Erklärung des Sponsoring-Systems\n\nBesuchen Sie die Programm- oder Experten-Seite!'
      : '👋 Hi! I\'m WellBot, your community guide. In our community, 127 members, 12 experts, and 5 sponsors work together to preserve local knowledge.\n\nHow can I help?\n• Program and course recommendations\n• Expert introductions\n• Sponsorship system explanation\n\nVisit the Programs or Experts page!';
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
          {/* Custom WellBot Avatar with gradient and breathing animation */}
          <motion.div 
            className="relative flex-shrink-0"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-indigo-600 shadow-[0_8px_30px_rgb(99,102,241,0.35)] flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Leaf className="h-8 w-8 text-white drop-shadow-md" />
              </motion.div>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                  {language === 'hu' ? 'Közösségi Kalauz' : language === 'de' ? 'Gemeinschaftsführer' : 'Community Concierge'}
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
                ? 'Segítek megtalálni a tökéletes szakértőt és programot a 127 tagú közösségünkben!'
                : language === 'de'
                ? 'Ich helfe dir, den perfekten Experten und das perfekte Programm in unserer 127-köpfigen Gemeinschaft zu finden!'
                : 'I help you find the perfect expert and program in our 127-member community!'}
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
                className="gap-2 text-sm bg-white/80 backdrop-blur-sm border-indigo-200 text-indigo-700 
                  hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-800 
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
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-indigo-600 shadow-[0_8px_30px_rgb(99,102,241,0.35)] flex items-center justify-center mx-auto mb-4"
              >
                <Leaf className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                {language === 'hu' ? 'Üdv! WellBot vagyok' : language === 'de' ? 'Hallo! Ich bin WellBot' : 'Hi! I\'m WellBot'}
              </h3>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
                {language === 'hu' 
                  ? 'A közösségi kalauzod! Segítek megtalálni a tökéletes szakértőt, programot, és elmagyarázom hogyan működik a szponzorációs rendszer.'
                  : language === 'de'
                  ? 'Dein Gemeinschaftsführer! Ich helfe dir, den perfekten Experten und das Programm zu finden und erkläre das Sponsoring-System.'
                  : 'Your community concierge! I help you find the perfect expert, program, and explain how our sponsorship system works.'}
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
                {/* Bot Avatar - Indigo/Sky gradient */}
                {message.sender === "ai" && (
                  <div className="bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full p-2 flex-shrink-0 shadow-[0_4px_12px_rgb(99,102,241,0.25)]">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  {message.sender === "ai" && (
                    <span className="text-xs font-medium bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent mb-1">WellBot</span>
                  )}
                  <div
                    className={`p-4 rounded-2xl whitespace-pre-wrap break-words text-sm leading-relaxed ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-tr-none shadow-[0_4px_16px_rgb(99,102,241,0.3)]"
                        : "bg-indigo-50 border border-indigo-100 text-slate-700 rounded-tl-none shadow-[0_4px_16px_rgb(0,0,0,0.06)]"
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

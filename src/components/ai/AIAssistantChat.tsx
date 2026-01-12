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
  Compass
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import robotAvatar from "@/assets/ai-assistant.jpg";

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

  // Demo mode mock responses
  const getDemoResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('tanul') || lowerMsg.includes('learn')) {
      return language === 'hu' 
        ? 'Szia! 🌿 Számos programot találsz a Piactéren: kovászkenyér sütés, gyógynövénygyűjtés, méhészkedés alapjai és még sok más! A legtöbb programot helyi szakértők tartják, és a szponzorált programok ingyenesek számodra.'
        : 'Hi! 🌿 You can find many programs in the Marketplace: sourdough baking, herb gathering, beekeeping basics and much more! Most programs are led by local experts, and sponsored programs are free for you.';
    }
    if (lowerMsg.includes('ingyenes') || lowerMsg.includes('free')) {
      return language === 'hu'
        ? 'Kiváló hír! 🎉 A Káli Panzió szponzorálja több programunkat is, így ingyen részt vehetsz rajtuk. Nézd meg a "Szponzorált" címkével ellátott programokat a Piactéren!'
        : 'Great news! 🎉 Káli Panzió sponsors several of our programs, so you can join them for free. Check out programs with the "Sponsored" label in the Marketplace!';
    }
    if (lowerMsg.includes('népszerű') || lowerMsg.includes('popular')) {
      return language === 'hu'
        ? 'A legkedveltebb programjaink: 1️⃣ Kovászkenyér kurzus (Kovács István), 2️⃣ Gyógynövénygyűjtés túra (Nagy Erzsébet), 3️⃣ Méhészkedés alapjai. Mindegyik kiváló értékeléseket kapott a résztvevőktől!'
        : 'Our most popular programs: 1️⃣ Sourdough Course (István Kovács), 2️⃣ Herb Gathering Tour (Erzsébet Nagy), 3️⃣ Beekeeping Basics. All have received excellent ratings from participants!';
    }
    return language === 'hu'
      ? 'Szia! Én a WellBot vagyok, a szakértők és programok közötti eligazodásban segítek neked. Kérdezz bátran a programokról, szakértőkről vagy az ingyenes lehetőségekről! 🌿'
      : 'Hi! I\'m WellBot, I help you navigate experts and programs. Feel free to ask about programs, experts, or free opportunities! 🌿';
  };

  // Knowledge Guide quick-start chips
  const quickActions = [
    { 
      icon: BookOpen, 
      title: t('wellbot.chip_learn'), 
      query: t('wellbot.query_learn')
    },
    { 
      icon: Gift, 
      title: t('wellbot.chip_free'), 
      query: t('wellbot.query_free')
    },
    { 
      icon: Star, 
      title: t('wellbot.chip_popular'), 
      query: t('wellbot.query_popular')
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
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
      {/* STICKY HEADER - WellBot Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 overflow-hidden">
              <img 
                src={robotAvatar} 
                alt="WellBot" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-md border-2 border-white">
              <Compass className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  {t('wellbot.available_24_7')}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-primary">{t('wellbot.online')}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {t('wellbot.knowledge_guide_desc')}
            </p>
          </div>
        </div>

        {/* Quick-Start Chips */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="gap-2 text-sm bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 
                hover:bg-primary/5 hover:border-primary hover:text-primary 
                shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all duration-200"
              disabled={isTyping}
            >
              <action.icon className="h-4 w-4" />
              {action.title}
            </Button>
          ))}
        </div>
      </div>

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
            placeholder={t('wellbot.input_placeholder')}
            className="pr-14 resize-none min-h-[52px] max-h-[120px] bg-white/95 border-slate-200 
              focus:border-primary focus:ring-2 focus:ring-primary/10 text-slate-800 
              placeholder:text-slate-400 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 bottom-2 rounded-lg bg-primary hover:bg-primary/90 shadow-md"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {t('wellbot.input_hint')}
        </p>
      </div>

      {/* SCROLLABLE MESSAGES AREA - Chat bubbles with organic premium style */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[hsl(var(--background))]">
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 items-start animate-fade-in">
            <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 shadow-[0_4px_12px_rgb(0,0,0,0.06)] border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="bg-white/95 backdrop-blur-sm border border-white/40 p-4 rounded-2xl rounded-tl-none shadow-[0_4px_16px_rgb(0,0,0,0.06)]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{t('wellbot.typing')}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          /* Empty State - Knowledge Guide Welcome */
          <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 mb-6">
              <Compass className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-slate-800">
                {t('wellbot.knowledge_guide_welcome')}
              </h3>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
                {t('wellbot.knowledge_guide_hint')}
              </p>
            </div>
          </div>
        ) : (
          /* Messages - Chat bubbles */
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-start animate-fade-in ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar */}
              {message.sender === "ai" && (
                <div className="bg-primary/10 rounded-full p-2 flex-shrink-0 shadow-[0_4px_12px_rgb(0,0,0,0.06)] border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              )}
              
              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                {message.sender === "ai" && (
                  <span className="text-xs font-medium text-primary mb-1">WellBot</span>
                )}
                <div
                  className={`p-4 rounded-2xl whitespace-pre-wrap break-words text-sm leading-relaxed ${
                    message.sender === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-[0_4px_16px_rgb(52,199,89,0.3)]"
                      : "bg-white/95 backdrop-blur-sm border border-white/40 text-slate-700 rounded-tl-none shadow-[0_4px_16px_rgb(0,0,0,0.06)]"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-slate-400 mt-1.5">
                  {format(message.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AIAssistantChat;

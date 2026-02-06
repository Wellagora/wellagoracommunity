import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, AlertCircle, Plus } from "lucide-react";
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

interface AIAssistantChatProps {
  embedded?: boolean;
}

const AIAssistantChat = ({ embedded = false }: AIAssistantChatProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
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

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user) {
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
            .order('timestamp', { ascending: true });

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
        console.error('Error loading conversation history:', error);
        setError(t('wellbot.error_message'));
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationHistory();
  }, [user, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setAvatarMood("thinking");
    setError(null);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
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
        setAvatarMood("neutral");
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

      setMessages(prev => [...prev, aiResponse]);
      setAvatarMood("happy");
    } catch (error) {
      console.error('WellBot error:', error);
      setError(t('wellbot.error_message'));
      toast({
        title: t('error'),
        description: t('wellbot.error_message'),
        variant: "destructive",
      });
      setAvatarMood("neutral");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('wellbot-conversation-id');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className={embedded ? "h-full flex flex-col overflow-hidden" : "flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto bg-[hsl(var(--background))]"}>      {/* HEADER - fix, nem scrollozik */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={embedded ? "flex-shrink-0 bg-white border-b px-3 py-3" : "flex-shrink-0 z-20 bg-white backdrop-blur-md border-b border-white/40 px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}
      >
        <div className={embedded ? "flex items-center gap-2 mb-0" : "flex items-center gap-4 mb-5"}>
          <div className="relative flex-shrink-0">
            <WellBotAvatar size={embedded ? "sm" : "lg"} mood={avatarMood} />
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
              <h1 className={embedded ? "text-base font-bold text-gray-900" : "text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent"}>
                WellBot
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                {language === 'hu' ? 'Új chat' : language === 'de' ? 'Neuer Chat' : 'New Chat'}
              </Button>
              {!embedded && (
                <div className="flex items-center gap-2">
                  <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                    {language === 'hu' ? 'Digitális Házigazda' : language === 'de' ? 'Digitaler Gastgeber' : 'Digital Host'}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <motion.div 
                      className="w-2 h-2 bg-sky-500 rounded-full"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs text-sky-600">{t('wellbot.online')}</span>
                  </div>
                </div>
              )}
            </div>
            {!embedded && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {language === 'hu' 
                  ? 'A WellAgora digitális házigazdája vagyok! Segítek eligazodni a programok és szakértők között. 🤖'
                  : language === 'de'
                  ? 'Ich bin der digitale Gastgeber von WellAgora! Ich helfe dir bei Programmen und Experten. 🤖'
                  : 'I\'m WellAgora\'s digital host! I help you navigate programs and experts. 🤖'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* MESSAGES - csak ez scrollozik */}
      <div className={embedded ? "flex-1 overflow-y-auto px-3 py-4 space-y-3" : "flex-1 overflow-y-auto px-4 py-4 space-y-4"}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {format(message.timestamp, 'HH:mm')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT - fix, nem scrollozik */}
      <div className={embedded ? "flex-shrink-0 border-t px-3 py-3 bg-white" : "flex-shrink-0 z-20 border-t px-4 py-4 bg-white shadow-[0_-4px_20px_rgb(0,0,0,0.02)]"}>
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

        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hu' ? 'Írj üzenetet...' : language === 'de' ? 'Nachricht schreiben...' : 'Type a message...'}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none"
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat;

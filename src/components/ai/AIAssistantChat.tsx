import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles,
  Calculator,
  Users,
  HelpCircle,
  Loader2,
  AlertCircle,
  Zap
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickActions = [
    { 
      icon: Calculator, 
      title: t('wellbot.action_carbon'), 
      query: t('wellbot.query_carbon')
    },
    { 
      icon: Sparkles, 
      title: t('wellbot.action_programs'), 
      query: t('wellbot.query_programs')
    },
    { 
      icon: Users, 
      title: t('wellbot.action_community'), 
      query: t('wellbot.query_community')
    },
    { 
      icon: HelpCircle, 
      title: t('wellbot.action_getstarted'), 
      query: t('wellbot.query_getstarted')
    }
  ];

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
        console.error('Error loading conversation history:', error);
        setError(t('wellbot.error_message'));
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationHistory();
  }, [user, t]);

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
        console.error('AI chat error:', error);
        throw error;
      }

      if (!data || typeof (data as any).message !== 'string') {
        console.error('AI chat returned invalid response:', data);
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
      console.error('Error calling AI:', error);
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
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* FIXED HEADER */}
      <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 pb-4 border-b border-border">
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img 
              src={robotAvatar} 
              alt="WellBot" 
              className="w-16 h-16 object-cover rounded-full shadow-lg border-2 border-primary/20"
            />
            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1.5 shadow-md">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold italic text-foreground">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {t('wellbot.available_24_7')}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">{t('wellbot.online')}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {t('wellbot.description')}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="gap-1.5 text-xs"
              disabled={isTyping}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* INPUT FIELD - Below header, always visible */}
      <div className="sticky top-[180px] z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border">
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1"
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
            className="pr-12 resize-none min-h-[48px] max-h-[120px] bg-card"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 bottom-2"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('wellbot.input_hint')}
        </p>
      </div>

      {/* MESSAGES SECTION - Newest at top, scroll down for older */}
      <div className="py-4 space-y-4">
        {/* Typing Indicator - Shows at TOP when AI is responding */}
        {isTyping && (
          <div className="flex gap-3 items-start animate-fade-in">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-2 flex-shrink-0 shadow-md border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="bg-card border border-border p-3 rounded-lg rounded-tl-none shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('wellbot.typing')}</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-6 shadow-lg border border-primary/20 mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('wellbot.community_greeting')}
            </h3>
            <p className="text-muted-foreground max-w-md text-sm">
              {t('wellbot.empty_state_hint')}
            </p>
          </div>
        ) : (
          /* Messages - Newest first (reverse chronological) */
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-start animate-fade-in ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar */}
              {message.sender === "ai" && (
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-2 flex-shrink-0 shadow-md border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              )}
              
              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                {message.sender === "ai" && (
                  <span className="text-xs font-medium text-primary mb-1">WellBot</span>
                )}
                <div
                  className={`p-3 rounded-lg whitespace-pre-wrap break-words shadow-sm text-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {format(message.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAssistantChat;

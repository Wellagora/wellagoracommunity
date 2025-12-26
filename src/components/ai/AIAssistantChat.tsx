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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* STICKY HEADER - Avatar, Title, Quick Actions */}
      <div className="sticky top-0 z-20 bg-card border-b border-accent/20 px-4 py-4 shadow-card">
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img 
              src={robotAvatar} 
              alt="WellBot" 
              className="w-16 h-16 object-cover rounded-full shadow-lg border-2 border-accent/30"
            />
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[hsl(216,100%,50%)] to-[hsl(186,100%,50%)] rounded-full p-1.5 shadow-md">
              <Zap className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold italic text-white">
                WellBot
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-gradient-to-r from-[hsl(216,100%,50%)] to-[hsl(186,100%,50%)] text-white border-0">
                  {t('wellbot.available_24_7')}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xs text-accent">{t('wellbot.online')}</span>
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
              className="gap-1.5 text-xs hover:border-accent hover:text-accent"
              disabled={isTyping}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* INPUT FIELD - Below header, sticky */}
      <div className="sticky top-[168px] z-20 bg-card border-b border-accent/20 px-4 py-4">
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
            className="pr-12 resize-none min-h-[48px] max-h-[120px] bg-background border-accent/20 focus:border-accent text-white"
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

      {/* SCROLLABLE MESSAGES AREA - Only this part scrolls */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Typing Indicator - Shows at TOP when AI is responding */}
        {isTyping && (
          <div className="flex gap-3 items-start animate-fade-in">
            <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-full p-2 flex-shrink-0 shadow-md border border-accent/30">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </div>
            <div className="bg-card border border-accent/20 p-3 rounded-xl rounded-tl-none shadow-card">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('wellbot.typing')}</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="bg-gradient-to-br from-[hsl(216,100%,50%)]/20 to-[hsl(186,100%,50%)]/10 rounded-full p-6 shadow-lg border border-accent/30 mb-4">
              <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
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
                <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-full p-2 flex-shrink-0 shadow-md border border-accent/30">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
              )}
              
              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                {message.sender === "ai" && (
                  <span className="text-xs font-medium text-accent mb-1">WellBot</span>
                )}
                <div
                  className={`p-3 rounded-xl whitespace-pre-wrap break-words shadow-card text-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-[hsl(216,100%,50%)] to-[hsl(186,100%,50%)] text-white rounded-tr-none"
                      : "bg-card border border-accent/20 text-foreground rounded-tl-none"
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AIAssistantChat;

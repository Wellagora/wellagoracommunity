import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Sparkles,
  Calculator,
  Users,
  HelpCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickActions = [
    { 
      icon: Calculator, 
      title: t('wellbot.action_carbon'), 
      description: t('wellbot.action_carbon_desc'),
      query: t('wellbot.query_carbon')
    },
    { 
      icon: Sparkles, 
      title: t('wellbot.action_programs'), 
      description: t('wellbot.action_programs_desc'),
      query: t('wellbot.query_programs')
    },
    { 
      icon: Users, 
      title: t('wellbot.action_community'), 
      description: t('wellbot.action_community_desc'),
      query: t('wellbot.query_community')
    },
    { 
      icon: HelpCircle, 
      title: t('wellbot.action_getstarted'), 
      description: t('wellbot.action_getstarted_desc'),
      query: t('wellbot.query_getstarted')
    }
  ];

  const initialSuggestions = [
    t('wellbot.suggestion_programs'),
    t('wellbot.suggestion_community'),
    t('wellbot.suggestion_howto'),
    t('wellbot.suggestion_impact')
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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
        id: Date.now().toString(),
        content: payload.message,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
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

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Sidebar - Left */}
        <div className="lg:col-span-1 space-y-3 animate-fade-in">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            {t('wellbot.quick_actions')}
          </h3>
          
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="hover:bg-accent transition-colors cursor-pointer group"
              onClick={() => handleQuickAction(action)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Area - Right */}
        <div className="lg:col-span-2 animate-fade-in">
          <Card className="flex flex-col h-[600px]">
            {/* Messages Container */}
            <ScrollArea className="flex-1 p-6 bg-muted/30">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t('wellbot.community_greeting')}
                    </h3>
                    
                    {/* Initial Suggestion Chips */}
                    <div className="flex flex-wrap gap-2 justify-center mt-6">
                      {initialSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 animate-fade-in ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Bot Avatar */}
                        {message.sender === "ai" && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                          </Avatar>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`flex flex-col max-w-[85%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                          <div
                            className={`p-3 rounded-lg whitespace-pre-wrap break-words ${
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
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3 animate-fade-in">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                        </Avatar>
                        <div className="bg-card border border-border p-3 rounded-lg rounded-tl-none">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Error Alert */}
            {error && (
              <div className="px-4 pt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setError(null)}
                    >
                      {t('common.dismiss')}
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t bg-background p-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('wellbot.input_placeholder')}
                  className="pr-12 resize-none min-h-[44px] max-h-[160px]"
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat;

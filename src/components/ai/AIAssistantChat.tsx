import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Leaf, 
  Zap, 
  Recycle,
  Car,
  Home
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistantChat = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: t('wellbot.greeting'),
      sender: "ai",
      timestamp: new Date(),
      suggestions: [
        t('wellbot.suggestion_carbon'),
        t('wellbot.suggestion_transport'),
        t('wellbot.suggestion_waste'),
        t('wellbot.suggestion_energy')
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { icon: Leaf, label: t('wellbot.action_carbon'), description: t('wellbot.action_carbon_desc') },
    { icon: Zap, label: t('wellbot.action_energy'), description: t('wellbot.action_energy_desc') },
    { icon: Recycle, label: t('wellbot.action_waste'), description: t('wellbot.action_waste_desc') },
    { icon: Car, label: t('wellbot.action_transport'), description: t('wellbot.action_transport_desc') },
    { icon: Home, label: t('wellbot.action_home'), description: t('wellbot.action_home_desc') }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          projectId: null // Could be set from ProjectContext if needed
        }
      });

      if (error) {
        console.error('AI chat error:', error);
        throw error;
      }

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast({
            title: t('error'),
            description: t('wellbot.rate_limit_error'),
            variant: "destructive",
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            title: t('error'),
            description: t('wellbot.payment_error'),
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        setIsTyping(false);
        return;
      }

      // Store conversation ID for future messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const aiResponse: Message = {
        id: Date.now().toString(),
        content: data.message,
        sender: "ai",
        timestamp: new Date(),
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling AI:', error);
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
    const queries = {
      "Carbon Calculator": "Help me calculate my carbon footprint",
      "Energy Tips": "Give me energy saving tips for my home",
      "Waste Reduction": "How can I reduce waste in my daily life?",
      "Green Transport": "What are sustainable transportation options?",
      "Eco Home": "How can I make my home more sustainable?"
    };
    
    handleSendMessage(queries[action.label as keyof typeof queries] || action.label);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span>{t('wellbot.assistant')}</span>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              {t('wellbot.online')}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b bg-muted/30">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('wellbot.quick_actions')}</h4>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    {message.sender === "ai" ? (
                      <div className="bg-gradient-primary w-full h-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[70%] ${message.sender === "user" ? "text-right" : ""}`}>
                    <div
                      className={`p-3 rounded-lg whitespace-pre-line ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* AI Suggestions */}
                    {message.sender === "ai" && message.suggestions && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center space-x-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>{t('wellbot.suggestions')}:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-auto py-1 px-2 hover:bg-primary hover:text-primary-foreground"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <div className="bg-gradient-primary w-full h-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('wellbot.input_placeholder')}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(inputValue);
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantChat;
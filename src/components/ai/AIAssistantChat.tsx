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

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistantChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI sustainability assistant. I can help you reduce your environmental impact, suggest eco-friendly alternatives, and answer questions about sustainable living. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
      suggestions: [
        "How can I reduce my carbon footprint?",
        "What are the best sustainable transport options?",
        "Help me create a waste reduction plan",
        "Find energy-efficient alternatives for my home"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { icon: Leaf, label: "Carbon Calculator", description: "Calculate your environmental impact" },
    { icon: Zap, label: "Energy Tips", description: "Reduce your energy consumption" },
    { icon: Recycle, label: "Waste Reduction", description: "Minimize waste and maximize recycling" },
    { icon: Car, label: "Green Transport", description: "Sustainable transportation options" },
    { icon: Home, label: "Eco Home", description: "Make your home more sustainable" }
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    let response = "";
    let suggestions: string[] = [];

    if (input.includes("carbon") || input.includes("footprint")) {
      response = "Great question! To reduce your carbon footprint, focus on these key areas:\n\n🚗 **Transportation**: Use public transport, cycle, walk, or consider electric vehicles\n⚡ **Energy**: Switch to renewable energy, improve home insulation, use LED bulbs\n🍽️ **Diet**: Eat more plant-based meals, buy local and seasonal produce\n♻️ **Consumption**: Buy less, reuse more, choose sustainable products\n\nWould you like specific tips for any of these areas?";
      suggestions = [
        "Tell me about electric vehicles",
        "How to switch to renewable energy?",
        "Plant-based meal ideas",
        "Start a home composting system"
      ];
    } else if (input.includes("transport") || input.includes("travel")) {
      response = "Here are sustainable transport options to consider:\n\n🚲 **Cycling**: Great for short distances, zero emissions, improves health\n🚌 **Public Transport**: Reduces individual carbon footprint significantly\n⚡ **Electric Vehicles**: Zero direct emissions, increasingly affordable\n🚶 **Walking**: Perfect for short trips, completely emission-free\n🚗 **Carpooling**: Share rides to reduce overall vehicle usage\n\nWhat type of journeys are you looking to make more sustainable?";
      suggestions = [
        "Best electric bike options",
        "Public transport apps in my area",
        "Electric car charging stations",
        "Safe cycling routes"
      ];
    } else if (input.includes("waste") || input.includes("recycling")) {
      response = "Here's how to create an effective waste reduction plan:\n\n♻️ **Reduce**: Buy only what you need, choose products with minimal packaging\n🔄 **Reuse**: Repurpose items, donate instead of discarding\n📦 **Recycle**: Learn your local recycling guidelines\n🌱 **Compost**: Turn organic waste into nutrient-rich soil\n🛍️ **Zero Waste Shopping**: Bring your own bags, containers, and bottles\n\nWhich area would you like to start with?";
      suggestions = [
        "How to start composting at home",
        "Zero waste shopping guide",
        "Local recycling guidelines",
        "DIY upcycling projects"
      ];
    } else if (input.includes("energy") || input.includes("electric")) {
      response = "Here are ways to make your energy usage more sustainable:\n\n☀️ **Solar Power**: Install solar panels or switch to a renewable energy provider\n💡 **Efficient Lighting**: Replace bulbs with LEDs, use natural light when possible\n🏠 **Insulation**: Improve home insulation to reduce heating/cooling needs\n📱 **Smart Devices**: Use programmable thermostats and smart power strips\n🔌 **Unplug**: Turn off devices when not in use to eliminate phantom loads\n\nWhat's your biggest energy expense at home?";
      suggestions = [
        "Solar panel installation cost",
        "Best smart thermostats",
        "Home energy audit checklist",
        "Renewable energy providers"
      ];
    } else {
      response = "I'd be happy to help you with sustainability questions! I can provide advice on:\n\n🌱 Reducing your environmental impact\n⚡ Energy efficiency and renewable options\n🚗 Sustainable transportation\n♻️ Waste reduction and recycling\n🏠 Eco-friendly home improvements\n🍽️ Sustainable food choices\n\nWhat specific topic would you like to explore?";
      suggestions = [
        "Calculate my carbon footprint",
        "Sustainable living tips for beginners",
        "Eco-friendly product recommendations",
        "Join local environmental initiatives"
      ];
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: "ai",
      timestamp: new Date(),
      suggestions
    };
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
            <span>AI Sustainability Assistant</span>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              Online
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b bg-muted/30">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Quick Actions</h4>
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
                          <span>Suggested follow-ups:</span>
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
                placeholder="Ask me anything about sustainability..."
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
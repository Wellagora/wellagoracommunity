import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  Brain,
  Sparkles
} from "lucide-react";
import aiAssistantImage from "@/assets/ai-assistant.jpg";

const AIAssistantSection = () => {
  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Coaching",
      description: "Personalized sustainability advice based on your lifestyle, preferences, and progress."
    },
    {
      icon: Target,
      title: "Challenge Recommendations",
      description: "AI-powered suggestions for challenges that match your interests and difficulty level."
    },
    {
      icon: TrendingUp,
      title: "Behavioral Analysis",
      description: "Track patterns and receive insights to optimize your sustainability journey."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Contextual challenge suggestions based on weather, season, and local events."
    },
    {
      icon: Users,
      title: "Community Matching",
      description: "Connect with like-minded individuals and form teams for collaborative challenges."
    },
    {
      icon: Lightbulb,
      title: "Impact Insights",
      description: "Understand your environmental impact and get suggestions for improvement."
    }
  ];

  const chatExamples = [
    {
      user: "How can I reduce my carbon footprint this week?",
      bot: "Based on your profile, I recommend trying our 'Bike to Work' challenge - it could save 15kg CO₂ and you're near a bike-friendly route! 🚴‍♂️"
    },
    {
      user: "I want to get my office involved in sustainability",
      bot: "Perfect! I suggest starting with our 'Office Energy Challenge'. I can help you create a custom team challenge for your colleagues. Want me to set it up? 💡"
    },
    {
      user: "What's the best challenge for beginners?",
      bot: "Great question! I recommend starting with our 'One Less Plastic' challenge - it's beginner-friendly and you'll earn your first badge quickly! 🏆"
    }
  ];

  return (
    <section id="ai-coach" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered Sustainability Coach
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Meet{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  WellBot
                </span>
                <br />Your Personal Guide
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI assistant provides personalized coaching, smart recommendations, 
                and contextual guidance to help you maximize your sustainability impact 
                while staying motivated on your journey.
              </p>
            </div>

            {/* AI Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {aiFeatures.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
                >
                  <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="bg-gradient-primary hover:shadow-glow transition-smooth">
              <Bot className="w-4 h-4 mr-2" />
              Try WellBot Now
            </Button>
          </div>

          {/* Right Content - Chat Interface Mockup */}
          <div className="relative">
            {/* AI Assistant Image */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <img 
                  src={aiAssistantImage} 
                  alt="WellBot AI Assistant" 
                  className="w-64 h-64 object-cover rounded-2xl shadow-eco"
                />
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-success rounded-full flex items-center justify-center animate-pulse-glow">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Chat Interface Mockup */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">WellBot Assistant</CardTitle>
                    <CardDescription className="text-sm">Online • Ready to help</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 max-h-80 overflow-hidden">
                {chatExamples.map((chat, index) => (
                  <div key={index} className="space-y-2">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2 max-w-xs text-sm">
                        {chat.user}
                      </div>
                    </div>
                    
                    {/* Bot Response */}
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2 max-w-xs text-sm">
                        {chat.bot}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -left-4 top-1/4 bg-card rounded-lg shadow-card p-3 animate-float">
              <div className="text-xs text-muted-foreground">Response Time</div>
              <div className="text-lg font-bold text-success">&lt; 2s</div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 bg-card rounded-lg shadow-card p-3 animate-float" style={{ animationDelay: "1s" }}>
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="text-lg font-bold text-primary">96.5%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
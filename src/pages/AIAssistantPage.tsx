import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";
import aiAssistantImage from "@/assets/ai-assistant.jpg";
import { Bot, Zap } from "lucide-react";

const AIAssistantPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Robot */}
        <div className="text-center mb-12">
          <div className="max-w-md mx-auto mb-8 relative">
            <img 
              src={aiAssistantImage} 
              alt="WellBot AI Assistant" 
              className="w-48 h-48 object-cover rounded-2xl shadow-eco mx-auto mb-6"
            />
            <div className="absolute -top-2 -right-1/4 w-12 h-12 bg-success rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Meet{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              WellBot
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered sustainability coach. Get personalized advice, eco-friendly solutions, and smart recommendations for a greener lifestyle.
          </p>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
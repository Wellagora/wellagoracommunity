import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";
import aiAssistantImage from "@/assets/ai-assistant.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bot, Zap } from "lucide-react";

const AIAssistantPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 xl:py-12">
        {/* Hero Section with Robot */}
        <div className="text-center mb-8 sm:mb-12 xl:mb-16">
          <div className="max-w-md mx-auto mb-6 sm:mb-8 xl:mb-10 relative">
            <img 
              src={aiAssistantImage} 
              alt="WellBot AI Assistant" 
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-cover rounded-2xl shadow-eco mx-auto mb-4 sm:mb-6 xl:mb-8"
            />
            <div className="absolute -top-2 -right-8 sm:-right-1/4 w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 bg-success rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 xl:mb-6 px-4">
            {t('wellbot.title')}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              WellBot
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl xl:max-w-3xl mx-auto px-4">
            {t('wellbot.description')}
          </p>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
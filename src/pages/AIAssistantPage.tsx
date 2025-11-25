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
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="max-w-md mx-auto mb-4 sm:mb-6 lg:mb-8 relative">
            <img 
              src={aiAssistantImage} 
              alt="WellBot AI Assistant" 
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-cover rounded-2xl shadow-eco mx-auto mb-3 sm:mb-4 lg:mb-6"
            />
            <div className="absolute -top-1 -right-4 sm:-top-2 sm:-right-8 lg:-right-1/4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-success rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2 sm:mb-3 lg:mb-4 px-4">
            {t('wellbot.title')}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              WellBot
            </span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-muted-foreground max-w-xl lg:max-w-2xl mx-auto px-4">
            {t('wellbot.description')}
          </p>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
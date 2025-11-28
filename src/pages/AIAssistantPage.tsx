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
          <div className="max-w-md mx-auto relative">
            {/* Robot Image */}
            <img 
              src={aiAssistantImage} 
              alt="WellBot AI Assistant" 
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover rounded-2xl shadow-eco mx-auto mb-4"
            />
            <div className="absolute top-0 right-1/4 w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            
            {/* WellBot Name */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white">
              WellBot
            </h2>
            
            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-foreground/80 mb-6 px-4">
              {t('wellbot.description')}
            </p>
          </div>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
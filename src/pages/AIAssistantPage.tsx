import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import robotAvatar from "@/assets/ai-assistant.jpg";

const AIAssistantPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header - Robot Avatar */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <div className="relative mb-6">
            <img 
              src={robotAvatar} 
              alt="WellBot" 
              className="w-48 h-48 object-cover rounded-full shadow-2xl border-4 border-primary/20"
            />
            <div className="absolute top-2 right-2 bg-primary rounded-full p-2 shadow-lg">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold italic mb-3 text-foreground">
            WellBot
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg mb-2">
            {t('wellbot.description')}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {t('wellbot.available_24_7')}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">{t('wellbot.online')}</span>
            </div>
          </div>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
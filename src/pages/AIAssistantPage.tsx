import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const AIAssistantPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            {/* WellBot Avatar - Larger and more prominent */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-5 shadow-lg border border-primary/20 flex-shrink-0">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            
            {/* Header Content */}
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 text-xs">
                {t('wellbot.available_24_7')}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                {t('wellbot.title')}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-3 max-w-2xl">
                {t('wellbot.description')}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">{t('wellbot.online')}</span>
              </div>
            </div>
          </div>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
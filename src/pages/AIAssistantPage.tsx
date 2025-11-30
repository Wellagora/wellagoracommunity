import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

const AIAssistantPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8 text-center animate-fade-in">
          <Badge variant="secondary" className="mb-4 text-xs">
            {t('wellbot.available_24_7')}
          </Badge>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            {t('wellbot.title')}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('wellbot.description')}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">{t('wellbot.online')}</span>
          </div>
        </div>

        <AIAssistantChat />
      </div>
    </div>
  );
};

export default AIAssistantPage;
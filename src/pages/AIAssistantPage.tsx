import AIAssistantChat from "@/components/ai/AIAssistantChat";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

const AIAssistantPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t('seo.ai_assistant.title')}
        description={t('seo.ai_assistant.description')}
      />
    <div className="bg-background">
      <AIAssistantChat />
    </div>
    </>
  );
};

export default AIAssistantPage;


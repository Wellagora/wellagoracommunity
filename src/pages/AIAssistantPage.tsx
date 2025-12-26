import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";

const AIAssistantPage = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navigation />
      <AIAssistantChat />
    </div>
  );
};

export default AIAssistantPage;

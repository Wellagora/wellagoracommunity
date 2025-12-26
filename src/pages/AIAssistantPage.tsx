import Navigation from "@/components/Navigation";
import AIAssistantChat from "@/components/ai/AIAssistantChat";

const AIAssistantPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <AIAssistantChat />
      </main>
    </div>
  );
};

export default AIAssistantPage;

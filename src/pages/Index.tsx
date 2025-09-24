import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StakeholderSection from "@/components/StakeholderSection";
import AIAssistantSection from "@/components/AIAssistantSection";
import ChallengesSection from "@/components/ChallengesSection";
import CommunitySection from "@/components/CommunitySection";
import ImpactSection from "@/components/ImpactSection";
import WelcomeToast from "@/components/WelcomeToast";
import FloatingActionHub from "@/components/FloatingActionHub";
import InteractiveFeatures from "@/components/InteractiveFeatures";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />
      <HeroSection />
      <StakeholderSection />
      <AIAssistantSection />
      <ChallengesSection />
      <InteractiveFeatures />
      <CommunitySection />
      <ImpactSection />
      
      {/* Interactive Elements */}
      <WelcomeToast />
      <FloatingActionHub />
    </div>
  );
};

export default Index;

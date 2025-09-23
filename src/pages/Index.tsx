import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StakeholderSection from "@/components/StakeholderSection";
import AIAssistantSection from "@/components/AIAssistantSection";
import ChallengesSection from "@/components/ChallengesSection";
import CommunitySection from "@/components/CommunitySection";
import ImpactSection from "@/components/ImpactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <StakeholderSection />
      <AIAssistantSection />
      <ChallengesSection />
      <CommunitySection />
      <ImpactSection />
    </div>
  );
};

export default Index;

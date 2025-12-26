import Navigation from "@/components/Navigation";
import UnifiedCommunityHub from "@/components/community/UnifiedCommunityHub";
import { StoryOfTheWeek } from "@/components/StoryOfTheWeek";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <UnifiedCommunityHub />
        <StoryOfTheWeek />
      </main>
    </div>
  );
};

export default CommunityPage;
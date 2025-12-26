import UnifiedCommunityHub from "@/components/community/UnifiedCommunityHub";
import { StoryOfTheWeek } from "@/components/StoryOfTheWeek";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedCommunityHub />
      <StoryOfTheWeek />
    </div>
  );
};

export default CommunityPage;

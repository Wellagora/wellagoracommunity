import Navigation from "@/components/Navigation";
import CommunityHubNew from "@/components/community/CommunityHubNew";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <CommunityHubNew />
      </div>
    </div>
  );
};

export default CommunityPage;

import Navigation from "@/components/Navigation";
import CommunityHub from "@/components/community/CommunityHub";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <CommunityHub />
      </div>
    </div>
  );
};

export default CommunityPage;
import Navigation from "@/components/Navigation";
import CommunityHub from "@/components/community/CommunityHub";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <CommunityHub />
      </div>
    </div>
  );
};

export default CommunityPage;
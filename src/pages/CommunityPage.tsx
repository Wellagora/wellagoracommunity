import Navigation from "@/components/Navigation";
import CommunityHubNew from "@/components/community/CommunityHubNew";
import CommunityTeaser from "@/components/community/CommunityTeaser";
import { useAuth } from "@/contexts/AuthContext";

const CommunityPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        {user ? <CommunityHubNew /> : <CommunityTeaser />}
      </div>
    </div>
  );
};

export default CommunityPage;

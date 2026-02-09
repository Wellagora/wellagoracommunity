import CommunityHubNew from "@/components/community/CommunityHubNew";
import CommunityTeaser from "@/components/community/CommunityTeaser";
import { useAuth } from "@/contexts/AuthContext";

const CommunityPage = () => {
  const { user } = useAuth();

  // AppLayout already provides Navigation + pt-16, no need to duplicate
  return user ? <CommunityHubNew /> : <CommunityTeaser />;
};

export default CommunityPage;

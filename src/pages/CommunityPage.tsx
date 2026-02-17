import CommunityHubNew from "@/components/community/CommunityHubNew";
import CommunityTeaser from "@/components/community/CommunityTeaser";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

const CommunityPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // AppLayout already provides Navigation + pt-16, no need to duplicate
  return (
    <>
      <SEOHead
        title={t('seo.community.title')}
        description={t('seo.community.description')}
      />
      {user ? <CommunityHubNew /> : <CommunityTeaser />}
    </>
  );
};

export default CommunityPage;

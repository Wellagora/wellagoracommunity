import { useLanguage } from "@/contexts/LanguageContext";

interface Sponsor {
  name: string;
  logo: string;
  sponsorUserId?: string;
  organizationId?: string;
}

interface ChallengeSponsorInfoProps {
  sponsor?: Sponsor;
}

const ChallengeSponsorInfo = ({ sponsor }: ChallengeSponsorInfoProps) => {
  const { t } = useLanguage();

  if (!sponsor) {
    return null;
  }

  const handleClick = () => {
    if (sponsor.organizationId) {
      window.location.href = `/organization/${sponsor.organizationId}`;
    } else if (sponsor.sponsorUserId) {
      window.location.href = `/profile/${sponsor.sponsorUserId}`;
    }
  };

  return (
    <div 
      className="p-4 rounded-lg bg-card border border-border cursor-pointer hover:border-primary/50 transition-all group"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {typeof sponsor.logo === 'string' && sponsor.logo.startsWith('http') ? (
          <img 
            src={sponsor.logo} 
            alt={sponsor.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
            {sponsor.logo}
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {t('challenges.sponsored_by')}: {sponsor.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('challenges.click_for_profile')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSponsorInfo;

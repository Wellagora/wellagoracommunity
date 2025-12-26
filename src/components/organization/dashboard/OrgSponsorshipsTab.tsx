import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users,
  Award,
  Plus,
  Heart,
  Sparkles,
  Trophy,
  Leaf,
  Handshake,
  Zap,
  Building2
} from "lucide-react";
import { OrganizationChallengeStats } from "@/components/dashboard/OrganizationChallengeStats";
import SponsorActiveSponsorships from "@/components/sponsor/SponsorActiveSponsorships";
import { Partnership, ImpactStory } from "@/hooks/useOrgDashboard";

interface OrgSponsorshipsTabProps {
  partnerships: Partnership[];
  impactStories: ImpactStory[];
  loadingStories: boolean;
  sponsorshipRefreshKey: number;
  onOpenSponsorModal: () => void;
  t: (key: string) => string;
}

export const OrgSponsorshipsTab = ({
  partnerships,
  impactStories,
  loadingStories,
  sponsorshipRefreshKey,
  onOpenSponsorModal,
  t
}: OrgSponsorshipsTabProps) => {
  const getPartnershipTypeIcon = (type: Partnership['type']) => {
    switch (type) {
      case 'ngo': return Heart;
      case 'government': return Building2;
      case 'business': return Handshake;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('organization.challenge_ecosystem')}</h3>
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-smooth w-full sm:w-auto"
          onClick={onOpenSponsorModal}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('organization.sponsor_challenge')}
        </Button>
      </div>

      {/* Employee Participation Stats */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('organization.employee_participation')}
        </h4>
        <OrganizationChallengeStats />
      </div>

      {/* Active Sponsorships */}
      <SponsorActiveSponsorships key={sponsorshipRefreshKey} />

      {/* Partnerships Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('organization.community_connections')}</h3>
          <Button className="bg-gradient-primary hover:shadow-glow transition-smooth w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t('organization.find_partner')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {partnerships.map((partner) => {
            const PartnerIcon = getPartnershipTypeIcon(partner.type);
            return (
              <Card key={partner.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <PartnerIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground mb-1 truncate">{partner.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {partner.type === 'ngo' ? t('organization.ngo_badge') : 
                         partner.type === 'government' ? t('organization.government_badge') : t('organization.business_badge')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t('organization.joint_projects')}</span>
                      <span className="font-semibold">{partner.projects}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{t('organization.impact_score')}</span>
                        <span className="font-medium">{partner.impact_score}</span>
                      </div>
                      <Progress value={partner.impact_score} className="h-2" />
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    {t('organization.contact')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Impact Stories */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('organization.impact_stories')}</h3>
        <p className="text-muted-foreground">
          {t('organization.success_stories_desc')}
        </p>
      </div>

      <div className="space-y-4">
        {loadingStories ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : impactStories.length === 0 ? (
          <Card className="p-8 text-center bg-card/50">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t('organization.no_impact_stories')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('organization.sponsor_challenges_hint')}
            </p>
          </Card>
        ) : impactStories.map((story) => (
          <Card key={story.id} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Avatar/Icon */}
                <div className="flex-shrink-0">
                  {story.type === 'participant' && story.userAvatar ? (
                    <img 
                      src={story.userAvatar} 
                      alt={story.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : story.type === 'milestone' ? (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <Handshake className="w-6 h-6 text-success" />
                    </div>
                  )}
                </div>

                {/* Story Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    {story.userName && (
                      <p className="font-semibold text-foreground">{story.userName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{story.challengeTitle}</p>
                  </div>
                  
                  <p className="text-foreground">{story.story}</p>

                  {/* Impact Metrics */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {story.impact.co2_saved && (
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4 text-success" />
                        <span className="font-medium text-success">{story.impact.co2_saved}kg CO₂</span>
                        <span className="text-muted-foreground">{t('organization.saved')}</span>
                      </div>
                    )}
                    {story.impact.participants && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">{story.impact.participants}</span>
                        <span className="text-muted-foreground">{t('organization.participants')}</span>
                      </div>
                    )}
                    {story.impact.achievement && (
                      <Badge variant="outline" className="text-warning border-warning">
                        <Award className="w-3 h-3 mr-1" />
                        {story.impact.achievement}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {new Date(story.date).toLocaleDateString('hu-HU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

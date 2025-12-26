import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Users,
  Award,
  TrendingUp,
  Plus
} from "lucide-react";
import { OrgMetrics } from "@/hooks/useOrgDashboard";

interface OrgOverviewTabProps {
  metrics: OrgMetrics;
  organizationId: string | null | undefined;
  onNavigateToSponsorships: () => void;
  onOpenSponsorModal: () => void;
  onOpenMobilizeModal: () => void;
  t: (key: string) => string;
}

export const OrgOverviewTab = ({
  metrics,
  organizationId,
  onNavigateToSponsorships,
  onOpenSponsorModal,
  onOpenMobilizeModal,
  t
}: OrgOverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* ESG Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.loading ? (
          <>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-success" />
              <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
            </Card>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
            </Card>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-warning/10 to-warning/5">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-warning" />
              <p className="text-xs sm:text-sm text-muted-foreground">{t('common.loading')}</p>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-success/10 to-success/5">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-2xl sm:text-3xl font-bold text-success">{metrics.activeSponsorships}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.active_sponsorships')}</p>
            </Card>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl sm:text-3xl font-bold text-primary">{metrics.totalParticipants}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.total_participants')}</p>
            </Card>
            <Card className="p-4 sm:p-6 text-center bg-gradient-to-br from-warning/10 to-warning/5">
              <Award className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl sm:text-3xl font-bold text-warning">{metrics.totalCompletions}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.total_completions')}</p>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-smooth py-6 text-base"
          onClick={onNavigateToSponsorships}
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('organization.create_new_challenge')}
        </Button>
        <Button 
          variant="outline"
          className="border-warning/50 hover:bg-warning/10 transition-smooth py-6 text-base"
          onClick={onOpenSponsorModal}
        >
          <Award className="w-5 h-5 mr-2 text-warning" />
          {t('organization.sponsor_challenge')}
        </Button>
        <Button 
          variant="outline"
          className="border-accent/50 hover:bg-accent/10 transition-smooth py-6 text-base"
          onClick={onOpenMobilizeModal}
          disabled={!organizationId}
        >
          <Users className="w-5 h-5 mr-2 text-accent" />
          {t('organization.mobilize_team')}
        </Button>
      </div>
    </div>
  );
};

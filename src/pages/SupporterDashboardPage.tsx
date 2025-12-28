import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  DollarSign, 
  BookOpen, 
  Users, 
  Plus, 
  FileDown, 
  Gift,
  ArrowLeft 
} from 'lucide-react';
import SponsorCreditsOverview from '@/components/sponsor/SponsorCreditsOverview';
import SponsorTransactionHistory from '@/components/sponsor/SponsorTransactionHistory';
import SponsorActiveSponsorships from '@/components/sponsor/SponsorActiveSponsorships';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

const SupporterDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { currentSubscription } = useSubscription();
  const [showPackages, setShowPackages] = useState(false);

  // Check if user is a business/sponsor type
  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('auth.login_required')}</h2>
          <Button onClick={() => navigate('/auth')}>
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  if (!isSponsor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('supporter.access_denied')}</h2>
          <p className="text-muted-foreground mb-4">{t('supporter.sponsor_only')}</p>
          <Button onClick={() => navigate('/dashboard')}>
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#FFD700]/20">
              <Building2 className="h-8 w-8 text-[#FFD700]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('supporter.title')}</h1>
              <p className="text-muted-foreground">{t('supporter.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-[#FFD700]" />
              <div>
                <p className="text-2xl font-bold">0 Ft</p>
                <p className="text-sm text-muted-foreground">{t('supporter.total_spent')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#00E5FF]" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('supporter.sponsored_guides')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('supporter.people_reached')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
            onClick={() => navigate('/piacer')}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('supporter.sponsor_new')}
          </Button>
          
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            {t('supporter.download_report')}
          </Button>
        </div>

        {/* Credits Overview */}
        <div className="mb-8">
          <SponsorCreditsOverview />
        </div>

        {/* Active Sponsorships or Empty State */}
        <Card className="p-6 bg-card border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('supporter.my_sponsorships')}</h2>
          
          {/* Empty State */}
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg">{t('supporter.no_sponsorships')}</p>
            <p className="text-muted-foreground mb-4">{t('supporter.no_sponsorships_desc')}</p>
            <Button 
              className="bg-[#FFD700] text-black"
              onClick={() => navigate('/piacer')}
            >
              {t('supporter.browse_guides')}
            </Button>
          </div>
        </Card>

        {/* Transaction History */}
        <div>
          <SponsorTransactionHistory />
        </div>
      </div>

      {/* Package Selection Dialog */}
      <Dialog open={showPackages} onOpenChange={setShowPackages}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {t('sponsor.choose_package')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SubscriptionPlanSelector 
              onSelectPlan={(planId) => {
                toast.success('Csomag kiválasztva! Stripe fizetés hamarosan elérhető.');
                setShowPackages(false);
              }}
              currentPlanKey={currentSubscription?.plan?.plan_key}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupporterDashboardPage;
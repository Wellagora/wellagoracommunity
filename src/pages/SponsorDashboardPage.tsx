import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SponsorCreditsOverview from '@/components/sponsor/SponsorCreditsOverview';
import SponsorTransactionHistory from '@/components/sponsor/SponsorTransactionHistory';
import SponsorActiveSponsorships from '@/components/sponsor/SponsorActiveSponsorships';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { currentSubscription } = useSubscription();
  const [showPackages, setShowPackages] = useState(false);

  // Check if user is a business/sponsor type
  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-light-transition flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-gradient-light-transition flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('sponsor.access_denied')}</h2>
          <p className="text-muted-foreground mb-4">{t('sponsor.sponsor_only')}</p>
          <Button onClick={() => navigate('/dashboard')}>
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light-transition">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back_to_dashboard')}
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground">
              {t('sponsor.dashboard_title')}
            </h1>
            <p className="text-gray-700 dark:text-muted-foreground mt-2">
              {t('sponsor.dashboard_subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/browse-programs')}
            >
              <Search className="w-4 h-4 mr-2" />
              {t('sponsor.browse_programs')}
            </Button>
            <Button
              className="bg-gradient-primary hover:shadow-glow"
              onClick={() => setShowPackages(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t('sponsor.buy_credits')}
            </Button>
          </div>
        </div>

        {/* Credits Overview */}
        <div className="mb-8">
          <SponsorCreditsOverview />
        </div>

        {/* Active Sponsorships */}
        <div className="mb-8">
          <SponsorActiveSponsorships />
        </div>

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

export default SponsorDashboardPage;

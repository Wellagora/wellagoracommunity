import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import SponsorCreditsOverview from '@/components/sponsor/SponsorCreditsOverview';
import SponsorTransactionHistory from '@/components/sponsor/SponsorTransactionHistory';
import SponsorActiveSponsorships from '@/components/sponsor/SponsorActiveSponsorships';

const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

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
          <Button
            className="bg-gradient-primary hover:shadow-glow"
            onClick={() => {
              // TODO: Navigate to credit purchase page
              alert(t('sponsor.stripe_coming_soon'));
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('sponsor.buy_credits')}
          </Button>
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
    </div>
  );
};

export default SponsorDashboardPage;

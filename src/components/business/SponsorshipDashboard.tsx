import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Leaf, 
  Target,
  Calendar,
  Award,
  BarChart3,
  Crown,
  Star,
  Gem
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';

interface SponsorshipDashboardProps {
  companyId: string;
}

const SponsorshipDashboard: React.FC<SponsorshipDashboardProps> = ({ companyId }) => {
  const { currentSubscription, availableCredits, credits, isLoading } = useSubscription();
  const { t } = useLanguage();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'silver': return 'bg-gray-500/10 text-gray-600 border-gray-200';  
      case 'gold': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'diamond': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-4 h-4" />;
      case 'silver': return <Star className="w-4 h-4" />;
      case 'gold': return <Crown className="w-4 h-4" />;
      case 'diamond': return <Gem className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'yyyy. MMM dd.', { locale: hu });
    } catch {
      return '-';
    }
  };

  const totalCredits = credits?.total_credits ?? 0;
  const usedCredits = credits?.used_credits ?? 0;
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{t('sponsorship.dashboard_title')}</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('sponsorship.dashboard_subtitle')}
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="flex items-center text-base md:text-lg">
              <CreditCard className="w-5 h-5 mr-2 flex-shrink-0" />
              {t('sponsorship.current_package')}
            </span>
            {currentSubscription?.plan ? (
              <Badge className={getTierColor(currentSubscription.plan.tier)}>
                {getTierIcon(currentSubscription.plan.tier)}
                <span className="ml-1">{currentSubscription.plan.name}</span>
              </Badge>
            ) : (
              <Badge variant="outline">{t('sponsorship.no_subscription')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSubscription?.plan ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base">{t('sponsorship.credit_usage')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>{t('sponsorship.credits_used')}</span>
                    <span className="font-medium">{usedCredits.toLocaleString()}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                    <span>{t('sponsorship.credits_remaining')}</span>
                    <span>{availableCredits.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm md:text-base">{t('sponsorship.package_details')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>{t('sponsorship.billing_period')}</span>
                    <span>
                      {currentSubscription.plan.billing_period === 'monthly' 
                        ? t('subscription.monthly') 
                        : t('subscription.yearly')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>{t('sponsorship.credits_per_month')}</span>
                    <span>{currentSubscription.plan.monthly_credits} kredit/hó</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>{t('sponsorship.renewal')}</span>
                    <span>{formatDate(currentSubscription.current_period_end)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('sponsorship.no_active_subscription')}</p>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                {t('sponsorship.browse_plans')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Metrics - Mock data for now */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t('sponsorship.participants_reached')}</p>
                <p className="text-xl md:text-2xl font-bold text-primary">0</p>
              </div>
              <Users className="w-6 md:w-8 h-6 md:h-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t('sponsorship.co2_saved')}</p>
                <p className="text-xl md:text-2xl font-bold text-success">0 kg</p>
              </div>
              <Leaf className="w-6 md:w-8 h-6 md:h-8 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t('sponsorship.brand_awareness')}</p>
                <p className="text-xl md:text-2xl font-bold text-accent">0</p>
              </div>
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-accent flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button size="lg" className="h-14 md:h-16 text-sm md:text-base">
          <Target className="w-4 md:w-5 h-4 md:h-5 mr-2" />
          {t('sponsorship.sponsor_new_challenge')}
        </Button>
        <Button size="lg" variant="outline" className="h-14 md:h-16 text-sm md:text-base">
          <BarChart3 className="w-4 md:w-5 h-4 md:h-5 mr-2" />
          {t('sponsorship.detailed_reports')}
        </Button>
      </div>
    </div>
  );
};

export default SponsorshipDashboard;

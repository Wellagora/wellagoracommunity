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
  BarChart3
} from 'lucide-react';
import { getSponsorshipDashboard, sponsorshipPackages } from '@/data/enhancedChallenges';

interface SponsorshipDashboardProps {
  companyId: string;
}

const SponsorshipDashboard: React.FC<SponsorshipDashboardProps> = ({ companyId }) => {
  const { subscription, loading, openCustomerPortal, packageTiers } = useSubscription();
  const { t } = useLanguage();
  const dashboardData = getSponsorshipDashboard(companyId);

  const getPackageColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'silver': return 'bg-gray-500/10 text-gray-600 border-gray-200';  
      case 'gold': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{t('sponsorship.dashboard_title')}</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('sponsorship.dashboard_subtitle')}
        </p>
      </div>

      {/* Current Package Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="flex items-center text-base md:text-lg">
              <CreditCard className="w-5 h-5 mr-2 flex-shrink-0" />
              {t('sponsorship.current_package')}
            </span>
            <Badge className={getPackageColor(dashboardData.activePackage.level)}>
              {dashboardData.activePackage.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">{t('sponsorship.credit_usage')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>{t('sponsorship.credits_used')}</span>
                  <span className="font-medium">{dashboardData.creditsUsed.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(dashboardData.creditsUsed / (dashboardData.creditsUsed + dashboardData.creditsRemaining)) * 100} 
                  className="h-2" 
                />
                <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                  <span>{t('sponsorship.credits_remaining')}</span>
                  <span>{dashboardData.creditsRemaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">{t('sponsorship.package_details')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>{t('sponsorship.duration')}</span>
                  <span>{dashboardData.activePackage.duration} {t('sponsorship.months')}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>{t('sponsorship.active_challenges')}</span>
                  <span>{dashboardData.sponsoredChallenges}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>{t('sponsorship.renewal')}</span>
                  <span>{dashboardData.upcomingRenewal.toLocaleDateString('hu-HU')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t('sponsorship.participants_reached')}</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{dashboardData.totalParticipants.toLocaleString()}</p>
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
                <p className="text-xl md:text-2xl font-bold text-success">{dashboardData.impactGenerated.co2Saved} kg</p>
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
                <p className="text-xl md:text-2xl font-bold text-accent">{dashboardData.impactGenerated.brandsAwareness}</p>
              </div>
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-accent flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Award className="w-5 h-5 mr-2 flex-shrink-0" />
            {t('sponsorship.available_packages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {sponsorshipPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  pkg.level === dashboardData.activePackage.level 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="text-center mb-4">
                  <Badge className={getPackageColor(pkg.level)}>
                    {pkg.name}
                  </Badge>
                  <div className="mt-2">
                    <span className="text-xl md:text-2xl font-bold">{pkg.priceHuf.toLocaleString()}</span>
                    <span className="text-xs md:text-sm text-muted-foreground"> HUF</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {pkg.duration} / {pkg.credits} {t('sponsorship.credits')}
                  </p>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {pkg.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="text-xs md:text-sm flex items-start">
                      <span className="text-success mr-2 flex-shrink-0">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={pkg.level === dashboardData.activePackage.level ? "outline" : "default"}
                  className="w-full text-sm"
                  disabled={pkg.level === dashboardData.activePackage.level}
                >
                  {pkg.level === dashboardData.activePackage.level ? t('sponsorship.active_package') : t('sponsorship.switch')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
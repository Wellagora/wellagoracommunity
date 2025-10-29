import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SponsorshipDashboard from '@/components/business/SponsorshipDashboard';
import SponsorshipPackageSelector from '@/components/business/SponsorshipPackageSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Target, 
  Users, 
  Leaf, 
  TrendingUp,
  Award,
  Building2,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';

const BusinessSponsorshipPage = () => {
  const { user, profile } = useAuth();
  const { createCheckout, packageTiers } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard'>('overview');

  // Mock sponsored challenges data
  const sponsoredChallenges = [
    {
      id: '1',
      title: 'Műanyagmentes Munkahely',
      sponsor: 'GreenTech Solutions Kft.',
      participants: 234,
      co2Saved: 1250,
      status: 'active',
      creditsUsed: 15000,
      endDate: '2024-12-15'
    },
    {
      id: '2', 
      title: 'Zöld Közlekedési Kihívás',
      sponsor: 'EcoTransport Ltd.',
      participants: 567,
      co2Saved: 2340,
      status: 'active',
      creditsUsed: 25000,
      endDate: '2024-11-30'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Card>
            <CardContent className="p-8">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">{t('business_sponsorship.login_title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('business_sponsorship.login_desc')}
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-success">
                {t('business_sponsorship.login_button')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profile?.user_role !== 'business') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              {t('business_sponsorship.access_denied')}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                {t('business_sponsorship.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('business_sponsorship.subtitle')}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-success text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t('business_sponsorship.premium_badge')}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 mb-6 sm:mb-8 bg-card/50 p-2 sm:p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1 text-xs sm:text-sm"
          >
            {t('business_sponsorship.tab_overview')}
          </Button>
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{t('business_sponsorship.tab_dashboard')}</span>
            <span className="sm:hidden">{t('business_sponsorship.tab_dashboard_short')}</span>
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Business Model Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  {t('business_sponsorship.business_model')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('business_sponsorship.how_it_works')}</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">{t('business_sponsorship.step1_title')}</p>
                          <p className="text-sm text-muted-foreground">{t('business_sponsorship.step1_desc')}</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">{t('business_sponsorship.step2_title')}</p>
                          <p className="text-sm text-muted-foreground">{t('business_sponsorship.step2_desc')}</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">{t('business_sponsorship.step3_title')}</p>
                          <p className="text-sm text-muted-foreground">{t('business_sponsorship.step3_desc')}</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">4</span>
                        </div>
                        <div>
                          <p className="font-medium">{t('business_sponsorship.step4_title')}</p>
                          <p className="text-sm text-muted-foreground">{t('business_sponsorship.step4_desc')}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-success/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-lg mb-4">{t('business_sponsorship.why_sponsor')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm">{t('business_sponsorship.benefit_awareness')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">{t('business_sponsorship.benefit_community')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4 text-success" />
                        <span className="text-sm">{t('business_sponsorship.benefit_impact')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="text-sm">{t('business_sponsorship.benefit_esg')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Sponsorships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {t('business_sponsorship.active_sponsorships')}
                  </span>
                  <Badge variant="secondary">{sponsoredChallenges.length} {t('business_sponsorship.active_count')}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sponsoredChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {challenge.participants} {t('business_sponsorship.participants')} • {challenge.co2Saved} {t('business_sponsorship.co2_saved')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{challenge.creditsUsed.toLocaleString()} {t('business_sponsorship.credits_used')}</div>
                        <div className="text-xs text-muted-foreground">{t('business_sponsorship.expiry')}: {challenge.endDate}</div>
                        <Badge className="bg-success/20 text-success">{t('business_sponsorship.status_active')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button onClick={() => setActiveTab('dashboard')} className="bg-gradient-to-r from-primary to-success">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('business_sponsorship.sponsor_new')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Sponsorship Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('business_sponsorship.packages_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {t('business_sponsorship.packages_desc')}
                </p>
                <SponsorshipPackageSelector />
              </CardContent>
            </Card>

            <SponsorshipDashboard companyId={profile?.organization_id || 'company-1'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSponsorshipPage;
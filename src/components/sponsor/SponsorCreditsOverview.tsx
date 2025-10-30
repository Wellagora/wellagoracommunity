import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, TrendingDown, Wallet, Leaf, Users, Award } from 'lucide-react';
import { getSponsorDashboardMetrics, type SponsorDashboardMetrics } from '@/services/SponsorImpactService';

interface SponsorCredits {
  total_credits: number;
  used_credits: number;
  available_credits: number;
}

const SponsorCreditsOverview = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [credits, setCredits] = useState<SponsorCredits | null>(null);
  const [metrics, setMetrics] = useState<SponsorDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('sponsor_credits')
        .select('total_credits, used_credits, available_credits')
        .eq('sponsor_user_id', user?.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error loading credits:', creditsError);
      }

      setCredits(creditsData || { total_credits: 0, used_credits: 0, available_credits: 0 });

      // Load real impact metrics
      const impactMetrics = await getSponsorDashboardMetrics(user?.id || '');
      setMetrics(impactMetrics);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = credits && credits.total_credits > 0 
    ? (credits.used_credits / credits.total_credits) * 100 
    : 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Total Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sponsor.total_credits')}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.total_credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('sponsor.purchased_total')}
            </p>
          </CardContent>
        </Card>

        {/* Available Credits */}
        <Card className="border-2 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sponsor.available_credits')}
            </CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {credits?.available_credits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sponsor.ready_to_use')}
            </p>
          </CardContent>
        </Card>

        {/* Used Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sponsor.used_credits')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.used_credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% {t('sponsor.utilized')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real Impact Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('sponsor.people_reached')}
              </CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {metrics.total_participants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.total_completions} {t('sponsor.completions')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('sponsor.co2_savings')}
              </CardTitle>
              <Leaf className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {metrics.total_co2_saved.toFixed(1)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ {metrics.trees_equivalent.toFixed(1)} {t('sponsor.trees')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('sponsor.points_distributed')}
              </CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {metrics.total_points_distributed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('sponsor.gamification_points')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('sponsor.validation_accuracy')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {(metrics.average_validation_score * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('sponsor.average_reliability')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sponsor.credit_usage')}</CardTitle>
          <CardDescription>
            {t('sponsor.realtime_data')} • {metrics?.active_sponsorships || 0} {t('sponsor.active_sponsorships_count')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('sponsor.usage_progress')}</span>
              <span className="font-medium">
                {credits?.used_credits || 0} / {credits?.total_credits || 0}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          
          {credits && credits.available_credits < 50 && credits.available_credits > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <p className="text-sm text-warning font-medium">
                ⚠️ {t('sponsor.low_credits_warning')}
              </p>
            </div>
          )}
          
          {credits && credits.available_credits === 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ❌ {t('sponsor.no_credits_warning')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SponsorCreditsOverview;

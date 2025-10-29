import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SponsorCredits {
  total_credits: number;
  used_credits: number;
  available_credits: number;
}

const SponsorCreditsOverview = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [credits, setCredits] = useState<SponsorCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsor_credits')
        .select('total_credits, used_credits, available_credits')
        .eq('sponsor_user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading credits:', error);
        return;
      }

      setCredits(data || { total_credits: 0, used_credits: 0, available_credits: 0 });
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

  const usagePercentage = credits ? (credits.used_credits / credits.total_credits) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
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

      {/* Credit Usage Progress */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>{t('sponsor.credit_usage')}</CardTitle>
          <CardDescription>{t('sponsor.usage_overview')}</CardDescription>
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
    </div>
  );
};

export default SponsorCreditsOverview;

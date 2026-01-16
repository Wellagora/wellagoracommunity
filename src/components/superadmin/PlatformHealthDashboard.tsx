import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  TrendingUp, 
  Wallet,
  CreditCard,
  Users,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PlatformMetrics {
  totalMembershipFees: number;
  totalTransactionCommissions: number;
  totalSponsorPackageRevenue: number;
  activeSponsors: number;
  totalCreditsInCirculation: number;
  creditsUsedThisMonth: number;
}

interface SponsorPackage {
  id: string;
  package_key: string;
  name_hu: string;
  name_en: string;
  total_price_huf: number;
  platform_fee_huf: number;
  credits_huf: number;
  bonus_credits_huf: number;
  billing_period: string;
  is_active: boolean;
}

/**
 * PlatformHealthDashboard - Super Admin Component
 * 
 * Shows platform financial health:
 * - Total Membership Fees collected
 * - Total Transaction Commissions (20%)
 * - Sponsor Package management
 */
const PlatformHealthDashboard = () => {
  const { language } = useLanguage();
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalMembershipFees: 0,
    totalTransactionCommissions: 0,
    totalSponsorPackageRevenue: 0,
    activeSponsors: 0,
    totalCreditsInCirculation: 0,
    creditsUsedThisMonth: 0
  });
  const [packages, setPackages] = useState<SponsorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load transactions for commission calculation
      const { data: transactions } = await supabase
        .from('transactions')
        .select('platform_fee, platform_commission, amount, transaction_type, created_at')
        .in('transaction_type', ['purchase', 'sponsored_purchase', 'sponsorship']);

      // Load credit transactions for sponsor package revenue
      const { data: creditTx } = await supabase
        .from('credit_transactions')
        .select('credits, transaction_type, created_at')
        .eq('transaction_type', 'purchase');

      // Load sponsor packages
      const { data: packagesData } = await supabase
        .from('sponsor_packages')
        .select('*')
        .order('total_price_huf', { ascending: true });

      // Load active sponsors count
      const { count: sponsorCount } = await supabase
        .from('sponsor_credits')
        .select('*', { count: 'exact', head: true })
        .gt('available_credits', 0);

      // Calculate metrics
      let totalCommissions = 0;
      let totalMemberFees = 0;
      
      transactions?.forEach(tx => {
        const commission = tx.platform_commission || tx.platform_fee || 0;
        totalCommissions += commission;
      });

      // Sponsor package revenue (platform fees from packages)
      let sponsorPackageRevenue = 0;
      creditTx?.forEach(tx => {
        // Estimate: 33% of credits purchased is platform fee for quarterly, 17% for annual
        sponsorPackageRevenue += Math.round(tx.credits * 0.20);
      });

      // Total credits in circulation
      const { data: creditsData } = await supabase
        .from('sponsor_credits')
        .select('available_credits, used_credits');

      let totalCirculation = 0;
      let monthlyUsed = 0;
      creditsData?.forEach(c => {
        totalCirculation += c.available_credits || 0;
      });

      setMetrics({
        totalMembershipFees: totalMemberFees,
        totalTransactionCommissions: totalCommissions,
        totalSponsorPackageRevenue: sponsorPackageRevenue,
        activeSponsors: sponsorCount || 0,
        totalCreditsInCirculation: totalCirculation,
        creditsUsedThisMonth: monthlyUsed
      });

      if (packagesData) {
        setPackages(packagesData);
      }
    } catch (error) {
      console.error('Error loading platform health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === 'hu' ? 'Platform Egészség' : 'Platform Health'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'hu' 
              ? 'Pénzügyi áttekintés és bevételi metrikák'
              : 'Financial overview and revenue metrics'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {language === 'hu' ? 'Frissítés' : 'Refresh'}
        </Button>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 text-xs">
                  20%
                </Badge>
              </div>
              <p className="text-3xl font-bold text-emerald-700">
                {formatCurrency(metrics.totalTransactionCommissions)}
              </p>
              <p className="text-sm text-emerald-600/80 mt-1">
                {language === 'hu' ? 'Tranzakciós Jutalék' : 'Transaction Commission'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <Badge variant="outline" className="border-indigo-300 text-indigo-700 text-xs">
                  {language === 'hu' ? 'Csomagok' : 'Packages'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-indigo-700">
                {formatCurrency(metrics.totalSponsorPackageRevenue)}
              </p>
              <p className="text-sm text-indigo-600/80 mt-1">
                {language === 'hu' ? 'Szponzor Csomag Díjak' : 'Sponsor Package Fees'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">
                  {language === 'hu' ? 'Aktív' : 'Active'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-amber-700">
                {formatCurrency(metrics.totalCreditsInCirculation)}
              </p>
              <p className="text-sm text-amber-600/80 mt-1">
                {language === 'hu' ? 'Kreditek Forgalomban' : 'Credits in Circulation'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {metrics.activeSponsors}
              </p>
              <p className="text-sm text-purple-600/80 mt-1">
                {language === 'hu' ? 'Aktív Támogatók' : 'Active Sponsors'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sponsor Packages Management */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {language === 'hu' ? 'Szponzor Csomagok' : 'Sponsor Packages'}
          </CardTitle>
          <CardDescription>
            {language === 'hu' 
              ? 'Aktív támogatói csomagok és árazás'
              : 'Active sponsor packages and pricing'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`border ${pkg.billing_period === 'annual' ? 'border-emerald-300 bg-emerald-50/50' : 'border-border'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">
                      {language === 'hu' ? pkg.name_hu : pkg.name_en}
                    </h4>
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                      {pkg.is_active 
                        ? (language === 'hu' ? 'Aktív' : 'Active')
                        : (language === 'hu' ? 'Inaktív' : 'Inactive')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'hu' ? 'Teljes ár' : 'Total price'}
                      </span>
                      <span className="font-medium">{formatCurrency(pkg.total_price_huf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'hu' ? 'Platform díj' : 'Platform fee'}
                      </span>
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(pkg.platform_fee_huf)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === 'hu' ? 'Kreditek' : 'Credits'}
                      </span>
                      <span className="font-medium">{formatCurrency(pkg.credits_huf)}</span>
                    </div>
                    {pkg.bonus_credits_huf > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {language === 'hu' ? 'Bónusz' : 'Bonus'}
                        </span>
                        <span className="font-medium text-amber-600">
                          +{formatCurrency(pkg.bonus_credits_huf)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 80/20 Rule Reminder */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {language === 'hu' ? '80/20 Bevétel Megosztás' : '80/20 Revenue Split'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'hu'
                  ? 'Minden tranzakció a Szakértő teljes árán alapul. A platform 20%-ot kap, a Szakértő 80%-ot – függetlenül attól, hogy Tag vagy Szponzor fizeti.'
                  : 'All transactions are based on the Expert\'s full price. Platform receives 20%, Expert receives 80% – regardless of whether Member or Sponsor pays.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformHealthDashboard;

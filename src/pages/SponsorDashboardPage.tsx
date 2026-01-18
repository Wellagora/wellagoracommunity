import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Users,
  Calendar,
  Ticket,
  TrendingUp,
  Wallet,
  Search,
  Plus,
  Gift,
  Building2,
  CreditCard,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// ============= TYPE DEFINITIONS =============
interface SponsorStats {
  peopleReached: number;
  monthlyGrowth: number;
  programsSupported: number;
  vouchersRedeemed: number;
  conversionRate: number;
  totalImpactCO2: number;
}

interface SponsoredProgram {
  id: string;
  programName: string;
  expertName: string;
  vouchersRedeemed: number;
  vouchersTotal: number;
  status: 'active' | 'completed';
}

interface ChartDataPoint {
  month: string;
  reached: number;
  credits: number;
}

// ============= MAIN COMPONENT =============
const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { currentSubscription } = useSubscription();
  const [showPackages, setShowPackages] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SponsorStats>({
    peopleReached: 0,
    monthlyGrowth: 0,
    programsSupported: 0,
    vouchersRedeemed: 0,
    conversionRate: 0,
    totalImpactCO2: 0
  });
  const [sponsoredPrograms, setSponsoredPrograms] = useState<SponsoredProgram[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [creditInfo, setCreditInfo] = useState({
    usedCredits: 0,
    totalCredits: 100,
    availableCredits: 100
  });

  // Fetch REAL data from Supabase with optimized aggregate queries
  useEffect(() => {
    const fetchSponsorData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // 1. Get sponsorship counts (aggregate - no full row fetch)
        const { count: challengeSponsorshipCount } = await supabase
          .from('challenge_sponsorships')
          .select('*', { count: 'exact', head: true })
          .eq('sponsor_user_id', user.id);

        // 2. Fetch content sponsorships (need IDs for further queries)
        const { data: contentSponsorships } = await supabase
          .from('content_sponsorships')
          .select('id, content_id, total_licenses, used_licenses, expert_contents(id, title, creator_id)')
          .eq('sponsor_id', user.id);

        const contentIds = contentSponsorships?.map(c => c.content_id) || [];
        const totalPrograms = (challengeSponsorshipCount || 0) + (contentSponsorships?.length || 0);

        // 3. Get voucher counts using aggregate (optimized - no full row fetch)
        let totalVouchersRedeemed = 0;
        let totalLicenses = 0;
        
        if (contentIds.length > 0) {
          // Single aggregate query for all redeemed vouchers
          const { count: redeemedCount } = await supabase
            .from('vouchers')
            .select('*', { count: 'exact', head: true })
            .in('content_id', contentIds)
            .eq('status', 'redeemed');
          
          totalVouchersRedeemed = redeemedCount || 0;
          totalLicenses = contentSponsorships?.reduce((sum, cs) => sum + (cs.total_licenses || 50), 0) || 0;

          // Single aggregate for unique users reached
          const { count: uniqueUserCount } = await supabase
            .from('vouchers')
            .select('user_id', { count: 'exact', head: true })
            .in('content_id', contentIds);
          
          // Build programs list with per-content counts (batch where possible)
          const programs: SponsoredProgram[] = [];
          
          // Get all creator IDs at once
          const creatorIds = contentSponsorships
            ?.map(cs => cs.expert_contents?.creator_id)
            .filter(Boolean) as string[];
          
          // Batch fetch all creators
          interface CreatorProfile {
            id: string;
            first_name: string | null;
            last_name: string | null;
          }
          
          const { data: creators } = creatorIds.length > 0 
            ? await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', creatorIds)
            : { data: [] as CreatorProfile[] };
          
          const creatorMap = new Map<string, CreatorProfile>(
            (creators || []).map((c: CreatorProfile) => [c.id, c])
          );

          // Get per-content voucher counts
          for (const cs of contentSponsorships || []) {
            const { count } = await supabase
              .from('vouchers')
              .select('*', { count: 'exact', head: true })
              .eq('content_id', cs.content_id)
              .eq('status', 'redeemed');

            const creator = creatorMap.get(cs.expert_contents?.creator_id || '');
            
            programs.push({
              id: cs.content_id,
              programName: cs.expert_contents?.title || 'Program',
              expertName: creator ? `${creator.first_name} ${creator.last_name}` : 'Szakértő',
              vouchersRedeemed: count || 0,
              vouchersTotal: cs.total_licenses || 50,
              status: (count || 0) >= (cs.total_licenses || 50) ? 'completed' : 'active'
            });
          }
          
          setSponsoredPrograms(programs);
        }

        // 4. Credit data from sponsor_credits table (source of truth)
        const { data: sponsorCreditsData, error: creditsError } = await supabase
          .from('sponsor_credits')
          .select('total_credits, used_credits, available_credits')
          .eq('sponsor_user_id', user.id)
          .maybeSingle();

        if (creditsError && creditsError.code !== 'PGRST116') {
          console.error('Error fetching sponsor credits:', creditsError);
        }

        // Use real data from sponsor_credits table
        const realCredits = sponsorCreditsData || { 
          total_credits: 0, 
          used_credits: 0, 
          available_credits: 0 
        };
        
        console.log('[SponsorDashboard] Credits from sponsor_credits table:', realCredits);

        // 5. Calculate unique users reached
        let peopleReached = 0;
        if (contentIds.length > 0) {
          const { data: userIds } = await supabase
            .from('vouchers')
            .select('user_id')
            .in('content_id', contentIds);
          
          peopleReached = new Set(userIds?.map(v => v.user_id) || []).size;
        }

        // 6. Monthly growth - compare with last month
        const comparisonDate = new Date();
        comparisonDate.setMonth(comparisonDate.getMonth() - 1);
        
        let monthlyGrowth = 0;
        if (contentIds.length > 0) {
          const { count: lastMonthCount } = await supabase
            .from('vouchers')
            .select('*', { count: 'exact', head: true })
            .in('content_id', contentIds)
            .lt('created_at', comparisonDate.toISOString());

          monthlyGrowth = lastMonthCount && lastMonthCount > 0
            ? Math.round(((totalVouchersRedeemed - lastMonthCount) / lastMonthCount) * 100)
            : totalVouchersRedeemed > 0 ? 100 : 0;
        }

        // Calculate conversion rate
        const conversionRate = totalLicenses > 0 
          ? Math.round((totalVouchersRedeemed / totalLicenses) * 100) 
          : 0;

        // Calculate CO2 impact (estimate: 2kg per voucher redeemed)
        const totalImpactCO2 = totalVouchersRedeemed * 2;

        setStats({
          peopleReached,
          monthlyGrowth,
          programsSupported: totalPrograms,
          vouchersRedeemed: totalVouchersRedeemed,
          conversionRate,
          totalImpactCO2
        });

        setCreditInfo({
          usedCredits: realCredits.used_credits || 0,
          totalCredits: realCredits.total_credits || 0,
          availableCredits: realCredits.available_credits || 0
        });

        // Generate chart data from real credits data
        const chartPoints: ChartDataPoint[] = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const usedCreditsValue = realCredits.used_credits || 0;
        
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          chartPoints.push({
            month: months[monthIndex],
            reached: Math.round(peopleReached * ((6 - i) / 6)),
            credits: Math.round(usedCreditsValue * ((6 - i) / 6))
          });
        }
        setChartData(chartPoints);

      } catch (error) {
        console.error('Error fetching sponsor data:', error);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsorData();
  }, [user, t]);

  // Organization name
  const orgName = profile?.organization_name || profile?.first_name || t('sponsor_hub.your_company');

  // Currency formatter
  const formatCurrency = (amount: number) => {
    if (language === 'hu') {
      return `${amount.toLocaleString('hu-HU')} Ft`;
    }
    const eurAmount = Math.round(amount / 400);
    return `€${eurAmount.toLocaleString()}`;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          <p className="text-emerald-600 text-sm">
            {payload[0]?.value} {t('sponsor_hub.people')}
          </p>
          <p className="text-indigo-600 text-sm">
            {payload[1]?.value} kredit
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if user is a business/sponsor type OR is Super Admin
  const isSponsor = profile?.user_role && ['business', 'government', 'ngo', 'sponsor'].includes(profile.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">{t('auth.login_required')}</h2>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-black hover:bg-black/90 text-white"
          >
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  // Super Admins can always access
  if (!isSponsor && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">{t('sponsor.access_denied')}</h2>
          <p className="text-black/60 mb-4">{t('sponsor.sponsor_only')}</p>
          <Button
            onClick={() => navigate('/iranyitopult')}
            className="bg-black hover:bg-black/90 text-white"
          >
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const creditUsagePercent = creditInfo.totalCredits > 0 
    ? Math.round((creditInfo.usedCredits / creditInfo.totalCredits) * 100)
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout
        title={t('sponsor_hub.title')}
        subtitle={`${t('sponsor_hub.subtitle')} • ${orgName}`}
        icon={Building2}
        iconColor="text-emerald-600"
        backUrl="/"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('sponsor_hub.title')}
      subtitle={`${t('sponsor_hub.subtitle')} • ${orgName}`}
      icon={Building2}
      iconColor="text-emerald-600"
      backUrl="/"
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/piacer')}
          className="border-black/10 text-black hover:bg-black/5"
        >
          <Search className="w-4 h-4 mr-2" />
          {t('sponsor_hub.explore_programs')}
        </Button>
        <Button
          onClick={() => setShowStripeModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {t('sponsor_hub.buy_credits')}
        </Button>
      </div>

      {/* Impact Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Card 1: People Reached */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.people_reached')}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.peopleReached}</p>
                {stats.monthlyGrowth > 0 && (
                  <Badge className="mt-2 bg-emerald-600 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.monthlyGrowth}% {t('sponsor_hub.this_month')}
                  </Badge>
                )}
              </div>
              <div className="p-3 sm:p-4 rounded-full bg-emerald-100">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Conversion Rate */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.conversion_rate') || 'Konverzió'}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.conversionRate}%</p>
                <p className="text-sm text-black/50 mt-2">
                  {stats.vouchersRedeemed} {t('sponsor_hub.vouchers_redeemed')}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-full bg-indigo-100">
                <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Impact */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.total_impact') || 'CO₂ Hatás'}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-black">{stats.totalImpactCO2} kg</p>
                <p className="text-sm text-black/50 mt-2">
                  {stats.programsSupported} {t('sponsor_hub.programs_supported')}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-full bg-amber-100">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Chart Section - Takes 2 columns */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black">
              {t('sponsor_hub.roi_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReached" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="reached"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReached)"
                    name={t('sponsor_hub.people_reached')}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="credits"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCredits)"
                    name={t('sponsor_hub.used_credits')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Credit Monitor - Takes 1 column */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              {t('sponsor_dashboard.credit_usage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-black/60">{t('sponsor_hub.used_credits')}</span>
                  <span className="font-medium text-black">{creditUsagePercent}%</span>
                </div>
                <Progress value={creditUsagePercent} className="h-3 bg-black/5" />
                <p className="text-xs text-black/50 mt-1">
                  {creditInfo.usedCredits} / {creditInfo.totalCredits} kredit
                </p>
              </div>

              {/* Available Balance */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-700 mb-1">{t('sponsor_hub.available_balance')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
                  {creditInfo.availableCredits} kredit
                </p>
              </div>

              {/* Buy Credits Button */}
              <Button
                onClick={() => setShowStripeModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('sponsor_hub.buy_credits')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsored Programs List */}
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-black flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-600" />
            {t('sponsor_hub.sponsored_programs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sponsoredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                {t('sponsor_hub.no_programs_title')}
              </h3>
              <p className="text-black/50 mb-6">
                {t('sponsor_hub.no_programs_desc')}
              </p>
              <Button onClick={() => navigate('/piacer')} className="bg-black hover:bg-black/90 text-white">
                {t('sponsor_hub.explore_programs')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-black/60">
                      {t('sponsor_hub.program')}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black/60">
                      {t('sponsor_hub.expert')}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black/60">
                      {t('sponsor_hub.redeemed')}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-black/60">
                      {t('sponsor_hub.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sponsoredPrograms.map((program) => (
                    <tr
                      key={program.id}
                      className="border-b border-black/5 hover:bg-black/[0.02] transition-colors cursor-pointer"
                      onClick={() => navigate(`/piacer/${program.id}`)}
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-black text-sm sm:text-base">{program.programName}</p>
                      </td>
                      <td className="py-4 px-4 text-black/60 text-sm">
                        {program.expertName}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(program.vouchersRedeemed / program.vouchersTotal) * 100}
                            className="w-16 sm:w-20 h-2"
                          />
                          <span className="text-xs sm:text-sm text-black/60">
                            {program.vouchersRedeemed}/{program.vouchersTotal}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={program.status === 'active' ? 'default' : 'secondary'}
                          className={
                            program.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-black/10 text-black/70'
                          }
                        >
                          {t(`sponsor_hub.${program.status}`)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Payment Modal */}
      <Dialog open={showStripeModal} onOpenChange={setShowStripeModal}>
        <DialogContent className="max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              {t('sponsor_hub.buy_credits')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-black font-medium mb-2">
              {language === 'hu' 
                ? 'Stripe fizetési kapu integráció alatt.' 
                : language === 'de'
                ? 'Stripe-Zahlungsintegration wird entwickelt.'
                : 'Stripe payment gateway integration in progress.'}
            </p>
            <p className="text-black/60 text-sm">
              {language === 'hu' 
                ? 'Hamarosan elérhető!' 
                : language === 'de'
                ? 'Bald verfügbar!'
                : 'Coming soon!'}
            </p>
          </div>
          <Button
            onClick={() => setShowStripeModal(false)}
            className="w-full bg-black hover:bg-black/90 text-white"
          >
            {t('common.close') || 'Bezárás'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Package Selection Dialog */}
      <Dialog open={showPackages} onOpenChange={setShowPackages}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-black">
              {t('sponsor_dashboard.select_package')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SubscriptionPlanSelector
              onSelectPlan={(planId) => {
                toast.success(t('sponsor_dashboard.package_selected'));
                setShowPackages(false);
              }}
              currentPlanKey={currentSubscription?.plan?.plan_key}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SponsorDashboardPage;

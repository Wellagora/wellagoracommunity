import { useState, useMemo } from 'react';
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
import { toast } from 'sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  getDemoSponsorData,
  getLocalizedOrgName,
  MOCK_VOUCHERS,
  MOCK_PROGRAMS,
  getMockExpertById,
  getLocalizedProgramTitle,
  type MockSponsor
} from '@/data/mockData';
import {
  Users,
  Calendar,
  Ticket,
  TrendingUp,
  Wallet,
  Search,
  Plus,
  Gift,
  Building2
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
interface ImpactData {
  month: string;
  reached: number;
  credits: number;
}

interface SponsoredProgram {
  id: string;
  programName: string;
  expertName: string;
  vouchersRedeemed: number;
  vouchersTotal: number;
  status: 'active' | 'completed';
}

interface SponsorStats {
  peopleReached: number;
  monthlyGrowth: number;
  programsSupported: number;
  vouchersRedeemed: number;
}

// ============= CHART DATA =============
const chartData: ImpactData[] = [
  { month: 'Aug', reached: 12, credits: 5000 },
  { month: 'Sep', reached: 28, credits: 8000 },
  { month: 'Oct', reached: 45, credits: 12000 },
  { month: 'Nov', reached: 78, credits: 15000 },
  { month: 'Dec', reached: 102, credits: 18000 },
  { month: 'Jan', reached: 127, credits: 15000 },
];

// ============= MAIN COMPONENT =============
const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, isDemoMode } = useAuth();
  const { t, language } = useLanguage();
  const { currentSubscription } = useSubscription();
  const [showPackages, setShowPackages] = useState(false);

  // Get sponsor data - demo or real
  const sponsorData: MockSponsor = useMemo(() => {
    if (isDemoMode) {
      return getDemoSponsorData();
    }
    // In production, fetch from Supabase; for now, use demo data
    return getDemoSponsorData();
  }, [isDemoMode]);

  const orgName = getLocalizedOrgName(sponsorData, language);

  // Calculate dynamic stats from MOCK_VOUCHERS
  const stats: SponsorStats = useMemo(() => {
    const vouchersRedeemed = MOCK_VOUCHERS.filter(
      v => v.sponsor_name === sponsorData.organization_name && v.status === 'redeemed'
    ).length;

    return {
      peopleReached: sponsorData.people_reached,
      monthlyGrowth: 23, // Mock for demo
      programsSupported: sponsorData.sponsored_programs,
      vouchersRedeemed
    };
  }, [sponsorData]);

  // Get sponsored programs dynamically
  const sponsoredPrograms: SponsoredProgram[] = useMemo(() => {
    // Find programs where sponsor_name matches
    const programs = MOCK_PROGRAMS.filter(p => {
      const sponsorName = p.sponsor_name;
      // Match "Káli Panzió" or similar variations
      return sponsorName === sponsorData.organization_name ||
             sponsorName === 'Káli Panzió' ||
             (isDemoMode && p.is_sponsored);
    }).slice(0, 4); // Limit to 4 for Káli Panzió demo

    return programs.map(p => {
      const expert = getMockExpertById(p.creator_id);
      const redeemed = MOCK_VOUCHERS.filter(
        v => v.content_id === p.id && v.status === 'redeemed'
      ).length;
      const totalLicenses = 50; // Default

      return {
        id: p.id,
        programName: getLocalizedProgramTitle(p, language),
        expertName: expert
          ? `${expert.first_name} ${expert.last_name}`
          : t('sponsor_hub.unknown_expert'),
        vouchersRedeemed: redeemed,
        vouchersTotal: totalLicenses,
        status: redeemed >= totalLicenses ? 'completed' : 'active' as const
      };
    });
  }, [sponsorData, language, isDemoMode, t]);

  // Currency formatter
  const formatCurrency = (amount: number) => {
    if (language === 'hu') {
      return `${amount.toLocaleString('hu-HU')} Ft`;
    }
    // Convert to EUR (approximate rate)
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
            {formatCurrency(payload[1]?.value || 0)}
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('auth.login_required')}</h2>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('sponsor.access_denied')}</h2>
          <p className="text-muted-foreground mb-4">{t('sponsor.sponsor_only')}</p>
          <Button
            onClick={() => navigate('/iranyitopult')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const creditUsagePercent = Math.round((sponsorData.used_credits / sponsorData.total_credits) * 100);

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
          onClick={() => setShowPackages(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('sponsor_hub.buy_credits')}
        </Button>
      </div>

      {/* Impact Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: People Reached */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.people_reached')}
                </p>
                <p className="text-4xl font-bold text-black">{stats.peopleReached}</p>
                <Badge className="mt-2 bg-emerald-600 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.monthlyGrowth} {t('sponsor_hub.this_month')}
                </Badge>
              </div>
              <div className="p-4 rounded-full bg-emerald-100">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Programs Supported */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.programs_supported')}
                </p>
                <p className="text-4xl font-bold text-black">{stats.programsSupported}</p>
                <p className="text-sm text-black/50 mt-2">
                  {t('sponsor_hub.active_programs')}
                </p>
              </div>
              <div className="p-4 rounded-full bg-indigo-100">
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Vouchers Redeemed */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black/60 mb-1">
                  {t('sponsor_hub.vouchers_redeemed')}
                </p>
                <p className="text-4xl font-bold text-black">{stats.vouchersRedeemed}</p>
                <p className="text-sm text-black/50 mt-2">
                  {t('sponsor_hub.redeemed')}
                </p>
              </div>
              <div className="p-4 rounded-full bg-amber-100">
                <Ticket className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart Section - Takes 2 columns */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">
              {t('sponsor_hub.roi_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis yAxisId="left" stroke="#10b981" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
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
            <CardTitle className="text-xl text-black flex items-center gap-2">
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
                  {formatCurrency(sponsorData.used_credits)} / {formatCurrency(sponsorData.total_credits)}
                </p>
              </div>

              {/* Available Balance */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-700 mb-1">{t('sponsor_hub.available_balance')}</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {formatCurrency(sponsorData.available_credits)}
                </p>
              </div>

              {/* Buy Credits Button */}
              <Button
                onClick={() => {
                  toast.info(t('sponsor_hub.coming_soon'));
                }}
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
          <CardTitle className="text-xl text-black flex items-center gap-2">
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
            <div className="overflow-x-auto">
              <table className="w-full">
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
                        <p className="font-medium text-black">{program.programName}</p>
                      </td>
                      <td className="py-4 px-4 text-black/60">
                        {program.expertName}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(program.vouchersRedeemed / program.vouchersTotal) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm text-black/60">
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

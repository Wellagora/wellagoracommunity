import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import SponsorPackageSelector from '@/components/sponsor/SponsorPackageSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import { SponsorDashboardSkeleton } from '@/components/ui/loading-skeleton';
import {
  Users,
  Wallet,
  Gift,
  Building2,
  CreditCard,
  Plus,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

// ============= TYPE DEFINITIONS =============
interface CreditTotals {
  currentBalance: number;
  totalPurchased: number;
  totalSpent: number;
}

interface SponsorSpendItem {
  id: string;
  created_at: string | null;
  description: string | null;
  credits: number;
  transaction_type: string;
}

interface SponsoredItem {
  id: string;
  name: string;
  type: 'program' | 'event';
  status: 'active' | 'ended';
  href?: string;
}

interface SponsorTargetOption {
  id: string;
  name: string;
}

// ============= MAIN COMPONENT =============
const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isSponsoring, setIsSponsoring] = useState(false);

  const [sponsorTargetType, setSponsorTargetType] = useState<'program' | 'event'>('program');
  const [availablePrograms, setAvailablePrograms] = useState<SponsorTargetOption[]>([]);
  const [availableEvents, setAvailableEvents] = useState<SponsorTargetOption[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [spendCreditsAmount, setSpendCreditsAmount] = useState<number>(50000);

  const purchaseTypes = useMemo(() => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'], []);
  const spendTypes = useMemo(() => ['deduction', 'sponsorship', 'usage', 'spend'], []);

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, { hu: string; en: string; de: string }> = {
      purchase: { hu: 'Kredit vásárlás', en: 'Credit Purchase', de: 'Kreditkauf' },
      subscription: { hu: 'Előfizetés', en: 'Subscription', de: 'Abonnement' },
      initial: { hu: 'Kezdő egyenleg', en: 'Initial Balance', de: 'Anfangssaldo' },
      bonus: { hu: 'Bónusz kredit', en: 'Bonus Credit', de: 'Bonus-Kredit' },
      rollover: { hu: 'Átvitt egyenleg', en: 'Rollover Balance', de: 'Übertragenes Guthaben' },
      deduction: { hu: 'Levonás', en: 'Deduction', de: 'Abzug' },
      sponsorship: { hu: 'Szponzoráció', en: 'Sponsorship', de: 'Sponsoring' },
      usage: { hu: 'Felhasználás', en: 'Usage', de: 'Nutzung' },
      spend: { hu: 'Szponzorálás', en: 'Sponsorship', de: 'Sponsoring' },
    };
    return labels[type]?.[language as keyof (typeof labels)[string]] || type;
  };

  const balanceQuery = useQuery({
    queryKey: ['sponsorDashboard', 'balance', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<CreditTotals> => {
      if (!user?.id) return { currentBalance: 0, totalPurchased: 0, totalSpent: 0 };
      const [creditPurchasesRes, creditSpendsRes] = await Promise.all([
        supabase
          .from('credit_transactions')
          .select('credits, transaction_type')
          .eq('sponsor_user_id', user.id)
          .in('transaction_type', purchaseTypes),
        supabase
          .from('credit_transactions')
          .select('credits, transaction_type')
          .eq('sponsor_user_id', user.id)
          .in('transaction_type', spendTypes),
      ]);
      if (creditPurchasesRes.error) throw creditPurchasesRes.error;
      if (creditSpendsRes.error) throw creditSpendsRes.error;

      const totalPurchased = (creditPurchasesRes.data || []).reduce((sum, row) => sum + (row.credits || 0), 0);
      const totalSpent = Math.abs((creditSpendsRes.data || []).reduce((sum, row) => sum + (row.credits || 0), 0));
      const currentBalance = Math.max(0, totalPurchased - totalSpent);
      return { currentBalance, totalPurchased, totalSpent };
    },
    retry: false,
  });

  // Removed spendingQuery - not needed for MVP

  const sponsoredItemsQuery = useQuery({
    queryKey: ['sponsorDashboard', 'sponsoredItems', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<SponsoredItem[]> => {
      if (!user?.id) return [];
      const sponsorId = user.id;
      const [sponsorProgramsRes, sponsorEventsRes] = await Promise.all([
        supabase
          .from('content_sponsorships')
          .select(
            `
              id,
              content_id,
              is_active,
              expert_contents:content_id (
                id,
                title
              )
            `
          )
          .eq('sponsor_id', sponsorId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('event_sponsors')
          .select(
            `
              id,
              event_id,
              is_active,
              events:event_id (
                id,
                title,
                end_date
              )
            `
          )
          .eq('sponsor_id', sponsorId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (sponsorProgramsRes.error) throw sponsorProgramsRes.error;
      if (sponsorEventsRes.error) throw sponsorEventsRes.error;

      const programItems: SponsoredItem[] = (sponsorProgramsRes.data || []).map((row: any) => {
        const isActive = row.is_active !== false;
        return {
          id: row.id,
          name: row.expert_contents?.title || t('common.program'),
          type: 'program',
          status: isActive ? 'active' : 'ended',
          href: row.content_id ? `/piacer/${row.content_id}` : undefined,
        };
      });

      const now = new Date();
      const eventItems: SponsoredItem[] = (sponsorEventsRes.data || []).map((row: any) => {
        const end = row.events?.end_date ? new Date(row.events.end_date) : null;
        const isActive = row.is_active !== false && (!end || end >= now);
        return {
          id: row.id,
          name: row.events?.title || t('common.event'),
          type: 'event',
          status: isActive ? 'active' : 'ended',
        };
      });

      return [...programItems, ...eventItems];
    },
    retry: false,
  });

  // Impact metrics query
  const impactQuery = useQuery({
    queryKey: ['sponsorDashboard', 'impact', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return { beneficiaries: 0, programsSponsored: 0, eventsSponsored: 0, totalReach: 0 };

      const [programSponsorships, eventSponsorships, vouchersUsed] = await Promise.all([
        supabase
          .from('content_sponsorships')
          .select('id, content_id')
          .eq('sponsor_id', user.id),
        supabase
          .from('event_sponsors')
          .select('id, event_id')
          .eq('sponsor_id', user.id),
        supabase
          .from('voucher_settlements')
          .select('id, user_id')
          .eq('sponsor_id', user.id),
      ]);

      const uniqueBeneficiaries = new Set(
        (vouchersUsed.data || []).map((v: any) => v.user_id)
      );

      return {
        beneficiaries: uniqueBeneficiaries.size,
        programsSponsored: (programSponsorships.data || []).length,
        eventsSponsored: (eventSponsorships.data || []).length,
        totalReach: uniqueBeneficiaries.size + (eventSponsorships.data || []).length * 10,
      };
    },
    retry: false,
  });

  const loadSponsorTargets = async () => {
    try {
      const [{ data: programsData }, { data: eventsData }] = await Promise.all([
        supabase
          .from('expert_contents')
          .select('id, title')
          .eq('is_published', true)
          .order('title', { ascending: true })
          .limit(50),
        supabase
          .from('events')
          .select('id, title')
          .eq('is_public', true)
          .order('start_date', { ascending: true })
          .limit(50),
      ]);

      setAvailablePrograms((programsData || []).map((p: any) => ({ id: p.id, name: p.title })));
      setAvailableEvents((eventsData || []).map((e: any) => ({ id: e.id, name: e.title })));
    } catch (e) {
      // If permissions are missing, keep lists empty but don't crash.
      console.error('[SponsorDashboard] Failed to load sponsor targets', e);
      setAvailablePrograms([]);
      setAvailableEvents([]);
    }
  };


  const handleOpenSponsorModal = async () => {
    setSelectedTargetId('');
    setSponsorTargetType('program');
    setSpendCreditsAmount(50000);
    await loadSponsorTargets();
    setShowSponsorModal(true);
  };

  const handleSponsorSpend = async () => {
    if (!user) return;

    if (!selectedTargetId) {
      toast.error(t('sponsor_hub.errors.select_item'));
      return;
    }

    if (!spendCreditsAmount || spendCreditsAmount <= 0) {
      toast.error(t('sponsor_hub.errors.enter_amount'));
      return;
    }

    const currentBalance = balanceQuery.data?.currentBalance ?? 0;
    if (spendCreditsAmount > currentBalance) {
      toast.error(t('sponsor_hub.errors.insufficient_credits'));
      return;
    }

    setIsSponsoring(true);
    try {
      const sponsorId = user.id;
      const targetName = sponsorTargetType === 'program'
        ? (availablePrograms.find(p => p.id === selectedTargetId)?.name || selectedTargetId)
        : (availableEvents.find(e => e.id === selectedTargetId)?.name || selectedTargetId);

      if (sponsorTargetType === 'program') {
        const seats = 10;
        const perSeat = Math.max(1, Math.floor(spendCreditsAmount / seats));

        const { error: sponsorshipError } = await supabase
          .from('content_sponsorships')
          .insert({
            content_id: selectedTargetId,
            sponsor_id: sponsorId,
            total_licenses: seats,
            used_licenses: 0,
            is_active: true,
            max_sponsored_seats: seats,
            sponsored_seats_used: 0,
            sponsor_contribution_huf: perSeat,
          } as any);

        if (sponsorshipError) throw sponsorshipError;
      } else {
        const { error: eventSponsorError } = await supabase
          .from('event_sponsors')
          .insert({
            event_id: selectedTargetId,
            sponsor_id: sponsorId,
            is_active: true,
            contribution_amount: spendCreditsAmount,
          } as any);

        if (eventSponsorError) throw eventSponsorError;
      }

      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          sponsor_user_id: user.id,
          credits: spendCreditsAmount,
          transaction_type: 'spend',
          description: sponsorTargetType === 'program'
            ? `${t('sponsor_hub.tx_description.program')} ${targetName}`
            : `${t('sponsor_hub.tx_description.event')} ${targetName}`,
        });

      if (txError) throw txError;

      toast.success(t('sponsor_hub.success.sponsorship_recorded'));
      setShowSponsorModal(false);
      await queryClient.invalidateQueries({ queryKey: ['sponsorDashboard'] });
    } catch (e: any) {
      console.error('[SponsorDashboard] sponsor spend failed', e);
      toast.error(e?.message || t('common.error'));
      await queryClient.invalidateQueries({ queryKey: ['sponsorDashboard'] });
    } finally {
      setIsSponsoring(false);
    }
  };

  // Organization name
  const orgName = profile?.organization_name || profile?.first_name || t('sponsor_hub.your_company');

  // Currency formatter
  const formatCurrency = (amount: number) => {
    const isHu = language === 'hu';
    const locale = isHu ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US';
    const eurAmount = Math.round(amount / 400);
    const displayAmount = isHu ? amount : eurAmount;
    const currency = isHu ? 'HUF' : 'EUR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(displayAmount);
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

  const isInitialLoading =
    balanceQuery.isLoading || sponsoredItemsQuery.isLoading;

  if (isInitialLoading) {
    return (
      <DashboardLayout
        title={t('sponsor_hub.title')}
        subtitle={`${t('sponsor_hub.subtitle')} • ${orgName}`}
        icon={Building2}
        iconColor="text-emerald-600"
        backUrl="/"
      >
        <SponsorDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const creditTotals: CreditTotals | null = balanceQuery.isError ? null : (balanceQuery.data || null);
  const creditUsagePercent = creditTotals && creditTotals.totalPurchased > 0
    ? Math.round((creditTotals.totalSpent / creditTotals.totalPurchased) * 100)
    : 0;

  const sponsoredItems: SponsoredItem[] = sponsoredItemsQuery.isError ? [] : (sponsoredItemsQuery.data || []);

  return (
    <DashboardLayout
      title={t('sponsor_hub.title')}
      subtitle={`${t('sponsor_hub.subtitle')} • ${orgName}`}
      icon={Building2}
      iconColor="text-emerald-600"
      backUrl="/"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* BALANCE */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              {t('sponsor_hub.cards.balance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceQuery.isError ? (
              <div className="text-sm text-muted-foreground">{t('common.no_data')}</div>
            ) : !creditTotals || creditTotals.totalPurchased === 0 ? (
              <div className="text-center py-6">
                <Wallet className="w-10 h-10 text-black/20 mx-auto mb-3" />
                <p className="text-black/60 text-sm mb-4">{t('sponsor_hub.cards.balance.empty')}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => setShowBuyCreditsModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('sponsor_hub.buy_credits')}
                  </Button>
                  <Button
                    onClick={handleOpenSponsorModal}
                    variant="outline"
                    className="border-black/10 text-black hover:bg-black/5"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {t('sponsor_hub.primary_cta')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 mb-1">{t('sponsor_hub.cards.balance.available')}</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {creditTotals.currentBalance.toLocaleString()} {t('common.credit')}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-black/5">
                    <p className="text-sm text-black/60 mb-1">{t('sponsor_hub.cards.balance.purchased')}</p>
                    <p className="text-2xl font-bold text-black">{creditTotals.totalPurchased.toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-black/5">
                    <p className="text-sm text-black/60 mb-1">{t('sponsor_hub.cards.balance.spent')}</p>
                    <p className="text-2xl font-bold text-black">{creditTotals.totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-black/60">{t('sponsor_hub.cards.balance.usage')}</span>
                    <span className="font-medium text-black">{creditUsagePercent}%</span>
                  </div>
                  <Progress value={creditUsagePercent} className="h-3 bg-black/5" />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => setShowBuyCreditsModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('sponsor_hub.buy_credits')}
                  </Button>
                  <Button
                    onClick={handleOpenSponsorModal}
                    variant="outline"
                    className="border-black/10 text-black hover:bg-black/5"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {t('sponsor_hub.primary_cta')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* IMPACT METRICS */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {t('sponsor_hub.cards.impact.title') || 'Hatás és Elérés'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{impactQuery.data?.beneficiaries || 0}</p>
                <p className="text-xs text-blue-700">{t('sponsor_hub.impact.beneficiaries') || 'Kedvezményezettek'}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <Gift className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-indigo-900">{impactQuery.data?.programsSponsored || 0}</p>
                <p className="text-xs text-indigo-700">{t('sponsor_hub.impact.programs') || 'Szponzorált programok'}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-900">{impactQuery.data?.eventsSponsored || 0}</p>
                <p className="text-xs text-emerald-700">{t('sponsor_hub.impact.events') || 'Szponzorált események'}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-900">{impactQuery.data?.totalReach || 0}</p>
                <p className="text-xs text-amber-700">{t('sponsor_hub.impact.reach') || 'Becsült elérés'}</p>
              </div>
            </div>
            {creditTotals && creditTotals.totalSpent > 0 && impactQuery.data && impactQuery.data.beneficiaries > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800 font-medium">
                  {t('sponsor_hub.impact.cost_per_beneficiary') || 'Költség / kedvezményezett'}:{' '}
                  <span className="font-bold">
                    {formatCurrency(Math.round(creditTotals.totalSpent / impactQuery.data.beneficiaries))}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SPONSORED ITEMS */}
        <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-black flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              {t('sponsor_hub.cards.sponsored.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sponsoredItemsQuery.isError ? (
              <div className="text-sm text-muted-foreground">{t('common.no_data')}</div>
            ) : sponsoredItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">{t('sponsor_hub.cards.sponsored.empty')}</div>
            ) : (
              <div className="space-y-3">
                {sponsoredItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl border border-black/5 p-4 ${item.href ? 'cursor-pointer hover:bg-black/[0.02]' : ''}`}
                    onClick={() => {
                      if (item.href) navigate(item.href);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-black truncate">{item.name}</p>
                      <p className="text-sm text-black/50">
                        {item.type === 'program' ? t('common.program') : t('common.event')}
                      </p>
                    </div>
                    <Badge
                      variant={item.status === 'active' ? 'default' : 'secondary'}
                      className={
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-black/10 text-black/70'
                      }
                    >
                      {item.status === 'active' ? t('sponsor_hub.item_status.active') : t('sponsor_hub.item_status.ended')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Buy Credits (Simulated) */}
      <Dialog open={showBuyCreditsModal} onOpenChange={setShowBuyCreditsModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              {t('sponsor_hub.buy_credits')}
            </DialogTitle>
          </DialogHeader>
          <SponsorPackageSelector
            onPurchaseComplete={async () => {
              await queryClient.invalidateQueries({ queryKey: ['sponsorDashboard'] });
            }}
            onClose={() => setShowBuyCreditsModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Sponsor Program/Event */}
      <Dialog open={showSponsorModal} onOpenChange={setShowSponsorModal}>
        <DialogContent className="max-w-lg p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              {t('sponsor_hub.sponsor_modal.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border border-black/10 p-3">
              <p className="text-sm text-black/60">
                {creditTotals
                  ? `${t('sponsor_hub.sponsor_modal.balance_available')}: ${creditTotals.currentBalance.toLocaleString()} ${t('common.credit')}`
                  : t('common.no_data')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('sponsor_hub.sponsor_modal.type_label')}</Label>
              <Select
                value={sponsorTargetType}
                onValueChange={(v) => {
                  setSponsorTargetType(v as 'program' | 'event');
                  setSelectedTargetId('');
                }}
              >
                <SelectTrigger className="border-black/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="program">{t('common.program')}</SelectItem>
                  <SelectItem value="event">{t('common.event')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('sponsor_hub.sponsor_modal.target_label')}</Label>
              <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                <SelectTrigger className="border-black/10">
                  <SelectValue placeholder={t('sponsor_hub.sponsor_modal.target_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {(sponsorTargetType === 'program' ? availablePrograms : availableEvents).map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(sponsorTargetType === 'program' ? availablePrograms : availableEvents).length === 0 && (
                <p className="text-xs text-black/50">
                  {t('sponsor_hub.sponsor_modal.no_list_help')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('sponsor_hub.sponsor_modal.spend_label')}</Label>
              <Input
                type="number"
                min={1}
                value={spendCreditsAmount}
                onChange={(e) => setSpendCreditsAmount(parseInt(e.target.value) || 0)}
                className="border-black/10"
              />
              <p className="text-xs text-black/50">
                {t('sponsor_hub.sponsor_modal.spend_help')}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-black/10"
                onClick={() => setShowSponsorModal(false)}
                disabled={isSponsoring}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSponsorSpend}
                disabled={isSponsoring}
              >
                {t('sponsor_hub.sponsor_modal.submit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SponsorDashboardPage;

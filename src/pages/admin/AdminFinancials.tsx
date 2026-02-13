import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { writeAuditLog } from '@/lib/auditLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Clock, RefreshCw, Settings,
  Percent, ArrowUpRight, Wallet, PiggyBank, Banknote, Receipt,
  Download, ChevronDown, ChevronUp, BarChart3, UserX
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

interface AdminOutletContext {
  selectedProjectId: string | null;
}

// ─── Types ───────────────────────────────────────────────────────
type TimePeriod = '7d' | '30d' | '90d' | 'all';

interface KpiData {
  totalRevenue: number;
  platformFee: number;
  pendingPayouts: number;
  completedPayouts: number;
  transactionCount: number;
  pendingExpertCount: number;
  userPayments: number;
  sponsorContributions: number;
  wellpointsDiscount: number;
}

interface ExpertBreakdown {
  expert_id: string;
  expert_name: string;
  programs_count: number;
  bookings_count: number;
  total_revenue: number;
  expert_payout: number;
  settlement_status: string;
}

interface SponsorCredit {
  id: string;
  sponsor_user_id: string;
  sponsor_name: string;
  sponsor_email: string;
  package_name: string | null;
  total_credits: number;
  used_credits: number;
  available_credits: number;
  status: 'active' | 'low' | 'empty';
  expanded?: boolean;
}

interface NoShowSummary {
  no_show_count: number;
  cancel_7plus: number;
  cancel_3to7: number;
  cancel_under3: number;
  refunded_credits: number;
  sponsor_credits_returned: number;
  expert_noshow_payouts: number;
}

interface SystemSetting {
  key: string;
  value: Record<string, number | string>;
}

// ─── Helpers ─────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount);

const periodToDate = (period: TimePeriod): string | null => {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
};

// ─── Component ───────────────────────────────────────────────────
const AdminFinancials = () => {
  const { user: adminUser } = useAuth();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [kpi, setKpi] = useState<KpiData>({ totalRevenue: 0, platformFee: 0, pendingPayouts: 0, completedPayouts: 0, transactionCount: 0, pendingExpertCount: 0, userPayments: 0, sponsorContributions: 0, wellpointsDiscount: 0 });
  const [expertBreakdown, setExpertBreakdown] = useState<ExpertBreakdown[]>([]);
  const [sponsorCredits, setSponsorCredits] = useState<SponsorCredit[]>([]);
  const [noShow, setNoShow] = useState<NoShowSummary>({ no_show_count: 0, cancel_7plus: 0, cancel_3to7: 0, cancel_under3: 0, refunded_credits: 0, sponsor_credits_returned: 0, expert_noshow_payouts: 0 });
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Record<string, Record<string, number | string>>>({});
  const [expandedExperts, setExpandedExperts] = useState<Set<string>>(new Set());
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(new Set());

  // ─── Data fetching ───────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    const since = periodToDate(period);
    try {
      await Promise.all([
        fetchKpi(since),
        fetchExpertBreakdown(since),
        fetchSponsorCredits(),
        fetchNoShow(since),
        fetchSettings(),
      ]);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Hiba az adatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const fetchKpi = async (since: string | null) => {
    let query = supabase.from('voucher_settlements').select('user_payment, sponsor_contribution, platform_fee, expert_payout, settlement_status, wellpoints_discount');
    if (since) query = query.gte('created_at', since);
    const { data } = await query;
    if (!data) return;

    let totalRevenue = 0, platformFee = 0, pendingPayouts = 0, completedPayouts = 0;
    let userPayments = 0, sponsorContributions = 0, wellpointsDiscount = 0;
    const pendingExperts = new Set<string>();

    data.forEach((row: any) => {
      const up = Number(row.user_payment) || 0;
      const sc = Number(row.sponsor_contribution) || 0;
      const pf = Number(row.platform_fee) || 0;
      const ep = Number(row.expert_payout) || 0;
      const wd = Number(row.wellpoints_discount) || 0;

      totalRevenue += up + sc;
      platformFee += pf;
      userPayments += up;
      sponsorContributions += sc;
      wellpointsDiscount += wd;

      if (row.settlement_status === 'pending') { pendingPayouts += ep; }
      else if (row.settlement_status === 'completed') { completedPayouts += ep; }
    });

    // Get pending expert count from full table (no period filter)
    const { data: pendingData } = await supabase.from('voucher_settlements').select('expert_id').eq('settlement_status', 'pending');
    pendingData?.forEach((r: any) => { if (r.expert_id) pendingExperts.add(r.expert_id); });

    setKpi({
      totalRevenue, platformFee, pendingPayouts, completedPayouts,
      transactionCount: data.length, pendingExpertCount: pendingExperts.size,
      userPayments, sponsorContributions, wellpointsDiscount,
    });
  };

  const fetchExpertBreakdown = async (since: string | null) => {
    let query = supabase.from('voucher_settlements').select('expert_id, content_id, user_payment, sponsor_contribution, expert_payout, platform_fee, settlement_status');
    if (since) query = query.gte('created_at', since);
    const { data } = await query;
    if (!data || data.length === 0) { setExpertBreakdown([]); return; }

    // Aggregate by expert
    const map = new Map<string, { programs: Set<string>; bookings: number; revenue: number; payout: number; status: string }>();
    data.forEach((r: any) => {
      const eid = r.expert_id || 'unknown';
      if (!map.has(eid)) map.set(eid, { programs: new Set(), bookings: 0, revenue: 0, payout: 0, status: 'completed' });
      const entry = map.get(eid)!;
      if (r.content_id) entry.programs.add(r.content_id);
      entry.bookings += 1;
      entry.revenue += (Number(r.user_payment) || 0) + (Number(r.sponsor_contribution) || 0);
      entry.payout += Number(r.expert_payout) || 0;
      if (r.settlement_status === 'pending') entry.status = 'pending';
    });

    // Fetch expert names
    const expertIds = Array.from(map.keys()).filter(id => id !== 'unknown');
    let namesMap: Record<string, string> = {};
    if (expertIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name').in('id', expertIds);
      profiles?.forEach((p: any) => { namesMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Ismeretlen'; });
    }

    setExpertBreakdown(Array.from(map.entries()).map(([id, v]) => ({
      expert_id: id, expert_name: namesMap[id] || 'Ismeretlen',
      programs_count: v.programs.size, bookings_count: v.bookings,
      total_revenue: v.revenue, expert_payout: v.payout, settlement_status: v.status,
    })).sort((a, b) => b.total_revenue - a.total_revenue));
  };

  const fetchSponsorCredits = async () => {
    const { data } = await supabase.from('sponsor_credits').select(`*, profiles:sponsor_user_id (first_name, last_name, email, organization_name)`);
    if (!data) { setSponsorCredits([]); return; }

    setSponsorCredits(data.map((c: any) => {
      const total = Number(c.total_credits) || 0;
      const available = Number(c.available_credits) || 0;
      let status: SponsorCredit['status'] = 'active';
      if (available <= 0) status = 'empty';
      else if (total > 0 && available <= total * 0.3) status = 'low';

      return {
        id: c.id, sponsor_user_id: c.sponsor_user_id,
        sponsor_name: c.profiles?.organization_name || [c.profiles?.first_name, c.profiles?.last_name].filter(Boolean).join(' ') || c.profiles?.email || 'Ismeretlen',
        sponsor_email: c.profiles?.email || '',
        package_name: null,
        total_credits: total,
        used_credits: Number(c.used_credits) || 0,
        available_credits: available,
        status,
      };
    }));
  };

  const fetchNoShow = async (since: string | null) => {
    let query = supabase.from('vouchers').select('is_no_show, cancellation_type, payout_amount');
    if (since) query = query.gte('created_at', since);
    const { data } = await query;
    if (!data) return;

    let no_show_count = 0, cancel_7plus = 0, cancel_3to7 = 0, cancel_under3 = 0;
    let refunded_credits = 0, expert_noshow_payouts = 0;
    data.forEach((v: any) => {
      if (v.is_no_show) { no_show_count++; expert_noshow_payouts += Number(v.payout_amount) || 0; }
      else if (v.cancellation_type === 'early') cancel_7plus++;
      else if (v.cancellation_type === 'medium') cancel_3to7++;
      else if (v.cancellation_type === 'late') cancel_under3++;
    });
    // Get refund data from settlements
    let sQuery = supabase.from('voucher_settlements').select('user_refund, sponsor_credit_action, sponsor_contribution').not('settlement_type', 'eq', 'normal');
    if (since) sQuery = sQuery.gte('created_at', since);
    const { data: sData } = await sQuery;
    let sponsor_credits_returned = 0;
    sData?.forEach((s: any) => {
      refunded_credits += Number(s.user_refund) || 0;
      if (s.sponsor_credit_action === 'refund') sponsor_credits_returned += Number(s.sponsor_contribution) || 0;
    });

    setNoShow({ no_show_count, cancel_7plus, cancel_3to7, cancel_under3, refunded_credits, sponsor_credits_returned, expert_noshow_payouts });
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('system_settings').select('key, value');
    if (data) {
      setSettings(data as SystemSetting[]);
      const editMap: Record<string, Record<string, number | string>> = {};
      data.forEach((s: any) => { editMap[s.key] = s.value; });
      setEditingSettings(editMap);
    }
  };

  useEffect(() => { fetchData(); }, [period, selectedProjectId]);

  // ─── Actions ─────────────────────────────────────────────────
  const markPayoutComplete = async (expertId: string) => {
    try {
      const { error } = await supabase.from('voucher_settlements').update({ settlement_status: 'completed', processed_at: new Date().toISOString() }).eq('expert_id', expertId).eq('settlement_status', 'pending');
      if (error) throw error;
      if (adminUser) await writeAuditLog({ action: 'admin_mark_payout_complete', tableName: 'voucher_settlements', recordId: expertId, userId: adminUser.id, userEmail: adminUser.email });
      toast.success('Kifizetés megjelölve készként!');
      fetchData();
    } catch { toast.error('Hiba a kifizetés frissítésekor'); }
  };

  const saveSettings = async () => {
    try {
      for (const [key, value] of Object.entries(editingSettings)) {
        await supabase.from('system_settings').update({ value }).eq('key', key);
      }
      toast.success('Beállítások mentve!');
      setSettingsOpen(false);
      fetchData();
    } catch { toast.error('Hiba a beállítások mentésekor'); }
  };

  const exportCSV = () => {
    const rows = [['Szakértő', 'Programok', 'Foglalások', 'Bevétel', 'Kifizetés', 'Státusz']];
    expertBreakdown.forEach(e => rows.push([e.expert_name, String(e.programs_count), String(e.bookings_count), String(e.total_revenue), String(e.expert_payout), e.settlement_status]));
    rows.push([]);
    rows.push(['--- KPI ---']);
    rows.push(['Teljes bevétel', String(kpi.totalRevenue)]);
    rows.push(['Platform jutalék', String(kpi.platformFee)]);
    rows.push(['Függő kifizetés', String(kpi.pendingPayouts)]);
    rows.push(['Kifizetett', String(kpi.completedPayouts)]);
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wellagora_financials_${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const platformFee = (settings.find(s => s.key === 'platform_fee')?.value?.percentage as number) || 20;

  // Sponsor credit summary
  const sponsorSummary = useMemo(() => {
    const active = sponsorCredits.filter(s => s.status === 'active').length;
    const low = sponsorCredits.filter(s => s.status === 'low').length;
    const empty = sponsorCredits.filter(s => s.status === 'empty').length;
    const total = sponsorCredits.reduce((s, c) => s + c.available_credits, 0);
    return { active, low, empty, total };
  }, [sponsorCredits]);

  // Revenue breakdown percentages
  const revTotal = kpi.userPayments + kpi.sponsorContributions + kpi.wellpointsDiscount;
  const pctUser = revTotal > 0 ? Math.round(kpi.userPayments / revTotal * 100) : 0;
  const pctSponsor = revTotal > 0 ? Math.round(kpi.sponsorContributions / revTotal * 100) : 0;
  const pctWellpoints = revTotal > 0 ? Math.round(kpi.wellpointsDiscount / revTotal * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ─── Header with period filter ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Pénzügyi Központ
          </h1>
          <p className="text-muted-foreground">Platform bevételek, kifizetések és szponzor kreditek kezelése</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <TabsList>
              <TabsTrigger value="7d">7 nap</TabsTrigger>
              <TabsTrigger value="30d">30 nap</TabsTrigger>
              <TabsTrigger value="90d">90 nap</TabsTrigger>
              <TabsTrigger value="all">Összes</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4 mr-1" />Beállítások</Button>
        </div>
      </div>

      {/* ─── 1. KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Teljes Bevétel</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpi.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.transactionCount} tranzakció</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50"><TrendingUp className="h-6 w-6 text-emerald-600" /></div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Jutalék ({platformFee}%)</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpi.platformFee)}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><ArrowUpRight className="h-3 w-3" />Bruttó bevétel része</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50"><Percent className="h-6 w-6 text-purple-600" /></div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className={cn(kpi.pendingExpertCount > 0 && "ring-2 ring-amber-400")}>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Függő Kifizetések</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpi.pendingPayouts)}</p>
                  <p className="text-xs text-amber-600 mt-1">{kpi.pendingExpertCount} szakértő vár</p>
                </div>
                <div className="p-3 rounded-full bg-amber-50"><Clock className="h-6 w-6 text-amber-600" /></div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kifizetett Összesen</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpi.completedPayouts)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Összes idők alatt</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50"><Banknote className="h-6 w-6 text-blue-600" /></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. Revenue Breakdown ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Bevétel Forrás Bontás</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32" /> : (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>Tag fizetett (Stripe)</span><span className="font-mono font-medium">{formatCurrency(kpi.userPayments)} ({pctUser}%)</span></div>
                <Progress value={pctUser} className="h-3 [&>div]:bg-emerald-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>Szponzor hozzájárulás</span><span className="font-mono font-medium">{formatCurrency(kpi.sponsorContributions)} ({pctSponsor}%)</span></div>
                <Progress value={pctSponsor} className="h-3 [&>div]:bg-amber-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>WellPoints kedvezmény <span className="text-muted-foreground">(marketing költség)</span></span><span className="font-mono font-medium">{formatCurrency(kpi.wellpointsDiscount)} ({pctWellpoints}%)</span></div>
                <Progress value={pctWellpoints} className="h-3 [&>div]:bg-blue-500" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 2b. Expert Breakdown Table ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Szakértőnkénti Bontás</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48" /> : expertBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nincs elszámolási adat az időszakban</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szakértő</TableHead>
                  <TableHead className="text-right">Programok</TableHead>
                  <TableHead className="text-right">Foglalások</TableHead>
                  <TableHead className="text-right">Bevétel</TableHead>
                  <TableHead className="text-right">Kifizetés (80%)</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expertBreakdown.map(e => (
                  <TableRow key={e.expert_id} className="hover:bg-muted">
                    <TableCell className="font-medium">{e.expert_name}</TableCell>
                    <TableCell className="text-right">{e.programs_count}</TableCell>
                    <TableCell className="text-right">{e.bookings_count}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(e.total_revenue)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{formatCurrency(e.expert_payout)}</TableCell>
                    <TableCell>
                      {e.settlement_status === 'pending' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Függő</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Rendben</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {e.settlement_status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => markPayoutComplete(e.expert_id)}>Fizet</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ─── 3. Sponsor Credit Health ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5" />Szponzor Kredit Egészség</CardTitle>
              <CardDescription>Összesen {formatCurrency(sponsorSummary.total)} kredit a rendszerben</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center"><p className="text-2xl font-bold text-emerald-600">{sponsorSummary.active}</p><p className="text-xs text-muted-foreground">Aktív</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-amber-600">{sponsorSummary.low}</p><p className="text-xs text-muted-foreground">Alacsony</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-red-600">{sponsorSummary.empty}</p><p className="text-xs text-muted-foreground">Kimerült</p></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48" /> : sponsorCredits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nincs szponzor kredit adat</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szponzor</TableHead>
                  <TableHead className="text-right">Összes</TableHead>
                  <TableHead className="text-right">Felhasznált</TableHead>
                  <TableHead className="text-right">Elérhető</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsorCredits.sort((a, b) => a.available_credits - b.available_credits).map(s => {
                  const pct = s.total_credits > 0 ? Math.round(s.used_credits / s.total_credits * 100) : 0;
                  return (
                    <TableRow key={s.id} className={cn("hover:bg-muted", s.status === 'empty' && "bg-red-50/50", s.status === 'low' && "bg-amber-50/50")}>
                      <TableCell>
                        <div><p className="font-medium">{s.sponsor_name}</p><p className="text-xs text-muted-foreground">{s.sponsor_email}</p></div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(s.total_credits)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-muted-foreground">{formatCurrency(s.used_credits)}</span>
                          <Progress value={pct} className="h-1.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatCurrency(s.available_credits)}</TableCell>
                      <TableCell>
                        {s.status === 'active' && <Badge className="bg-emerald-100 text-emerald-700">Aktív</Badge>}
                        {s.status === 'low' && <Badge className="bg-amber-100 text-amber-700">Alacsony</Badge>}
                        {s.status === 'empty' && <Badge variant="destructive">Kimerült</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const next = new Set(expandedSponsors);
                          next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                          setExpandedSponsors(next);
                        }}>
                          {expandedSponsors.has(s.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ─── 5. No-Show & Cancellation ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserX className="h-5 w-5" />No-Show & Lemondás Összefoglaló</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-24" /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">No-show esetek</p>
                <p className="text-xl font-bold">{noShow.no_show_count} db</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lemondás (7+ nap)</p>
                <p className="text-xl font-bold text-emerald-600">{noShow.cancel_7plus} db</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lemondás (3-7 nap)</p>
                <p className="text-xl font-bold text-amber-600">{noShow.cancel_3to7} db</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lemondás (&lt;3 nap)</p>
                <p className="text-xl font-bold text-red-600">{noShow.cancel_under3} db</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Visszatérített</p>
                <p className="text-lg font-mono font-medium">{formatCurrency(noShow.refunded_credits)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Szponzor kredit visszajárt</p>
                <p className="text-lg font-mono font-medium">{formatCurrency(noShow.sponsor_credits_returned)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expert részesedés (no-show)</p>
                <p className="text-lg font-mono font-medium">{formatCurrency(noShow.expert_noshow_payouts)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Settings Dialog ─── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Pénzügyi Beállítások</DialogTitle>
            <DialogDescription>Platform díjak és kifizetési beállítások</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Platform Jutalék (%)</Label>
              <Input type="number" min="0" max="100" value={editingSettings.platform_fee?.percentage || 20} onChange={(e) => setEditingSettings(prev => ({ ...prev, platform_fee: { percentage: Number(e.target.value) } }))} />
              <p className="text-xs text-muted-foreground">A platform által visszatartott százalék minden tranzakcióból</p>
            </div>
            <div className="space-y-2">
              <Label>EUR/HUF Árfolyam</Label>
              <Input type="number" min="1" value={editingSettings.exchange_rate?.EUR_HUF || 395} onChange={(e) => setEditingSettings(prev => ({ ...prev, exchange_rate: { EUR_HUF: Number(e.target.value) } }))} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Kifizetési Küszöb (HUF)</Label>
              <Input type="number" min="0" value={editingSettings.payout_settings?.minimum_threshold_huf || 10000} onChange={(e) => setEditingSettings(prev => ({ ...prev, payout_settings: { ...prev.payout_settings, minimum_threshold_huf: Number(e.target.value) } }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Figyelmeztetési Küszöb (HUF)</Label>
                <Input type="number" min="0" value={editingSettings.sponsor_alert_thresholds?.warning || 5000} onChange={(e) => setEditingSettings(prev => ({ ...prev, sponsor_alert_thresholds: { ...prev.sponsor_alert_thresholds, warning: Number(e.target.value) } }))} />
              </div>
              <div className="space-y-2">
                <Label>Kritikus Küszöb (HUF)</Label>
                <Input type="number" min="0" value={editingSettings.sponsor_alert_thresholds?.critical || 1000} onChange={(e) => setEditingSettings(prev => ({ ...prev, sponsor_alert_thresholds: { ...prev.sponsor_alert_thresholds, critical: Number(e.target.value) } }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Mégse</Button>
            <Button onClick={saveSettings}>Mentés</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinancials;

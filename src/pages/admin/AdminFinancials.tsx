import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Wallet,
  PiggyBank,
  Banknote,
  Receipt
} from 'lucide-react';

interface FinancialStats {
  total_revenue_huf: number;
  total_transactions: number;
  pending_payouts_count: number;
  pending_payouts_amount: number;
  completed_payouts_amount: number;
  active_sponsors: number;
  total_credits_in_system: number;
  low_balance_sponsors: number;
  zero_balance_sponsors: number;
}

interface Payout {
  id: string;
  expert_id: string;
  expert_name: string;
  amount_huf: number;
  gross_revenue_huf: number;
  platform_fee_huf: number;
  status: string;
  period_start: string;
  period_end: string;
  programs_count: number;
  bookings_count: number;
  created_at: string;
}

interface SponsorCredit {
  sponsor_user_id: string;
  sponsor_name: string;
  sponsor_email: string;
  total_credits: number;
  used_credits: number;
  available_credits: number;
  days_until_empty: number;
  status: 'healthy' | 'warning' | 'critical' | 'empty';
}

interface SystemSetting {
  key: string;
  value: Record<string, number | string>;
}

const AdminFinancials = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [sponsorCredits, setSponsorCredits] = useState<SponsorCredit[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Record<string, Record<string, number | string>>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch financial overview
      const { data: financialData } = await supabase.rpc('get_financial_overview');
      if (financialData && typeof financialData === 'object' && !('error' in financialData)) {
        setStats(financialData as unknown as FinancialStats);
      }

      // Fetch pending payouts with expert info
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select(`
          *,
          profiles:expert_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (payoutsData) {
        setPayouts(payoutsData.map((p: any) => ({
          ...p,
          expert_name: p.profiles ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() || p.profiles.email : 'Ismeretlen'
        })));
      }

      // Fetch sponsor credits with profile info
      const { data: creditsData } = await supabase
        .from('sponsor_credits')
        .select(`
          *,
          profiles:sponsor_user_id (first_name, last_name, email, organization_name)
        `);

      if (creditsData) {
        // Calculate average daily usage per sponsor
        const { data: usageData } = await supabase
          .from('credit_transactions')
          .select('sponsor_user_id, credits, created_at')
          .eq('transaction_type', 'spend')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const dailyUsageMap = new Map<string, number>();
        if (usageData) {
          usageData.forEach((tx: any) => {
            const current = dailyUsageMap.get(tx.sponsor_user_id) || 0;
            dailyUsageMap.set(tx.sponsor_user_id, current + tx.credits);
          });
        }

        setSponsorCredits(creditsData.map((c: any) => {
          const monthlyUsage = dailyUsageMap.get(c.sponsor_user_id) || 0;
          const dailyUsage = monthlyUsage / 30;
          const daysUntilEmpty = dailyUsage > 0 ? Math.floor(c.available_credits / dailyUsage) : 999;
          
          let status: SponsorCredit['status'] = 'healthy';
          if (c.available_credits <= 0) status = 'empty';
          else if (c.available_credits < 1000 || daysUntilEmpty < 7) status = 'critical';
          else if (c.available_credits < 5000 || daysUntilEmpty < 14) status = 'warning';

          return {
            sponsor_user_id: c.sponsor_user_id,
            sponsor_name: c.profiles?.organization_name || 
              `${c.profiles?.first_name || ''} ${c.profiles?.last_name || ''}`.trim() || 
              c.profiles?.email || 'Ismeretlen',
            sponsor_email: c.profiles?.email || '',
            total_credits: c.total_credits,
            used_credits: c.used_credits,
            available_credits: c.available_credits,
            days_until_empty: daysUntilEmpty,
            status
          };
        }));
      }

      // Fetch system settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('key, value');

      if (settingsData) {
        setSettings(settingsData as SystemSetting[]);
        const editMap: Record<string, Record<string, number | string>> = {};
        settingsData.forEach((s: SystemSetting) => {
          editMap[s.key] = s.value as Record<string, number | string>;
        });
        setEditingSettings(editMap);
      }

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Hiba az adatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markPayoutComplete = async (payoutId: string) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: 'completed', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', payoutId);

      if (error) throw error;
      toast.success('Kifizetés megjelölve készként!');
      fetchData();
    } catch (error) {
      toast.error('Hiba a kifizetés frissítésekor');
    }
  };

  const markAllPayoutsComplete = async () => {
    try {
      const pendingIds = payouts.filter(p => p.status === 'pending').map(p => p.id);
      if (pendingIds.length === 0) {
        toast.info('Nincs függő kifizetés');
        return;
      }

      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: 'completed', 
          paid_at: new Date().toISOString() 
        })
        .in('id', pendingIds);

      if (error) throw error;
      toast.success(`${pendingIds.length} kifizetés megjelölve készként!`);
      fetchData();
    } catch (error) {
      toast.error('Hiba a kifizetések frissítésekor');
    }
  };

  const saveSettings = async () => {
    try {
      for (const [key, value] of Object.entries(editingSettings)) {
        await supabase
          .from('system_settings')
          .update({ value })
          .eq('key', key);
      }
      toast.success('Beállítások mentve!');
      setSettingsOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Hiba a beállítások mentésekor');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { 
      style: 'currency', 
      currency: 'HUF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Függő</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Feldolgozás</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Kifizetve</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Sikertelen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCreditStatusBadge = (status: SponsorCredit['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-emerald-100 text-emerald-700">Egészséges</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-700">Figyelmeztetés</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Kritikus</Badge>;
      case 'empty':
        return <Badge variant="destructive">Kimerült</Badge>;
    }
  };

  const platformFee = settings.find(s => s.key === 'platform_fee')?.value?.percentage as number || 20;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Pénzügyi Központ
          </h1>
          <p className="text-muted-foreground">
            Platform bevételek, kifizetések és szponzor kreditek kezelése
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Beállítások
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Teljes Bevétel</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.total_revenue_huf || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.total_transactions || 0} tranzakció
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Jutalék ({platformFee}%)</p>
                  <p className="text-2xl font-bold">{formatCurrency((stats?.total_revenue_huf || 0) * (platformFee / 100))}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Bruttó bevétel része
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-950">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          (stats?.pending_payouts_count || 0) > 0 && "ring-2 ring-amber-400"
        )}>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Függő Kifizetések</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.pending_payouts_amount || 0)}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {stats?.pending_payouts_count || 0} szakértő vár
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-950">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kifizetett Összesen</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.completed_payouts_amount || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Összes idők alatt
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                  <Banknote className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Credit Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Szponzor Kredit Egészség
              </CardTitle>
              <CardDescription>
                Összesen {formatCurrency(stats?.total_credits_in_system || 0)} kredit a rendszerben
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats?.active_sponsors || 0}</p>
                <p className="text-xs text-muted-foreground">Aktív</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats?.low_balance_sponsors || 0}</p>
                <p className="text-xs text-muted-foreground">Alacsony</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats?.zero_balance_sponsors || 0}</p>
                <p className="text-xs text-muted-foreground">Kimerült</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : sponsorCredits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nincs szponzor kredit adat
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szponzor</TableHead>
                  <TableHead className="text-right">Összes Kredit</TableHead>
                  <TableHead className="text-right">Felhasznált</TableHead>
                  <TableHead className="text-right">Elérhető</TableHead>
                  <TableHead className="text-right">Hátralévő napok</TableHead>
                  <TableHead>Státusz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsorCredits
                  .sort((a, b) => a.days_until_empty - b.days_until_empty)
                  .map((sponsor) => (
                    <TableRow 
                      key={sponsor.sponsor_user_id}
                      className={cn(
                        "cursor-pointer hover:bg-muted",
                        sponsor.status === 'critical' && "bg-red-50/50 dark:bg-red-950/20",
                        sponsor.status === 'warning' && "bg-amber-50/50 dark:bg-amber-950/20"
                      )}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{sponsor.sponsor_name}</p>
                          <p className="text-xs text-muted-foreground">{sponsor.sponsor_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sponsor.total_credits)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(sponsor.used_credits)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(sponsor.available_credits)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sponsor.days_until_empty < 999 ? (
                          <span className={cn(
                            "font-medium",
                            sponsor.days_until_empty < 7 && "text-red-600",
                            sponsor.days_until_empty >= 7 && sponsor.days_until_empty < 14 && "text-amber-600"
                          )}>
                            {sponsor.days_until_empty} nap
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getCreditStatusBadge(sponsor.status)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payouts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Szakértő Kifizetések
              </CardTitle>
              <CardDescription>
                Kifizetés = (Ár × Foglalások) × (1 - {platformFee}% Platform díj)
              </CardDescription>
            </div>
            {payouts.filter(p => p.status === 'pending').length > 0 && (
              <Button onClick={markAllPayoutsComplete}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Összes Kifizetése
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nincs kifizetési adat
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szakértő</TableHead>
                  <TableHead>Időszak</TableHead>
                  <TableHead className="text-right">Bruttó Bevétel</TableHead>
                  <TableHead className="text-right">Platform Díj</TableHead>
                  <TableHead className="text-right">Nettó Kifizetés</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id} className="cursor-pointer hover:bg-muted">
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.expert_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payout.programs_count} program, {payout.bookings_count} foglalás
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(payout.period_start).toLocaleDateString('hu-HU')} - {new Date(payout.period_end).toLocaleDateString('hu-HU')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(payout.gross_revenue_huf)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      -{formatCurrency(payout.platform_fee_huf)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">
                      {formatCurrency(payout.amount_huf)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payout.status)}
                    </TableCell>
                    <TableCell>
                      {payout.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markPayoutComplete(payout.id)}
                        >
                          Kifizetve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pénzügyi Beállítások
            </DialogTitle>
            <DialogDescription>
              Platform díjak és kifizetési beállítások
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Platform Fee */}
            <div className="space-y-2">
              <Label>Platform Jutalék (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editingSettings.platform_fee?.percentage || 20}
                onChange={(e) => setEditingSettings(prev => ({
                  ...prev,
                  platform_fee: { percentage: Number(e.target.value) }
                }))}
              />
              <p className="text-xs text-muted-foreground">
                A platform által visszatartott százalék minden tranzakcióból
              </p>
            </div>

            {/* Exchange Rate */}
            <div className="space-y-2">
              <Label>EUR/HUF Árfolyam</Label>
              <Input
                type="number"
                min="1"
                value={editingSettings.exchange_rate?.EUR_HUF || 395}
                onChange={(e) => setEditingSettings(prev => ({
                  ...prev,
                  exchange_rate: { EUR_HUF: Number(e.target.value) }
                }))}
              />
            </div>

            {/* Payout Settings */}
            <div className="space-y-2">
              <Label>Minimum Kifizetési Küszöb (HUF)</Label>
              <Input
                type="number"
                min="0"
                value={editingSettings.payout_settings?.minimum_threshold_huf || 10000}
                onChange={(e) => setEditingSettings(prev => ({
                  ...prev,
                  payout_settings: { 
                    ...prev.payout_settings,
                    minimum_threshold_huf: Number(e.target.value) 
                  }
                }))}
              />
            </div>

            {/* Alert Thresholds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Figyelmeztetési Küszöb (HUF)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingSettings.sponsor_alert_thresholds?.warning || 5000}
                  onChange={(e) => setEditingSettings(prev => ({
                    ...prev,
                    sponsor_alert_thresholds: { 
                      ...prev.sponsor_alert_thresholds,
                      warning: Number(e.target.value) 
                    }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kritikus Küszöb (HUF)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingSettings.sponsor_alert_thresholds?.critical || 1000}
                  onChange={(e) => setEditingSettings(prev => ({
                    ...prev,
                    sponsor_alert_thresholds: { 
                      ...prev.sponsor_alert_thresholds,
                      critical: Number(e.target.value) 
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Mégse
            </Button>
            <Button onClick={saveSettings}>
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinancials;

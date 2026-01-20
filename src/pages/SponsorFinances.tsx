import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { SponsorDashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Download,
  Package,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { format, subDays, startOfMonth, eachDayOfInterval } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

interface CreditTransaction {
  id: string;
  credits: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  pdf_url: string | null;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_huf: number;
  price_eur: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', name: 'Starter', credits: 50000, price_huf: 50000, price_eur: 130 },
  { id: 'professional', name: 'Professional', credits: 150000, price_huf: 150000, price_eur: 390, popular: true },
  { id: 'enterprise', name: 'Enterprise', credits: 500000, price_huf: 480000, price_eur: 1250 },
];

const SponsorFinances = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creditInfo, setCreditInfo] = useState({
    totalCredits: 0,
    usedCredits: 0,
    availableCredits: 0,
  });

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  const loadFinancialData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load credit transactions
      const { data: txData } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("sponsor_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setTransactions(txData || []);

      // Calculate credit balances
      const purchases = (txData || [])
        .filter(t => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.credits || 0), 0);
      
      const deductions = Math.abs((txData || [])
        .filter(t => ['deduction', 'sponsorship', 'usage'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.credits || 0), 0));

      setCreditInfo({
        totalCredits: purchases,
        usedCredits: deductions,
        availableCredits: Math.max(0, purchases - deductions),
      });

      // Load invoices
      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .eq("organization_id", profile?.organization_id || user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setInvoices(invoiceData || []);
    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate chart data from transactions
  const chartData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      
      const dayTransactions = transactions.filter(t => 
        format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
      );

      const income = dayTransactions
        .filter(t => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'].includes(t.transaction_type))
        .reduce((sum, t) => sum + Math.abs(t.credits), 0);

      const spent = dayTransactions
        .filter(t => ['deduction', 'sponsorship', 'usage'].includes(t.transaction_type))
        .reduce((sum, t) => sum + Math.abs(t.credits), 0);

      return {
        date: format(day, 'MMM dd', { locale: getLocale() }),
        income,
        spent,
      };
    });
  }, [transactions, language]);

  const getLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  const getTransactionIcon = (type: string) => {
    if (['purchase', 'subscription', 'initial', 'bonus', 'rollover'].includes(type)) {
      return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

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
    };
    return labels[type]?.[language as keyof (typeof labels)[string]] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          {language === 'hu' ? 'Fizetve' : language === 'de' ? 'Bezahlt' : 'Paid'}
        </Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          {language === 'hu' ? 'Függőben' : language === 'de' ? 'Ausstehend' : 'Pending'}
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePurchasePackage = (pkg: CreditPackage) => {
    // In a real app, this would redirect to Stripe checkout
    toast.info(
      language === 'hu' 
        ? 'Stripe integráció hamarosan elérhető!' 
        : 'Stripe integration coming soon!'
    );
  };

  if (loading) {
    return <SponsorDashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo', 'sponsor'].includes(profile.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;
  
  if (!isSponsor && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const usagePercent = creditInfo.totalCredits > 0 
    ? Math.round((creditInfo.usedCredits / creditInfo.totalCredits) * 100)
    : 0;

  return (
    <DashboardLayout
      title={t("sponsor.finances_title") || (language === 'hu' ? "Pénzügyeim" : "My Finances")}
      subtitle={t("sponsor.finances_subtitle") || (language === 'hu' ? "Kreditek és tranzakciók követése" : "Track your credits and transactions")}
      icon={BarChart3}
      iconColor="text-blue-500"
    >
      <div className="space-y-6">
        {/* Credit Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Összes kredit' : language === 'de' ? 'Gesamtkredit' : 'Total Credits'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(creditInfo.totalCredits)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Felhasznált' : language === 'de' ? 'Verwendet' : 'Used'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(creditInfo.usedCredits)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Elérhető' : language === 'de' ? 'Verfügbar' : 'Available'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(creditInfo.availableCredits)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Usage Chart */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Kredit Használat' : language === 'de' ? 'Kreditnutzung' : 'Credit Usage'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' ? 'Elmúlt 30 nap aktivitás' : language === 'de' ? 'Aktivität der letzten 30 Tage' : 'Last 30 days activity'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'income' 
                        ? (language === 'hu' ? 'Feltöltés' : 'Income') 
                        : (language === 'hu' ? 'Felhasználás' : 'Spent')
                    ]}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'income' 
                        ? (language === 'hu' ? 'Feltöltés' : language === 'de' ? 'Einnahmen' : 'Income') 
                        : (language === 'hu' ? 'Felhasználás' : language === 'de' ? 'Ausgaben' : 'Spent')
                    }
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorSpent)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Credit Tank */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {language === 'hu' ? 'Kredit Tank' : language === 'de' ? 'Kredit-Tank' : 'Credit Tank'}
                </CardTitle>
                <CardDescription>
                  {language === 'hu' ? 'Aktuális egyenleg és felhasználás' : language === 'de' ? 'Aktueller Stand und Nutzung' : 'Current balance and usage'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'hu' ? 'Felhasználva' : language === 'de' ? 'Verwendet' : 'Used'}
                </span>
                <span className="font-medium">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(creditInfo.usedCredits)} / {formatCurrency(creditInfo.totalCredits)}
              </p>
              {creditInfo.availableCredits < 10000 && creditInfo.totalCredits > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ {language === 'hu' ? 'Alacsony egyenleg - érdemes feltölteni!' : 'Low balance - consider topping up!'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Kredit Csomagok' : language === 'de' ? 'Kreditpakete' : 'Credit Packages'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' ? 'Válassz a csomagok közül a szponzorálás folytatásához' : language === 'de' ? 'Wähle ein Paket, um mit dem Sponsoring fortzufahren' : 'Choose a package to continue sponsoring'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`relative border-2 transition-all hover:shadow-lg ${
                    pkg.popular 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {language === 'hu' ? 'Népszerű' : language === 'de' ? 'Beliebt' : 'Popular'}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="font-bold text-lg">{pkg.name}</h3>
                      <div>
                        <p className="text-3xl font-bold">{formatCurrency(pkg.credits)}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'hu' ? 'kredit' : 'credits'}
                        </p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-lg font-semibold">{formatCurrency(pkg.price_huf)}</p>
                        <p className="text-xs text-muted-foreground">€{pkg.price_eur}</p>
                      </div>
                      <ul className="text-sm text-left space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {language === 'hu' ? 'Azonnali aktiválás' : 'Instant activation'}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {language === 'hu' ? 'Részletes riportok' : 'Detailed reports'}
                        </li>
                        {pkg.id === 'enterprise' && (
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {language === 'hu' ? '+20% bónusz kredit' : '+20% bonus credits'}
                          </li>
                        )}
                      </ul>
                      <Button 
                        className={`w-full ${pkg.popular ? 'bg-primary' : ''}`}
                        variant={pkg.popular ? 'default' : 'outline'}
                        onClick={() => handlePurchasePackage(pkg)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'hu' ? 'Megvásárolom' : language === 'de' ? 'Kaufen' : 'Purchase'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Table */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Tranzakciós Előzmények' : language === 'de' ? 'Transaktionsverlauf' : 'Transaction History'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' ? 'Összes kredit mozgás' : language === 'de' ? 'Alle Kreditbewegungen' : 'All credit movements'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === 'hu' ? 'Még nincs tranzakció' : 'No transactions yet'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>{language === 'hu' ? 'Dátum' : 'Date'}</TableHead>
                      <TableHead>{language === 'hu' ? 'Típus' : 'Type'}</TableHead>
                      <TableHead>{language === 'hu' ? 'Leírás' : 'Description'}</TableHead>
                      <TableHead className="text-right">{language === 'hu' ? 'Összeg' : 'Amount'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 20).map((tx) => {
                      const isIncome = ['purchase', 'subscription', 'initial', 'bonus', 'rollover'].includes(tx.transaction_type);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {format(new Date(tx.created_at), 'yyyy.MM.dd HH:mm', { locale: getLocale() })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.transaction_type)}
                              <span className="text-sm font-medium">
                                {getTransactionLabel(tx.transaction_type)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {tx.description || '-'}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.credits))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Számlák' : language === 'de' ? 'Rechnungen' : 'Invoices'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' ? 'Fizetési bizonylatok' : language === 'de' ? 'Zahlungsbelege' : 'Payment receipts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === 'hu' ? 'Még nincs számla' : 'No invoices yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(invoice.created_at), 'yyyy.MM.dd', { locale: getLocale() })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                      {getStatusBadge(invoice.status || 'pending')}
                      {invoice.pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SponsorFinances;

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { SponsorDashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";


interface CreditTransaction {
  id: string;
  credits: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const SponsorFinances = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
    setLoadError(null);
    try {
      // Load credit transactions
      const { data: txData, error: txError } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("sponsor_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (txError) throw txError;

      setTransactions(txData || []);

      // Calculate credit balances
      const purchases = (txData || [])
        .filter(t => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.credits || 0), 0);
      
      const deductions = Math.abs((txData || [])
        .filter(t => ['deduction', 'sponsorship', 'usage', 'spend'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.credits || 0), 0));

      setCreditInfo({
        totalCredits: purchases,
        usedCredits: deductions,
        availableCredits: Math.max(0, purchases - deductions),
      });
    } catch (error) {
      console.error("Error loading financial data:", error);
      setLoadError(language === 'hu'
        ? 'Nem sikerült betölteni a pénzügyeket.'
        : language === 'de'
        ? 'Finanzdaten konnten nicht geladen werden.'
        : 'Could not load finances.');
    } finally {
      setIsLoading(false);
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
      spend: { hu: 'Szponzorálás', en: 'Sponsorship', de: 'Sponsoring' },
    };
    return labels[type]?.[language as keyof (typeof labels)[string]] || type;
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

  const purchaseTypes = ['purchase', 'subscription', 'initial', 'rollover', 'bonus'];
  const spendTypes = ['deduction', 'sponsorship', 'usage', 'spend'];

  const purchases = transactions.filter(tx => purchaseTypes.includes(tx.transaction_type));
  const spending = transactions.filter(tx => spendTypes.includes(tx.transaction_type));

  return (
    <DashboardLayout
      title={t("sponsor.finances_title")}
      subtitle={t("sponsor.finances_subtitle")}
      icon={BarChart3}
      iconColor="text-blue-500"
    >
      <div className="space-y-6">
        {loadError && (
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{loadError}</p>
            </CardContent>
          </Card>
        )}

        {/* Purchases */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Vásárlások' : language === 'de' ? 'Käufe' : 'Purchases'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SponsorDashboardSkeleton />
            ) : purchases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === 'hu' ? 'Még nincs tranzakció' : language === 'de' ? 'Noch keine Transaktionen' : 'No transactions yet'}
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
                    {purchases.slice(0, 20).map((tx) => {
                      const isIncome = true;
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {new Date(tx.created_at).toLocaleString()}
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

        {/* Spending */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Költések' : language === 'de' ? 'Ausgaben' : 'Spending'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SponsorDashboardSkeleton />
            ) : spending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === 'hu' ? 'Még nincs költés' : language === 'de' ? 'Noch keine Ausgaben' : 'No spending yet'}
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
                    {spending.slice(0, 20).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {new Date(tx.created_at).toLocaleString()}
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
                        <TableCell className="text-right font-semibold text-red-500">
                          -{formatCurrency(Math.abs(tx.credits))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t("sponsor.finances_title")}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-10 w-full rounded-lg bg-muted/30" />
                <div className="h-10 w-full rounded-lg bg-muted/30" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-black/5">
                  <p className="text-sm text-muted-foreground">{language === 'hu' ? 'Összes vásárlás' : language === 'de' ? 'Gesamt gekauft' : 'Total purchased'}</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(creditInfo.totalCredits)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5">
                  <p className="text-sm text-muted-foreground">{language === 'hu' ? 'Összes költés' : language === 'de' ? 'Gesamt ausgegeben' : 'Total spent'}</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(creditInfo.usedCredits)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-500/10">
                  <p className="text-sm text-emerald-700">{language === 'hu' ? 'Aktuális egyenleg' : language === 'de' ? 'Aktuelles Guthaben' : 'Current balance'}</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(creditInfo.availableCredits)}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {language === 'hu' ? 'Felhasználva' : language === 'de' ? 'Verwendet' : 'Used'}
                </span>
                <span className="font-medium">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(creditInfo.usedCredits)} / {formatCurrency(creditInfo.totalCredits)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SponsorFinances;

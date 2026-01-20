import { useState, useEffect } from "react";
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
  Download
} from "lucide-react";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

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
        .limit(50);

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
    const labels: Record<string, { hu: string; en: string }> = {
      purchase: { hu: 'Kredit vásárlás', en: 'Credit Purchase' },
      subscription: { hu: 'Előfizetés', en: 'Subscription' },
      initial: { hu: 'Kezdő egyenleg', en: 'Initial Balance' },
      bonus: { hu: 'Bónusz kredit', en: 'Bonus Credit' },
      rollover: { hu: 'Átvitt egyenleg', en: 'Rollover Balance' },
      deduction: { hu: 'Levonás', en: 'Deduction' },
      sponsorship: { hu: 'Szponzoráció', en: 'Sponsorship' },
      usage: { hu: 'Felhasználás', en: 'Usage' },
    };
    return labels[type]?.[language === 'hu' ? 'hu' : 'en'] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          {language === 'hu' ? 'Fizetve' : 'Paid'}
        </Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          {language === 'hu' ? 'Függőben' : 'Pending'}
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <SponsorDashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is sponsor or super admin
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
      title={t("nav.finances") || "Pénzügyeim"}
      subtitle={t("sponsor.finances_subtitle") || "Track your credits and transactions"}
      icon={BarChart3}
      iconColor="text-blue-500"
    >
      <div className="space-y-6">
        {/* Credit Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Összes kredit' : 'Total Credits'}
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
                    {language === 'hu' ? 'Felhasznált' : 'Used'}
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
                    {language === 'hu' ? 'Elérhető' : 'Available'}
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

        {/* Credit Tank */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {language === 'hu' ? 'Kredit Tank' : 'Credit Tank'}
                </CardTitle>
                <CardDescription>
                  {language === 'hu' ? 'Aktuális egyenleg és felhasználás' : 'Current balance and usage'}
                </CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'hu' ? 'Kredit feltöltés' : 'Top Up'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'hu' ? 'Felhasználva' : 'Used'}
                </span>
                <span className="font-medium">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(creditInfo.usedCredits)} / {formatCurrency(creditInfo.totalCredits)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {language === 'hu' ? 'Tranzakciók' : 'Transactions'}
              </CardTitle>
              <CardDescription>
                {language === 'hu' ? 'Legutóbbi kredit mozgások' : 'Recent credit movements'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
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
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.transaction_type)}
                        <div>
                          <p className="font-medium text-sm">
                            {getTransactionLabel(tx.transaction_type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'MMM d, yyyy', { locale: getLocale() })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        ['purchase', 'subscription', 'initial', 'bonus', 'rollover'].includes(tx.transaction_type)
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}>
                        {['purchase', 'subscription', 'initial', 'bonus', 'rollover'].includes(tx.transaction_type) ? '+' : '-'}
                        {formatCurrency(Math.abs(tx.credits))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {language === 'hu' ? 'Számlák' : 'Invoices'}
              </CardTitle>
              <CardDescription>
                {language === 'hu' ? 'Fizetési bizonylatok' : 'Payment receipts'}
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
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(invoice.created_at), 'MMM d, yyyy', { locale: getLocale() })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                        {getStatusBadge(invoice.status)}
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
      </div>
    </DashboardLayout>
  );
};

export default SponsorFinances;

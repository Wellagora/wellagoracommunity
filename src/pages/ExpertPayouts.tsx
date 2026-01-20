import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

interface Payout {
  id: string;
  period_start: string;
  period_end: string;
  gross_revenue_huf: number;
  platform_fee_huf: number;
  amount_huf: number;
  status: string;
  paid_at: string | null;
  programs_count: number | null;
  bookings_count: number | null;
}

const ExpertPayouts = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    lastPayout: 0,
  });

  useEffect(() => {
    if (user) {
      loadPayouts();
    }
  }, [user]);

  const loadPayouts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("expert_id", user.id)
        .order("period_end", { ascending: false });

      if (error) throw error;

      setPayouts(data || []);

      // Calculate stats
      const paid = data?.filter(p => p.status === 'paid') || [];
      const pending = data?.filter(p => p.status === 'pending') || [];
      
      const totalEarnings = paid.reduce((sum, p) => sum + (p.amount_huf || 0), 0);
      const pendingAmount = pending.reduce((sum, p) => sum + (p.amount_huf || 0), 0);
      const lastPayout = paid.length > 0 ? paid[0].amount_huf : 0;

      setStats({ totalEarnings, pendingAmount, lastPayout });
    } catch (error) {
      console.error("Error loading payouts:", error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'Kifizetve' : 'Paid'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'Függőben' : 'Pending'}
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'Feldolgozás alatt' : 'Processing'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return <ExpertStudioSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasPayoutInfo = profile?.wise_iban || profile?.wise_email;

  return (
    <DashboardLayout
      title={t("nav.payouts") || "Kifizetések"}
      subtitle={t("expert.payouts_subtitle") || "Track your earnings and payment history"}
      icon={Wallet}
      iconColor="text-amber-500"
    >
      <div className="space-y-6">
        {/* Warning if no payout info */}
        {!hasPayoutInfo && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  {language === 'hu' ? 'Hiányzó kifizetési adatok' : 'Missing payout information'}
                </p>
                <p className="text-sm text-amber-700">
                  {language === 'hu' 
                    ? 'Add meg az IBAN számodat a Beállítások menüben a kifizetések fogadásához.'
                    : 'Please add your IBAN number in Settings to receive payouts.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Összes bevétel' : 'Total Earnings'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Függőben lévő' : 'Pending'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hu' ? 'Utolsó kifizetés' : 'Last Payout'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.lastPayout)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Split Info */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'hu' ? 'Bevételmegosztás' : 'Revenue Split'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' 
                ? 'A platform 80/20 bevételmegosztást alkalmaz'
                : 'The platform uses an 80/20 revenue split'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-emerald-500/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">80%</p>
                <p className="text-sm text-emerald-600">
                  {language === 'hu' ? 'Szakértő' : 'Expert'}
                </p>
              </div>
              <div className="flex-1 bg-slate-100 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-slate-600">20%</p>
                <p className="text-sm text-slate-500">
                  {language === 'hu' ? 'Platform' : 'Platform'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts History */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {language === 'hu' ? 'Kifizetési előzmények' : 'Payout History'}
            </CardTitle>
            <CardDescription>
              {language === 'hu' ? 'Korábbi és függőben lévő kifizetések' : 'Past and pending payouts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {language === 'hu' ? 'Még nincs kifizetés' : 'No payouts yet'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' 
                    ? 'A kifizetések havonta egyszer történnek, miután elérted a minimum összeget.'
                    : 'Payouts are processed monthly once you reach the minimum threshold.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {format(new Date(payout.period_start), 'MMMM yyyy', { locale: getLocale() })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payout.programs_count || 0} {language === 'hu' ? 'program' : 'programs'} • 
                            {payout.bookings_count || 0} {language === 'hu' ? 'foglalás' : 'bookings'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">
                          {formatCurrency(payout.amount_huf)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'hu' ? 'Bruttó:' : 'Gross:'} {formatCurrency(payout.gross_revenue_huf)}
                        </p>
                      </div>
                      {getStatusBadge(payout.status)}
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

export default ExpertPayouts;

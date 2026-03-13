import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BarChart3, BookOpen, Wallet, Users, Plus, TrendingUp, Calendar, DollarSign, ArrowRight, Store, CreditCard, ExternalLink, CheckCircle2, AlertCircle, FileCheck, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/pricing";
import { isStripeEnabled } from "@/lib/stripe";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Import components for tabs
import ExpertImpactReport from "@/components/expert-studio/ExpertImpactReport";
import MyProgramsList from "@/components/expert-studio/MyProgramsList";
import ExpertCalendar from "@/components/expert-studio/ExpertCalendar";
import { ExpertAgreementModal, EXPERT_ASZF_VERSION } from "@/components/expert-studio/ExpertAgreementModal";

const ExpertStudio = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  // ÁSZF check — expert must accept the agreement before selling content
  const aszfAccepted = (profile as any)?.expert_aszf_accepted_at != null;
  const aszfNeedsUpdate = (profile as any)?.expert_aszf_version !== EXPERT_ASZF_VERSION;
  const needsAszf = !aszfAccepted || aszfNeedsUpdate;
  const isFoundingExpert = (profile as any)?.is_founding_expert || false;

  // Card 1: Program Status (top 3 programs + CTA)
  const programsQuery = useQuery({
    queryKey: ['expertPrograms', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      const { data, error } = await supabase
        .from('expert_contents')
        .select('id, title, is_published, used_licenses, total_licenses, max_capacity, image_url')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  // Card 2: Revenue Overview - Real earnings from transactions table
  const revenueQuery = useQuery({
    queryKey: ['expertRevenue', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Fetch completed transactions where user is the creator
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('creator_revenue, created_at')
        .eq('creator_id', user.id)
        .eq('status', 'completed');
      
      if (error) throw error;
      if (!transactions || transactions.length === 0) {
        return { monthlyEarnings: 0, totalEarnings: 0, balance: 0, salesCount: 0 };
      }

      // Calculate total earnings
      const totalEarnings = transactions.reduce((sum, t) => sum + (t.creator_revenue || 0), 0);
      
      // Calculate this month's earnings
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthTransactions = transactions.filter(t => 
        new Date(t.created_at) >= startOfMonth
      );
      const monthlyEarnings = thisMonthTransactions.reduce((sum, t) => sum + (t.creator_revenue || 0), 0);

      return { 
        monthlyEarnings, 
        totalEarnings, 
        balance: totalEarnings,
        salesCount: transactions.length
      };
    },
    enabled: !!user,
    retry: false,
  });

  // Recent Transactions - Detailed list with buyer info
  const transactionsQuery = useQuery({
    queryKey: ['expertTransactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          creator_revenue,
          platform_fee,
          created_at,
          expert_contents (
            id,
            title,
            image_url
          ),
          buyer:profiles!transactions_buyer_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('creator_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    retry: false,
  });

  // Card 3: Community Activity - Real participant count from transactions + vouchers
  const communityQuery = useQuery({
    queryKey: ['expertCommunity', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Get unique buyers from completed transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('buyer_id')
        .eq('creator_id', user.id)
        .eq('status', 'completed');
      
      const uniqueBuyers = new Set(
        transactions?.map(t => t.buyer_id) || []
      );
      
      // Get creator's content IDs
      const { data: contents } = await supabase
        .from('expert_contents')
        .select('id')
        .eq('creator_id', user.id);
      
      const contentIds = contents?.map(c => c.id) || [];
      
      // Get unique voucher users for creator's programs
      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('user_id')
        .in('content_id', contentIds)
        .eq('status', 'active');
      
      const uniqueVoucherUsers = new Set(
        vouchers?.map(v => v.user_id) || []
      );
      
      // Combine both sets for total unique participants
      const allParticipants = new Set([
        ...Array.from(uniqueBuyers),
        ...Array.from(uniqueVoucherUsers)
      ]);
      
      return { totalBookings: allParticipants.size };
    },
    enabled: !!user,
    retry: false,
  });

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      case 'en': return enUS;
      default: return enUS;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExpertStudioSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = programsQuery.isLoading || revenueQuery.isLoading || communityQuery.isLoading || transactionsQuery.isLoading;

  return (
    <DashboardLayout
      title={t("expert_studio.title")}
      subtitle={t("expert_studio.subtitle")}
      icon={Sparkles}
      iconColor="text-black"
      backUrl="/"
    >
      {/* Tabs for Műhely (Workshop) vs Üzlet (Business) */}
      <Tabs defaultValue="muhely" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="muhely" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('expert_studio.tab_muhely') || 'Műhely'}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('expert_studio.tab_calendar') || 'Naptár'}
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            {t('expert_studio.tab_business') || 'Üzlet'}
          </TabsTrigger>
        </TabsList>

        {/* Műhely Tab - Programs Management Only */}
        <TabsContent value="muhely" className="space-y-6">
          <MyProgramsList userId={user.id} />
        </TabsContent>

        {/* Naptár Tab - Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <ExpertCalendar userId={user.id} />
        </TabsContent>

        {/* Üzlet Tab - Business Overview with Revenue + Stats + Transactions + Impact Report */}
        <TabsContent value="business" className="space-y-6">
          {/* ÁSZF Banner — Expert must accept agreement before selling */}
          {needsAszf && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-l-4 border-l-orange-500 bg-orange-50 border-orange-200">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#3d3429]">
                        {language === 'hu'
                          ? 'Szakértői Szolgáltatási Szerződés szükséges'
                          : 'Expert Service Agreement Required'}
                      </p>
                      <p className="text-sm text-[#3d3429]/60">
                        {language === 'hu'
                          ? (aszfNeedsUpdate && aszfAccepted
                            ? 'A feltételek frissültek — kérjük, fogadd el az új verziót a tartalmaid értékesítéséhez.'
                            : 'A tartalmaid értékesítéséhez el kell fogadnod a Szakértői Szolgáltatási Szerződést.')
                          : (aszfNeedsUpdate && aszfAccepted
                            ? 'The terms have been updated — please accept the new version to continue selling.'
                            : 'You need to accept the Expert Service Agreement to start selling content.')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAgreement(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    {language === 'hu' ? 'Szerződés megtekintése' : 'View Agreement'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Founding Expert badge */}
          {isFoundingExpert && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                {language === 'hu'
                  ? 'Founding Expert — 0% platform jutalék minden tranzakción!'
                  : 'Founding Expert — 0% platform fee on all transactions!'}
              </p>
            </div>
          )}
          {/* Stripe Connect Onboarding Section - hidden when VITE_STRIPE_ENABLED=false */}
          {isStripeEnabled() && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`border-l-4 ${(profile as any)?.stripe_onboarding_complete ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t('expert.stripe_payout_title') || 'Kifizetések'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(profile as any)?.stripe_onboarding_complete ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-600">
                          {t('expert.stripe_active') || 'Stripe fiók aktív'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(profile as any)?.stripe_account_id ? `(${(profile as any).stripe_account_id.substring(0, 12)}...)` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">{t('expert.total_revenue') || 'Összes bevétel'}</p>
                        <p className="text-lg font-bold">{formatPrice(revenueQuery.data?.totalEarnings || 0, 'HUF')}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">{t('expert.pending_payout') || 'Függő kifizetés'}</p>
                        <p className="text-lg font-bold">{formatPrice(0, 'HUF')}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">{t('expert.paid_out') || 'Már kifizetett'}</p>
                        <p className="text-lg font-bold">{formatPrice(0, 'HUF')}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('expert.open_stripe_dashboard') || 'Stripe Dashboard megnyitása'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {t('expert.stripe_required') || 'A programjaid bevételéhez csatlakoztasd Stripe fiókodat.'}
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        setStripeLoading(true);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const res = await supabase.functions.invoke('create-connect-account', {
                            body: {},
                          });
                          if (res.error) throw new Error(res.error.message);
                          if (res.data?.url) {
                            window.location.href = res.data.url;
                          }
                        } catch (err: any) {
                          toast({ title: 'Hiba', description: err.message, variant: 'destructive' });
                        } finally {
                          setStripeLoading(false);
                        }
                      }}
                      disabled={stripeLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {stripeLoading ? '...' : (t('expert.stripe_setup') || 'Stripe fiók beállítása')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Bevétel áttekintés */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{t('expert_studio.cards.revenue.title') || 'Bevétel áttekintés'}</CardTitle>
                      <Wallet className="w-5 h-5 text-emerald-500" />
                    </div>
                    <CardDescription>{t('expert_studio.cards.revenue.subtitle') || 'Bevételeid (80%)'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueQuery.isError || !revenueQuery.data ? (
                      <p className="text-sm text-muted-foreground">{t('common.no_data')}</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-4xl font-bold text-foreground mb-2">
                            {formatPrice(revenueQuery.data.monthlyEarnings, 'HUF')}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t('expert_studio.this_month') || 'Ez a hónap'}
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">{t('expert_studio.total_earned') || 'Összesen'}</p>
                              <p className="font-semibold">{formatPrice(revenueQuery.data.totalEarnings, 'HUF')}</p>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div>
                              <p className="text-muted-foreground">{revenueQuery.data.salesCount} {t('expert_studio.sales') || 'eladás'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 2: Közösségi aktivitás */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {t('expert_studio.cards.community.title') || 'Közösségi aktivitás'}
                      </CardTitle>
                      <Users className="w-5 h-5 text-indigo-500" />
                    </div>
                    <CardDescription>
                      {t('expert_studio.cards.community.subtitle') || 'Elérésed'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {communityQuery.isError || !communityQuery.data ? (
                      <p className="text-sm text-muted-foreground">{t('common.no_data')}</p>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-4xl font-bold text-foreground mb-2">
                          {communityQuery.data.totalBookings}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('expert_studio.cards.community.participants') || 'Résztvevő'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Recent Transactions Section */}
          {!isLoading && transactionsQuery.data && transactionsQuery.data.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('expert_studio.recent_transactions') || 'Legutóbbi tranzakciók'}
                  </CardTitle>
                  <CardDescription>
                    {t('expert_studio.recent_transactions_desc') || 'Az utolsó 5 eladás részletei'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactionsQuery.data.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                          {transaction.expert_contents?.image_url ? (
                            <img src={transaction.expert_contents.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {transaction.expert_contents?.title || 'Ismeretlen program'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.buyer?.first_name} {transaction.buyer?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'PPP', { locale: getDateLocale() })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-emerald-600">
                            {formatPrice(transaction.creator_revenue, 'HUF')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('expert_studio.from')} {formatPrice(transaction.amount, 'HUF')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {revenueQuery.data && revenueQuery.data.salesCount > 5 && (
                    <Button variant="ghost" className="w-full mt-4" size="sm">
                      {t('expert_studio.view_all_transactions') || 'Összes tranzakció megtekintése'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Impact Report Section within Üzlet */}
          {!isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ExpertImpactReport userId={user.id} />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Expert Agreement Modal */}
      <ExpertAgreementModal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAccepted={() => {
          setShowAgreement(false);
          // Reload profile to reflect acceptance
          window.location.reload();
        }}
        creatorLegalStatus={(profile as any)?.creator_legal_status || 'individual'}
      />
    </DashboardLayout>
  );
};

export default ExpertStudio;

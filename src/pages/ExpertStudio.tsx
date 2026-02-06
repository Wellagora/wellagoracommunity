import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BarChart3, BookOpen, Wallet, Users, Plus, TrendingUp, Calendar, DollarSign, ArrowRight, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/pricing";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

// Import components for tabs
import ExpertImpactReport from "@/components/expert-studio/ExpertImpactReport";
import MyProgramsList from "@/components/expert-studio/MyProgramsList";

const ExpertStudio = () => {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-white">
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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="muhely" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('expert_studio.tab_muhely') || 'Műhely'}
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

        {/* Üzlet Tab - Business Overview with Revenue + Stats + Transactions + Impact Report */}
        <TabsContent value="business" className="space-y-6">
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
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
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
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center flex-shrink-0">
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
    </DashboardLayout>
  );
};

export default ExpertStudio;

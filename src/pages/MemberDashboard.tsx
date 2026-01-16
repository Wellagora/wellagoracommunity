import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/dashboard/KPICard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useVouchers, VoucherStatus } from "@/hooks/useVouchers";
import CommunityActivityFeed from "@/components/dashboard/CommunityActivityFeed";
import ActiveNowStats from "@/components/dashboard/ActiveNowStats";
import RegionalProgramsHighlight from "@/components/dashboard/RegionalProgramsHighlight";
import SavingsWallet from "@/components/member/SavingsWallet";
import CommunityTicker from "@/components/member/CommunityTicker";
import { 
  Ticket, 
  BookOpen, 
  PiggyBank, 
  QrCode,
  ChevronRight,
  Sparkles,
  Users,
  Home,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SponsoredContent {
  id: string;
  title: string;
  image_url: string;
  sponsor_name: string;
  category: string;
}

const MemberDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { vouchers, isLoading: vouchersLoading, stats } = useVouchers();
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');

  // Fetch sponsored content recommendations
  const { data: sponsoredContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['sponsored-content'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expert_contents')
        .select('id, title, image_url, sponsor_name, category')
        .eq('is_sponsored', true)
        .eq('is_published', true)
        .limit(6);
      return data || [];
    },
    enabled: !!user,
  });

  // Filter vouchers by status
  const filteredVouchers = statusFilter === 'all' 
    ? vouchers 
    : vouchers.filter(v => v.status === statusFilter);

  const getStatusIcon = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'used': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'active': 
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{t('voucher.status_active') || 'Aktív'}</Badge>;
      case 'used': 
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{t('voucher.status_used') || 'Felhasznált'}</Badge>;
      case 'expired': 
        return <Badge className="bg-red-100 text-red-700 border-red-200">{t('voucher.status_expired') || 'Lejárt'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      title={t('member_dashboard.title') || 'Saját Központ'}
      subtitle={t('member_dashboard.welcome')}
      icon={Home}
      iconColor="text-black"
      backUrl="/"
    >

      {/* Community Activity Ticker - Real-time "[Name] just joined [Program]" */}
      <DashboardCard className="mb-4">
        <CommunityTicker />
      </DashboardCard>

      {/* Active Now Stats - Living Community Feel */}
      <DashboardCard className="mb-6">
        <ActiveNowStats />
      </DashboardCard>

      {/* Savings Wallet - Total HUF saved via sponsorships */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard className="md:col-span-1">
          <SavingsWallet 
            totalSavings={stats.totalSavings}
            sponsorCount={vouchers.filter(v => v.sponsor_name).length}
            voucherCount={vouchers.length}
          />
        </DashboardCard>
        <DashboardCard delay={0.1} className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            <KPICard
              title={t('member_dashboard.active_vouchers')}
              value={stats.active}
              icon={Ticket}
              subtitle={t('member_dashboard.redeemable')}
              iconColor="text-emerald-600"
            />
            <KPICard
              title={t('member_dashboard.opened_contents')}
              value={vouchers.length}
              icon={BookOpen}
              subtitle={t('member_dashboard.workshop_secrets')}
              iconColor="text-black/70"
            />
          </div>
        </DashboardCard>
      </div>

      {/* Living Community Section - Activity Feed + Regional Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <DashboardCard delay={0.25}>
          <CommunityActivityFeed />
        </DashboardCard>
        <DashboardCard delay={0.3}>
          <RegionalProgramsHighlight />
        </DashboardCard>
      </div>

      {/* Active Vouchers Section with Filter Tabs */}
      <DashboardCard delay={0.3} className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="w-5 h-5 text-black/60" />
            {t('member_dashboard.my_vouchers') || 'Kuponjaim'}
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VoucherStatus | 'all')}>
              <TabsList className="bg-black/5 h-9">
                <TabsTrigger value="all" className="text-xs px-3 data-[state=active]:bg-white">
                  {t('common.all') || 'Mind'} ({vouchers.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs px-3 data-[state=active]:bg-white">
                  {t('voucher.status_active') || 'Aktív'} ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="used" className="text-xs px-3 data-[state=active]:bg-white">
                  {t('voucher.status_used') || 'Felhasznált'} ({stats.used})
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs px-3 data-[state=active]:bg-white">
                  {t('voucher.status_expired') || 'Lejárt'} ({stats.expired})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link to="/piacer">
              <Button variant="ghost" size="sm" className="text-black/60 hover:text-black">
                {t('member_dashboard.new_voucher')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {vouchersLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredVouchers.length > 0 ? (
            <div className="space-y-3">
              {filteredVouchers.map((voucher) => (
                <Link 
                  key={voucher.id}
                  to={`/piacer/${voucher.content_id}`}
                  className="block"
                >
                  <div
                    className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-black/5 relative">
                        {voucher.content_image ? (
                          <img 
                            src={voucher.content_image} 
                            alt={voucher.content_title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <QrCode className="w-8 h-8 text-black/60" />
                        )}
                        <div className="absolute -top-1 -right-1">
                          {getStatusIcon(voucher.status)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-black">{voucher.content_title}</p>
                        <p className="text-sm text-black/50">
                          {voucher.expert_name}
                          {voucher.sponsor_name && (
                            <span> • {t('member_dashboard.sponsor_label')}: {voucher.sponsor_name}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-black/10 font-mono">
                            {voucher.code}
                          </Badge>
                          {getStatusBadge(voucher.status)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-black/10">
                      {t('member_dashboard.show_qr')}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto text-black/30 mb-4" />
              <p className="text-black/50 mb-4">
                {statusFilter === 'all' 
                  ? (t('member_dashboard.no_vouchers'))
                  : (t('member_dashboard.no_vouchers_in_category') || 'Nincs ilyen kuponod')}
              </p>
              <Link to="/piacer">
                <Button className="bg-black hover:bg-black/90 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('member_dashboard.explore_marketplace')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </DashboardCard>

      {/* Sponsored Content Recommendations */}
      <DashboardCard delay={0.4} className="mb-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-black/60" />
            {t("member_dashboard.sponsored_contents") || "Támogatott Műhelytitkok"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contentLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-64 rounded-xl flex-shrink-0" />
              ))}
            </div>
          ) : sponsoredContent.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4 pb-4">
                {sponsoredContent.map((content) => (
                  <Link
                    key={content.id}
                    to={`/piacer/${content.id}`}
                    className="flex-shrink-0 w-64"
                  >
                    <div className="rounded-xl overflow-hidden border border-black/5 bg-white hover:shadow-lg transition-shadow">
                      <div 
                        className="h-32 bg-black/5"
                        style={{
                          backgroundImage: content.image_url ? `url(${content.image_url})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div className="p-4">
                        <Badge variant="secondary" className="mb-2 text-xs bg-black/5 text-black/60">
                          {content.category || t('member_dashboard.workshop_secrets')}
                        </Badge>
                        <p className="font-medium text-black truncate">
                          {content.title}
                        </p>
                        <p className="text-sm text-black/50 truncate">
                          {t('member_dashboard.sponsor_label')}: {content.sponsor_name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-black/30 mb-4" />
              <p className="text-black/50">
                {t('member_dashboard.coming_soon')}
              </p>
            </div>
          )}
        </CardContent>
      </DashboardCard>

      {/* Community Feed Section */}
      <DashboardCard delay={0.5}>
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-black/60" />
            {t('member_dashboard.community_news')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-black/30 mb-4" />
            <p className="text-black/50 mb-4">
              {t('member_dashboard.join_community')}
            </p>
            <Link to="/kozosseg">
              <Button variant="outline" className="border-black/10 text-black">
                {t('member_dashboard.explore_community')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default MemberDashboard;

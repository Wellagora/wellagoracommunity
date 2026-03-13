import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ExpertApplicationModal from "@/components/expert-application/ExpertApplicationModal";
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
  const { t, language } = useLanguage();
  const { vouchers, isLoading: vouchersLoading, stats } = useVouchers();
  const [showExpertApplication, setShowExpertApplication] = useState(false);

  // Check if user can apply to become an expert
  const userRole = (profile as any)?.user_role || 'member';
  const verificationStatus = (profile as any)?.verification_status || 'unverified';
  const isAlreadyExpert = userRole === 'expert' || userRole === 'creator';
  const isPendingExpert = verificationStatus === 'pending';
  const canApplyForExpert = !isAlreadyExpert && !isPendingExpert;
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
      case 'active': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'used': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'expired': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/10 text-primary border-primary/20">{t('voucher.status_active') || 'Aktív'}</Badge>;
      case 'used':
        return <Badge className="bg-muted text-muted-foreground border-border">{t('voucher.status_used') || 'Felhasznált'}</Badge>;
      case 'expired':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">{t('voucher.status_expired') || 'Lejárt'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
      iconColor="text-foreground"
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

      {/* Become Expert CTA - Only shown to non-expert users */}
      {canApplyForExpert && (
        <DashboardCard className="mb-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#3d3429]">
                  {language === 'hu' ? 'Szakértővé válnál?' : 'Want to become an Expert?'}
                </h3>
                <p className="text-sm text-[#3d3429]/60">
                  {language === 'hu'
                    ? 'Oszd meg a tudásodat és keress vele — 80% bevétel a Tiéd.'
                    : 'Share your knowledge and earn — you keep 80% of revenue.'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowExpertApplication(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Jelentkezem' : 'Apply Now'}
            </Button>
          </div>
        </DashboardCard>
      )}

      {/* Pending Expert Application Notice */}
      {isPendingExpert && (
        <DashboardCard className="mb-6">
          <div className="flex items-center gap-4 p-2">
            <div className="p-3 rounded-xl bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#3d3429]">
                {language === 'hu' ? 'Szakértői jelentkezésed elbírálás alatt' : 'Your expert application is under review'}
              </h3>
              <p className="text-sm text-[#3d3429]/60">
                {language === 'hu'
                  ? 'Hamarosan értesítünk az eredményről. Ez általában 1-3 munkanapot vesz igénybe.'
                  : 'We\'ll notify you shortly. This typically takes 1-3 business days.'}
              </p>
            </div>
          </div>
        </DashboardCard>
      )}

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
              iconColor="text-primary"
            />
            <KPICard
              title={t('member_dashboard.opened_contents')}
              value={vouchers.length}
              icon={BookOpen}
              subtitle={t('member_dashboard.workshop_secrets')}
              iconColor="text-muted-foreground"
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
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="w-5 h-5 text-muted-foreground" />
              {t('member_dashboard.my_vouchers') || 'Kuponjaim'}
            </CardTitle>
            <Link to="/vasarlasaim">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                {language === 'hu' ? 'Vásárlásaim' : 'Purchases'}
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VoucherStatus | 'all')}>
              <TabsList className="bg-muted h-9">
                <TabsTrigger value="all" className="text-xs px-3 data-[state=active]:bg-background">
                  {t('common.all') || 'Mind'} ({vouchers.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs px-3 data-[state=active]:bg-background">
                  {t('voucher.status_active') || 'Aktív'} ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="used" className="text-xs px-3 data-[state=active]:bg-background">
                  {t('voucher.status_used') || 'Felhasznált'} ({stats.used})
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs px-3 data-[state=active]:bg-background">
                  {t('voucher.status_expired') || 'Lejárt'} ({stats.expired})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link to="/piacer">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted relative">
                        {voucher.content_image ? (
                          <img 
                            src={voucher.content_image} 
                            alt={voucher.content_title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <QrCode className="w-8 h-8 text-muted-foreground" />
                        )}
                        <div className="absolute -top-1 -right-1">
                          {getStatusIcon(voucher.status)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{voucher.content_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {voucher.expert_name}
                          {voucher.sponsor_name && (
                            <span> • {t('member_dashboard.sponsor_label')}: {voucher.sponsor_name}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-border font-mono">
                            {voucher.code}
                          </Badge>
                          {getStatusBadge(voucher.status)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-border">
                      {t('member_dashboard.show_qr')}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all' 
                  ? (t('member_dashboard.no_vouchers'))
                  : (t('member_dashboard.no_vouchers_in_category') || 'Nincs ilyen kuponod')}
              </p>
              <Link to="/piacer">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
            <Sparkles className="w-5 h-5 text-muted-foreground" />
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
                    <div className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
                      <div 
                        className="h-32 bg-muted"
                        style={{
                          backgroundImage: content.image_url ? `url(${content.image_url})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div className="p-4">
                        <Badge variant="secondary" className="mb-2 text-xs bg-muted text-muted-foreground">
                          {content.category || t('member_dashboard.workshop_secrets')}
                        </Badge>
                        <p className="font-medium text-foreground truncate">
                          {content.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
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
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
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
            <Users className="w-5 h-5 text-muted-foreground" />
            {t('member_dashboard.community_news')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              {t('member_dashboard.join_community')}
            </p>
            <Link to="/kozosseg">
              <Button variant="outline" className="border-border text-foreground">
                {t('member_dashboard.explore_community')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </DashboardCard>

      {/* Expert Application Modal */}
      <ExpertApplicationModal
        isOpen={showExpertApplication}
        onClose={() => setShowExpertApplication(false)}
        onSuccess={() => window.location.reload()}
      />
    </DashboardLayout>
  );
};

export default MemberDashboard;

import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KPICard } from "@/components/dashboard/KPICard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { 
  Ticket, 
  BookOpen, 
  PiggyBank, 
  QrCode,
  ChevronRight,
  Sparkles,
  Users,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Voucher {
  id: string;
  code: string;
  content_title: string;
  sponsor_name: string;
  status: string;
  expires_at: string;
}

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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [sponsoredContent, setSponsoredContent] = useState<SponsoredContent[]>([]);
  const [stats, setStats] = useState({
    activeVouchers: 0,
    openedContents: 0,
    totalSavings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch user's content access (vouchers/sponsored content)
      const { data: accessData } = await supabase
        .from('content_access')
        .select(`
          id,
          access_type,
          amount_paid,
          created_at,
          content_id,
          expert_contents(id, title, image_url, sponsor_name, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Transform data for display
      const voucherList: Voucher[] = [];
      let openedCount = 0;
      let savings = 0;

      if (accessData) {
        accessData.forEach((access: any) => {
          openedCount++;
          if (access.access_type === 'sponsored') {
            savings += access.amount_paid || 0;
            voucherList.push({
              id: access.id,
              code: `WA-2026-${access.id.substring(0, 4).toUpperCase()}`,
              content_title: access.expert_contents?.title || 'N/A',
              sponsor_name: access.expert_contents?.sponsor_name || 'N/A',
              status: 'active',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }

      setVouchers(voucherList);
      setStats({
        activeVouchers: voucherList.length,
        openedContents: openedCount,
        totalSavings: savings
      });

      // Fetch sponsored content recommendations
      const { data: contentData } = await supabase
        .from('expert_contents')
        .select('id, title, image_url, sponsor_name, category')
        .eq('is_sponsored', true)
        .eq('is_published', true)
        .limit(6);

      setSponsoredContent(contentData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard>
          <KPICard
            title={t('member_dashboard.active_vouchers')}
            value={stats.activeVouchers}
            icon={Ticket}
            subtitle={t('member_dashboard.redeemable')}
            iconColor="text-black"
          />
        </DashboardCard>
        <DashboardCard delay={0.1}>
          <KPICard
            title={t('member_dashboard.opened_contents')}
            value={stats.openedContents}
            icon={BookOpen}
            subtitle={t('member_dashboard.workshop_secrets')}
            iconColor="text-black/70"
          />
        </DashboardCard>
        <DashboardCard delay={0.2}>
          <KPICard
            title={t('member_dashboard.savings')}
            value={`${stats.totalSavings.toLocaleString()} Ft`}
            icon={PiggyBank}
            subtitle={t('member_dashboard.from_sponsor')}
            iconColor="text-black/60"
          />
        </DashboardCard>
      </div>

      {/* Active Vouchers Section */}
      <DashboardCard delay={0.3} className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="w-5 h-5 text-black/60" />
            {t('member_dashboard.active_vouchers')}
          </CardTitle>
          <Link to="/piacer">
            <Button variant="ghost" size="sm" className="text-black/60 hover:text-black">
              {t('member_dashboard.new_voucher')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : vouchers.length > 0 ? (
            <div className="space-y-3">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] border border-black/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-black/5">
                      <QrCode className="w-8 h-8 text-black/60" />
                    </div>
                    <div>
                      <p className="font-medium text-black">{voucher.content_title}</p>
                      <p className="text-sm text-black/50">
                        {t('member_dashboard.sponsor_label')}: {voucher.sponsor_name}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs border-black/10">
                        {voucher.code}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-black/10">
                    {t('member_dashboard.show_qr')}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto text-black/30 mb-4" />
              <p className="text-black/50 mb-4">
                {t('member_dashboard.no_vouchers')}
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
          {isLoading ? (
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
                    to={`/muhelytitok/${content.id}`}
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

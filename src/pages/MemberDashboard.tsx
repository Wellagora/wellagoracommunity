import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KPICard } from "@/components/dashboard/KPICard";
import { 
  Ticket, 
  BookOpen, 
  PiggyBank, 
  QrCode,
  ChevronRight,
  Sparkles,
  Users
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
      <div className="min-h-screen bg-background">
        <Navigation />
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Szia, {profile?.first_name || 'Tag'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Üdvözlünk a WellAgora közösségben
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <KPICard
            title="Aktív kuponjaim"
            value={stats.activeVouchers}
            icon={Ticket}
            subtitle="Beváltható"
            iconColor="text-primary"
          />
          <KPICard
            title="Megnyitott tartalmak"
            value={stats.openedContents}
            icon={BookOpen}
            subtitle="Műhelytitkok"
            iconColor="text-cyan-500"
          />
          <KPICard
            title="Megtakarítás"
            value={`${stats.totalSavings.toLocaleString()} Ft`}
            icon={PiggyBank}
            subtitle="Támogatói keretből"
            iconColor="text-green-500"
          />
        </div>

        {/* Active Vouchers Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Aktív kuponjaim
            </CardTitle>
            <Link to="/piac">
              <Button variant="ghost" size="sm">
                Új kupon <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
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
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <QrCode className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{voucher.content_title}</p>
                        <p className="text-sm text-muted-foreground">
                          Támogató: {voucher.sponsor_name}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {voucher.code}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      QR megjelenítése
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Még nincs aktív kuponod
                </p>
                <Link to="/piac">
                  <Button>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Fedezd fel a Piacteret
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sponsored Content Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t("member_dashboard.sponsored_contents") || "Támogatott Műhelytitkok"}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {content.category || 'Műhelytitok'}
                          </Badge>
                          <p className="font-medium text-foreground truncate">
                            {content.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Támogató: {content.sponsor_name}
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
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Hamarosan új tartalmak érkeznek
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Feed Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Közösségi hírek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Csatlakozz a közösséghez és oszd meg a tapasztalataidat
              </p>
              <Link to="/kozosseg">
                <Button variant="outline">
                  Közösség felfedezése
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;

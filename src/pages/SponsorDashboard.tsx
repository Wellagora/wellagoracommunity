import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/dashboard/KPICard";
import { 
  Building2,
  Ticket,
  Users,
  Settings,
  Plus,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredContent {
  id: string;
  title: string;
  total_licenses: number;
  used_licenses: number;
  redeemed_count: number;
}

const SponsorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [sponsorships, setSponsorships] = useState<SponsoredContent[]>([]);
  const [stats, setStats] = useState({
    totalLicenses: 0,
    usedLicenses: 0,
    redeemedVouchers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSponsorData();
    }
  }, [user]);

  const loadSponsorData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch content sponsorships where user is sponsor
      const { data: sponsorshipData } = await supabase
        .from('content_sponsorships')
        .select(`
          id,
          total_licenses,
          used_licenses,
          content_id,
          expert_contents(id, title)
        `)
        .eq('sponsor_id', user.id)
        .eq('is_active', true);

      const transformedData: SponsoredContent[] = (sponsorshipData || []).map((s: any) => ({
        id: s.id,
        title: s.expert_contents?.title || 'N/A',
        total_licenses: s.total_licenses || 0,
        used_licenses: s.used_licenses || 0,
        redeemed_count: s.used_licenses || 0 // Using used_licenses as redeemed for now
      }));

      setSponsorships(transformedData);

      // Calculate totals
      const totalLic = transformedData.reduce((sum, s) => sum + s.total_licenses, 0);
      const usedLic = transformedData.reduce((sum, s) => sum + s.used_licenses, 0);
      const redeemed = transformedData.reduce((sum, s) => sum + s.redeemed_count, 0);

      setStats({
        totalLicenses: totalLic,
        usedLicenses: usedLic,
        redeemedVouchers: redeemed
      });
    } catch (error) {
      console.error('Error loading sponsor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const usedPercentage = stats.totalLicenses > 0 
    ? Math.round((stats.usedLicenses / stats.totalLicenses) * 100) 
    : 0;
  
  const redeemedPercentage = stats.usedLicenses > 0 
    ? Math.round((stats.redeemedVouchers / stats.usedLicenses) * 100) 
    : 0;

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Támogatói Központ
              </h1>
              <p className="text-muted-foreground">
                {profile?.organization_name || profile?.organization || 'Szervezet'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/profil">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Szervezeti beállítások
              </Button>
            </Link>
            <Link to="/piac">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Új szponzoráció
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <KPICard
            title="Összes licenc"
            value={stats.totalLicenses}
            icon={Ticket}
            subtitle="Vásárolt"
            iconColor="text-amber-500"
          />
          <KPICard
            title="Felhasznált licencek"
            value={`${usedPercentage}%`}
            icon={Users}
            subtitle={`${stats.usedLicenses} / ${stats.totalLicenses}`}
            iconColor="text-primary"
          />
          <KPICard
            title="Beváltott kuponok"
            value={`${redeemedPercentage}%`}
            icon={Ticket}
            subtitle={`${stats.redeemedVouchers} beváltva`}
            iconColor="text-green-500"
          />
        </div>

        {/* Sponsored Contents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-500" />
              Szponzorált tartalmak
            </CardTitle>
            <CardDescription>
              A szervezeted által támogatott műhelytitkok
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : sponsorships.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Műhelytitok</TableHead>
                    <TableHead>Licencek</TableHead>
                    <TableHead>Felhasznált</TableHead>
                    <TableHead>Beváltott</TableHead>
                    <TableHead>Kihasználtság</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsorships.map((item) => {
                    const usagePercent = item.total_licenses > 0 
                      ? Math.round((item.used_licenses / item.total_licenses) * 100)
                      : 0;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.total_licenses}</TableCell>
                        <TableCell>{item.used_licenses}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {item.redeemed_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={usagePercent} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {usagePercent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Még nincs szponzorációd
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Támogass egy műhelytitokot és segíts, hogy mások is hozzáférjenek a tudáshoz
                </p>
                <Link to="/piac">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Piactér felfedezése
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorDashboard;

import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { SponsorDashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Plus, Users, Target, TrendingUp, ExternalLink } from "lucide-react";

interface Campaign {
  id: string;
  content_id: string;
  program_title: string;
  expert_name: string;
  sponsor_contribution_huf: number;
  max_sponsored_seats: number;
  sponsored_seats_used: number;
  is_active: boolean;
  created_at: string;
}

const SponsorCampaigns = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSeatsSponsored: 0,
    seatsUsed: 0,
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_sponsorships")
        .select(`
          id,
          content_id,
          sponsor_contribution_huf,
          max_sponsored_seats,
          sponsored_seats_used,
          is_active,
          created_at,
          expert_contents (
            id,
            title,
            creator_id,
            profiles:creator_id (
              first_name,
              last_name
            )
          )
        `)
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCampaigns: Campaign[] = (data || []).map((c: any) => ({
        id: c.id,
        content_id: c.content_id,
        program_title: c.expert_contents?.title || 'Unknown Program',
        expert_name: c.expert_contents?.profiles 
          ? `${c.expert_contents.profiles.first_name} ${c.expert_contents.profiles.last_name}`
          : 'Unknown Expert',
        sponsor_contribution_huf: c.sponsor_contribution_huf || 0,
        max_sponsored_seats: c.max_sponsored_seats || 0,
        sponsored_seats_used: c.sponsored_seats_used || 0,
        is_active: c.is_active !== false,
        created_at: c.created_at,
      }));

      setCampaigns(formattedCampaigns);

      // Calculate stats
      const activeCampaigns = formattedCampaigns.filter(c => c.is_active);
      const totalSeats = formattedCampaigns.reduce((sum, c) => sum + c.max_sponsored_seats, 0);
      const usedSeats = formattedCampaigns.reduce((sum, c) => sum + c.sponsored_seats_used, 0);

      setStats({
        totalCampaigns: formattedCampaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalSeatsSponsored: totalSeats,
        seatsUsed: usedSeats,
      });
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
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

  return (
    <DashboardLayout
      title={t("nav.my_campaigns") || "Kampányaim"}
      subtitle={t("sponsor.campaigns_subtitle") || "Manage your active sponsorships"}
      icon={Wallet}
      iconColor="text-blue-500"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' ? 'Összes kampány' : 'Total Campaigns'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stats.activeCampaigns}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' ? 'Aktív kampány' : 'Active'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.totalSeatsSponsored}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' ? 'Szponzorált helyek' : 'Sponsored Seats'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.seatsUsed}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' ? 'Felhasznált' : 'Used'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {language === 'hu' ? 'Aktív szponzorációk' : 'Active Sponsorships'}
          </h2>
          <Link to="/programs">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Új szponzoráció' : 'New Sponsorship'}
            </Button>
          </Link>
        </div>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {language === 'hu' ? 'Még nincs szponzorációd' : 'No sponsorships yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'hu' 
                  ? 'Böngészd a Piacteret és támogass programokat a közösség számára!'
                  : 'Browse the Marketplace and sponsor programs for the community!'}
              </p>
              <Link to="/programs">
                <Button className="bg-primary hover:bg-primary/90">
                  <Target className="w-4 h-4 mr-2" />
                  {language === 'hu' ? 'Piactér böngészése' : 'Browse Marketplace'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => {
              const progress = campaign.max_sponsored_seats > 0 
                ? Math.round((campaign.sponsored_seats_used / campaign.max_sponsored_seats) * 100)
                : 0;
              
              return (
                <Card key={campaign.id} className="bg-white/80 backdrop-blur-md border-white/40 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{campaign.program_title}</CardTitle>
                        <CardDescription>{campaign.expert_name}</CardDescription>
                      </div>
                      <Badge 
                        className={campaign.is_active 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-slate-100 text-slate-600"}
                      >
                        {campaign.is_active 
                          ? (language === 'hu' ? 'Aktív' : 'Active')
                          : (language === 'hu' ? 'Befejezett' : 'Completed')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            {language === 'hu' ? 'Felhasználás' : 'Usage'}
                          </span>
                          <span className="font-medium">
                            {campaign.sponsored_seats_used} / {campaign.max_sponsored_seats}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {campaign.sponsored_seats_used} {language === 'hu' ? 'fő támogatva' : 'supported'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatCurrency(campaign.sponsor_contribution_huf)} / fő
                          </span>
                        </div>
                      </div>

                      {/* View Program Link */}
                      <Link to={`/programs/${campaign.content_id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {language === 'hu' ? 'Program megtekintése' : 'View Program'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SponsorCampaigns;

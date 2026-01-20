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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet, 
  Plus, 
  Users, 
  Target, 
  TrendingUp, 
  ExternalLink,
  MoreVertical,
  Pause,
  Play,
  FileBarChart,
  Pencil,
  Calendar,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";
import { toast } from "sonner";

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
  status: 'active' | 'planned' | 'completed' | 'paused';
  total_budget: number;
  spent_budget: number;
  campaign_type: string;
}

type StatusFilter = 'all' | 'active' | 'planned' | 'completed';

const SponsorCampaigns = () => {
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    plannedCampaigns: 0,
    completedCampaigns: 0,
    totalSeatsSponsored: 0,
    seatsUsed: 0,
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const getLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

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
          total_licenses,
          used_licenses,
          supported_category,
          expert_contents (
            id,
            title,
            category,
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

      const formattedCampaigns: Campaign[] = (data || []).map((c: any) => {
        const maxSeats = c.max_sponsored_seats || c.total_licenses || 0;
        const usedSeats = c.sponsored_seats_used || c.used_licenses || 0;
        const contributionPerSeat = c.sponsor_contribution_huf || 0;
        const totalBudget = maxSeats * contributionPerSeat;
        const spentBudget = usedSeats * contributionPerSeat;
        
        // Determine campaign status
        let status: Campaign['status'] = 'active';
        if (!c.is_active) {
          status = usedSeats >= maxSeats ? 'completed' : 'paused';
        } else if (usedSeats >= maxSeats && maxSeats > 0) {
          status = 'completed';
        } else if (usedSeats === 0) {
          status = 'planned';
        }
        
        return {
          id: c.id,
          content_id: c.content_id,
          program_title: c.expert_contents?.title || 'Unknown Program',
          expert_name: c.expert_contents?.profiles 
            ? `${c.expert_contents.profiles.first_name} ${c.expert_contents.profiles.last_name}`
            : 'Unknown Expert',
          sponsor_contribution_huf: contributionPerSeat,
          max_sponsored_seats: maxSeats,
          sponsored_seats_used: usedSeats,
          is_active: c.is_active !== false,
          created_at: c.created_at,
          status,
          total_budget: totalBudget,
          spent_budget: spentBudget,
          campaign_type: c.supported_category || c.expert_contents?.category || 'general',
        };
      });

      setCampaigns(formattedCampaigns);

      // Calculate stats
      const activeCampaigns = formattedCampaigns.filter(c => c.status === 'active');
      const plannedCampaigns = formattedCampaigns.filter(c => c.status === 'planned');
      const completedCampaigns = formattedCampaigns.filter(c => c.status === 'completed');
      const totalSeats = formattedCampaigns.reduce((sum, c) => sum + c.max_sponsored_seats, 0);
      const usedSeats = formattedCampaigns.reduce((sum, c) => sum + c.sponsored_seats_used, 0);

      setStats({
        totalCampaigns: formattedCampaigns.length,
        activeCampaigns: activeCampaigns.length,
        plannedCampaigns: plannedCampaigns.length,
        completedCampaigns: completedCampaigns.length,
        totalSeatsSponsored: totalSeats,
        seatsUsed: usedSeats,
      });
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCampaignStatus = async (campaignId: string, currentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from("content_sponsorships")
        .update({ is_active: !currentlyActive })
        .eq("id", campaignId);

      if (error) throw error;

      toast.success(currentlyActive ? t("sponsor.campaign_paused") : t("sponsor.campaign_activated"));
      loadCampaigns();
    } catch (error) {
      console.error("Error toggling campaign:", error);
      toast.error(t("sponsor.error_occurred"));
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      active: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", key: "sponsor.active" },
      planned: { className: "bg-blue-500/10 text-blue-600 border-blue-500/20", key: "sponsor.planned" },
      completed: { className: "bg-slate-500/10 text-slate-600 border-slate-500/20", key: "sponsor.completed" },
      paused: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", key: "sponsor.paused" },
    };
    const badge = badges[status];
    return <Badge className={badge.className}>{t(badge.key)}</Badge>;
  };

  const getCampaignTypeLabel = (type: string) => {
    const typeKey = `category.${type}`;
    const translated = t(typeKey);
    // If no translation found, return type capitalized
    return translated !== typeKey ? translated : type.charAt(0).toUpperCase() + type.slice(1);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (statusFilter === 'all') return true;
    return campaign.status === statusFilter;
  });

  if (loading) {
    return <SponsorDashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo', 'sponsor'].includes(profile.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;
  
  if (!isSponsor && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout
      title={t("sponsor.campaigns_title")}
      subtitle={t("sponsor.campaigns_subtitle")}
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
                <p className="text-sm text-muted-foreground">{t("sponsor.total_campaigns")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stats.activeCampaigns}</p>
                <p className="text-sm text-muted-foreground">{t("sponsor.active")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.totalSeatsSponsored}</p>
                <p className="text-sm text-muted-foreground">{t("sponsor.sponsored_seats")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.seatsUsed}</p>
                <p className="text-sm text-muted-foreground">{t("sponsor.used")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="bg-white/80 backdrop-blur-md">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {language === 'hu' ? 'Mind' : language === 'de' ? 'Alle' : 'All'} ({stats.totalCampaigns})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                {language === 'hu' ? 'Aktív' : language === 'de' ? 'Aktiv' : 'Active'} ({stats.activeCampaigns})
              </TabsTrigger>
              <TabsTrigger value="planned" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                {language === 'hu' ? 'Tervezett' : language === 'de' ? 'Geplant' : 'Planned'} ({stats.plannedCampaigns})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white">
                {language === 'hu' ? 'Befejezett' : language === 'de' ? 'Abgeschlossen' : 'Completed'} ({stats.completedCampaigns})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Link to="/programs">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Új szponzoráció' : language === 'de' ? 'Neue Sponsoring' : 'New Sponsorship'}
            </Button>
          </Link>
        </div>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {statusFilter === 'all' ? t("sponsor.no_sponsorships") : t("sponsor.no_campaigns_status")}
              </h3>
              <p className="text-muted-foreground mb-4">{t("sponsor.browse_marketplace_hint")}</p>
              <Link to="/programs">
                <Button className="bg-primary hover:bg-primary/90">
                  <Target className="w-4 h-4 mr-2" />
                  {t("sponsor.browse_marketplace")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map((campaign) => {
              const progress = campaign.max_sponsored_seats > 0 
                ? Math.round((campaign.sponsored_seats_used / campaign.max_sponsored_seats) * 100)
                : 0;
              const budgetProgress = campaign.total_budget > 0
                ? Math.round((campaign.spent_budget / campaign.total_budget) * 100)
                : 0;
              
              return (
                <Card key={campaign.id} className="bg-white/80 backdrop-blur-md border-white/40 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getCampaignTypeLabel(campaign.campaign_type)}
                          </Badge>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <CardTitle className="text-lg line-clamp-1">{campaign.program_title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {campaign.expert_name}
                        </CardDescription>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/programs/${campaign.content_id}`} className="flex items-center">
                              <Pencil className="w-4 h-4 mr-2" />
                              {t("sponsor.edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleCampaignStatus(campaign.id, campaign.is_active)}>
                            {campaign.is_active ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                {t("sponsor.pause")}
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                {t("sponsor.activate")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/sponsor-dashboard`} className="flex items-center">
                              <FileBarChart className="w-4 h-4 mr-2" />
                              {t("sponsor.report")}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Budget info */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hu' ? 'Teljes keret' : 'Total Budget'}
                          </p>
                          <p className="font-semibold text-sm">{formatCurrency(campaign.total_budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hu' ? 'Elköltve' : 'Spent'}
                          </p>
                          <p className="font-semibold text-sm text-blue-600">{formatCurrency(campaign.spent_budget)}</p>
                        </div>
                      </div>

                      {/* Seats Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {language === 'hu' ? 'Résztvevők' : 'Participants'}
                          </span>
                          <span className="font-medium">
                            {campaign.sponsored_seats_used} / {campaign.max_sponsored_seats}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Budget Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            {language === 'hu' ? 'Költségvetés' : 'Budget'}
                          </span>
                          <span className="font-medium">{budgetProgress}%</span>
                        </div>
                        <Progress value={budgetProgress} className="h-2 [&>div]:bg-blue-500" />
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.created_at), 'MMM d, yyyy', { locale: getLocale() })}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {formatCurrency(campaign.sponsor_contribution_huf)} / fő
                        </span>
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

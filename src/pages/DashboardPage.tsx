import { useState, useEffect } from "react";
import { logger } from '@/lib/logger';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Trophy,
  Target,
  Users,
  Plus,
  User,
  Settings,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface Activity {
  id: string;
  type: "joined" | "completed" | "badge" | "points";
  description: string;
  timestamp: string;
  icon: any;
}

interface ProgramProgress {
  id: string;
  title: string;
  progress: number;
  points: number;
  image_url?: string;
}

interface Voucher {
  id: string;
  code: string;
  content_title: string;
  status: 'active' | 'redeemed';
  pickup_location: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    activePrograms: 0,
  });
  const [programs, setPrograms] = useState<ProgramProgress[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Get locale for date-fns
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Redirect organizations to their specialized dashboard (skip if super admin in citizen view mode)
  useEffect(() => {
    // Import viewMode from context at the top of the component
    // Skip redirect if super admin is testing citizen view
    if (profile?.user_role && ["business", "government", "ngo"].includes(profile.user_role)) {
      // Only redirect if not in citizen test mode
      const savedViewMode = localStorage.getItem("wellagora_view_mode");
      if (savedViewMode !== "citizen") {
        navigate("/sponsor-dashboard");
      }
    }
  }, [profile?.user_role, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);

        // Fetch user's challenge completions to calculate points
        const { data: completions } = await supabase
          .from("challenge_completions")
          .select("points_earned")
          .eq("user_id", user.id);

        const totalPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;

        // Fetch active programs (challenge definitions user hasn't completed yet)
        const { data: allPrograms } = await supabase
          .from("challenge_definitions")
          .select("id, title, image_url, points_base")
          .eq("is_active", true)
          .limit(4);

        // Programs without mock progress (will show 0% until real tracking is implemented)
        const programsWithProgress =
          allPrograms?.map((p) => ({
            id: p.id,
            title: p.title,
            progress: 0,
            points: p.points_base,
            image_url: p.image_url,
          })) || [];

        setStats({
          points: totalPoints,
          activePrograms: allPrograms?.length || 0,
        });

        setPrograms(programsWithProgress);

        // No mock activities - will be empty until real activity tracking
        setActivities([]);

        // Fetch user vouchers from DB
        const { data: userVouchers } = await supabase
          .from("content_access")
          .select("id, content_id, created_at, expert_contents(title)")
          .eq("user_id", user.id)
          .eq("access_type", "voucher")
          .limit(5);

        setVouchers((userVouchers || []).map((v: any) => ({
          id: v.id,
          code: `WA-${new Date(v.created_at).getFullYear()}-${v.id.slice(0, 4).toUpperCase()}`,
          content_title: v.expert_contents?.title || 'Program',
          status: 'active' as const,
          pickup_location: 'A Szakértőnél'
        })));
      } catch (error) {
        logger.error('Error fetching dashboard data', error, 'Dashboard');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && !loading) {
      fetchDashboardData();
    }
  }, [user, loading, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = profile?.first_name || "User";
  const today = format(new Date(), "EEEE, MMMM d", { locale: dateLocale });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("dashboard.hello")}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/piacer")}
              title={t("dashboard.new_program")}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title={t("nav.profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} title={t("nav.settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
          {/* Points Card */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{t("dashboard.points")}</p>
                  {loadingData ? (
                    <Skeleton className="h-9 w-24" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats.points}</p>
                  )}
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Programs Card */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{t("dashboard.active_programs")}</p>
                  {loadingData ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats.activePrograms}</p>
                  )}
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2 text-primary hover:text-primary/80"
                    onClick={() => navigate("/piacer")}
                  >
                    {t("dashboard.view_all")} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Active Programs (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t("dashboard.my_active_programs")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))}
                  </div>
                ) : programs.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-12">
                    <div className="w-16 h-16 mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Target className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-medium mb-2">{t("community_building.hub_title")}</p>
                    <p className="text-muted-foreground mb-4 max-w-md">{t("community_building.hub_desc")}</p>
                    <div className="flex gap-3">
                      <Button onClick={() => navigate("/piacer")}>{t("community_building.hub_explore_programs")}</Button>
                      <Button variant="outline" onClick={() => navigate("/kozosseg")}>{t("community_building.hub_explore_community")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {programs.map((program) => (
                      <Card
                        key={program.id}
                        className="hover:shadow-md transition-all duration-300 cursor-pointer border-border/50"
                        onClick={() => navigate(`/piacer/${program.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {program.image_url && (
                              <img
                                src={program.image_url}
                                alt={program.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-2 truncate">{program.title}</h3>
                              <div className="flex items-center gap-4 mb-2">
                                <Progress value={program.progress} className="flex-1" />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {program.progress}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {program.points} {t("dashboard.points")}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  {t("dashboard.continue")}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity - Full width section */}
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("dashboard.recent_activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{t("community_building.activity_title")}</p>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">{t("community_building.activity_desc")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(activity.timestamp), "PPp", { locale: dateLocale })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: WellBot Widget (1/3 width on desktop) */}
          <div className="lg:col-span-1 animate-fade-in">
            <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/20 sticky top-24">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4 shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">WellBot</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.wellbot_greeting")}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <Button
                    variant="secondary"
                    className="w-full justify-start hover:bg-secondary/80 transition-colors"
                    size="sm"
                    onClick={() => navigate("/ai-assistant")}
                  >
                    <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t("dashboard.wellbot_suggest")}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start hover:bg-secondary/80 transition-colors"
                    size="sm"
                    onClick={() => navigate("/ai-assistant")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t("dashboard.wellbot_progress")}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start hover:bg-secondary/80 transition-colors"
                    size="sm"
                    onClick={() => navigate("/ai-assistant")}
                  >
                    <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t("dashboard.wellbot_tips")}</span>
                  </Button>
                </div>

                <Button
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  onClick={() => navigate("/ai-assistant")}
                >
                  {t("dashboard.wellbot_full")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

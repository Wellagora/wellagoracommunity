import { useState, useEffect } from "react";
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
  Award
} from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface Activity {
  id: string;
  type: 'joined' | 'completed' | 'badge' | 'points';
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    points: 0,
    activePrograms: 0,
    rank: "Top 15%"
  });
  const [programs, setPrograms] = useState<ProgramProgress[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Get locale for date-fns
  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Redirect organizations to their specialized dashboard
  useEffect(() => {
    if (profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role)) {
      navigate("/organization");
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
          .from('challenge_completions')
          .select('points_earned')
          .eq('user_id', user.id);

        const totalPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;

        // Fetch active programs (challenge definitions user hasn't completed yet)
        const { data: allPrograms } = await supabase
          .from('challenge_definitions')
          .select('id, title, image_url, points_base')
          .eq('is_active', true)
          .limit(4);

        // Mock progress data (in real app, fetch from user's progress table)
        const programsWithProgress = allPrograms?.map(p => ({
          id: p.id,
          title: p.title,
          progress: Math.floor(Math.random() * 100),
          points: p.points_base,
          image_url: p.image_url
        })) || [];

        setStats({
          points: totalPoints,
          activePrograms: allPrograms?.length || 0,
          rank: "Top 15%"
        });

        setPrograms(programsWithProgress);

        // Mock recent activities
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'joined',
            description: t('dashboard.joined_program'),
            timestamp: new Date().toISOString(),
            icon: CheckCircle2
          },
          {
            id: '2',
            type: 'points',
            description: t('dashboard.earned_points'),
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            icon: Trophy
          }
        ];
        setActivities(mockActivities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = profile?.first_name || 'User';
  const today = format(new Date(), 'EEEE, MMMM d', { locale: dateLocale });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('dashboard.hello')}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/challenges')}>
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          {/* Points Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('dashboard.points')}</p>
                  {loadingData ? (
                    <Skeleton className="h-9 w-24" />
                  ) : (
                    <p className="text-3xl font-bold">{stats.points}</p>
                  )}
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{t('dashboard.points_trend')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Programs Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('dashboard.active_programs')}</p>
                  {loadingData ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stats.activePrograms}</p>
                  )}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2 text-primary"
                    onClick={() => navigate('/challenges')}
                  >
                    {t('dashboard.view_all')} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Rank Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('dashboard.community_rank')}</p>
                  {loadingData ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stats.rank}</p>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    {t('dashboard.top_percent')}
                  </Badge>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Active Programs */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.my_active_programs')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : programs.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">{t('dashboard.no_programs')}</p>
                    <p className="text-muted-foreground mb-4">{t('dashboard.no_programs_desc')}</p>
                    <Button onClick={() => navigate('/challenges')}>
                      {t('dashboard.browse_programs')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {programs.map((program) => (
                      <Card key={program.id} className="hover-scale cursor-pointer" onClick={() => navigate(`/challenges/${program.id}`)}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {program.image_url && (
                              <img 
                                src={program.image_url} 
                                alt={program.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{program.title}</h3>
                              <div className="flex items-center gap-4 mb-2">
                                <Progress value={program.progress} className="flex-1" />
                                <span className="text-sm text-muted-foreground">{program.progress}%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {program.points} {t('dashboard.points')}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  {t('dashboard.continue')}
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{t('dashboard.no_activity')}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.no_activity_desc')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.timestamp), 'PPp', { locale: dateLocale })}
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

          {/* Right: WellBot Widget */}
          <div className="lg:col-span-1 animate-fade-in">
            <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">WellBot</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.wellbot_greeting')}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate('/ai-assistant')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {t('dashboard.wellbot_suggest')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate('/ai-assistant')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('dashboard.wellbot_progress')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate('/ai-assistant')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('dashboard.wellbot_tips')}
                  </Button>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => navigate('/ai-assistant')}
                >
                  {t('dashboard.wellbot_full')}
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

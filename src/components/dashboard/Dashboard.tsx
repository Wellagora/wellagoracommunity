import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  Zap, 
  Users, 
  Target, 
  Award,
  TreePine,
  Flame,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardProps {
  userRole: UserRole;
}

interface CompletedChallenge {
  id: string;
  challenge_id: string;
  completion_date: string;
  impact_data: any;
  points_earned: number;
}

interface Activity {
  id: string;
  activity_type: string;
  impact_amount: number;
  points_earned: number;
  date: string;
}

interface Connection {
  id: string;
  first_name: string;
  last_name: string;
  user_role: string;
  organization?: string;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [handprintData, setHandprintData] = useState({
    totalCo2Saved: 0,
    totalPoints: 0,
    activitiesCount: 0,
    streakDays: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load completed challenges
      const { data: challenges } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('validation_status', 'approved')
        .order('completion_date', { ascending: false })
        .limit(10);
      
      if (challenges) setCompletedChallenges(challenges);

      // Load recent activities
      const { data: activities } = await supabase
        .from('sustainability_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(10);
      
      if (activities) {
        setRecentActivities(activities);
        
        // Calculate handprint data
        const totalCo2 = activities.reduce((sum, act) => sum + (act.impact_amount || 0), 0);
        const totalPts = activities.reduce((sum, act) => sum + (act.points_earned || 0), 0);
        
        setHandprintData({
          totalCo2Saved: totalCo2,
          totalPoints: totalPts,
          activitiesCount: activities.length,
          streakDays: calculateStreak(activities)
        });
      }

      // Load connections (public profiles from same region/project)
      const { data: profile } = await supabase
        .from('profiles')
        .select('region, project_id')
        .eq('id', user?.id)
        .single();

      if (profile) {
        const { data: publicProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, user_role, organization')
          .eq('is_public_profile', true)
          .or(`region.eq.${profile.region},project_id.eq.${profile.project_id}`)
          .neq('id', user?.id)
          .limit(5);
        
        if (publicProfiles) setConnections(publicProfiles);
      }
      
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (activities: Activity[]) => {
    if (!activities.length) return 0;
    
    let streak = 1;
    const sortedDates = activities.map(a => new Date(a.date)).sort((a, b) => b.getTime() - a.getTime());
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff = Math.floor((sortedDates[i].getTime() - sortedDates[i + 1].getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) streak++;
      else break;
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getCategoryBreakdown = () => {
    const categories: { [key: string]: number } = {};
    
    recentActivities.forEach(activity => {
      const type = activity.activity_type;
      categories[type] = (categories[type] || 0) + activity.impact_amount;
    });
    
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categories).map(([type, value]) => ({
      nameKey: `dashboard.category.${type}`,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      icon: getCategoryIcon(type)
    }));
  };

  const getCategoryIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      energy: "⚡",
      transport: "🚲",
      waste: "♻️",
      food: "🥬",
      water: "💧",
      home: "🏠",
      community: "🤝"
    };
    return icons[type] || "🌱";
  };

  const dashboardData = {
    handprint: {
      score: handprintData.totalCo2Saved,
      co2Saved: handprintData.totalCo2Saved,
      treesEquivalent: Math.round(handprintData.totalCo2Saved / 12),
      streakDays: handprintData.streakDays
    },
    activeChallenges: completedChallenges.slice(0, 3).map(challenge => ({
      id: challenge.challenge_id,
      titleKey: challenge.challenge_id,
      progress: 100,
      dueDate: new Date(challenge.completion_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
      category: challenge.impact_data?.category || "general",
      points: challenge.points_earned
    })),
    categoryBreakdown: getCategoryBreakdown(),
    communityImpact: {
      totalParticipants: connections.length * 500, // Estimate based on connections
      co2SavedThisMonth: handprintData.totalCo2Saved,
      activeChallenges: completedChallenges.length
    },
    recentAchievements: recentActivities.slice(0, 3).map((activity, idx) => ({
      id: activity.id,
      titleKey: activity.activity_type,
      icon: getCategoryIcon(activity.activity_type),
      date: new Date(activity.date).toLocaleDateString('hu-HU'),
      points: activity.points_earned
    })),
    connections: connections,
    organizationData: userRole !== "citizen" ? {
      sponsoredChallenges: completedChallenges.slice(0, 3).map(challenge => ({
        id: challenge.id,
        titleKey: challenge.challenge_id,
        participants: Math.round(Math.random() * 200 + 50),
        co2Saved: challenge.impact_data?.co2_saved || 0
      })),
      partnerships: connections.map(conn => ({
        id: conn.id,
        nameKey: `${conn.first_name} ${conn.last_name}`,
        type: conn.user_role,
        organization: conn.organization
      }))
    } : null
  };

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Top Impact Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Card className="bg-gradient-to-br from-success/10 to-primary/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.completed_programs')}</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData.handprint.score}</p>
              </div>
              <Award className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.total_participants')}</p>
                <p className="text-2xl font-bold">{dashboardData.communityImpact.totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.current_streak')}</p>
                <p className="text-2xl font-bold">{dashboardData.handprint.streakDays} {t('dashboard.days')}</p>
              </div>
              <Flame className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.active_challenges')}</CardTitle>
              <CardDescription>{t('dashboard.current_challenges')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.activeChallenges.length > 0 ? (
                dashboardData.activeChallenges.map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className="flex flex-col space-y-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors" 
                    onClick={() => window.location.href = `/challenges/${challenge.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{challenge.titleKey}</h4>
                      <Badge variant="outline" className="text-xs bg-success/20">
                        ✓ Teljesítve: {challenge.dueDate}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/20 text-primary">
                        +{challenge.points} pont
                      </Badge>
                      <span className="text-sm text-muted-foreground">{getCategoryIcon(challenge.category)} {challenge.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('dashboard.no_completed_challenges')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => window.location.href = '/challenges'}
                  >
                    {t('dashboard.browse_challenges')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.impact_by_category')}</CardTitle>
              <CardDescription>{t('dashboard.biggest_impact')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                    <div className="text-xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{t(category.nameKey)}</span>
                        <span className="text-sm font-semibold">{category.value}%</span>
                      </div>
                      <Progress value={category.value} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Community Impact */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{t('dashboard.community_impact')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.total_participants')}</p>
                    <p className="text-2xl font-bold">{dashboardData.communityImpact.totalParticipants.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.co2_saved')} {t('dashboard.this_month')}</p>
                    <p className="text-2xl font-bold">{dashboardData.communityImpact.co2SavedThisMonth}t</p>
                  </div>
                  <TreePine className="w-8 h-8 text-success" />
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.active_challenges')}</p>
                    <p className="text-2xl font-bold">{dashboardData.communityImpact.activeChallenges}</p>
                  </div>
                  <Target className="w-8 h-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-warning" />
                <span>{t('dashboard.recent_activities')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentAchievements.length > 0 ? (
                  dashboardData.recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                      <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.titleKey}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                      <Badge className="bg-success/20 text-success">
                        +{achievement.points}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Leaf className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('dashboard.no_activities_yet')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Connections */}
          {connections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>{t('dashboard.connections')}</span>
                </CardTitle>
                <CardDescription>{t('dashboard.people_in_network')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center space-x-3 p-2 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{connection.first_name} {connection.last_name}</p>
                        {connection.organization && (
                          <p className="text-xs text-muted-foreground">{connection.organization}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t(`dashboard.roles.${connection.user_role}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization-specific Section */}
          {userRole !== "citizen" && dashboardData.organizationData && (
            <Card className="bg-gradient-to-br from-warning/5 to-success/5">
              <CardHeader>
                <CardTitle>{t('dashboard.organization_overview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('dashboard.sponsored_challenges')}</h4>
                    {dashboardData.organizationData.sponsoredChallenges.map((challenge) => (
                      <div key={challenge.id} className="flex justify-between items-center p-2 bg-card rounded-lg mb-2">
                        <span className="text-sm">{t(challenge.titleKey)}</span>
                        <Badge className="bg-success text-white">{challenge.participants} {t('dashboard.participants')}</Badge>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t('dashboard.partnerships')}</h4>
                    {dashboardData.organizationData.partnerships.map((partner) => (
                      <div key={partner.id} className="flex items-center space-x-2 p-2 bg-card rounded-lg mb-2">
                        <span className="text-sm flex-1">{partner.nameKey}</span>
                        <div className="flex flex-col items-end">
                          <Badge variant="outline" className="text-xs mb-1">{t(`dashboard.roles.${partner.type}`)}</Badge>
                          {partner.organization && (
                            <span className="text-xs text-muted-foreground">{partner.organization}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
  Flame
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useLanguage();

  // Mock data - will be replaced with real data from Supabase
  const dashboardData = {
    handprint: {
      score: 156.8,
      co2Saved: 156.8,
      treesEquivalent: 12,
      streakDays: 23
    },
    activeChallenges: [
      {
        id: "1",
        titleKey: "dashboard.challenges.green_energy_switch",
        progress: 65,
        dueDate: "Mar 30",
        category: "energy"
      },
      {
        id: "2",
        titleKey: "dashboard.challenges.sustainable_transport_week",
        progress: 40,
        dueDate: "Mar 25",
        category: "transport"
      }
    ],
    categoryBreakdown: [
      { nameKey: "dashboard.category.energy", value: 28, icon: "⚡" },
      { nameKey: "dashboard.category.transport", value: 22, icon: "🚲" },
      { nameKey: "dashboard.category.waste", value: 18, icon: "♻️" },
      { nameKey: "dashboard.category.food", value: 15, icon: "🥬" },
      { nameKey: "dashboard.category.water", value: 10, icon: "💧" },
      { nameKey: "dashboard.category.home", value: 7, icon: "🏠" }
    ],
    communityImpact: {
      totalParticipants: 2847,
      co2SavedThisMonth: 45.6,
      activeChallenges: 12
    },
    recentAchievements: [
      {
        id: "1",
        titleKey: "dashboard.achievements.energy_master",
        icon: "⚡",
        date: "2 hours ago"
      },
      {
        id: "2",
        titleKey: "dashboard.achievements.water_guardian",
        icon: "💧",
        date: "1 day ago"
      }
    ],
    // Organization-specific data
    organizationData: userRole !== "citizen" ? {
      sponsoredChallenges: [
        {
          id: "1",
          titleKey: "dashboard.challenges.green_office_initiative",
          participants: 342,
          co2Saved: 18.5
        }
      ],
      partnerships: [
        { id: "1", nameKey: "dashboard.partnerships.green_earth_ngo", type: "ngo" },
        { id: "2", nameKey: "dashboard.partnerships.city_sustainability_office", type: "government" }
      ]
    } : null
  };

  return (
    <div className="space-y-6">
      {/* Top Impact Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-primary/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('handprint.title')}</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData.handprint.score}</p>
              </div>
              <Leaf className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.co2_saved')}</p>
                <p className="text-2xl font-bold">{dashboardData.handprint.co2Saved}kg</p>
              </div>
              <TreePine className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.trees')}</p>
                <p className="text-2xl font-bold">{dashboardData.handprint.treesEquivalent}</p>
              </div>
              <TreePine className="w-8 h-8 text-primary" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.active_challenges')}</CardTitle>
              <CardDescription>{t('dashboard.current_challenges')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.activeChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="flex flex-col space-y-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors" 
                  onClick={() => window.location.href = `/challenges/${challenge.id}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{t(challenge.titleKey)}</h4>
                    <Badge variant="outline" className="text-xs">{t('dashboard.labels.due')}: {challenge.dueDate}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={challenge.progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{challenge.progress}%</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); window.location.href = `/challenges/${challenge.id}`; }}>
                    {t('dashboard.continue')}
                  </Button>
                </div>
              ))}
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

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-warning" />
                <span>{t('dashboard.recent_wins')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t(achievement.titleKey)}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                        <span className="text-sm flex-1">{t(partner.nameKey)}</span>
                        <Badge variant="outline" className="text-xs">{partner.type}</Badge>
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

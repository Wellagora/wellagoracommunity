import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Leaf, 
  Zap, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Building,
  TreePine,
  Recycle,
  Car,
  Home
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RegionalImpactMap } from "./RegionalImpactMap";
import { SponsorChallengeModal } from "./SponsorChallengeModal";
import { MobilizeTeamModal } from "./MobilizeTeamModal";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [mobilizeModalOpen, setMobilizeModalOpen] = useState(false);

  // Mock data - will be replaced with real data from Supabase
  const citizenData = {
    personalStats: {
      co2Reduced: 156.8,
      pointsEarned: 2847,
      challengesCompleted: 8,
      streakDays: 23
    },
    monthlyProgress: [
      { month: "Jan", co2: 45.2, points: 650 },
      { month: "Feb", co2: 52.1, points: 780 },
      { month: "Mar", co2: 59.5, points: 890 },
    ],
    categoryBreakdown: [
      { nameKey: "dashboard.category.energy", value: 28, color: "#FEF08A", icon: "⚡" },
      { nameKey: "dashboard.category.transport", value: 22, color: "#A7F3D0", icon: "🚲" },
      { nameKey: "dashboard.category.waste", value: 18, color: "#BFDBFE", icon: "♻️" },
      { nameKey: "dashboard.category.food", value: 15, color: "#DDD6FE", icon: "🥬" },
      { nameKey: "dashboard.category.water", value: 10, color: "#FECACA", icon: "💧" },
      { nameKey: "dashboard.category.home", value: 7, color: "#C7D2FE", icon: "🏠" }
    ],
    forestGrowth: {
      trees: 12,
      shrubs: 8,
      flowers: 15,
      totalCo2Absorbed: 156.8,
      monthlyGrowth: 2.3
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
    ]
  };

  const businessData = {
    companyStats: {
      employeesEngaged: 847,
      co2Reduced: 2456.7,
      costsReduced: 18500,
      sustainabilityScore: 78
    },
    departmentProgress: [
      { department: "HR", score: 85, employees: 45 },
      { department: "IT", score: 72, employees: 120 },
      { department: "Marketing", score: 68, employees: 35 },
      { department: "Operations", score: 81, employees: 200 },
    ],
    initiatives: [
      {
        id: "1",
        title: "Office Energy Optimization",
        participants: 245,
        savings: 12500,
        status: "active"
      },
      {
        id: "2",
        title: "Remote Work Fridays",
        participants: 180,
        savings: 6000,
        status: "planning"
      }
    ]
  };

  const renderCitizenDashboard = () => (
    <div className="space-y-6">
      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs sm:text-sm">{t('dashboard.co2_saved')}</p>
                <p className="text-lg sm:text-2xl font-bold break-words">{citizenData.personalStats.co2Reduced}kg</p>
              </div>
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('dashboard.points_earned')}</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.pointsEarned.toLocaleString()}</p>
              </div>
              <Award className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('dashboard.challenges_completed')}</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.challengesCompleted}</p>
              </div>
              <Target className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t('dashboard.current_streak')}</p>
                <p className="text-2xl font-bold">{citizenData.personalStats.streakDays} {t('dashboard.days')}</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forest Growth Visualization */}
        <Card className="bg-gradient-to-br from-success/5 via-card to-primary/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TreePine className="w-5 h-5 text-success" />
              <span>{t('dashboard.forest_growth')}</span>
            </CardTitle>
            <CardDescription>{t('dashboard.forest_growth_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Forest Visualization */}
              <div className="bg-gradient-to-b from-blue-100 to-green-200 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 min-h-[200px] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-300 to-transparent dark:from-green-800/40"></div>
                
                {/* Trees */}
                <div className="flex items-end justify-center space-x-2 h-40 relative z-10">
                  {Array.from({ length: citizenData.forestGrowth.trees }, (_, i) => (
                    <div key={`tree-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="text-2xl mb-1">🌲</div>
                    </div>
                  ))}
                  {Array.from({ length: citizenData.forestGrowth.shrubs }, (_, i) => (
                    <div key={`shrub-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${(i + 12) * 0.1}s` }}>
                      <div className="text-lg mb-1">🌿</div>
                    </div>
                  ))}
                  {Array.from({ length: Math.min(citizenData.forestGrowth.flowers, 8) }, (_, i) => (
                    <div key={`flower-${i}`} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${(i + 20) * 0.1}s` }}>
                      <div className="text-sm mb-1">🌸</div>
                    </div>
                  ))}
                </div>
                
                {/* Growth Stats */}
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{t('dashboard.this_month')}</div>
                  <div className="text-sm font-semibold text-success">+{citizenData.forestGrowth.monthlyGrowth} {t('dashboard.new_plants')}</div>
                </div>
              </div>
              
              {/* Forest Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl mb-1">🌲</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.trees}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.trees')}</div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl mb-1">🌿</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.shrubs}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.shrubs')}</div>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl mb-1">🌸</div>
                  <div className="font-semibold text-foreground">{citizenData.forestGrowth.flowers}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.flowers')}</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{t('dashboard.forest_total')}</div>
                <div className="text-lg font-bold text-success">{citizenData.forestGrowth.totalCo2Absorbed} kg CO₂</div>
                <div className="text-xs text-muted-foreground">{t('dashboard.co2_absorption')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.impact_by_category')}</CardTitle>
            <CardDescription>{t('dashboard.biggest_impact')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Category List with Progress Bars */}
              {citizenData.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-foreground">{t(category.nameKey)}</span>
                      <span className="text-sm font-semibold text-foreground">{category.value}%</span>
                    </div>
                    <Progress value={category.value} className="h-2" />
                  </div>
                </div>
              ))}
              
              {/* Mini Pie Chart */}
              <div className="mt-6 flex justify-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={citizenData.categoryBreakdown}
                    cx="50%"
                    cy="50%" 
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {citizenData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t('dashboard.active_challenges')}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('dashboard.current_challenges')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {citizenData.activeChallenges.map((challenge) => (
            <div key={challenge.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => window.location.href = `/challenge/${challenge.id}`}>
              <div className="flex-1 w-full">
                <h4 className="text-sm sm:text-base font-medium">{t(challenge.titleKey)}</h4>
                <div className="flex items-center space-x-4 mt-2">
                  <Progress value={challenge.progress} className="flex-1" />
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{challenge.progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.labels.due')}: {challenge.dueDate}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto" onClick={(e) => { e.stopPropagation(); window.location.href = `/challenge/${challenge.id}`; }}>{t('dashboard.continue')}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessDashboard = () => {
    // Mock regional data - will be replaced with real Supabase data
    const regionalData = {
      overview: {
        activeChallenges: 12,
        peopleReached: 2847,
        co2Saved: 45.6,
        partnerships: 8
      },
      regionalRank: 3,
      totalOrganizations: 47,
      challenges: [
        {
          id: "1",
          titleKey: "dashboard.challenges.green_office_initiative",
          type: "sponsored",
          participants: 342,
          co2Saved: 18.5,
          status: "active",
          progress: 67
        },
        {
          id: "2",
          titleKey: "dashboard.challenges.bike_to_work_campaign",
          type: "created",
          participants: 156,
          co2Saved: 8.2,
          status: "active",
          progress: 45
        },
        {
          id: "3",
          titleKey: "dashboard.challenges.community_garden_project",
          type: "team_joins",
          participants: 89,
          co2Saved: 4.3,
          status: "completed",
          progress: 100
        }
      ],
      partnerships: [
        { id: "1", nameKey: "dashboard.partnerships.green_earth_ngo", type: "ngo", projects: 5, impact: 92 },
        { id: "2", nameKey: "dashboard.partnerships.city_sustainability_office", type: "government", projects: 3, impact: 88 },
        { id: "3", nameKey: "dashboard.partnerships.local_tech_hub", type: "business", projects: 4, impact: 85 }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Regional Impact Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <RegionalImpactMap />
          </div>

          {/* Regional Rank */}
          <Card className="bg-gradient-to-br from-warning/10 to-accent/10">
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-warning mx-auto mb-3" />
                <h3 className="text-sm text-muted-foreground mb-2">{t('dashboard.regional_rank')}</h3>
                <p className="text-4xl font-bold text-foreground mb-1">#{regionalData.regionalRank}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.out_of')} {regionalData.totalOrganizations} {t('dashboard.organizations')}</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">{t('dashboard.impact_score')}</p>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">85/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.activeChallenges}</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.active_challenges')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-accent mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.peopleReached.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.people_reached')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TreePine className="w-8 h-8 text-success mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.co2Saved}t</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.co2_saved')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Building className="w-8 h-8 text-warning mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.partnerships}</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.new_partnerships')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges">{t('dashboard.challenge_ecosystem')}</TabsTrigger>
            <TabsTrigger value="partnerships">{t('dashboard.community_connections')}</TabsTrigger>
            <TabsTrigger value="stories">{t('dashboard.impact_stories')}</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-4">
                 <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex-1 min-w-[140px]">
                    <Target className="w-4 h-4 mr-2" />
                    {t('dashboard.actions.create_challenge')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]">
                    <Award className="w-4 h-4 mr-2" />
                    {t('dashboard.actions.sponsor_challenge')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]">
                    <Users className="w-4 h-4 mr-2" />
                    {t('dashboard.actions.mobilize_team')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Challenges List */}
            <div className="grid gap-4">
              {regionalData.challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{t(challenge.titleKey)}</h4>
                          <Badge variant={challenge.type === "sponsored" ? "default" : challenge.type === "created" ? "secondary" : "outline"}>
                            {t(`dashboard.badge.${challenge.type}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants} {t('dashboard.labels.participants')}
                          </span>
                          <span className="flex items-center gap-1">
                            <TreePine className="w-4 h-4" />
                            {challenge.co2Saved}t CO₂
                          </span>
                        </div>
                      </div>
                      <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                        {t(`dashboard.status.${challenge.status}`)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.labels.progress')}</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            <div className="grid gap-4">
              {regionalData.partnerships.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                          {partner.type === "ngo" ? "🌱" : partner.type === "government" ? "🏛️" : "🏢"}
                        </div>
                        <div>
                          <h4 className="font-semibold">{t(partner.nameKey)}</h4>
                          <p className="text-sm text-muted-foreground">{partner.projects} {t('dashboard.labels.joint_projects')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('dashboard.impact_score')}</p>
                        <p className="text-xl font-bold text-success">{partner.impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📢</div>
                  <p className="text-2xl font-bold">1.2M</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.labels.brand_engagement')}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📰</div>
                  <p className="text-2xl font-bold">34</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.labels.media_mentions')}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.labels.sustainability_awards')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderGovernmentDashboard = () => {
    const regionalData = {
      overview: {
        activeChallenges: 28,
        peopleReached: 12450,
        co2Saved: 124.3,
        partnerships: 15
      },
      regionalRank: 1,
      totalOrganizations: 8,
      challenges: [
        {
          id: "1",
          titleKey: "dashboard.challenges.city_wide_solar",
          type: "created",
          participants: 3240,
          co2Saved: 52.1,
          status: "active",
          progress: 78
        },
        {
          id: "2",
          titleKey: "dashboard.challenges.public_transport_week",
          type: "sponsored",
          participants: 4580,
          co2Saved: 38.6,
          status: "active",
          progress: 92
        },
        {
          id: "3",
          titleKey: "dashboard.challenges.green_schools_program",
          type: "created",
          participants: 2150,
          co2Saved: 22.4,
          status: "active",
          progress: 65
        }
      ],
      partnerships: [
        { id: "1", nameKey: "dashboard.partnerships.local_business_consortium", type: "business", projects: 12, impact: 95 },
        { id: "2", nameKey: "dashboard.partnerships.environmental_coalition", type: "ngo", projects: 8, impact: 91 },
        { id: "3", nameKey: "dashboard.partnerships.university_research_center", type: "ngo", projects: 6, impact: 87 }
      ]
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RegionalImpactMap />
          </div>

          <Card className="bg-gradient-to-br from-warning/10 to-primary/10">
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-warning mx-auto mb-3" />
                <h3 className="text-sm text-muted-foreground mb-2">Regional Rank</h3>
                <p className="text-4xl font-bold text-foreground mb-1">#{regionalData.regionalRank}</p>
                <p className="text-xs text-muted-foreground">leading municipality</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Policy Impact</p>
                  <Progress value={95} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">95/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-warning mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.activeChallenges}</p>
              <p className="text-xs text-muted-foreground">Active Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.peopleReached.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Citizens Engaged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TreePine className="w-8 h-8 text-success mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.co2Saved}t</p>
              <p className="text-xs text-muted-foreground">CO₂ Reduced</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Building className="w-8 h-8 text-accent mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.partnerships}</p>
              <p className="text-xs text-muted-foreground">Partnerships</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs">Municipal Programs</TabsTrigger>
            <TabsTrigger value="partnerships">Stakeholder Network</TabsTrigger>
            <TabsTrigger value="impact">Policy Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4">
            <Card className="bg-gradient-to-r from-warning/10 to-primary/10">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex-1 min-w-[140px]" onClick={() => setSponsorModalOpen(true)}>
                    <Target className="w-4 h-4 mr-2" />
                    Launch Program
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]" onClick={() => setSponsorModalOpen(true)}>
                    <Award className="w-4 h-4 mr-2" />
                    Fund Initiative
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]" onClick={() => setMobilizeModalOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Engage Citizens
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {regionalData.challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{t(challenge.titleKey)}</h4>
                          <Badge variant={challenge.type === "created" ? "default" : "secondary"}>
                            {t(`dashboard.badge.${challenge.type}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants.toLocaleString()} {t('dashboard.labels.participants')}
                          </span>
                          <span className="flex items-center gap-1">
                            <TreePine className="w-4 h-4" />
                            {challenge.co2Saved}t CO₂
                          </span>
                        </div>
                      </div>
                      <Badge variant="default">{t(`dashboard.status.${challenge.status}`)}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.labels.progress')}</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            <div className="grid gap-4">
              {regionalData.partnerships.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-primary/20 rounded-full flex items-center justify-center">
                          {partner.type === "business" ? "🏢" : "🌱"}
                        </div>
                        <div>
                          <h4 className="font-semibold">{t(partner.nameKey)}</h4>
                          <p className="text-sm text-muted-foreground">{partner.projects} {t('dashboard.labels.joint_projects')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('dashboard.impact_score')}</p>
                        <p className="text-xl font-bold text-success">{partner.impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm text-muted-foreground">Citizen Satisfaction</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Policies Implemented</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌍</div>
                  <p className="text-2xl font-bold">€2.4M</p>
                  <p className="text-sm text-muted-foreground">Green Investment</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderNGODashboard = () => {
    const regionalData = {
      overview: {
        activeChallenges: 18,
        peopleReached: 5680,
        co2Saved: 67.8,
        partnerships: 11
      },
      regionalRank: 2,
      totalOrganizations: 34,
      challenges: [
        {
          id: "1",
          titleKey: "dashboard.challenges.community_cleanup",
          type: "created",
          participants: 890,
          co2Saved: 12.4,
          status: "active",
          progress: 82
        },
        {
          id: "2",
          titleKey: "dashboard.challenges.urban_gardening",
          type: "sponsored",
          participants: 1240,
          co2Saved: 28.3,
          status: "active",
          progress: 55
        },
        {
          id: "3",
          titleKey: "dashboard.challenges.eco_education",
          type: "created",
          participants: 2150,
          co2Saved: 15.6,
          status: "completed",
          progress: 100
        }
      ],
      partnerships: [
        { id: "1", nameKey: "dashboard.partnerships.tech_for_good", type: "business", projects: 7, impact: 89 },
        { id: "2", nameKey: "dashboard.partnerships.city_environmental", type: "government", projects: 5, impact: 93 },
        { id: "3", nameKey: "dashboard.partnerships.green_schools", type: "ngo", projects: 9, impact: 86 }
      ]
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RegionalImpactMap />
          </div>

          <Card className="bg-gradient-to-br from-success/10 to-primary/10">
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="text-sm text-muted-foreground mb-2">Regional Rank</h3>
                <p className="text-4xl font-bold text-foreground mb-1">#{regionalData.regionalRank}</p>
                <p className="text-xs text-muted-foreground">out of {regionalData.totalOrganizations} NGOs</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Community Impact</p>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">90/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-success mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.activeChallenges}</p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.peopleReached.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Volunteers & Supporters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TreePine className="w-8 h-8 text-success mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.co2Saved}t</p>
              <p className="text-xs text-muted-foreground">Environmental Impact</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Building className="w-8 h-8 text-accent mb-2" />
              <p className="text-2xl font-bold">{regionalData.overview.partnerships}</p>
              <p className="text-xs text-muted-foreground">Collaborations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projects & Campaigns</TabsTrigger>
            <TabsTrigger value="partnerships">Collaboration Network</TabsTrigger>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card className="bg-gradient-to-r from-success/10 to-primary/10">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex-1 min-w-[140px]" onClick={() => setSponsorModalOpen(true)}>
                    <Target className="w-4 h-4 mr-2" />
                    Start Campaign
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]" onClick={() => setSponsorModalOpen(true)}>
                    <Award className="w-4 h-4 mr-2" />
                    Seek Sponsorship
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]" onClick={() => setMobilizeModalOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Rally Volunteers
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {regionalData.challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{t(challenge.titleKey)}</h4>
                          <Badge variant={challenge.type === "created" ? "default" : "secondary"}>
                            {t(`dashboard.badge.${challenge.type}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants.toLocaleString()} {t('dashboard.labels.participants')}
                          </span>
                          <span className="flex items-center gap-1">
                            <TreePine className="w-4 h-4" />
                            {challenge.co2Saved}t CO₂
                          </span>
                        </div>
                      </div>
                      <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                        {t(`dashboard.status.${challenge.status}`)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.labels.progress')}</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            <div className="grid gap-4">
              {regionalData.partnerships.map((partner) => (
                <Card key={partner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-primary/20 rounded-full flex items-center justify-center">
                          {partner.type === "business" ? "🏢" : partner.type === "government" ? "🏛️" : "🌱"}
                        </div>
                        <div>
                          <h4 className="font-semibold">{t(partner.nameKey)}</h4>
                          <p className="text-sm text-muted-foreground">{partner.projects} {t('dashboard.labels.joint_projects')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('dashboard.impact_score')}</p>
                        <p className="text-xl font-bold text-success">{partner.impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌟</div>
                  <p className="text-2xl font-bold">2,340</p>
                  <p className="text-sm text-muted-foreground">Volunteer Hours</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📣</div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-muted-foreground">Community Events</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">💚</div>
                  <p className="text-2xl font-bold">€45K</p>
                  <p className="text-sm text-muted-foreground">Funds Raised</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const getDashboardContent = () => {
    switch (userRole) {
      case "citizen":
        return renderCitizenDashboard();
      case "business":
        return renderBusinessDashboard();
      case "government":
        return renderGovernmentDashboard();
      case "ngo":
        return renderNGODashboard();
      default:
        return renderCitizenDashboard();
    }
  };

  const getRoleExplanation = () => {
    switch (userRole) {
      case "citizen":
        return {
          title: "Személyes Dashboard",
          description: "Saját fenntarthatósági hatásod és fejlődésed nyomon követése",
          badge: "Személyes Nézet",
          badgeColor: "bg-primary",
          explanation: "Ez a te személyes dashboard-od, ahol láthatod saját környezetvédelmi tevékenységeidet és eredményeidet."
        };
      case "business":
        return {
          title: "Regional Impact Hub", 
          description: "Vállalati regionális hatás és közösségi szerepvállalás",
          badge: "Vállalati Nézet",
          badgeColor: "bg-accent",
          explanation: "Adminként láthatod vállalkozásod regionális hatását: szponzorált és létrehozott kihívások, közösségi elérés és partneri kapcsolatok."
        };
      case "government":
        return {
          title: "Regional Impact Hub",
          description: "Önkormányzati regionális hatás és közösségi programok",
          badge: "Önkormányzati Nézet",
          badgeColor: "bg-warning",
          explanation: "Adminként láthatod az önkormányzat regionális hatását: városi programok, állampolgári részvétel és stakeholder kapcsolatok."
        };
      case "ngo":
        return {
          title: "Regional Impact Hub", 
          description: "Civil szervezeti regionális hatás és közösségi projektek",
          badge: "Civil Szervezeti Nézet",
          badgeColor: "bg-success",
          explanation: "Adminként láthatod szervezeted regionális hatását: kampányok, önkéntes mozgósítás és együttműködési hálózat."
        };
      default:
        return {
          title: "Dashboard",
          description: "Fenntarthatóság követés és fejlődés",
          badge: "Alapértelmezett Nézet",
          badgeColor: "bg-muted",
          explanation: ""
        };
    }
  };

  const roleInfo = getRoleExplanation();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            {roleInfo.title}
          </h1>
          <Badge className={`${roleInfo.badgeColor} text-white px-4 py-2`}>
            {roleInfo.badge}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg mb-4">
          {roleInfo.description}
        </p>
        
        {/* Role Explanation Card */}
        <Card className="bg-gradient-to-r from-card to-muted/20 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">🌍 Ökoszisztéma Nézet Koncepció</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  <strong>Miért ezt a nézetet látod?</strong> {roleInfo.explanation}
                </p>
                
                {/* Interactive Role Connections */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "citizen" ? "Te vagy itt" : "Magánszemélyek"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "business" ? "Te vagy itt" : "Vállalkozások"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "government" ? "Te vagy itt" : "Önkormányzat"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {userRole === "ngo" ? "Te vagy itt" : "Civil szervezetek"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                  <div className="text-xs font-medium text-foreground mb-1">💡 Hasznos tudni:</div>
                  <div className="text-xs text-muted-foreground">
                    A különböző szerepeket kiválasztva láthatod, hogyan kapcsolódik össze a fenntarthatósági ökoszisztéma minden eleme.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector - Only for citizens */}
      {userRole === "citizen" && (
        <div className="flex space-x-2 mb-6">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("week")}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("month")}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("year")}
            size="sm"
          >
            Year
          </Button>
        </div>
      )}

      {getDashboardContent()}

      {/* Modals */}
      <SponsorChallengeModal open={sponsorModalOpen} onOpenChange={setSponsorModalOpen} />
      <MobilizeTeamModal open={mobilizeModalOpen} onOpenChange={setMobilizeModalOpen} />
    </div>
  );
};

export default Dashboard;
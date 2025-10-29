import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import PointsSystem from "@/components/gamification/PointsSystem";
import CreativeGamification from "@/components/gamification/CreativeGamification";
import HandprintWidget from "@/components/dashboard/HandprintWidget";
import ProgressVisualization from "@/components/ProgressVisualization";
import CelebrationModal from "@/components/CelebrationModal";
import { ProjectLeaderboard } from "@/components/dashboard/ProjectLeaderboard";
import { ProjectActivities } from "@/components/dashboard/ProjectActivities";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Building2, 
  Landmark, 
  Users,
  BarChart3,
  Trophy,
  Loader2,
  Target,
  TrendingUp,
  Award
} from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const [currentRole, setCurrentRole] = useState<UserRole>("citizen");
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Mock achievement for demonstration
  const mockAchievement = {
    title: "Energy Efficiency Master",
    description: "You've reduced your energy consumption by 30% this month!",
    points: 500,
    impact: "45.2kg",
    level: 13
  };

  // Sync currentRole with user profile
  useEffect(() => {
    if (profile?.user_role && profile.user_role !== currentRole) {
      setCurrentRole(profile.user_role);
    }
  }, [profile?.user_role, currentRole]);

  const roles = [
    { 
      value: "citizen" as UserRole, 
      icon: User, 
      gradient: "from-primary/20 to-success/20",
      borderGradient: "from-primary to-success"
    },
    { 
      value: "business" as UserRole, 
      icon: Building2, 
      gradient: "from-accent/20 to-secondary/20",
      borderGradient: "from-accent to-secondary"
    },
    { 
      value: "government" as UserRole, 
      icon: Landmark, 
      gradient: "from-warning/20 to-destructive/20",
      borderGradient: "from-warning to-destructive"
    },
    { 
      value: "ngo" as UserRole, 
      icon: Users, 
      gradient: "from-success/20 to-primary/20",
      borderGradient: "from-success to-primary"
    }
  ];

  const getCurrentRoleGradient = () => {
    const role = roles.find(role => role.value === currentRole);
    return role?.borderGradient || "from-primary to-success";
  };

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
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 lg:py-20 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
              {t('dashboard.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              {t('dashboard.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span className="text-foreground font-medium text-sm sm:text-base">{t('dashboard.monthly_growth')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span className="text-foreground font-medium text-sm sm:text-base">{t('dashboard.new_badges')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Role Selector */}
        <Card3D className="mb-6 sm:mb-8 bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2">{t('dashboard.type.title')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.type.subtitle')}</p>
              </div>
              <Badge className={`bg-gradient-to-r ${getCurrentRoleGradient()} text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-premium`}>
                {t(`dashboard.roles.${currentRole}`)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {roles.map((role) => {
                const IconComponent = role.icon;
                const isActive = currentRole === role.value;
                return (
                  <div
                    key={role.value}
                    onClick={() => setCurrentRole(role.value)}
                    className={`
                      cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 group
                      ${isActive 
                        ? `bg-gradient-to-br ${role.gradient} border-primary shadow-glow scale-105` 
                        : 'bg-card/30 border-border hover:bg-card/70 hover:border-primary/50 hover:scale-102 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="text-center space-y-4">
                      <div className={`
                        w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300
                        ${isActive 
                          ? `bg-gradient-to-r ${role.borderGradient} shadow-lg` 
                          : 'bg-gradient-to-r from-muted to-muted-foreground/20 group-hover:from-primary group-hover:to-success'
                        }
                      `}>
                        <IconComponent className={`w-8 h-8 ${isActive ? 'text-white' : 'text-foreground group-hover:text-white'}`} />
                      </div>
                      
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${isActive ? 'text-foreground' : 'text-foreground group-hover:text-primary'}`}>
                          {t(`dashboard.roles.${role.value}`)}
                        </h3>
                        <p className={`text-sm ${isActive ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {t(`dashboard.roles.${role.value}_desc`)}
                        </p>
                      </div>
                      
                      {isActive && (
                        <div className="flex items-center justify-center">
                          <Badge className="bg-white/20 text-foreground border-white/30">
                            {t('dashboard.selected')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card3D>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="progress" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-1 sm:p-2">
            <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('dashboard.tabs.analytics')}</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('dashboard.tabs.progress')}</span>
              <span className="sm:hidden">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('dashboard.tabs.rewards')}</span>
              <span className="sm:hidden">Rewards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="animate-fade-in">
            <Dashboard userRole={profile?.user_role || currentRole} />
          </TabsContent>

          <TabsContent value="progress" className="animate-fade-in">
            {currentRole === "citizen" ? (
              <>
                {/* Erdőm Növekedése és Kéznyom - Only for citizens */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <ProgressVisualization />
                  <HandprintWidget />
                </div>
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => setShowCelebration(true)}
                    className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground px-8 py-3 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
                  >
                    {t('dashboard.simulate_achievement')}
                  </Button>
                </div>
              </>
            ) : (
              /* Regional Impact Progress for organizations */
              <div className="space-y-6">
                {/* Monthly Progress */}
                <Card className="bg-gradient-to-r from-primary/5 via-card to-accent/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">{t('dashboard.monthly_regional_progress')}</h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-2xl font-bold text-foreground">+4</div>
                        <div className="text-sm text-muted-foreground">{t('dashboard.new_initiatives')}</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">👥</div>
                        <div className="text-2xl font-bold text-foreground">+842</div>
                        <div className="text-sm text-muted-foreground">{t('dashboard.new_participants')}</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">🌱</div>
                        <div className="text-2xl font-bold text-foreground">+12.3t</div>
                        <div className="text-sm text-muted-foreground">{t('dashboard.co2_saved')}</div>
                      </div>
                    </div>
                    
                    {/* Quarterly Goals */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t('dashboard.quarterly_co2_goal')}</span>
                          <span className="text-sm font-medium">45.6 / 60t</span>
                        </div>
                        <Progress value={76} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t('dashboard.community_reach_goal')}</span>
                          <span className="text-sm font-medium">2,847 / 5,000</span>
                        </div>
                        <Progress value={57} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{t('dashboard.new_partnerships')}</span>
                          <span className="text-sm font-medium">8 / 10</span>
                        </div>
                        <Progress value={80} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Initiatives Performance */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">{t('dashboard.best_performance')}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Green Office Initiative</div>
                              <div className="text-xs text-muted-foreground">342 {t('dashboard.participants')}</div>
                            </div>
                          </div>
                          <Badge className="bg-success text-white">+18.5t</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Bike to Work Campaign</div>
                              <div className="text-xs text-muted-foreground">156 {t('dashboard.participants')}</div>
                            </div>
                          </div>
                          <Badge className="bg-primary text-white">+8.2t</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">{t('dashboard.regional_trend')}</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('dashboard.vs_previous_month')}</span>
                          <div className="flex items-center gap-1 text-success">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">+23%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('dashboard.regional_average')}</span>
                          <div className="flex items-center gap-1 text-primary">
                            <Award className="w-4 h-4" />
                            <span className="font-semibold">{t('dashboard.over_performing')}</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                          <div className="text-xs font-medium text-warning mb-1">{t('dashboard.next_milestone')}</div>
                          <div className="text-sm text-foreground">50 {t('dashboard.co2_tons')} {t('dashboard.co2_saved')} {t('dashboard.until_milestone')} 4.4t</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6 animate-fade-in">
            {currentRole === "citizen" ? (
              <div className="space-y-8">
                {/* Achievement Showcase */}
                <Card className="bg-gradient-to-r from-warning/20 to-success/20 border-warning/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground">🏆 Legutóbbi Eredmény</h3>
                      <Badge className="bg-gradient-to-r from-warning to-success text-white">+500 pont</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-warning to-success rounded-full flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-foreground">Energia Mester</h4>
                        <p className="text-muted-foreground">30%-kal csökkented az energiafogyasztásod!</p>
                        <div className="text-sm text-success font-medium mt-1">🌱 45.2kg CO₂ megtakarítás</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress & Rewards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 border-primary/20">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">🎯 Havi Cél Előrehaladás</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CO₂ csökkentés</span>
                          <span className="font-medium text-foreground">67/100 kg</span>
                        </div>
                        <Progress value={67} className="h-3" />
                        <div className="text-xs text-muted-foreground">33 kg-ig eléred a következő szintet!</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-success/20">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">🌟 Következő Jutalom</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-success to-primary rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Zöld Városvédő Cím</div>
                          <div className="text-sm text-muted-foreground">150 ponttal elérhető</div>
                        </div>
                      </div>
                      <Progress value={75} className="h-2" />
                    </CardContent>
                  </Card>
                </div>

                <CreativeGamification />
                <PointsSystem />
                
                {/* Project-specific components for citizens */}
                {currentProject && (
                  <div className="space-y-6">
                    <ProjectLeaderboard />
                    <ProjectActivities />
                  </div>
                )}
              </div>
            ) : (
              /* Regional Recognition & Impact Stories for organizations */
              <div className="space-y-6">
                {/* Regional Recognition */}
                <Card className="bg-gradient-to-r from-warning/20 to-accent/20 border-warning/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-foreground">🏆 Regionális Elismerés</h3>
                      <Badge className="bg-gradient-to-r from-warning to-accent text-white">
                        {currentRole === "business" ? "Top 3 Vállalat" : currentRole === "government" ? "#1 Önkormányzat" : "Top 5 NGO"}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">🌟</div>
                        <div className="text-xl font-bold text-foreground">85/100</div>
                        <div className="text-sm text-muted-foreground">Impact Score</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">📈</div>
                        <div className="text-xl font-bold text-success">+23%</div>
                        <div className="text-sm text-muted-foreground">Ez hónap növekedés</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-xl">
                        <div className="text-3xl mb-2">🎖️</div>
                        <div className="text-xl font-bold text-warning">Kiváló</div>
                        <div className="text-sm text-muted-foreground">Minősítés</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Highlights & Media */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">📣 Média Megjelenés</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">📰</span>
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">Helyi Média Lefedettség</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                3 újságcikk és 2 TV interjú a fenntarthatósági kezdeményezésekről
                              </div>
                              <Badge variant="outline" className="text-xs">1.2M elérés</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-success/10 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">💚</span>
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">{t('dashboard.social_media')}</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                Virális kampány: #ZöldMagyarország
                              </div>
                              <Badge variant="outline" className="text-xs">34K engagement</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">🏅 Díjak & Címek</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-warning to-accent rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Regionális Fenntarthatósági Díj</div>
                            <div className="text-xs text-muted-foreground">2025 Tavasz</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-success to-primary rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{t('dashboard.community_impact_award')}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard.year_end')} 2024</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{t('dashboard.climate_partnership')}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard.certified_member')}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Success Stories */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">💡 Sikertörténetek</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border border-border rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">🌞</div>
                          <div>
                            <h5 className="font-medium mb-1">Napelemes Átállás</h5>
                            <p className="text-xs text-muted-foreground">
                              342 résztvevő, 18.5t CO₂ megtakarítás
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success/20 text-success border-0">Lezárva</Badge>
                      </div>
                      <div className="p-4 border border-border rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">🚲</div>
                          <div>
                            <h5 className="font-medium mb-1">Kerékpáros Közlekedés Hét</h5>
                            <p className="text-xs text-muted-foreground">
                              156 résztvevő, 8.2t CO₂ megtakarítás
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-0">Aktív</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Milestones */}
                <Card className="bg-gradient-to-r from-accent/10 to-primary/10">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">🎯 Következő Mérföldkövek</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">50 {t('dashboard.co2_tons')} {t('dashboard.co2_saved')}</div>
                          <Progress value={91} className="h-2" />
                        </div>
                        <span className="ml-4 text-sm font-semibold text-primary">91%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">5,000 {t('dashboard.community_reach')}</div>
                          <Progress value={57} className="h-2" />
                        </div>
                        <span className="ml-4 text-sm font-semibold text-primary">57%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">10 stratégiai partnerség</div>
                          <Progress value={80} className="h-2" />
                        </div>
                        <span className="ml-4 text-sm font-semibold text-primary">80%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Project-specific components for organizations */}
                {currentProject && (
                  <div className="space-y-6">
                    <ProjectLeaderboard />
                    <ProjectActivities />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Celebration Modal */}
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          achievement={mockAchievement}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
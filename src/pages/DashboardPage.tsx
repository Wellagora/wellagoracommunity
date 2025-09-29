import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import PointsSystem from "@/components/gamification/PointsSystem";
import CreativeGamification from "@/components/gamification/CreativeGamification";
import HandprintWidget from "@/components/dashboard/HandprintWidget";
import ProgressVisualization from "@/components/ProgressVisualization";
import CelebrationModal from "@/components/CelebrationModal";
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
  const [currentRole, setCurrentRole] = useState<UserRole>("citizen");
  const [showCelebration, setShowCelebration] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
      <section className="relative py-20 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('dashboard.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('dashboard.subtitle')}
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-foreground font-medium">{t('dashboard.monthly_growth')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-warning" />
                <span className="text-foreground font-medium">{t('dashboard.new_badges')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Role Selector */}
        <Card3D className="mb-8 bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{t('dashboard.type.title')}</h2>
                <p className="text-muted-foreground">{t('dashboard.type.subtitle')}</p>
              </div>
              <Badge className={`bg-gradient-to-r ${getCurrentRoleGradient()} text-white px-4 py-2 text-sm font-medium shadow-premium`}>
                {t(`dashboard.roles.${currentRole}`)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                            ✓ Kiválasztva
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
        <Tabs defaultValue="analytics" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2">
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
              <span>{t('dashboard.tabs.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <Target className="w-4 h-4" />
              <span>{t('dashboard.tabs.progress')}</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <Trophy className="w-4 h-4" />
              <span>{t('dashboard.tabs.rewards')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="animate-fade-in">
            <Dashboard userRole={profile?.user_role || currentRole} />
          </TabsContent>

          <TabsContent value="progress" className="animate-fade-in">
            {/* Erdőm Növekedése és Kéznyom */}
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
              </div>
            ) : (
              <Card className="text-center py-16 bg-card/50 backdrop-blur-sm">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.rewards_coming_soon')}</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {t(`dashboard.rewards_${currentRole}_development`)}
                </p>
              </Card>
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
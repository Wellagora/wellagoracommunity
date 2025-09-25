import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import PointsSystem from "@/components/gamification/PointsSystem";
import CreativeGamification from "@/components/gamification/CreativeGamification";
import ProgressVisualization from "@/components/ProgressVisualization";
import CelebrationModal from "@/components/CelebrationModal";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { user, loading } = useAuth();
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
                  <FeatureCard3D
                    key={role.value}
                    icon={<IconComponent className="w-8 h-8" />}
                    title={t(`dashboard.roles.${role.value}`)}
                    description={t(`dashboard.roles.${role.value}_desc`)}
                    onClick={() => setCurrentRole(role.value)}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${role.gradient} border-2 border-gradient-${role.borderGradient} shadow-glow` 
                        : 'hover:bg-card/50 hover:scale-105'
                    }`}
                  />
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
            <Dashboard userRole={currentRole} />
          </TabsContent>

          <TabsContent value="progress" className="animate-fade-in">
            <ProgressVisualization />
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
                <CreativeGamification />
                <PointsSystem />
              </div>
            ) : (
              <Card3D className="text-center py-16 bg-card/50 backdrop-blur-sm">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.rewards_coming_soon')}</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {t(`dashboard.rewards_${currentRole}_development`)}
                </p>
              </Card3D>
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
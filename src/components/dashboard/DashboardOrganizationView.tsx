import { memo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";
import PointsSystem from "@/components/gamification/PointsSystem";
import CreativeGamification from "@/components/gamification/CreativeGamification";
import HandprintWidget from "./HandprintWidget";
import ForestGrowth from "./ForestGrowth";
import { ProjectLeaderboard } from "./ProjectLeaderboard";
import { ProjectActivities } from "./ProjectActivities";
import { DashboardRoleSelector } from "./DashboardRoleSelector";
import { DashboardStats } from "./DashboardStats";
import { 
  BarChart3, 
  Target, 
  Trophy, 
  TrendingUp, 
  Award 
} from "lucide-react";

type UserRole = "citizen" | "business" | "government" | "ngo";

interface DashboardOrganizationViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onCelebrationTrigger: () => void;
}

export const DashboardOrganizationView = memo(({ 
  currentRole, 
  onRoleChange,
  onCelebrationTrigger
}: DashboardOrganizationViewProps) => {
  const { t } = useLanguage();
  const { currentProject } = useProject();

  const handleRoleChange = useCallback((role: UserRole) => {
    onRoleChange(role);
  }, [onRoleChange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Role Selector */}
      <DashboardRoleSelector 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange}
      />

      {/* Dashboard Tabs */}
      <Tabs defaultValue="progress" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-1 sm:p-2">
          <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t('dashboard.tabs.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t('dashboard.tabs.progress')}</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-lg sm:rounded-xl transition-all duration-300">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t('dashboard.tabs.rewards')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="animate-fade-in">
          <Dashboard userRole={currentRole} />
        </TabsContent>

        <TabsContent value="progress" className="animate-fade-in">
          {currentRole === "citizen" ? (
            <>
              {/* Forest Growth & Handprint - Only for citizens */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <ForestGrowth />
                <HandprintWidget />
              </div>
              <div className="mt-8 text-center">
                <Button 
                  onClick={onCelebrationTrigger}
                  className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground px-8 py-3 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  {t('dashboard.simulate_achievement')}
                </Button>
              </div>
            </>
          ) : (
            <DashboardStats variant="organization" />
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
    </div>
  );
});

DashboardOrganizationView.displayName = "DashboardOrganizationView";

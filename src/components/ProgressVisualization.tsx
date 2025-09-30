import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TreePine, 
  Zap, 
  Droplets, 
  Recycle,
  Users,
  TrendingUp,
  Heart,
  Sparkles,
  Target,
  ArrowUp
} from "lucide-react";
import progressImage from "@/assets/progress-celebration.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const ProgressVisualization = () => {
  const { t } = useLanguage();
  
  const personalImpact = {
    co2Saved: 156.8,
    treesEquivalent: 23,
    waterSaved: 1245,
    wasteReduced: 89,
    currentLevel: 12,
    nextLevelProgress: 68,
    pointsToNextLevel: 320
  };

  const communityImpact = {
    totalMembers: 2847,
    co2SavedCommunity: 45600,
    activeThisWeek: 892,
    challengesCompleted: 12400
  };

  const achievements = [
    { id: 1, name: "First Steps", earned: true, icon: "🌱" },
    { id: 2, name: "Energy Saver", earned: true, icon: "⚡" },
    { id: 3, name: "Water Guardian", earned: true, icon: "💧" },
    { id: 4, name: "Waste Warrior", earned: false, icon: "♻️" },
    { id: 5, name: "Community Leader", earned: false, icon: "👑" },
  ];

  const milestones = [
    { target: "Plant 50 trees", current: 23, total: 50, color: "text-success" },
    { target: "Save 200kg CO₂", current: 156.8, total: 200, color: "text-primary" },
    { target: "Engage 10 friends", current: 7, total: 10, color: "text-accent" }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Personal Impact Hero */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-success/5 border-2 border-primary/20">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={progressImage} 
            alt="Progress visualization" 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left: Personal Stats */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-primary rounded-xl sm:rounded-2xl">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold leading-tight">{t('dashboard.impact_journey')}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.making_world_better')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div className="bg-glass backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover-lift">
                  <TreePine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-success mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-success">{personalImpact.treesEquivalent}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.trees_worth')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover-lift">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-warning mb-1 sm:mb-2" />
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-warning break-all leading-tight">{personalImpact.co2Saved}<span className="text-sm">kg</span></div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.co2_saved')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover-lift">
                  <Droplets className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent">{personalImpact.waterSaved}<span className="text-sm">L</span></div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.water_saved')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover-lift">
                  <Recycle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{personalImpact.wasteReduced}<span className="text-sm">kg</span></div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.waste_reduced')}</div>
                </div>
              </div>
            </div>

            {/* Right: Level Progress */}
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-primary rounded-full mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{personalImpact.currentLevel}</span>
                </div>
                <h4 className="text-base sm:text-lg lg:text-xl font-semibold">{t('dashboard.sustainability_champion')}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.level')} {personalImpact.currentLevel}</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="line-clamp-1">{t('dashboard.progress_to_level').replace('{level}', String(personalImpact.currentLevel + 1))}</span>
                  <span className="font-semibold whitespace-nowrap">{personalImpact.nextLevelProgress}%</span>
                </div>
                <Progress value={personalImpact.nextLevelProgress} className="h-3 sm:h-4" />
                <div className="text-center">
                  <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] sm:text-xs px-2 py-1">
                    <Target className="w-3 h-3 mr-1" />
                    {personalImpact.pointsToNextLevel} {t('dashboard.points_to_next_level')}
                  </Badge>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-spring group text-xs sm:text-sm lg:text-base py-2 sm:py-3">
                {t('dashboard.view_full_progress')}
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Achievements */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base lg:text-lg">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span>{t('dashboard.your_achievements')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 p-4 sm:p-6">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-spring ${
                  achievement.earned 
                    ? 'bg-success/10 border-success/20 hover:bg-success/15' 
                    : 'bg-muted/30 border-muted/50 opacity-60'
                }`}
              >
                <div className={`text-lg sm:text-xl lg:text-2xl ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs sm:text-sm lg:text-base font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'} truncate`}>
                    {achievement.name}
                  </div>
                  {achievement.earned && (
                    <div className="text-[10px] sm:text-xs text-success">{t('dashboard.unlocked')}</div>
                  )}
                </div>
                {achievement.earned && (
                  <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
                    {t('dashboard.earned')}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base lg:text-lg">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span>{t('dashboard.community_impact')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-2">
                {communityImpact.co2SavedCommunity.toLocaleString()}<span className="text-base sm:text-lg">kg</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.co2_saved_together')}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="text-center p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                <div className="text-base sm:text-lg lg:text-xl font-bold text-primary">{communityImpact.totalMembers.toLocaleString()}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.champions')}</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-success/10 rounded-lg sm:rounded-xl">
                <div className="text-base sm:text-lg lg:text-xl font-bold text-success">{communityImpact.activeThisWeek}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.active_this_week')}</div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-accent/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-accent" />
                <span className="text-xs sm:text-sm lg:text-base font-medium">{t('dashboard.top_percentage')}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('dashboard.impact_above_average')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-center text-sm sm:text-base lg:text-lg">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('dashboard.sustainability_milestones')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm lg:text-base font-medium truncate">{milestone.target}</span>
                <span className={`text-xs sm:text-sm font-bold ${milestone.color} whitespace-nowrap`}>
                  {milestone.current}/{milestone.total}
                </span>
              </div>
              <Progress 
                value={(milestone.current / milestone.total) * 100} 
                className="h-2 sm:h-3" 
              />
              <div className="text-right">
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {Math.round(((milestone.current / milestone.total) * 100))}% {t('dashboard.complete')}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressVisualization;
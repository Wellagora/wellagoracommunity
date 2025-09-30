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
    <div className="space-y-8">
      {/* Personal Impact Hero */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-success/5 border-2 border-primary/20">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={progressImage} 
            alt="Progress visualization" 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Personal Stats */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-primary rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold">{t('dashboard.impact_journey')}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.making_world_better')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-success mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-success">{personalImpact.treesEquivalent}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.trees_worth')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-warning mb-2" />
                  <div className="text-lg sm:text-2xl font-bold text-warning break-words">{personalImpact.co2Saved}kg</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.co2_saved')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-accent mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-accent">{personalImpact.waterSaved}L</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.water_saved')}</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Recycle className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-primary">{personalImpact.wasteReduced}kg</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.waste_reduced')}</div>
                </div>
              </div>
            </div>

            {/* Right: Level Progress */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-primary rounded-full mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-white">{personalImpact.currentLevel}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-semibold">{t('dashboard.sustainability_champion')}</h4>
                <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.level')} {personalImpact.currentLevel}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>{t('dashboard.progress_to_level').replace('{level}', String(personalImpact.currentLevel + 1))}</span>
                  <span>{personalImpact.nextLevelProgress}%</span>
                </div>
                <Progress value={personalImpact.nextLevelProgress} className="h-4" />
                <div className="text-center">
                  <Badge className="bg-warning/10 text-warning border-warning/20 text-xs sm:text-sm">
                    <Target className="w-3 h-3 mr-1" />
                    {personalImpact.pointsToNextLevel} {t('dashboard.points_to_next_level')}
                  </Badge>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-spring group text-sm sm:text-base">
                {t('dashboard.view_full_progress')}
                <ArrowUp className="w-4 h-4 ml-2 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-base sm:text-lg">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span>{t('dashboard.your_achievements')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-spring ${
                  achievement.earned 
                    ? 'bg-success/10 border-success/20 hover:bg-success/15' 
                    : 'bg-muted/30 border-muted/50 opacity-60'
                }`}
              >
                <div className={`text-2xl ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`text-sm sm:text-base font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </div>
                  {achievement.earned && (
                    <div className="text-xs sm:text-sm text-success">{t('dashboard.unlocked')}</div>
                  )}
                </div>
                {achievement.earned && (
                  <Badge className="bg-success text-success-foreground text-xs sm:text-sm">
                    {t('dashboard.earned')}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-base sm:text-lg">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span>{t('dashboard.community_impact')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {communityImpact.co2SavedCommunity.toLocaleString()}kg
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">{t('dashboard.co2_saved_together')}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <div className="text-lg sm:text-xl font-bold text-primary">{communityImpact.totalMembers.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.champions')}</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-xl">
                <div className="text-lg sm:text-xl font-bold text-success">{communityImpact.activeThisWeek}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.active_this_week')}</div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-sm sm:text-base font-medium">{t('dashboard.top_percentage')}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('dashboard.impact_above_average')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-base sm:text-lg">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('dashboard.sustainability_milestones')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium">{milestone.target}</span>
                <span className={`text-xs sm:text-sm font-bold ${milestone.color}`}>
                  {milestone.current}/{milestone.total}
                </span>
              </div>
              <Progress 
                value={(milestone.current / milestone.total) * 100} 
                className="h-3" 
              />
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
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
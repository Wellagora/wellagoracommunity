import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy, Target, Leaf, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LevelInfo {
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

const LEVELS: LevelInfo[] = [
  { name: "seed", icon: "🌱", minPoints: 0, maxPoints: 100, color: "text-amber-600" },
  { name: "seedling", icon: "🌿", minPoints: 101, maxPoints: 500, color: "text-lime-600" },
  { name: "growing_tree", icon: "🌳", minPoints: 501, maxPoints: 1000, color: "text-green-600" },
  { name: "strong_tree", icon: "🌲", minPoints: 1001, maxPoints: 2500, color: "text-emerald-600" },
  { name: "forest", icon: "🏞️", minPoints: 2501, maxPoints: Infinity, color: "text-teal-600" },
];

const getLevelForPoints = (points: number): { level: LevelInfo; levelIndex: number } => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return { level: LEVELS[i], levelIndex: i + 1 };
    }
  }
  return { level: LEVELS[0], levelIndex: 1 };
};

const getProgressToNextLevel = (points: number, currentLevel: LevelInfo): number => {
  if (currentLevel.maxPoints === Infinity) return 100;
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
  const pointsInLevel = points - currentLevel.minPoints;
  return Math.min(100, Math.round((pointsInLevel / levelRange) * 100));
};

const getPointsToNextLevel = (points: number, currentLevel: LevelInfo): number => {
  if (currentLevel.maxPoints === Infinity) return 0;
  return currentLevel.maxPoints - points + 1;
};

export const PersonalImpactGarden = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['personalGardenStats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get challenge completions
      const { data: completions } = await supabase
        .from('challenge_completions')
        .select('points_earned')
        .eq('user_id', user.id)
        .eq('validation_status', 'approved');

      // Get sustainability activities
      const { data: activities } = await supabase
        .from('sustainability_activities')
        .select('points_earned, impact_amount')
        .eq('user_id', user.id);

      // Get carbon handprint entries
      const { data: handprintEntries } = await supabase
        .from('carbon_handprint_entries')
        .select('impact_kg_co2')
        .eq('user_id', user.id);

      const challengesCompleted = completions?.length || 0;
      const completionPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;
      const activityPoints = activities?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
      const totalPoints = completionPoints + activityPoints;
      
      // CO2 from handprint entries
      const co2FromHandprint = handprintEntries?.reduce((sum, e) => sum + Number(e.impact_kg_co2 || 0), 0) || 0;
      // CO2 from activities
      const co2FromActivities = activities?.reduce((sum, a) => sum + (a.impact_amount || 0), 0) || 0;
      const totalCo2 = co2FromHandprint + co2FromActivities;

      return {
        totalPoints,
        challengesCompleted,
        totalCo2,
        activitiesCount: activities?.length || 0,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const points = stats?.totalPoints || 0;
  const { level, levelIndex } = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points, level);
  const pointsToNext = getPointsToNextLevel(points, level);

  return (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-success/5 via-background to-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('gamification.my_garden')}
          </CardTitle>
          <Badge variant="outline" className={`${level.color} border-current`}>
            {t('gamification.level')} {levelIndex}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Visualization */}
        <motion.div 
          className="text-center py-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="text-6xl mb-2">{level.icon}</div>
          <h3 className={`text-xl font-bold ${level.color}`}>
            {t(`gamification.${level.name}`)}
          </h3>
        </motion.div>

        {/* Progress to Next Level */}
        {level.maxPoints !== Infinity && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('gamification.next_level')}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {pointsToNext} {t('gamification.points_to_next')}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">{points}</div>
            <div className="text-xs text-muted-foreground">{t('gamification.points')}</div>
          </div>
          
          <div className="text-center p-2 bg-success/5 rounded-lg">
            <Target className="w-4 h-4 text-success mx-auto mb-1" />
            <div className="text-lg font-bold text-success">{stats?.challengesCompleted || 0}</div>
            <div className="text-xs text-muted-foreground">{t('gamification.challenges')}</div>
          </div>
          
          <div className="text-center p-2 bg-accent/5 rounded-lg">
            <Leaf className="w-4 h-4 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-accent">{(stats?.totalCo2 || 0).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
        </div>

        {/* Level Progress Dots */}
        <div className="flex justify-center gap-2 pt-2">
          {LEVELS.map((l, i) => (
            <div
              key={l.name}
              className={`w-3 h-3 rounded-full transition-all ${
                i < levelIndex 
                  ? 'bg-primary scale-100' 
                  : i === levelIndex - 1 
                    ? 'bg-primary/50 scale-110 ring-2 ring-primary/20' 
                    : 'bg-muted'
              }`}
              title={t(`gamification.${l.name}`)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
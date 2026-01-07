import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const CommunityImpactProgress = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: impactData, isLoading } = useQuery({
    queryKey: ['communityImpactProgress', user?.id],
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

      // Get carbon handprint
      const { data: handprint } = await supabase
        .from('carbon_handprint_entries')
        .select('impact_kg_co2')
        .eq('user_id', user.id);

      const completionPoints = completions?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0;
      const activityPoints = activities?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
      const totalPoints = completionPoints + activityPoints;
      
      const co2FromHandprint = handprint?.reduce((sum, e) => sum + Number(e.impact_kg_co2 || 0), 0) || 0;
      const co2FromActivities = activities?.reduce((sum, a) => sum + (a.impact_amount || 0), 0) || 0;
      
      // Calculate percentage (target: 1000 points = 100%)
      const targetPoints = 1000;
      const percentage = Math.min(100, Math.round((totalPoints / targetPoints) * 100));

      return {
        totalPoints,
        totalCo2: co2FromHandprint + co2FromActivities,
        completedChallenges: completions?.length || 0,
        percentage,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="card-3d-premium h-full">
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const percentage = impactData?.percentage || 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="card-3d-premium h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-success" />
          {t('dashboard.community_impact_title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {/* Circular Progress */}
        <motion.div 
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            {/* Progress circle with soft green gradient */}
            <circle
              cx="70"
              cy="70"
              r="45"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 8px hsl(var(--success) / 0.4))'
              }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-6 h-6 text-success mb-1" />
            </motion.div>
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          </div>
        </motion.div>

        {/* Stats below */}
        <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
          <div className="p-2 rounded-lg bg-success/5">
            <div className="text-lg font-bold text-success">{impactData?.totalPoints || 0}</div>
            <div className="text-xs text-muted-foreground">{t('gamification.points')}</div>
          </div>
          <div className="p-2 rounded-lg bg-primary/5">
            <div className="text-lg font-bold text-primary">{impactData?.completedChallenges || 0}</div>
            <div className="text-xs text-muted-foreground">{t('gamification.challenges')}</div>
          </div>
          <div className="p-2 rounded-lg bg-accent/5">
            <div className="text-lg font-bold text-accent">{(impactData?.totalCo2 || 0).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

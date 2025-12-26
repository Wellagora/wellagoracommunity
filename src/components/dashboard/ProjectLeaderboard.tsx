import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  total_points: number;
  challenges_completed: number;
  co2_saved: number;
}

export function ProjectLeaderboard() {
  const { currentProject } = useProject();
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProject) {
      loadLeaderboard();
    }
  }, [currentProject]);

  const loadLeaderboard = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);

      // Get project members
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("user_id")
        .eq("project_id", currentProject.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const memberIds = memberData.map((m) => m.user_id);

      // Get challenge completions for project members
      const { data: completionsData, error: completionsError } = await supabase
        .from("challenge_completions")
        .select("user_id, points_earned, impact_data")
        .in("user_id", memberIds)
        .eq("validation_status", "approved");

      if (completionsError) throw completionsError;

      // Get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", memberIds);

      if (profilesError) throw profilesError;

      // Calculate stats per user
      const userStats = new Map<string, { points: number; completed: number; co2: number }>();

      completionsData?.forEach((completion) => {
        const current = userStats.get(completion.user_id) || {
          points: 0,
          completed: 0,
          co2: 0,
        };

        current.points += completion.points_earned || 0;
        current.completed += 1;
        current.co2 += parseFloat(
          (completion.impact_data as any)?.co2Saved?.replace("kg", "") || "0"
        );

        userStats.set(completion.user_id, current);
      });

      // Build leaderboard
      const leaderboardData: LeaderboardEntry[] = profilesData
        ?.map((profile) => {
          const stats = userStats.get(profile.id) || { points: 0, completed: 0, co2: 0 };
          return {
            user_id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            total_points: stats.points,
            challenges_completed: stats.completed,
            co2_saved: stats.co2,
          };
        })
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10) || [];

      setLeaderboard(leaderboardData);
    } catch (error) {
      // Silent fail - leaderboard load failed
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-warning" />;
      case 1:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  if (!currentProject) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t('leaderboard.title')}
          </CardTitle>
          <CardDescription>{t('leaderboard.loading')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {currentProject.name} - {t('leaderboard.title')}
        </CardTitle>
        <CardDescription>
          {t('leaderboard.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('leaderboard.no_completions')}
          </p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  index < 3
                    ? "bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20"
                    : "bg-card/50 border border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>
                      {entry.first_name[0]}
                      {entry.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {entry.first_name} {entry.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.challenges_completed} {t('leaderboard.challenges_completed')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="mb-1">
                    {entry.total_points} {t('leaderboard.points')}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.co2_saved.toFixed(1)} kg CO₂
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Zap, Droplets, Recycle, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Activity {
  id: string;
  activity_type: string;
  impact_amount: number;
  date: string;
  points_earned: number;
  user_id: string;
  first_name: string;
  last_name: string;
}

export function ProjectActivities() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProject) {
      loadActivities();
    }
  }, [currentProject]);

  const loadActivities = async () => {
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
        setActivities([]);
        setLoading(false);
        return;
      }

      const memberIds = memberData.map((m) => m.user_id);

      // Get activities for project members
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("sustainability_activities")
        .select("id, activity_type, impact_amount, date, points_earned, user_id")
        .in("user_id", memberIds)
        .eq("validation_method", "manual")
        .order("date", { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      // Get user profiles
      const userIds = [...new Set(activitiesData?.map((a) => a.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

      const enrichedActivities =
        activitiesData?.map((activity) => {
          const profile = profilesMap.get(activity.user_id);
          return {
            ...activity,
            first_name: profile?.first_name || "Unknown",
            last_name: profile?.last_name || "User",
          };
        }) || [];

      setActivities(enrichedActivities);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "energy":
        return <Zap className="w-4 h-4 text-warning" />;
      case "water":
        return <Droplets className="w-4 h-4 text-info" />;
      case "waste":
        return <Recycle className="w-4 h-4 text-success" />;
      default:
        return <Leaf className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "energy":
        return "bg-warning/10 border-warning/20";
      case "water":
        return "bg-info/10 border-info/20";
      case "waste":
        return "bg-success/10 border-success/20";
      default:
        return "bg-primary/10 border-primary/20";
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
            <Leaf className="h-5 w-5" />
            {t('activities.title')}
          </CardTitle>
          <CardDescription>{t('activities.loading')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          {currentProject.name} - {t('activities.recent')}
        </CardTitle>
        <CardDescription>{t('activities.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('activities.no_activities')}
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${getActivityColor(
                  activity.activity_type
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-card">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {activity.first_name} {activity.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {activity.activity_type}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(activity.date), "yyyy. MM. dd.")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-success mb-1">
                    {activity.impact_amount} kg CO₂
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.points_earned} {t('leaderboard.points')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

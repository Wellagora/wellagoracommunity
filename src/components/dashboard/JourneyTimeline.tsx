import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy, Target, Sparkles, Star, Leaf, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  type: 'challenge' | 'activity' | 'badge' | 'milestone';
  title: string;
  date: Date;
  points?: number;
  icon: React.ReactNode;
  color: string;
}

export const JourneyTimeline = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const getLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ['journeyTimeline', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get challenge completions
      const { data: completions } = await supabase
        .from('challenge_completions')
        .select('id, challenge_id, completion_date, points_earned')
        .eq('user_id', user.id)
        .eq('validation_status', 'approved')
        .order('completion_date', { ascending: false })
        .limit(5);

      // Get sustainability activities
      const { data: activities } = await supabase
        .from('sustainability_activities')
        .select('id, activity_type, created_at, points_earned')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const timelineEvents: TimelineEvent[] = [];

      // Add completions
      completions?.forEach((c) => {
        timelineEvents.push({
          id: c.id,
          type: 'challenge',
          title: t('dashboard.completed_program'),
          date: new Date(c.completion_date),
          points: c.points_earned,
          icon: <Trophy className="w-4 h-4" />,
          color: 'text-warning bg-warning/10'
        });
      });

      // Add activities
      activities?.forEach((a) => {
        timelineEvents.push({
          id: a.id,
          type: 'activity',
          title: a.activity_type || t('dashboard.earned_points'),
          date: new Date(a.created_at),
          points: a.points_earned,
          icon: <Leaf className="w-4 h-4" />,
          color: 'text-success bg-success/10'
        });
      });

      // Sort by date (most recent first)
      return timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
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

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          {t('dashboard.journey_title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.journey_subtitle')}
        </p>
      </CardHeader>
      <CardContent className="py-2">
        {events && events.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-success via-primary to-accent" />
            
            {/* Timeline events */}
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="relative flex items-start gap-4 pl-2"
                >
                  {/* Icon circle */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${event.color} ring-4 ring-background`}>
                    {event.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(event.date, 'MMM d', { locale: getLocale() })}
                      </span>
                      {event.points && event.points > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <Star className="w-3 h-3" />
                          +{event.points}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.no_activity')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.no_activity_desc')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

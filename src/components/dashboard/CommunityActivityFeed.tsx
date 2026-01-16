import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  UserPlus, 
  Calendar, 
  BookOpen, 
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { hu, de, enUS } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'join' | 'complete' | 'event' | 'new_program' | 'achievement';
  user_name: string;
  user_avatar?: string | null;
  action_text: string;
  target_name: string;
  created_at: string;
}

const CommunityActivityFeed = () => {
  const { language } = useLanguage();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch recent voucher claims (user joined program)
        const { data: vouchers } = await supabase
          .from('vouchers')
          .select(`
            id,
            created_at,
            user_id,
            profiles:user_id(first_name, last_name, avatar_url),
            expert_contents:content_id(title)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch recent events created
        const { data: events } = await supabase
          .from('events')
          .select(`
            id,
            title,
            created_at,
            profiles:created_by(first_name, last_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent challenge completions
        const { data: completions } = await supabase
          .from('challenge_completions')
          .select(`
            id,
            created_at,
            user_id,
            challenge_id
          `)
          .eq('validation_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5);

        const activityItems: ActivityItem[] = [];

        // Process vouchers
        vouchers?.forEach((v: any) => {
          if (v.profiles && v.expert_contents) {
            activityItems.push({
              id: `voucher-${v.id}`,
              type: 'join',
              user_name: `${v.profiles.first_name} ${v.profiles.last_name?.[0] || ''}.`,
              user_avatar: v.profiles.avatar_url,
              action_text: language === 'hu' ? 'csatlakozott:' : 'joined:',
              target_name: v.expert_contents.title,
              created_at: v.created_at
            });
          }
        });

        // Process events
        events?.forEach((e: any) => {
          if (e.profiles) {
            activityItems.push({
              id: `event-${e.id}`,
              type: 'event',
              user_name: `${e.profiles.first_name} ${e.profiles.last_name?.[0] || ''}.`,
              user_avatar: e.profiles.avatar_url,
              action_text: language === 'hu' ? 'új eseményt hirdetett:' : 'posted a new event:',
              target_name: e.title,
              created_at: e.created_at
            });
          }
        });

        // Process completions
        completions?.forEach((c: any) => {
          activityItems.push({
            id: `completion-${c.id}`,
            type: 'complete',
            user_name: language === 'hu' ? 'Egy tag' : 'A member',
            user_avatar: null,
            action_text: language === 'hu' ? 'sikeresen teljesített egy' : 'completed a',
            target_name: language === 'hu' ? 'kihívást' : 'challenge',
            created_at: c.created_at
          });
        });

        // Sort by date and take top 10
        activityItems.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(activityItems.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('community-activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vouchers' },
        () => fetchActivities()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language]);

  // Auto-rotate through activities
  useEffect(() => {
    if (activities.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'join': return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'complete': return <Trophy className="w-4 h-4 text-amber-600" />;
      case 'event': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'new_program': return <BookOpen className="w-4 h-4 text-violet-600" />;
      case 'achievement': return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'join': return 'bg-emerald-50 border-emerald-200';
      case 'complete': return 'bg-amber-50 border-amber-200';
      case 'event': return 'bg-blue-50 border-blue-200';
      case 'new_program': return 'bg-violet-50 border-violet-200';
      case 'achievement': return 'bg-yellow-50 border-yellow-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm h-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse flex items-center gap-2">
            <Activity className="w-5 h-5 text-black/30" />
            <span className="text-black/40 text-sm">
              {language === 'hu' ? 'Betöltés...' : 'Loading...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
        <CardTitle className="flex items-center justify-between text-base text-black">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            {language === 'hu' ? 'Közösségi Aktivitás' : 'Community Activity'}
          </div>
          <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'Élő' : 'Live'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2">
        {activities.length === 0 ? (
          <p className="text-center text-black/50 text-sm py-4">
            {language === 'hu' ? 'Még nincs aktivitás' : 'No activity yet'}
          </p>
        ) : (
          <>
            {/* Featured Activity (animated) */}
            <div className="relative h-20 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 p-3 rounded-xl border ${getActivityColor(activities[currentIndex]?.type)}`}
                >
                  {activities[currentIndex] && (
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={activities[currentIndex].user_avatar || undefined} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                          {activities[currentIndex].user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black">
                          <span className="font-semibold">{activities[currentIndex].user_name}</span>
                          {' '}
                          <span className="text-black/60">{activities[currentIndex].action_text}</span>
                        </p>
                        <p className="text-sm font-medium text-black truncate">
                          {activities[currentIndex].target_name}
                        </p>
                        <p className="text-xs text-black/40 mt-0.5">
                          {formatDistanceToNow(new Date(activities[currentIndex].created_at), { 
                            addSuffix: true, 
                            locale: getDateLocale() 
                          })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getActivityIcon(activities[currentIndex].type)}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Activity dots indicator */}
            <div className="flex items-center justify-center gap-1 pt-1">
              {activities.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentIndex % 5 
                      ? 'bg-emerald-500 w-3' 
                      : 'bg-black/20 hover:bg-black/40'
                  }`}
                />
              ))}
            </div>

            {/* Recent activity list */}
            <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto">
              {activities.slice(0, 4).map((activity, idx) => (
                <div 
                  key={activity.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    idx === currentIndex % activities.length ? 'bg-black/[0.03]' : ''
                  }`}
                >
                  {getActivityIcon(activity.type)}
                  <span className="truncate text-black/70">
                    <span className="font-medium text-black">{activity.user_name}</span>
                    {' '}{activity.action_text}{' '}
                    <span className="text-black/60">{activity.target_name}</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityActivityFeed;

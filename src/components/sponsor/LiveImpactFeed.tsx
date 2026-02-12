import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Sparkles, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  activity_type: 'claim' | 'redeem' | 'complete';
  member_name: string;
  content_title: string;
  credit_amount: number;
  created_at: string;
}

const LiveImpactFeed = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadActivities = async () => {
      // Fetch real voucher claims with member info
      const { data: vouchers } = await supabase
        .from('vouchers')
        .select(`
          id,
          created_at,
          status,
          redeemed_at,
          profiles:user_id (first_name, last_name),
          expert_contents:content_id (
            title,
            sponsor_id,
            fixed_sponsor_amount
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (vouchers) {
        const mappedActivities: ActivityItem[] = vouchers
          .filter(v => v.expert_contents?.sponsor_id === user.id)
          .map(v => {
            const profile = v.profiles as any;
            const content = v.expert_contents as any;
            return {
              id: v.id,
              activity_type: v.status === 'used' ? 'redeem' : 'claim',
              member_name: profile?.first_name 
                ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.`
                : 'Közösségi tag',
              content_title: content?.title || 'Program',
              credit_amount: content?.fixed_sponsor_amount || 2500,
              created_at: v.status === 'used' ? v.redeemed_at : v.created_at,
            };
          });

        setActivities(mappedActivities);
      }
      setIsLoading(false);
    };

    loadActivities();

    // Real-time subscription for new claims
    const channel = supabase
      .channel('sponsor-activity')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'vouchers' },
        (payload) => {
          // Refresh activities when new voucher is created
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'redeem': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'complete': return <Sparkles className="w-4 h-4 text-amber-500" />;
      default: return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const name = activity.member_name;
    switch (activity.activity_type) {
      case 'claim':
        return language === 'hu' 
          ? `${name} csatlakozott a támogatásoddal`
          : language === 'de'
          ? `${name} ist mit deiner Unterstützung beigetreten`
          : `${name} joined with your support`;
      case 'redeem':
        return language === 'hu'
          ? `${name} részt vett a programon`
          : language === 'de'
          ? `${name} hat am Programm teilgenommen`
          : `${name} attended the program`;
      case 'complete':
        return language === 'hu'
          ? `${name} sikeresen teljesítette`
          : language === 'de'
          ? `${name} hat erfolgreich abgeschlossen`
          : `${name} completed successfully`;
      default:
        return name;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'hu') {
      if (diffMins < 1) return 'most';
      if (diffMins < 60) return `${diffMins} perce`;
      if (diffHours < 24) return `${diffHours} órája`;
      return `${diffDays} napja`;
    }
    if (language === 'de') {
      if (diffMins < 1) return 'Jetzt';
      if (diffMins < 60) return `vor ${diffMins} Min`;
      if (diffHours < 24) return `vor ${diffHours} Std`;
      return `vor ${diffDays} Tagen`;
    }
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-black">
          <Heart className="w-5 h-5 text-rose-500" />
          {language === 'hu' ? 'Élő Hatás Feed' : 'Live Impact Feed'}
          <Badge variant="outline" className="ml-auto animate-pulse border-emerald-500/30 text-emerald-600 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            {language === 'hu' ? 'Élő' : 'Live'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-black/20 mb-3" />
            <p className="text-black/50 text-sm">
              {language === 'hu' 
                ? 'Az aktivitások itt fognak megjelenni'
                : 'Activities will appear here'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/5 mb-2 hover:bg-black/[0.04] transition-colors"
                >
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-black/50 truncate">
                      {activity.content_title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-600">
                        -{activity.credit_amount.toLocaleString()} Ft
                      </Badge>
                      <span className="text-xs text-black/40">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveImpactFeed;

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
  id: string;
  userName: string;
  programTitle: string;
  type: 'join' | 'complete';
  timestamp: Date;
}

/**
 * CommunityTicker - Real-time activity ticker
 * 
 * Displays a scrolling ticker of community activities:
 * "[Name] just joined [Program]"
 * Creates a sense of live, active community.
 */
const CommunityTicker = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadRecentActivities();
    
    // Subscribe to real-time voucher claims
    const channel = supabase
      .channel('community-activity-ticker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vouchers'
        },
        (payload) => {
          fetchNewActivity(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Rotate through activities
  useEffect(() => {
    if (activities.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const loadRecentActivities = async () => {
    try {
      const { data: vouchers } = await supabase
        .from('vouchers')
        .select(`
          id,
          created_at,
          profiles:user_id (first_name, last_name),
          expert_contents:content_id (title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (vouchers) {
        const mapped: ActivityItem[] = vouchers
          .filter(v => v.profiles && v.expert_contents)
          .map(v => {
            const profile = v.profiles as any;
            const content = v.expert_contents as any;
            return {
              id: v.id,
              userName: profile?.first_name 
                ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.`
                : (language === 'hu' ? 'Közösségi tag' : 'Community member'),
              programTitle: content?.title || (language === 'hu' ? 'Program' : 'Program'),
              type: 'join' as const,
              timestamp: new Date(v.created_at)
            };
          });

        setActivities(mapped);
      }
    } catch (error) {
    }
  };

  const fetchNewActivity = async (voucherId: string) => {
    try {
      const { data } = await supabase
        .from('vouchers')
        .select(`
          id,
          created_at,
          profiles:user_id (first_name, last_name),
          expert_contents:content_id (title)
        `)
        .eq('id', voucherId)
        .single();

      if (data && data.profiles && data.expert_contents) {
        const profile = data.profiles as any;
        const content = data.expert_contents as any;
        const newActivity: ActivityItem = {
          id: data.id,
          userName: profile?.first_name 
            ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.`
            : 'Közösségi tag',
          programTitle: content?.title || 'Program',
          type: 'join',
          timestamp: new Date(data.created_at)
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        setCurrentIndex(0);
      }
    } catch (error) {
    }
  };

  if (activities.length === 0) {
    return null;
  }

  const currentActivity = activities[currentIndex];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200/50 rounded-xl p-3 overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 p-1.5 rounded-full bg-blue-100">
          <Users className="w-3.5 h-3.5 text-blue-600" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm min-w-0 flex-1"
          >
            <span className="font-medium text-blue-800 truncate">
              {currentActivity.userName}
            </span>
            <span className="text-blue-600/70 flex-shrink-0">
              {language === 'hu' ? 'csatlakozott:' : 'joined'}
            </span>
            <span className="font-medium text-blue-700 truncate">
              {currentActivity.programTitle}
            </span>
          </motion.div>
        </AnimatePresence>

        <Badge 
          variant="outline" 
          className="flex-shrink-0 border-blue-200 bg-blue-50 text-blue-600 text-xs ml-auto"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {language === 'hu' ? 'Élőben' : 'Live'}
        </Badge>
      </div>

      {/* Progress dots */}
      {activities.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {activities.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-blue-500 w-3' 
                  : 'bg-blue-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityTicker;

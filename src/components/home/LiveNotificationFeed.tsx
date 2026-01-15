import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Sparkles, Ticket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: number | string;
  type: string;
  icon: typeof UserPlus;
  message: string;
  avatar: string | null;
  initials: string;
  time: string;
}

export const LiveNotificationFeed = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('activity_feed.time_now') || 'Most';
    if (diffMins < 60) return `${diffMins} ${t('activity_feed.time_minutes_ago') || 'perce'}`;
    if (diffHours < 24) return `${diffHours} ${language === 'hu' ? 'órája' : language === 'de' ? 'Stunden' : 'hours ago'}`;
    return `${diffDays} ${language === 'hu' ? 'napja' : language === 'de' ? 'Tage' : 'days ago'}`;
  }, [t, language]);

  // Get user initials
  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last || '👤';
  };

  // Fetch initial real data from Supabase
  const fetchRealNotifications = useCallback(async () => {
    try {
      // Fetch last 5 vouchers with user profiles and content
      const { data: vouchers, error } = await supabase
        .from('vouchers')
        .select(`
          id,
          created_at,
          user_id,
          content_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !vouchers || vouchers.length === 0) {
        // Fall back to mock data if no real data
        setNotifications([
          {
            id: 1,
            type: 'program',
            icon: Sparkles,
            message: t('activity_feed.new_program') || 'Új program indult!',
            avatar: null,
            initials: '🍞',
            time: t('activity_feed.time_now') || 'Most',
          }
        ]);
        setIsLoading(false);
        return;
      }

      // Fetch profiles and content for each voucher
      const notificationPromises = vouchers.map(async (voucher) => {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', voucher.user_id)
          .single();

        // Get content title
        const { data: content } = await supabase
          .from('expert_contents')
          .select('title')
          .eq('id', voucher.content_id)
          .single();

        const userName = profile?.first_name 
          ? `${profile.first_name} ${profile.last_name?.[0] || ''}.`
          : t('activity_feed.member') || 'Egy Tag';

        const programTitle = content?.title || t('activity_feed.program') || 'programhoz';

        // Format: "🎉 [User Name] épp most csatlakozott a [Program Title] programhoz!"
        const message = language === 'hu' 
          ? `🎉 ${userName} csatlakozott: ${programTitle}`
          : language === 'de'
          ? `🎉 ${userName} ist beigetreten: ${programTitle}`
          : `🎉 ${userName} just joined: ${programTitle}`;

        return {
          id: voucher.id,
          type: 'voucher',
          icon: Ticket,
          message,
          avatar: profile?.avatar_url || null,
          initials: getInitials(profile?.first_name, profile?.last_name),
          time: formatRelativeTime(voucher.created_at),
        };
      });

      const realNotifications = await Promise.all(notificationPromises);
      setNotifications(realNotifications.slice(0, 3));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [t, language, formatRelativeTime]);

  // Load real data on mount
  useEffect(() => {
    fetchRealNotifications();
  }, [fetchRealNotifications]);

  // Subscribe to real-time voucher claims
  useEffect(() => {
    const channel = supabase
      .channel('voucher-claims-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vouchers',
        },
        async (payload) => {
          // Fetch profile and content for this voucher
          const [profileRes, contentRes] = await Promise.all([
            supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', payload.new.user_id).single(),
            supabase.from('expert_contents').select('title').eq('id', payload.new.content_id).single()
          ]);
          
          const profile = profileRes.data;
          const content = contentRes.data;

          const userName = profile?.first_name 
            ? `${profile.first_name} ${profile.last_name?.[0] || ''}.`
            : t('activity_feed.member') || 'Egy Tag';

          const programTitle = content?.title || t('activity_feed.program') || 'programhoz';

          const message = language === 'hu' 
            ? `🎉 ${userName} csatlakozott: ${programTitle}`
            : language === 'de'
            ? `🎉 ${userName} ist beigetreten: ${programTitle}`
            : `🎉 ${userName} just joined: ${programTitle}`;

          const newNotification: Notification = {
            id: payload.new.id,
            type: 'voucher',
            icon: Ticket,
            message,
            avatar: profile?.avatar_url || null,
            initials: getInitials(profile?.first_name, profile?.last_name),
            time: t('activity_feed.time_now') || 'Most',
          };
          
          // Add to top of feed
          setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [t, language]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="flex-1 h-4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 20, 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            layout
          >
            {/* Glassmorphism bubble */}
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm hover:bg-white/80 transition-colors ${notification.type === 'voucher' ? 'ring-2 ring-emerald-200' : ''}`}>
              {/* Avatar or Icon */}
              {notification.avatar ? (
                <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                    {notification.initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm ring-2 ring-white ${notification.type === 'voucher' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {notification.initials}
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {notification.message}
                </p>
              </div>
              
              {/* Icon + Time */}
              <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                <notification.icon className={`w-3.5 h-3.5 ${notification.type === 'voucher' ? 'text-emerald-500' : ''}`} />
                <span className="text-xs">{notification.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {notifications.length === 0 && !isLoading && (
        <div className="text-center py-6 text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('activity_feed.no_activity') || 'Hamarosan itt lesznek az aktivitások!'}</p>
        </div>
      )}
    </div>
  );
};

export default LiveNotificationFeed;

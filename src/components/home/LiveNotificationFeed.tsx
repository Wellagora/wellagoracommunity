import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Sparkles, MessageCircle, Heart, Star, Ticket } from 'lucide-react';
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
  const { t } = useLanguage();
  
  // Create base mock notifications
  const MOCK_NOTIFICATIONS: Notification[] = useMemo(() => [
    {
      id: 1,
      type: 'join',
      icon: UserPlus,
      message: t('activity_feed.kata_joined'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50',
      initials: 'KA',
      time: t('activity_feed.time_now'),
    },
    {
      id: 2,
      type: 'program',
      icon: Sparkles,
      message: t('activity_feed.new_program'),
      avatar: null,
      initials: '🍞',
      time: `2 ${t('activity_feed.time_minutes_ago')}`,
    },
    {
      id: 3,
      type: 'review',
      icon: Star,
      message: t('activity_feed.peter_review'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
      initials: 'PK',
      time: `5 ${t('activity_feed.time_minutes_ago')}`,
    },
    {
      id: 4,
      type: 'join',
      icon: UserPlus,
      message: t('activity_feed.anna_joined'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
      initials: 'AT',
      time: `8 ${t('activity_feed.time_minutes_ago')}`,
    },
    {
      id: 5,
      type: 'like',
      icon: Heart,
      message: t('activity_feed.eszter_liked'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50',
      initials: 'EN',
      time: `12 ${t('activity_feed.time_minutes_ago')}`,
    },
    {
      id: 6,
      type: 'comment',
      icon: MessageCircle,
      message: t('activity_feed.gabor_comment'),
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50',
      initials: 'GS',
      time: `15 ${t('activity_feed.time_minutes_ago')}`,
    },
  ], [t]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(3);

  // Initialize notifications when MOCK_NOTIFICATIONS changes (language switch)
  useEffect(() => {
    setNotifications(MOCK_NOTIFICATIONS.slice(0, 3));
    setCurrentIndex(3);
  }, [MOCK_NOTIFICATIONS]);

  // Subscribe to real-time voucher claims
  useEffect(() => {
    const channel = supabase
      .channel('voucher-claims')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vouchers',
        },
        async (payload) => {
          // Fetch the content title for this voucher
          const { data: content } = await supabase
            .from('expert_contents')
            .select('title')
            .eq('id', payload.new.content_id)
            .single();
          
          if (content) {
            const newNotification: Notification = {
              id: payload.new.id,
              type: 'voucher',
              icon: Ticket,
              message: t('activity_feed.new_voucher_claim')?.replace('{program}', content.title) 
                || `Egy új Tag csatlakozott: ${content.title}`,
              avatar: null,
              initials: '🎫',
              time: t('activity_feed.time_now') || 'Most',
            };
            
            // Add to top of feed
            setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [t]);

  // Rotate notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % MOCK_NOTIFICATIONS.length;
        
        // Add new notification to top, remove oldest
        setNotifications((current) => {
          const newNotification = {
            ...MOCK_NOTIFICATIONS[nextIndex],
            id: Date.now(), // Unique key for animation
          };
          return [newNotification, ...current.slice(0, 2)];
        });
        
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [MOCK_NOTIFICATIONS]);

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
    </div>
  );
};

export default LiveNotificationFeed;

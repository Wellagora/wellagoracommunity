import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Sparkles, MessageCircle, Heart, Star } from 'lucide-react';

// Human-centric mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'join',
    icon: UserPlus,
    message: 'Kata épp most csatlakozott',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50',
    initials: 'KA',
    time: 'most',
  },
  {
    id: 2,
    type: 'program',
    icon: Sparkles,
    message: 'Új élmény: Tradicionális kenyérsütés',
    avatar: null,
    initials: '🍞',
    time: '2 perce',
  },
  {
    id: 3,
    type: 'review',
    icon: Star,
    message: "Péter véleményt írt: 'Felejthetetlen nap volt!'",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
    initials: 'PK',
    time: '5 perce',
  },
  {
    id: 4,
    type: 'join',
    icon: UserPlus,
    message: 'Anna és 3 másik tag csatlakozott',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
    initials: 'AT',
    time: '8 perce',
  },
  {
    id: 5,
    type: 'like',
    icon: Heart,
    message: 'Eszter kedvelte a Gyógynövénytúra programot',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50',
    initials: 'EN',
    time: '12 perce',
  },
  {
    id: 6,
    type: 'comment',
    icon: MessageCircle,
    message: "Gábor hozzászólt: 'Mikor lesz a következő?'",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50',
    initials: 'GS',
    time: '15 perce',
  },
];

interface Notification {
  id: number;
  type: string;
  icon: typeof UserPlus;
  message: string;
  avatar: string | null;
  initials: string;
  time: string;
}

export const LiveNotificationFeed = () => {
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS.slice(0, 3)
  );
  const [currentIndex, setCurrentIndex] = useState(3);

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
  }, []);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm hover:bg-white/80 transition-colors">
              {/* Avatar or Icon */}
              {notification.avatar ? (
                <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                    {notification.initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm ring-2 ring-white">
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
                <notification.icon className="w-3.5 h-3.5" />
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

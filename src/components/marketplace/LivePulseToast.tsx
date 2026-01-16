import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LivePulseToastProps {
  enabled?: boolean;
  interval?: number;
}

// Realistic Hungarian activity data
const MOCK_ACTIVITIES = [
  { name: 'Anna K.', program: 'Kovászos Kenyér Workshop', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { name: 'Péter M.', program: 'Fenntartható Kertészkedés', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { name: 'Zsófia N.', program: 'Természetes Kozmetikumok', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { name: 'Gábor T.', program: 'Hulladékmentes Konyha', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
  { name: 'Réka B.', program: 'Méhészet Kezdőknek', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
  { name: 'Máté H.', program: 'Komposztálás A-tól Z-ig', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
];

export const LivePulseToast = ({ enabled = true, interval = 12000 }: LivePulseToastProps) => {
  const { language } = useLanguage();
  const [currentActivity, setCurrentActivity] = useState<typeof MOCK_ACTIVITIES[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNewActivity = useCallback(() => {
    const randomActivity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
    setCurrentActivity(randomActivity);
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Show first one after 3 seconds
    const initialTimeout = setTimeout(() => {
      showNewActivity();
    }, 3000);

    // Then show periodically
    const intervalId = setInterval(() => {
      showNewActivity();
    }, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [enabled, interval, showNewActivity]);

  if (!enabled || !currentActivity) return null;

  const getMessage = () => {
    if (language === 'hu') {
      return `${currentActivity.name} most jelentkezett: ${currentActivity.program}`;
    }
    if (language === 'de') {
      return `${currentActivity.name} hat sich angemeldet: ${currentActivity.program}`;
    }
    return `${currentActivity.name} just joined: ${currentActivity.program}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-4 z-50 max-w-sm"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/[0.05]">
            {/* Pulsing Live indicator */}
            <div className="relative flex-shrink-0">
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/30">
                <AvatarImage src={currentActivity.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {currentActivity.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
                  {language === 'hu' ? 'ÉLŐ' : language === 'de' ? 'LIVE' : 'LIVE'}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {getMessage()}
              </p>
            </div>

            {/* Check icon */}
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LivePulseToast;

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { updateStreak, awardPoints } from '@/lib/wellpoints';
import { getRoleColors } from '@/lib/roleColors';

const POINTS_PER_LEVEL = 100;

/**
 * Compact progress card for the authenticated homepage.
 * Shows WellPoints balance, current streak, and level progress.
 * Uses REAL data from profiles table — no mocks.
 */
export const UserProgressBar = ({ variant = 'light' }: { variant?: 'light' | 'dark' }) => {
  const isDark = variant === 'dark';
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const roleColors = getRoleColors(profile?.user_role);

  // Fetch live profile data for points and streak
  const { data: progressData } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('wellpoints_balance, current_streak, longest_streak, last_activity_date')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;
      return {
        wellpoints: (data as any).wellpoints_balance ?? 0,
        currentStreak: (data as any).current_streak ?? 0,
        longestStreak: (data as any).longest_streak ?? 0,
        lastActivity: (data as any).last_activity_date,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Update streak on mount (once per day)
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progressData?.lastActivity;
    if (lastActivity !== today) {
      updateStreak(user.id).catch(() => {});
      awardPoints(user.id, 'daily_login', 'Napi belépés').catch(() => {});
    }
  }, [user, progressData?.lastActivity]);

  if (!user || !progressData) return null;

  const { wellpoints, currentStreak } = progressData;
  const level = Math.floor(wellpoints / POINTS_PER_LEVEL) + 1;
  const pointsInLevel = wellpoints % POINTS_PER_LEVEL;
  const progressPercent = (pointsInLevel / POINTS_PER_LEVEL) * 100;
  const isStreakHot = currentStreak >= 3;

  const labels = {
    hu: { level: 'Szint', points: 'WellPont', streak: 'nap sorozat', nextLevel: 'Következő szint' },
    en: { level: 'Level', points: 'WellPoints', streak: 'day streak', nextLevel: 'Next level' },
    de: { level: 'Stufe', points: 'WellPunkte', streak: 'Tage Serie', nextLevel: 'Nächste Stufe' },
  };
  const l = labels[language as keyof typeof labels] || labels.hu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={isDark
        ? "rounded-2xl p-4"
        : "bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
      }
    >
      <div className="flex items-center justify-between gap-4">
        {/* Points + Level */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/15' : roleColors.bgLight} flex items-center justify-center`}>
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-300' : roleColors.text}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{wellpoints}</span>
              <span className={`text-xs ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>{l.points}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
              <TrendingUp className="w-3 h-3" />
              <span>{l.level} {level}</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-2">
            <div className={`relative ${isStreakHot ? 'flame-animate' : ''}`}>
              <Flame className={`w-6 h-6 ${isStreakHot ? 'text-orange-400 fill-orange-300' : isDark ? 'text-white/40' : 'text-gray-400'}`} />
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${isStreakHot ? (isDark ? 'text-orange-300' : 'text-orange-600') : isDark ? 'text-white' : 'text-foreground'}`}>
                {currentStreak}
              </span>
              <span className={`text-xs block leading-tight ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>{l.streak}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar to next level */}
      <div className="mt-3">
        <div className={`flex items-center justify-between text-[10px] mb-1 ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
          <span>{l.nextLevel}</span>
          <span>{pointsInLevel}/{POINTS_PER_LEVEL}</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/15' : 'bg-gray-100'}`}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-300"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UserProgressBar;

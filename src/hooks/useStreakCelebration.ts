import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useStreakCelebration() {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkStreak = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_login, streak_days, streak_celebration_shown_at')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) return;

        const p = profile as any;
        const lastLogin = p.last_login ? new Date(p.last_login) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastLogin) {
          const lastLoginDate = new Date(lastLogin);
          lastLoginDate.setHours(0, 0, 0, 0);
          const isNewDay = lastLoginDate.getTime() !== today.getTime();

          if (isNewDay) {
            const diffMs = today.getTime() - lastLoginDate.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            // Reset streak if more than 1 day gap
            const newStreakDays = diffDays <= 1 ? (p.streak_days || 0) + 1 : 1;
            setStreakDays(newStreakDays);

            const milestones = [3, 7, 14, 30];
            if (milestones.includes(newStreakDays)) {
              const lastShown = p.streak_celebration_shown_at
                ? new Date(p.streak_celebration_shown_at)
                : null;
              lastShown?.setHours(0, 0, 0, 0);

              if (!lastShown || lastShown.getTime() !== today.getTime()) {
                setShowCelebration(true);
              }
            }

            await supabase
              .from('profiles')
              .update({
                streak_days: newStreakDays,
                last_login: new Date().toISOString(),
                ...(milestones.includes(newStreakDays) && {
                  streak_celebration_shown_at: new Date().toISOString(),
                }),
              } as any)
              .eq('id', user.id);
          }
        } else {
          // First login ever
          await supabase
            .from('profiles')
            .update({
              streak_days: 1,
              last_login: new Date().toISOString(),
            } as any)
            .eq('id', user.id);
          setStreakDays(1);
        }
      } catch (error) {
        console.error('Error checking streak:', error);
      }
    };

    checkStreak();
  }, [user]);

  return { streakDays, showCelebration, setShowCelebration };
}

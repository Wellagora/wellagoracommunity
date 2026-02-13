import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flame, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakCelebrationProps {
  streakDays: number;
  isVisible: boolean;
  onDismiss: () => void;
}

export const StreakCelebration = ({ streakDays, isVisible, onDismiss }: StreakCelebrationProps) => {
  const { t } = useLanguage();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const milestones = [3, 7, 14, 30];
  const isMilestone = milestones.includes(streakDays);

  useEffect(() => {
    if (isVisible && isMilestone && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isVisible, isMilestone, hasTriggeredConfetti]);

  const getMilestoneBonus = (days: number): number => {
    const bonusMap: Record<number, number> = { 3: 10, 7: 25, 14: 50, 30: 100 };
    return bonusMap[days] || 0;
  };

  if (!isMilestone) return null;

  const bonus = getMilestoneBonus(streakDays);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <Card className="w-full max-w-sm mx-4 shadow-2xl pointer-events-auto">
            <div className="p-6 text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center"
              >
                <Trophy className="w-16 h-16 text-amber-500" />
              </motion.div>

              <h3 className="text-2xl font-bold">
                {streakDays} {t(`onboarding.streak.day${streakDays === 1 ? '' : 's'}`)}{' '}
                <span className="inline-flex items-center gap-1">
                  <Flame className="w-6 h-6 text-orange-500" />
                </span>
              </h3>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-primary/10 rounded-lg p-3"
              >
                <p className="text-lg font-bold text-primary">
                  +{bonus} {t('wallet.points')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.streak.bonus')}
                </p>
              </motion.div>

              <p className="text-sm text-muted-foreground">
                {t(`onboarding.streak.message_${streakDays}d`)}
              </p>

              <Button onClick={onDismiss} className="w-full" size="lg">
                {t('onboarding.streak.continue')}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

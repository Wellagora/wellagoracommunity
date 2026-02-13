import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

type UserRole = 'expert' | 'member' | 'sponsor' | 'guest';

interface WelcomeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
  isFoundingExpert?: boolean;
}

const ROLE_GRADIENTS: Record<UserRole, string> = {
  expert: 'from-amber-500 via-orange-400 to-yellow-500',
  member: 'from-emerald-500 via-green-400 to-teal-500',
  sponsor: 'from-blue-500 via-indigo-400 to-purple-500',
  guest: 'from-primary via-primary/80 to-accent',
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  expert: <Crown className="w-8 h-8 text-white" />,
  member: <Leaf className="w-8 h-8 text-white" />,
  sponsor: <Sparkles className="w-8 h-8 text-white" />,
  guest: <Leaf className="w-8 h-8 text-white" />,
};

export const WelcomeModal = ({ isOpen, onOpenChange, userRole, isFoundingExpert = false }: WelcomeModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const handleDismiss = async () => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ has_seen_welcome: true } as any)
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating welcome status:', error);
      }
    } else {
      localStorage.setItem('has_seen_welcome', 'true');
    }
    setIsClosing(true);
    setTimeout(() => onOpenChange(false), 300);
  };

  const tips = [
    t(`onboarding.welcome.tips.${userRole}_1`),
    t(`onboarding.welcome.tips.${userRole}_2`),
    t(`onboarding.welcome.tips.${userRole}_3`),
  ];

  const gradient = isFoundingExpert ? 'from-amber-500 via-amber-400 to-yellow-500' : ROLE_GRADIENTS[userRole];

  return (
    <Dialog open={isOpen && !isClosing} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
        <AnimatePresence>
          {/* Header gradient bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-2 bg-gradient-to-r ${gradient} origin-left`}
          />

          <div className="px-8 pt-6 pb-8">
            {/* Icon + Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-6"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg mb-4`}>
                {ROLE_ICONS[userRole]}
              </div>

              {isFoundingExpert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3"
                >
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-300 hover:bg-amber-500/20 text-xs px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    {t('onboarding.welcome.founding_expert_badge')}
                  </Badge>
                </motion.div>
              )}

              <h2 className="text-2xl font-bold tracking-tight">
                {isFoundingExpert
                  ? t(`onboarding.welcome.title.${userRole}_founder`)
                  : t(`onboarding.welcome.title.${userRole}`)
                }
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                {isFoundingExpert
                  ? t(`onboarding.welcome.description.${userRole}_founder`)
                  : t(`onboarding.welcome.description.${userRole}`)
                }
              </p>
            </motion.div>

            {/* Founding Expert perk */}
            {isFoundingExpert && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-center"
              >
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {t('onboarding.welcome.founding_expert_perk')}
                </p>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-3 mb-8"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('onboarding.welcome.tips_title')}
              </p>
              {tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + idx * 0.1 }}
                  className="flex items-start gap-3 group"
                >
                  <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-foreground/80 leading-snug">{tip}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleDismiss}
                size="lg"
                className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white shadow-lg transition-all duration-200`}
              >
                {t('onboarding.welcome.get_started')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Zap, Users, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

type UserRole = 'expert' | 'member' | 'sponsor' | 'guest';

interface WelcomeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
  isFoundingExpert?: boolean;
}

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

        setIsClosing(true);
        setTimeout(() => onOpenChange(false), 300);
      } catch (error) {
        console.error('Error updating welcome status:', error);
      }
    } else {
      localStorage.setItem('has_seen_welcome', 'true');
      setIsClosing(true);
      setTimeout(() => onOpenChange(false), 300);
    }
  };

  const getTips = (role: UserRole): string[] => {
    const keysMap = {
      expert: [
        'onboarding.welcome.tips.expert_1',
        'onboarding.welcome.tips.expert_2',
        'onboarding.welcome.tips.expert_3',
      ],
      member: [
        'onboarding.welcome.tips.member_1',
        'onboarding.welcome.tips.member_2',
        'onboarding.welcome.tips.member_3',
      ],
      sponsor: [
        'onboarding.welcome.tips.sponsor_1',
        'onboarding.welcome.tips.sponsor_2',
        'onboarding.welcome.tips.sponsor_3',
      ],
      guest: [
        'onboarding.welcome.tips.guest_1',
        'onboarding.welcome.tips.guest_2',
        'onboarding.welcome.tips.guest_3',
      ],
    };
    return keysMap[role];
  };

  const getIcon = (role: UserRole) => {
    const iconMap = {
      expert: <Crown className="w-12 h-12 text-amber-500" />,
      member: <Users className="w-12 h-12 text-green-500" />,
      sponsor: <Award className="w-12 h-12 text-blue-500" />,
      guest: <Zap className="w-12 h-12 text-purple-500" />,
    };
    return iconMap[role];
  };

  const tips = getTips(userRole);

  return (
    <Dialog open={isOpen && !isClosing} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className={`sm:max-w-md ${isFoundingExpert ? 'border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            {getIcon(userRole)}
          </div>
          <DialogTitle className="text-center text-xl">
            {isFoundingExpert ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                    {t('onboarding.welcome.founding_expert_badge')}
                  </Badge>
                </div>
                {t(`onboarding.welcome.title.${userRole}_founder`)}
              </>
            ) : (
              t(`onboarding.welcome.title.${userRole}`)
            )}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-center text-sm text-muted-foreground">
            {isFoundingExpert
              ? t(`onboarding.welcome.description.${userRole}_founder`)
              : t(`onboarding.welcome.description.${userRole}`)
            }
          </p>

          {isFoundingExpert && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
              <p className="text-xs text-amber-900 dark:text-amber-100 text-center font-semibold">
                {t('onboarding.welcome.founding_expert_perk')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('onboarding.welcome.tips_title')}
            </h3>
            {tips.map((tipKey, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex gap-2 text-sm"
              >
                <span className="text-primary font-bold min-w-fit">&rarr;</span>
                <span>{t(tipKey)}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleDismiss}
            className="w-full mt-6"
            size="lg"
          >
            {t('onboarding.welcome.get_started')}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;

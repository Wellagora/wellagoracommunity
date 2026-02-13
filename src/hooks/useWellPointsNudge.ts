import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface PointsAction {
  action: string;
  points: number;
}

export function useWellPointsNudge() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const awardPoints = useCallback((action: PointsAction) => {
    toast({
      title: `+${action.points} ${t('wallet.points')}`,
      description: t(`points.${action.action}`),
      duration: 3000,
    });
  }, [toast, t]);

  return { awardPoints };
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const CO2ImpactCard = () => {
  const { t } = useLanguage();

  const { data: impact } = useQuery({
    queryKey: ['community-co2-impact'],
    queryFn: async () => {
      const { data: participations } = await supabase
        .from('participations')
        .select('id')
        .eq('status', 'completed');

      // Estimate: each program completion = 5kg CO₂ saved
      const totalParticipations = participations?.length || 0;
      const co2Saved = totalParticipations * 5;

      return {
        participations: totalParticipations,
        co2Saved: Math.round(co2Saved),
      };
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Leaf className="w-5 h-5 text-green-600" />
            {t('community.co2_impact_title')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              className="text-3xl font-bold text-green-700 dark:text-green-400"
            >
              {impact?.co2Saved || 0} <span className="text-lg">kg CO₂</span>
            </motion.div>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              {t('community.co2_impact_desc')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span>
              {impact?.participations || 0} {t('community.co2_participations')}
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center italic">
            {t('community.co2_disclaimer')}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

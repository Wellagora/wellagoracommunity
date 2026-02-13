import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Leaf, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhyWellAgoraSection = () => {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: Users,
      titleKey: 'homepage.why_wellagora.local_experts_title',
      descKey: 'homepage.why_wellagora.local_experts_desc',
      bgColor: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
    },
    {
      icon: Leaf,
      titleKey: 'homepage.why_wellagora.sustainable_community_title',
      descKey: 'homepage.why_wellagora.sustainable_community_desc',
      bgColor: 'from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20',
    },
    {
      icon: Handshake,
      titleKey: 'homepage.why_wellagora.sponsor_support_title',
      descKey: 'homepage.why_wellagora.sponsor_support_desc',
      bgColor: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('homepage.why_wellagora.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('homepage.why_wellagora.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
              >
                <Card className={`h-full bg-gradient-to-br ${reason.bgColor} border-0 shadow-md hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6 space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>

                    <h3 className="text-lg font-semibold">
                      {t(reason.titleKey)}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(reason.descKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyWellAgoraSection;

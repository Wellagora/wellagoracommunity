import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const BrowseProgramsNudge = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">{t('growth.browse_programs_nudge')}</p>
              <p className="text-xs text-muted-foreground">{t('growth.discover_programs_desc')}</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/programs')}
            size="sm"
            className="whitespace-nowrap"
          >
            {t('actions.browse')}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

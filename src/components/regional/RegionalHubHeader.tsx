import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  region_name: string;
  description: string | null;
  villages: string[] | null;
  translations?: Record<string, { name?: string; description?: string }>;
}

interface RegionalHubHeaderProps {
  project: Project;
  registeredCount: number;
  potentialCount: number;
}

export const RegionalHubHeader = ({ 
  project, 
  registeredCount, 
  potentialCount 
}: RegionalHubHeaderProps) => {
  const { t, language } = useLanguage();

  const getTranslatedName = () => {
    const translations = (project as any).translations;
    return translations?.[language]?.name || project.name;
  };

  const getTranslatedDescription = () => {
    const translations = (project as any).translations;
    return translations?.[language]?.description || project.description || t('regional.subtitle_selected');
  };

  return (
    <motion.div
      className="mb-6 sm:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-end mb-3">
        <LanguageSelector />
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground">
            {getTranslatedName()}
          </h1>
        </div>
        <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
          {getTranslatedDescription()}
        </p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge 
          className="bg-gradient-to-r from-primary to-accent text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
        >
          📍 {project.region_name}
        </Badge>
        <Badge variant="secondary" className="bg-success/20 text-success text-xs sm:text-sm">
          {registeredCount} {t('regional.registered')}
        </Badge>
        <Badge variant="secondary" className="bg-warning/20 text-warning text-xs sm:text-sm">
          {potentialCount} {t('regional.potential')}
        </Badge>
        {project.villages && project.villages.length > 0 && (
          <Badge variant="outline" className="text-xs sm:text-sm">
            {project.villages.length} {t('regional.villages')}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

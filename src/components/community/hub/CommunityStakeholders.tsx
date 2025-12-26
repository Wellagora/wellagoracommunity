import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import ModernRegionalVisualization from "@/components/matching/ModernRegionalVisualization";
import type { StakeholderProfile } from "@/hooks/useCommunityHub";

interface CommunityStakeholdersProps {
  stakeholders: StakeholderProfile[];
  loading: boolean;
  onBack: () => void;
}

const CommunityStakeholders = ({ stakeholders, loading, onBack }: CommunityStakeholdersProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={onBack}>
        ← {t('common.back')}
      </Button>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : stakeholders.length > 0 ? (
        <ModernRegionalVisualization
          stakeholders={stakeholders}
          onStakeholderClick={(stakeholder) => {
            toast({
              title: t('regional.stakeholder_selected'),
              description: stakeholder.name,
            });
          }}
        />
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">{t('regional.no_stakeholders')}</h3>
          <p className="text-muted-foreground">{t('regional.no_stakeholders_desc')}</p>
        </Card>
      )}
    </motion.div>
  );
};

export default CommunityStakeholders;

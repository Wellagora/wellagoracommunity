import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus } from "lucide-react";
import ForumCard from "../ForumCard";
import type { Forum } from "@/hooks/useCommunityHub";

interface CommunityForumsProps {
  forums: Forum[];
  onBack: () => void;
}

const CommunityForums = ({ forums, onBack }: CommunityForumsProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← {t('common.back')}
        </Button>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          {t('community.new_post')}
        </Button>
      </div>
      
      <div className="grid gap-6">
        {forums.map((forum) => (
          <ForumCard 
            key={forum.id} 
            forum={forum} 
            onViewForum={() => {}}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityForums;

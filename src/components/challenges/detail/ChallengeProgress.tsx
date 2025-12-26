import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChallengeProgressProps {
  progress: number;
  isParticipating: boolean;
  isCompleted: boolean;
}

const ChallengeProgress = ({ progress, isParticipating, isCompleted }: ChallengeProgressProps) => {
  const { t } = useLanguage();

  if (!isParticipating || isCompleted) {
    return null;
  }

  return (
    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{t('challenges.your_progress')}</span>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ChallengeProgress;

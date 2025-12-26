import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Clock, 
  Users, 
  Trophy, 
  Target, 
  Share2,
  Zap,
  Leaf,
  Recycle,
  Heart,
  Lightbulb,
  Droplets,
  Bird,
  ArrowDownUp,
  TrendingUp
} from "lucide-react";

interface ChallengeHeaderProps {
  titleKey: string;
  descriptionKey: string;
  durationKey: string;
  category: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  onShare: () => void;
}

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  energy: { icon: Zap, color: "bg-gradient-sunset", label: "Energia" },
  transport: { icon: Target, color: "bg-gradient-ocean", label: "Közlekedés" },
  food: { icon: Leaf, color: "bg-gradient-nature", label: "Étel" },
  waste: { icon: Recycle, color: "bg-gradient-nature", label: "Hulladék" },
  community: { icon: Heart, color: "bg-gradient-primary", label: "Közösség" },
  innovation: { icon: Lightbulb, color: "bg-gradient-sunset", label: "Innováció" },
  water: { icon: Droplets, color: "bg-gradient-ocean", label: "Víz" },
  biodiversity: { icon: Bird, color: "bg-gradient-nature", label: "Biodiverzitás" },
  "circular-economy": { icon: ArrowDownUp, color: "bg-gradient-primary", label: "Körforgásos gazdaság" },
  "green-finance": { icon: TrendingUp, color: "bg-gradient-sunset", label: "Zöld finanszírozás" }
};

const ChallengeHeader = ({
  titleKey,
  descriptionKey,
  durationKey,
  pointsReward,
  participants,
  completionRate,
  onShare
}: ChallengeHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>{durationKey}</span>
          </Badge>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {t(titleKey)}
        </h2>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
          {t(descriptionKey)}
        </p>
        
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:space-x-6 gap-3 sm:gap-0 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
            <Users className="w-4 h-4 text-muted-foreground mb-1 sm:mb-0" />
            <span className="text-foreground font-medium text-center sm:text-left">
              {participants.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
            <Target className="w-4 h-4 text-success mb-1 sm:mb-0" />
            <span className="text-foreground font-medium text-center sm:text-left">
              {completionRate}%
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
            <Trophy className="w-4 h-4 text-warning mb-1 sm:mb-0" />
            <span className="text-foreground font-medium text-center sm:text-left">
              {pointsReward}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 p-4 sm:p-0 bg-primary/5 sm:bg-transparent rounded-lg sm:rounded-none">
        <div className="flex items-center sm:flex-col sm:text-right space-x-2 sm:space-x-0">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {pointsReward}
          </div>
          <div className="text-xs text-muted-foreground">{t('challenges.points_reward')}</div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="hover:bg-primary/10"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChallengeHeader;

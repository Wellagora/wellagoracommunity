import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Trophy, 
  CheckCircle,
  Star,
  Share2,
  Award,
  Flame,
  Sparkles,
  Check,
  RefreshCcw,
  Target
} from "lucide-react";

interface ChallengeActionsProps {
  challengeId: string;
  pointsReward: number;
  stepsCount: number;
  isOrganization: boolean;
  buttonType: string;
  userProgress?: {
    isParticipating: boolean;
    isCompleted: boolean;
    progress: number;
    completedSteps: number[];
  };
  onJoin: () => void;
  onComplete: () => void;
  onShare: () => void;
  onSponsor: () => void;
}

const ChallengeActions = ({
  pointsReward,
  stepsCount,
  isOrganization,
  buttonType,
  userProgress,
  onJoin,
  onComplete,
  onShare,
  onSponsor
}: ChallengeActionsProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col space-y-4 pt-6">
      {/* Inspirational CTA Section */}
      {!userProgress?.isParticipating && (
        <div className="w-full p-4 rounded-lg bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 border border-primary/20 mb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{t('challenges.ready_to_make_impact')}</h4>
              <p className="text-sm text-muted-foreground">{t('challenges.join_others')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="w-4 h-4 text-warning" />
            <span>{pointsReward} {t('challenges.points')}</span>
          </div>
        </div>
      )}
      
      {/* Progress Milestones */}
      {userProgress?.isParticipating && !userProgress.isCompleted && (
        <div className="w-full p-4 rounded-lg bg-primary/5 border border-primary/20 mb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{t('challenges.your_journey')}</span>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {userProgress.completedSteps?.length || 0}/{stepsCount} {t('challenges.steps')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-warning" />
            <span>{t('challenges.keep_going')}</span>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {isOrganization && (
          <>
            {buttonType === 'sponsored' && (
              <Button 
                className="flex-1 bg-success hover:bg-success/90 h-12 sm:h-11 text-base font-semibold"
              >
                <Check className="w-5 h-5 mr-2" />
                {t('challenges.sponsored')}
              </Button>
            )}
            {buttonType === 'extend' && (
              <Button 
                onClick={onSponsor}
                className="flex-1 bg-warning hover:bg-warning/90 h-12 sm:h-11 text-base font-semibold"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                {t('challenges.extend_sponsorship')}
              </Button>
            )}
            {buttonType === 'sponsor' && (
              <Button 
                onClick={onSponsor}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth h-12 sm:h-11 text-base font-semibold group"
              >
                <Star className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {t('challenges.sponsor_challenge')}
              </Button>
            )}
          </>
        )}
        
        {!isOrganization && (
          <>
            {!userProgress?.isParticipating ? (
              <Button 
                onClick={onJoin}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth h-12 sm:h-11 text-base font-semibold group"
              >
                <Trophy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {t('challenges.join_challenge')}
                <Sparkles className="w-4 h-4 ml-2 opacity-70" />
              </Button>
            ) : userProgress.isCompleted ? (
              <Button 
                disabled
                className="flex-1 bg-success hover:bg-success h-11 sm:h-10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('challenges.challenge_completed_label')}
              </Button>
            ) : (
              <Button 
                onClick={onComplete}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth h-12 sm:h-11 text-base font-semibold group"
              >
                <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {t('challenges.complete_challenge')}
                <Award className="w-4 h-4 ml-2 opacity-70" />
              </Button>
            )}
          </>
        )}
        
        <Button 
          variant="outline" 
          onClick={onShare}
          className="sm:w-auto h-11 sm:h-10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {t('challenges.share')}
        </Button>
      </div>
    </div>
  );
};

export default ChallengeActions;

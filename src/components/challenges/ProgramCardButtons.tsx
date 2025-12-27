import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCcw, Star, Users, Eye, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgramActions } from "@/hooks/useProgramActions";

interface ProgramCardButtonsProps {
  challengeId: string;
  isJoined?: boolean;
  progress?: number;
  isCompleted?: boolean;
  onNavigate: () => void;
  onSponsor: () => void;
}

const ProgramCardButtons = ({
  challengeId,
  isJoined = false,
  progress = 0,
  isCompleted = false,
  onNavigate,
  onSponsor,
}: ProgramCardButtonsProps) => {
  const { t } = useLanguage();
  const { isOrganization, sponsorshipStatus, participationStatus, getButtonType } = useProgramActions(challengeId);

  const buttonType = getButtonType();
  const isLoading = sponsorshipStatus.loading || participationStatus.loading;

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          disabled 
          className="w-full rounded-2xl shadow-premium"
        >
          <span className="animate-pulse">...</span>
        </Button>
      </div>
    );
  }

  // Organization users - show sponsorship-based buttons
  if (isOrganization) {
    switch (buttonType) {
      case 'sponsored':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onNavigate}
              className="w-full bg-success hover:bg-success/90 text-success-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
            >
              <Check className="w-4 h-4 mr-2" />
              {t('challenges.sponsored')}
            </Button>
          </div>
        );

      case 'extend':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onSponsor}
              className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('challenges.extend_sponsorship')}
            </Button>
          </div>
        );

      case 'sponsor':
      default:
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onSponsor}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
            >
              <Star className="w-4 h-4 mr-2" />
              {t('challenges.sponsor_challenge')}
            </Button>
          </div>
        );
    }
  }

  // Individual users - Completed state (100% or approved)
  if (isCompleted || progress === 100) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Badge 
          className="w-full justify-center py-3 bg-success/20 text-success border border-success/30 font-semibold text-sm rounded-2xl"
        >
          <Check className="w-4 h-4 mr-2" />
          {t('challenges.completed_badge') || 'Teljesítve ✓'}
        </Badge>
      </div>
    );
  }

  // Individual users - Joined but not completed (Continue)
  if (isJoined) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onNavigate}
          variant="outline"
          className="w-full border-accent text-accent hover:bg-accent/10 font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
        >
          <Play className="w-4 h-4 mr-2" />
          {t('challenges.continue_program')}
        </Button>
      </div>
    );
  }

  // Not joined - show Join button (primary gradient style)
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={onNavigate}
        className="w-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:from-[#0055DD] hover:to-[#00BBEE] text-white font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
      >
        <Users className="w-4 h-4 mr-2" />
        {t('challenges.join_challenge')}
      </Button>
    </div>
  );
};

export default ProgramCardButtons;
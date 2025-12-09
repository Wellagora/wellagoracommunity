import { Button } from "@/components/ui/button";
import { Check, RefreshCcw, Star, Users, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgramActions } from "@/hooks/useProgramActions";

interface ProgramCardButtonsProps {
  challengeId: string;
  onNavigate: () => void;
  onSponsor: () => void;
}

const ProgramCardButtons = ({
  challengeId,
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

  // Individual users - show participation-based buttons
  switch (buttonType) {
    case 'open':
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onNavigate}
            variant="outline"
            className="w-full font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('challenges.open_program')}
          </Button>
        </div>
      );

    case 'join':
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onNavigate}
            className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('challenges.join_challenge')}
          </Button>
        </div>
      );

    case 'view':
    default:
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onNavigate}
            className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold rounded-2xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 px-3 py-2"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('challenges.view_challenge')}
          </Button>
        </div>
      );
  }
};

export default ProgramCardButtons;

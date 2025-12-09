import { Button } from "@/components/ui/button";
import { Check, RefreshCcw, Star, Users, Eye, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgramActions } from "@/hooks/useProgramActions";
import { cn } from "@/lib/utils";

interface ProgramActionButtonProps {
  programId: string;
  onSponsor?: () => void;
  onJoin?: () => void;
  onOpen?: () => void;
  onView?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

const ProgramActionButton = ({
  programId,
  onSponsor,
  onJoin,
  onOpen,
  onView,
  className,
  size = "default",
  fullWidth = true,
}: ProgramActionButtonProps) => {
  const { t } = useLanguage();
  const { isOrganization, sponsorshipStatus, participationStatus, getButtonType } = useProgramActions(programId);

  const buttonType = getButtonType();
  const isLoading = sponsorshipStatus.loading || participationStatus.loading;

  if (isLoading) {
    return (
      <Button 
        disabled 
        className={cn(fullWidth && "w-full", className)}
        size={size}
      >
        <span className="animate-pulse">...</span>
      </Button>
    );
  }

  switch (buttonType) {
    case 'sponsor':
      return (
        <Button
          onClick={onSponsor}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            fullWidth && "w-full",
            className
          )}
          size={size}
        >
          <Star className="w-4 h-4 mr-2" />
          {t('challenges.sponsor_challenge')}
        </Button>
      );

    case 'sponsored':
      return (
        <Button
          onClick={onOpen}
          className={cn(
            "bg-success hover:bg-success/90 text-success-foreground",
            fullWidth && "w-full",
            className
          )}
          size={size}
        >
          <Check className="w-4 h-4 mr-2" />
          {t('challenges.sponsored')}
        </Button>
      );

    case 'extend':
      return (
        <Button
          onClick={onSponsor}
          className={cn(
            "bg-warning hover:bg-warning/90 text-warning-foreground",
            fullWidth && "w-full",
            className
          )}
          size={size}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {t('challenges.extend_sponsorship')}
        </Button>
      );

    case 'join':
      return (
        <Button
          onClick={onJoin}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            fullWidth && "w-full",
            className
          )}
          size={size}
        >
          <Users className="w-4 h-4 mr-2" />
          {t('challenges.join_challenge')}
        </Button>
      );

    case 'open':
      return (
        <Button
          onClick={onOpen}
          variant="outline"
          className={cn(fullWidth && "w-full", className)}
          size={size}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('challenges.open_program')}
        </Button>
      );

    case 'view':
    default:
      return (
        <Button
          onClick={onView}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            fullWidth && "w-full",
            className
          )}
          size={size}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('challenges.view_challenge')}
        </Button>
      );
  }
};

export default ProgramActionButton;

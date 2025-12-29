import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  isSaving: boolean;
  contentId: string | null;
  onBack: () => void;
}

export const WizardHeader = ({
  currentStep,
  totalSteps,
  progress,
  isSaving,
  contentId,
  onBack,
}: WizardHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3 max-w-2xl">
        {/* Top row: Back + Title + Close */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 text-center">
            <h1 className="font-semibold text-lg">{t("wizard.new_workshop_secret")}</h1>
            {/* Auto-save status */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t("wizard.saving")}</span>
                </>
              ) : contentId ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>{t("wizard.draft_saved")}</span>
                </>
              ) : null}
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicator */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {t("wizard.step")} {currentStep}/{totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

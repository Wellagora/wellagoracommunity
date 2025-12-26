import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Check, Loader2 } from "lucide-react";

interface ChallengeStepsProps {
  stepsKeys: string[];
  completedSteps: number[];
  isParticipating: boolean;
  isCompletingStep: boolean;
  onCompleteStep: (stepIndex: number) => void;
}

const ChallengeSteps = ({
  stepsKeys,
  completedSteps,
  isParticipating,
  isCompletingStep,
  onCompleteStep
}: ChallengeStepsProps) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
        {t('challenges.steps_to_complete')}
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {stepsKeys.map((stepKey, index) => (
          <div
            key={stepKey}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
              completedSteps?.includes(index) 
                ? 'bg-success/10 border-success/20 shadow-sm' 
                : activeStep === index 
                ? 'bg-primary/10 border-primary/20 shadow-sm' 
                : 'bg-muted/30 border-border active:bg-muted/50'
            }`}
            onClick={() => setActiveStep(index)}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
              completedSteps?.includes(index) 
                ? 'bg-success text-success-foreground' 
                : activeStep === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {completedSteps?.includes(index) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium text-sm sm:text-base">{t(stepKey)}</p>
              {isParticipating && !completedSteps?.includes(index) && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="mt-2 text-xs h-7"
                  disabled={isCompletingStep}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteStep(index);
                  }}
                >
                  {isCompletingStep ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {t('challenges.mark_complete')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeSteps;

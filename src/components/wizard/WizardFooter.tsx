import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardFooterProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isSaving: boolean;
}

export const WizardFooter = ({
  currentStep,
  onNext,
  onBack,
  canProceed,
  isSaving,
}: WizardFooterProps) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
      <div className="container mx-auto max-w-2xl flex gap-3">
        {currentStep > 1 && (
          <Button variant="outline" onClick={onBack} className="flex-1 py-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("wizard.back")}
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={!canProceed || isSaving}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6"
        >
          {isSaving && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {t("wizard.next")}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

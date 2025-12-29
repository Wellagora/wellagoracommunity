import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, AlertCircle, Rocket, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WizardFormData, CATEGORIES } from "../WorkshopSecretWizard";

interface Step5PreviewProps {
  formData: WizardFormData;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
}

export const Step5Preview = ({ formData, onPublish, onSaveDraft, isPublishing }: Step5PreviewProps) => {
  const { t, language } = useLanguage();

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    if (!cat) return value;
    switch (language) {
      case "en": return cat.labelEn;
      case "de": return cat.labelDe;
      default: return cat.label;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("wizard.step5_title")}</h2>
        <p className="text-muted-foreground">{t("wizard.step5_subtitle")}</p>
      </div>

      {/* Preview card */}
      <Card className="bg-card border-border overflow-hidden">
        {formData.image_url && (
          <img src={formData.image_url} alt={formData.title} className="w-full h-48 object-cover" />
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-primary/20 text-primary">{getCategoryLabel(formData.category)}</Badge>
            <Badge
              className={
                formData.access_type === "free"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-amber-500/20 text-amber-500"
              }
            >
              {formData.access_type === "free" ? t("wizard.free") : `${formData.price_huf.toLocaleString()} Ft`}
            </Badge>
          </div>
          <h3 className="font-bold text-xl mb-2">{formData.title || t("wizard.untitled")}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {formData.short_description || t("wizard.no_description")}
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <span>
              {formData.milestones.length} {t("wizard.milestones")}
            </span>
          </div>
        </div>
      </Card>

      {/* Summary checklist */}
      <div className="space-y-2 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm">
          {formData.title && formData.short_description ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span>{t("wizard.checklist_basics")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {formData.image_url ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span>{t("wizard.checklist_cover")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {formData.milestones.length > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span>
            {formData.milestones.length} {t("wizard.milestones_added")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>
            {t("wizard.checklist_price")}:{" "}
            {formData.access_type === "free" ? t("wizard.free") : `${formData.price_huf.toLocaleString()} Ft`}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={onPublish}
          disabled={isPublishing || !formData.title}
          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 py-6 text-lg"
        >
          {isPublishing ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Rocket className="h-5 w-5 mr-2" />
          )}
          {t("wizard.publish_now")}
        </Button>

        <Button variant="outline" onClick={onSaveDraft} className="w-full py-6">
          <Save className="h-5 w-5 mr-2" />
          {t("wizard.save_draft")}
        </Button>
      </div>
    </div>
  );
};

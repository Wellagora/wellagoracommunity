import { useLanguage } from "@/contexts/LanguageContext";
import { Lightbulb, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WizardFormData, CATEGORIES } from "../WorkshopSecretWizard";

interface Step1BasicsProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
}

export const Step1Basics = ({ formData, setFormData }: Step1BasicsProps) => {
  const { t, language } = useLanguage();

  const getCategoryLabel = (cat: typeof CATEGORIES[0]) => {
    switch (language) {
      case "en": return cat.labelEn;
      case "de": return cat.labelDe;
      default: return cat.label;
    }
  };

  return (
    <div className="space-y-6">
      {/* Motivational header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("wizard.step1_title")}</h2>
        <p className="text-muted-foreground">{t("wizard.step1_subtitle")}</p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          {t("wizard.title_label")} *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t("wizard.title_placeholder")}
          className="bg-card border-border text-lg py-6"
          maxLength={100}
        />
        <div className="flex justify-between text-xs">
          <span className={formData.title.length < 5 ? "text-yellow-500" : "text-muted-foreground"}>
            {formData.title.length < 5 ? t("wizard.min_5_chars") : ""}
          </span>
          <span className="text-muted-foreground">{formData.title.length}/100</span>
        </div>
      </div>

      {/* Category selector */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t("wizard.category_label")} *</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.category === cat.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="text-sm">{getCategoryLabel(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Short description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          {t("wizard.description_label")} *
        </Label>
        <Textarea
          id="description"
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          placeholder={t("wizard.description_placeholder")}
          className="bg-card border-border min-h-[120px]"
          maxLength={300}
        />
        <div className="flex justify-between text-xs">
          <span className={formData.short_description.length < 20 ? "text-yellow-500" : "text-muted-foreground"}>
            {formData.short_description.length < 20 ? t("wizard.min_20_chars") : ""}
          </span>
          <span className="text-muted-foreground">{formData.short_description.length}/300</span>
        </div>
      </div>

      {/* Tip */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p className="text-sm text-primary flex items-start gap-2">
          <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{t("wizard.step1_tip")}</span>
        </p>
      </div>
    </div>
  );
};

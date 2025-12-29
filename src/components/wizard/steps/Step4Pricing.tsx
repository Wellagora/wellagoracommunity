import { useLanguage } from "@/contexts/LanguageContext";
import { DollarSign, Gift, Coins, Heart, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardFormData, PRICE_PRESETS } from "../WorkshopSecretWizard";

interface Step4PricingProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
}

export const Step4Pricing = ({ formData, setFormData }: Step4PricingProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("wizard.step4_title")}</h2>
        <p className="text-muted-foreground">{t("wizard.step4_subtitle")}</p>
      </div>

      {/* Free vs Paid selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, access_type: "free", price_huf: 0 })}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            formData.access_type === "free"
              ? "border-green-500 bg-green-500/10"
              : "border-border bg-card"
          }`}
        >
          <Gift
            className={`h-10 w-10 mx-auto mb-3 ${
              formData.access_type === "free" ? "text-green-500" : "text-muted-foreground"
            }`}
          />
          <p className="font-semibold text-lg">{t("wizard.free")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("wizard.free_description")}</p>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, access_type: "paid", price_huf: 2990 })}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            formData.access_type === "paid"
              ? "border-amber-500 bg-amber-500/10"
              : "border-border bg-card"
          }`}
        >
          <Coins
            className={`h-10 w-10 mx-auto mb-3 ${
              formData.access_type === "paid" ? "text-amber-500" : "text-muted-foreground"
            }`}
          />
          <p className="font-semibold text-lg">{t("wizard.paid")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("wizard.paid_description")}</p>
        </button>
      </div>

      {/* Price settings (if paid) */}
      {formData.access_type === "paid" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <Label className="text-base font-medium">{t("wizard.choose_price")}</Label>

          {/* Preset prices */}
          <div className="grid grid-cols-3 gap-2">
            {PRICE_PRESETS.map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => setFormData({ ...formData, price_huf: price })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.price_huf === price
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-border bg-card"
                }`}
              >
                {price.toLocaleString()} Ft
              </button>
            ))}
          </div>

          {/* Custom price */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{t("wizard.or")}</span>
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                step="100"
                value={formData.price_huf}
                onChange={(e) => setFormData({ ...formData, price_huf: parseInt(e.target.value) || 0 })}
                className="bg-card border-border pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">Ft</span>
            </div>
          </div>

          {/* Revenue calculator */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("wizard.your_revenue")} (85%):</span>
              <span className="text-2xl font-bold text-amber-500">
                {Math.floor(formData.price_huf * 0.85).toLocaleString()} Ft
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("wizard.platform_fee")} (15%): {Math.floor(formData.price_huf * 0.15).toLocaleString()} Ft
            </p>
          </div>
        </div>
      )}

      {/* Sponsorship note */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p className="text-sm text-primary flex items-start gap-2">
          <Heart className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{t("wizard.step4_tip")}</span>
        </p>
      </div>
    </div>
  );
};

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaf, ChefHat, Hammer, Heart, Palette, MoreHorizontal } from "lucide-react";
import type { ProgramFormData } from "../ProgramCreatorWizard";

interface Step2DetailsProps {
  formData: ProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProgramFormData>>;
}

const CATEGORIES = [
  { value: "gardening", icon: Leaf, color: "text-green-500" },
  { value: "gastronomy", icon: ChefHat, color: "text-orange-500" },
  { value: "crafts", icon: Hammer, color: "text-amber-600" },
  { value: "health", icon: Heart, color: "text-red-500" },
  { value: "art", icon: Palette, color: "text-purple-500" },
  { value: "other", icon: MoreHorizontal, color: "text-gray-500" },
];

const Step2Details = ({ formData, setFormData }: Step2DetailsProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("program_creator.step_details")}
        </h2>
        <p className="text-muted-foreground">
          {t("program_creator.details_subtitle")}
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          {t("program_creator.title")} *
        </Label>
        <Input
          id="title"
          value={formData.title_hu}
          onChange={(e) => setFormData(prev => ({ ...prev, title_hu: e.target.value }))}
          placeholder={t("program_creator.title_placeholder")}
          className="h-12 text-lg"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.title_hu.length}/100
        </p>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {t("program_creator.category")} *
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = formData.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                className={`
                  p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${isSelected 
                    ? "border-emerald-500 bg-emerald-500/10 shadow-md" 
                    : "border-border hover:border-emerald-300 hover:bg-muted/50"
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? "text-emerald-500" : cat.color}`} />
                <span className={`text-sm font-medium ${isSelected ? "text-emerald-700" : "text-foreground"}`}>
                  {t(`categories.${cat.value}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Mode */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
        <CardContent className="p-6">
          <Label className="text-base font-medium mb-4 block">
            {t("program_creator.pricing_mode")}
          </Label>
          
          <RadioGroup
            value={formData.pricingMode}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              pricingMode: value as "sponsor_only" | "purchasable",
              price_huf: value === "sponsor_only" ? 0 : prev.price_huf
            }))}
            className="space-y-3"
          >
            <div className={`
              flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${formData.pricingMode === "sponsor_only" 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-border hover:border-emerald-300"
              }
            `}>
              <RadioGroupItem value="sponsor_only" id="sponsor" className="mt-1" />
              <div>
                <Label htmlFor="sponsor" className="text-base font-medium cursor-pointer">
                  {t("program_creator.sponsor_only")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("program_creator.sponsor_only_hint")}
                </p>
              </div>
            </div>
            
            <div className={`
              flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${formData.pricingMode === "purchasable" 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-border hover:border-emerald-300"
              }
            `}>
              <RadioGroupItem value="purchasable" id="purchase" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="purchase" className="text-base font-medium cursor-pointer">
                  {t("program_creator.also_purchasable")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("program_creator.also_purchasable_hint")}
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Price Input */}
          {formData.pricingMode === "purchasable" && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg">
              <Label htmlFor="price" className="text-sm font-medium">
                {t("program_creator.price")}
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="price"
                  type="number"
                  value={formData.price_huf || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_huf: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="3500"
                  className="flex-1"
                  min={500}
                  step={100}
                />
                <span className="text-lg font-medium text-muted-foreground">
                  {language === "hu" ? "Ft" : "€"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("program_creator.revenue_hint")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Step2Details;

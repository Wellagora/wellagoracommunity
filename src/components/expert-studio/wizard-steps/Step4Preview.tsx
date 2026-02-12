import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Save, 
  Rocket, 
  Check, 
  ChevronDown, 
  Leaf, 
  ChefHat, 
  Hammer, 
  Heart, 
  Palette, 
  MoreHorizontal,
  Loader2,
  Bot,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ProgramFormData } from "../ProgramCreatorWizard";

interface Step4PreviewProps {
  formData: ProgramFormData;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  hasPayoutMethod?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  gardening: Leaf,
  gastronomy: ChefHat,
  crafts: Hammer,
  health: Heart,
  art: Palette,
  other: MoreHorizontal,
};

const Step4Preview = ({ formData, onPublish, onSaveDraft, isPublishing, hasPayoutMethod = false }: Step4PreviewProps) => {
  const { t, language } = useLanguage();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const CategoryIcon = CATEGORY_ICONS[formData.category] || MoreHorizontal;

  const checklist = [
    { key: "media", done: !!formData.mediaUrl, label: t("program_creator.checklist_media") },
    { key: "title", done: formData.title_hu.length >= 3, label: t("program_creator.checklist_title") },
    { key: "category", done: !!formData.category, label: t("program_creator.checklist_category") },
    { key: "description", done: formData.description_hu.length >= 20, label: t("program_creator.checklist_description") },
    { key: "translations", done: !!formData.title_en && !!formData.title_de, label: t("program_creator.checklist_translations") },
    { key: "payout", done: hasPayoutMethod, label: language === "hu" ? "Kifizetési mód beállítva" : "Payout method set" },
  ];

  // Payout method is required for publishing
  const allDone = checklist.filter(c => c.key !== "translations").every(c => c.done);
  const canPublish = allDone && hasPayoutMethod;

  // Publish check validation

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("program_creator.step_preview")}
        </h2>
        <p className="text-muted-foreground">
          {t("program_creator.preview_subtitle")}
        </p>
      </div>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden shadow-xl">
          {/* Thumbnail */}
          {formData.mediaUrl && (
            <div className="aspect-video relative">
              {formData.mediaType === "video" ? (
                <video
                  src={formData.mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={formData.mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-primary/90 text-white">
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {t(`categories.${formData.category}`)}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                {formData.pricingMode === "sponsor_only" ? (
                  <Badge className="bg-emerald-500 text-white">
                    {t("program_creator.sponsored")}
                  </Badge>
                ) : (
                  <Badge className={`shadow-md ${formData.price_huf > 0 ? 'bg-white text-foreground' : 'bg-amber-100 text-amber-800'}`}>
                    {formData.price_huf > 0
                      ? `${formData.price_huf.toLocaleString()} Ft`
                      : t("program_creator.price_not_set") || "0 Ft"
                    }
                  </Badge>
                )}
              </div>
            </div>
          )}

          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-3">
              {formData.title_hu || t("program_creator.untitled")}
            </h3>
            <p className="text-muted-foreground line-clamp-3">
              {formData.description_hu || t("program_creator.no_description")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Translations Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("program_creator.translations_preview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* English */}
          <Collapsible open={openSections.includes("en")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("en")}
              className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span className="font-medium">English</span>
                {formData.isAITranslated.en && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Bot className="w-3 h-3" /> AI
                  </Badge>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.includes("en") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-2">
              <p className="font-medium">{formData.title_en || "-"}</p>
              <p className="text-sm text-muted-foreground">{formData.description_en || "-"}</p>
            </CollapsibleContent>
          </Collapsible>

          {/* German */}
          <Collapsible open={openSections.includes("de")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("de")}
              className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🇩🇪</span>
                <span className="font-medium">Deutsch</span>
                {formData.isAITranslated.de && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Bot className="w-3 h-3" /> AI
                  </Badge>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.includes("de") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-2">
              <p className="font-medium">{formData.title_de || "-"}</p>
              <p className="text-sm text-muted-foreground">{formData.description_de || "-"}</p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("program_creator.checklist_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.key} className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${item.done ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}
                `}>
                  {item.done ? <Check className="w-4 h-4" /> : <span className="text-xs">○</span>}
                </div>
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Payout Warning */}
      {!hasPayoutMethod && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                {language === "hu" 
                  ? "A közzétételhez állítsd be a kifizetési módot a profilodban."
                  : "Set up your payout method in your profile to publish."}
              </span>
              <Link to="/settings/payout">
                <Button size="sm" variant="outline" className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-100">
                  <CreditCard className="w-4 h-4" />
                  {language === "hu" ? "Beállítás" : "Set up"}
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="flex-1 h-14"
          disabled={isPublishing}
        >
          <Save className="w-5 h-5 mr-2" />
          {t("program_creator.save_draft")}
        </Button>
        <Button
          onClick={onPublish}
          disabled={!canPublish || isPublishing}
          className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
          title={!hasPayoutMethod ? (language === "hu" ? "Állítsd be a kifizetési módot" : "Set up payout method first") : ""}
        >
          {isPublishing ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-5 h-5 mr-2" />
          )}
          {t("program_creator.publish")}
        </Button>
      </div>
    </div>
  );
};

export default Step4Preview;

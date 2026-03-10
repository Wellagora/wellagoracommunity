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
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Video
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
  lifestyle: Leaf,
  craft: Hammer,
  gastronomy: ChefHat,
  wellness: Heart,
  hiking: MoreHorizontal,
  gardening: Leaf,
  heritage: MoreHorizontal,
  volunteering: Heart,
  market: MoreHorizontal,
  community: MoreHorizontal,
  sport: MoreHorizontal,
  culture: Palette,
  family: Heart,
  // Legacy keys
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

  const primaryCategory = formData.categories?.[0] || formData.category || '';
  const CategoryIcon = CATEGORY_ICONS[primaryCategory] || MoreHorizontal;

  const isFreeProgram = formData.pricingMode !== "purchasable" || formData.price_huf === 0;

  // Media is considered "done" if there's an image/thumbnail, video URL, meeting link, or it's an in_person/online_live type
  const hasMedia = !!formData.mediaUrl || !!formData.videoUrl || !!formData.meetingLink
    || formData.contentType === 'in_person' || formData.contentType === 'online_live';

  const checklist = [
    { key: "media", done: hasMedia, label: t("program_creator.checklist_media") },
    { key: "title", done: formData.title_hu.length >= 3, label: t("program_creator.checklist_title") },
    { key: "category", done: (formData.categories?.length > 0) || !!formData.category, label: t("program_creator.checklist_category") },
    { key: "description", done: formData.description_hu.length >= 20, label: t("program_creator.checklist_description") },
    { key: "translations", done: !!formData.title_en && !!formData.title_de, label: t("program_creator.checklist_translations") },
    // Payout only shown for paid programs, and even then it's not blocking (Stripe not yet integrated)
    ...(!isFreeProgram ? [{ key: "payout", done: hasPayoutMethod, label: language === "hu" ? "Kifizetési mód beállítva" : "Payout method set" }] : []),
  ];

  // Payout is NOT blocking — programs can be published without it (Stripe integration pending)
  const allDone = checklist.filter(c => c.key !== "translations" && c.key !== "payout").every(c => c.done);
  const canPublish = allDone;

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
                formData.thumbnailUrl ? (
                  // Show thumbnail image with play icon overlay (like marketplace cards)
                  <div className="relative w-full h-full">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-primary ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <video
                    src={formData.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                )
              ) : (
                <img
                  src={formData.mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                {(formData.categories?.length > 0 ? formData.categories : [formData.category].filter(Boolean)).map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat] || MoreHorizontal;
                  return (
                    <Badge key={cat} className="bg-primary/90 text-white">
                      <CatIcon className="w-3 h-3 mr-1" />
                      {t(`categories.${cat}`)}
                    </Badge>
                  );
                })}
              </div>
              <div className="absolute top-4 right-4">
                {formData.pricingMode === "sponsor_only" ? (
                  <Badge className="bg-blue-500 text-white">
                    {t("program_creator.sponsored")}
                  </Badge>
                ) : (
                  <Badge className="bg-white text-foreground shadow-md">
                    {language === "hu" 
                      ? `${formData.price_huf.toLocaleString()} Ft`
                      : `€${Math.round(formData.price_huf / 400)}`
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
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {formData.description_hu || t("program_creator.no_description")}
            </p>

            {/* Event metadata summary */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {formData.contentType === 'in_person' && (
                <>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Élő esemény</span>
                  {formData.locationAddress && (
                    <span className="flex items-center gap-1">{formData.locationAddress}</span>
                  )}
                </>
              )}
              {formData.contentType === 'online_live' && (
                <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> Online élő</span>
              )}
              {formData.contentType === 'recorded' && (
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Videókurzus</span>
              )}
              {formData.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(formData.eventDate).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
                </span>
              )}
              {formData.eventTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formData.eventTime}
                </span>
              )}
            </div>
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
                  ${item.done ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"}
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

      {/* Payout Info — informational, not blocking */}
      {!hasPayoutMethod && !isFreeProgram && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                {language === "hu"
                  ? "A fizetős programokhoz később állítsd be a kifizetési módot. Most is közzéteheted a programot."
                  : language === "de"
                  ? "Für kostenpflichtige Programme richten Sie später Ihre Auszahlungsmethode ein. Sie können das Programm jetzt veröffentlichen."
                  : "Set up your payout method later for paid programs. You can publish now."}
              </span>
              <Link to="/expert-studio/settings">
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
          className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 disabled:opacity-50"
          title={!canPublish ? (language === "hu" ? "Töltsd ki az összes mezőt" : "Complete all required fields") : ""}
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

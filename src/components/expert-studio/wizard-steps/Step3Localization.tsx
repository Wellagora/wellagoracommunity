import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, AlertTriangle, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramFormData } from "../ProgramCreatorWizard";

interface Step3LocalizationProps {
  formData: ProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProgramFormData>>;
}

const Step3Localization = ({ formData, setFormData }: Step3LocalizationProps) => {
  const { t } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("hu");

  const approveLocale = (lang: 'hu' | 'en' | 'de') => {
    setFormData(prev => ({
      ...prev,
      isApproved: { ...prev.isApproved, [lang]: true },
    }));
    toast.success(t('creator.translation.approve'));
  };

  const handleAutoTranslate = async () => {
    if (!formData.title_hu.trim() || !formData.description_hu.trim()) {
      toast.error(t("program_creator.fill_hungarian_first"));
      return;
    }

    setIsTranslating(true);
    try {
      // Combine title and description for translation
      const textToTranslate = `${formData.title_hu}\n---SEPARATOR---\n${formData.description_hu}`;

      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: {
          text: textToTranslate,
          targetLanguages: ["en", "de"],
        },
      });

      if (error) throw error;

      // Parse translations
      const translations = data?.translations ?? data;
      if (translations) {
        const enParts = translations.en?.split("\n---SEPARATOR---\n") || [];
        const deParts = translations.de?.split("\n---SEPARATOR---\n") || [];

        setFormData(prev => ({
          ...prev,
          title_en: enParts[0]?.trim() || "",
          description_en: enParts[1]?.trim() || "",
          title_de: deParts[0]?.trim() || "",
          description_de: deParts[1]?.trim() || "",
          isAITranslated: { en: true, de: true },
          isApproved: { ...prev.isApproved, en: false, de: false },
        }));

        toast.success(t("program_creator.translation_complete"));
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error(t("program_creator.translation_error"));
    } finally {
      setIsTranslating(false);
    }
  };

  const renderLanguageTab = (lang: "hu" | "en" | "de") => {
    const isHungarian = lang === "hu";
    const titleKey = `title_${lang}` as keyof ProgramFormData;
    const descKey = `description_${lang}` as keyof ProgramFormData;
    const isAI = !isHungarian && formData.isAITranslated[lang as "en" | "de"];
    const isApproved = formData.isApproved[lang];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {isAI ? t('creator.translation.badge_ai') : null}
          </div>
          <Button
            type="button"
            variant={isApproved ? 'default' : 'outline'}
            onClick={() => approveLocale(lang)}
            className="whitespace-nowrap"
          >
            {t('creator.translation.approve')}
          </Button>
        </div>

        {/* Title */}
        <div className="space-y-2 relative">
          <Label htmlFor={`title-${lang}`} className="text-base font-medium">
            {t("program_creator.title")} {isHungarian && "*"}
          </Label>
          <div className="relative">
            <Input
              id={`title-${lang}`}
              value={formData[titleKey] as string}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [titleKey]: e.target.value,
                isAITranslated: isHungarian 
                  ? prev.isAITranslated 
                  : { ...prev.isAITranslated, [lang]: false }
                ,
                isApproved: { ...prev.isApproved, [lang]: false }
              }))}
              placeholder={t(`program_creator.title_placeholder_${lang}`)}
              className={`h-12 ${isAI ? "pr-16" : ""}`}
              disabled={!isHungarian && isTranslating}
            />
            {isAI && (
              <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <Bot className="w-3 h-3" />
                <span>AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 relative">
          <Label htmlFor={`desc-${lang}`} className="text-base font-medium">
            {t(`program_creator.description_${lang}`)} {isHungarian && "*"}
          </Label>
          <div className="relative">
            <Textarea
              id={`desc-${lang}`}
              value={formData[descKey] as string}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [descKey]: e.target.value,
                isAITranslated: isHungarian 
                  ? prev.isAITranslated 
                  : { ...prev.isAITranslated, [lang]: false }
                ,
                isApproved: { ...prev.isApproved, [lang]: false }
              }))}
              placeholder={t(`program_creator.description_placeholder_${lang}`)}
              className="min-h-[200px] resize-none"
              disabled={!isHungarian && isTranslating}
            />
            {isAI && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <Bot className="w-3 h-3" />
                <span>AI</span>
              </div>
            )}
          </div>
          {isHungarian && (
            <p className="text-xs text-muted-foreground text-right">
              {(formData[descKey] as string).length} / {t("program_creator.min_chars")}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("program_creator.step_localization")}
        </h2>
        <p className="text-muted-foreground">
          {t("program_creator.localization_subtitle")}
        </p>
      </div>

      {/* Auto-Translate Button */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">
                {t("program_creator.auto_translate_title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("program_creator.auto_translate_desc")}
              </p>
            </div>
            <Button
              onClick={handleAutoTranslate}
              disabled={isTranslating || !formData.title_hu.trim() || !formData.description_hu.trim()}
              variant="outline"
              className="border-amber-400 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("program_creator.translating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("program_creator.generate_translation")}
                </>
              )}
            </Button>
          </div>

          {/* AI Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-amber-100/50 border border-amber-200 rounded-lg mt-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              {t("program_creator.ai_disclaimer")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hu" className="gap-2">
            🇭🇺 Magyar
          </TabsTrigger>
          <TabsTrigger value="en" className="gap-2">
            🇬🇧 English
            {formData.isAITranslated.en && <Bot className="w-3 h-3 text-amber-500" />}
          </TabsTrigger>
          <TabsTrigger value="de" className="gap-2">
            🇩🇪 Deutsch
            {formData.isAITranslated.de && <Bot className="w-3 h-3 text-amber-500" />}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="hu" className="mt-0">
            {renderLanguageTab("hu")}
          </TabsContent>
          <TabsContent value="en" className="mt-0">
            {renderLanguageTab("en")}
          </TabsContent>
          <TabsContent value="de" className="mt-0">
            {renderLanguageTab("de")}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Step3Localization;

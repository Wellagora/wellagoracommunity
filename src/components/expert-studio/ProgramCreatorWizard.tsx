import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import Step1Media from "./wizard-steps/Step1Media";
import Step2Details from "./wizard-steps/Step2Details";
import Step3Localization from "./wizard-steps/Step3Localization";
import Step4Preview from "./wizard-steps/Step4Preview";

export type ContentType = 'in_person' | 'online_live' | 'recorded';

export interface ProgramFormData {
  // Media
  mediaFile: File | null;
  mediaUrl: string;
  mediaType: "video" | "image" | null;
  mediaLibraryId?: string | null; // Track if from media library

  // Details
  title_hu: string;
  category: string; // kept for backward compat (primary category, derived from categories[0])
  categories: string[]; // multi-category support
  pricingMode: "sponsor_only" | "purchasable";
  price_huf: number;

  // Problem-Solution for AI indexing
  problemStatement: string;
  solutionStatement: string;

  // Program Type & Conditional Fields
  contentType: ContentType;
  eventDate: string; // ISO date string
  eventTime: string; // HH:MM format
  maxParticipants: number; // Max participants for in_person and online_live
  locationAddress: string; // Physical location for in_person
  locationMapUrl: string; // Google Maps link
  meetingLink: string; // Zoom/Teams link for online_live
  videoUrl: string; // Vimeo/YouTube link for recorded

  // Localization
  description_hu: string;
  title_en: string;
  description_en: string;
  title_de: string;
  description_de: string;
  isAITranslated: { en: boolean; de: boolean };
  isApproved: { hu: boolean; en: boolean; de: boolean };
  masterLocale: 'hu' | 'en' | 'de';
}

const initialFormData: ProgramFormData = {
  mediaFile: null,
  mediaUrl: "",
  mediaType: null,
  mediaLibraryId: null,
  title_hu: "",
  category: "",
  categories: [],
  pricingMode: "sponsor_only",
  price_huf: 0,
  problemStatement: "",
  solutionStatement: "",
  contentType: "in_person",
  eventDate: "",
  eventTime: "",
  maxParticipants: 10,
  locationAddress: "",
  locationMapUrl: "",
  meetingLink: "",
  videoUrl: "",
  description_hu: "",
  title_en: "",
  description_en: "",
  title_de: "",
  description_de: "",
  isAITranslated: { en: false, de: false },
  isApproved: { hu: false, en: false, de: false },
  masterLocale: 'hu',
};

const STEPS = ["media", "details", "localization", "preview"] as const;

const ProgramCreatorWizard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData);
  const [contentId, setContentId] = useState<string | null>(editId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);

  // Check for media library params on mount
  useEffect(() => {
    const mediaId = searchParams.get('mediaId');
    const mediaUrl = searchParams.get('mediaUrl');
    const mediaType = searchParams.get('mediaType');

    if (mediaUrl && mediaType) {
      setFormData(prev => ({
        ...prev,
        mediaUrl: mediaUrl,
        mediaType: mediaType as 'video' | 'image',
        mediaLibraryId: mediaId || null,
      }));
      // Auto-advance to step 2 (details) since media is pre-selected
      setCurrentStep(1);
      toast.success('Média betöltve a Médiatárból!');
    }
  }, [searchParams]);

  useEffect(() => {
    if (editId && user) {
      loadExistingContent(editId);
    }
  }, [editId, user]);

  const loadExistingContent = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("*")
        .eq("id", id)
        .eq("creator_id", user?.id)
        .single();

      if (error || !data) {
        toast.error(t("wizard.content_not_found"));
        navigate("/szakertoi-studio");
        return;
      }

      // Parse problem_solution JSON if exists
      const problemSolution = data.problem_solution as { problem?: string; solution?: string } | null;

      const { data: locs } = await supabase
        .from('content_localizations')
        .select('locale, is_approved, is_ai_generated')
        .eq('content_id', id);

      const approved: { hu: boolean; en: boolean; de: boolean } = { hu: false, en: false, de: false };
      const ai: { en: boolean; de: boolean } = { en: false, de: false };
      for (const row of (locs || []) as any[]) {
        if (row.locale === 'hu') approved.hu = !!row.is_approved;
        if (row.locale === 'en') {
          approved.en = !!row.is_approved;
          ai.en = !!row.is_ai_generated;
        }
        if (row.locale === 'de') {
          approved.de = !!row.is_approved;
          ai.de = !!row.is_ai_generated;
        }
      }

      setFormData({
        mediaFile: null,
        mediaUrl: data.image_url || data.thumbnail_url || "",
        mediaType: data.image_url?.includes("video") ? "video" : "image",
        title_hu: data.title || "",
        category: data.category || "",
        categories: data.category ? data.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
        pricingMode: data.price_huf && data.price_huf > 0 ? "purchasable" : "sponsor_only",
        price_huf: data.price_huf || 0,
        problemStatement: problemSolution?.problem || "",
        solutionStatement: problemSolution?.solution || "",
        contentType: (data.content_type as ContentType) || "in_person",
        eventDate: "",
        eventTime: "",
        maxParticipants: data.max_capacity || 10,
        locationAddress: "",
        locationMapUrl: "",
        meetingLink: data.content_url || "",
        videoUrl: data.content_url || "",
        description_hu: data.description || "",
        title_en: data.title_en || "",
        description_en: data.description_en || "",
        title_de: data.title_de || "",
        description_de: data.description_de || "",
        isAITranslated: ai,
        isApproved: approved,
        masterLocale: (data.master_locale as 'hu' | 'en' | 'de') || 'hu',
      });

      setContentId(id);
    } catch (error) {
      toast.error(t("wizard.load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Media (optional - can skip)
        return true;
      case 1: // Details
        return formData.title_hu.trim().length >= 3 && (formData.categories?.length > 0 || !!formData.category);
      case 2: // Localization
        return formData.description_hu.trim().length >= 20;
      case 3: // Preview
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (isSaving) return; // Prevent double-click

    // Show specific validation errors instead of generic message
    if (!isStepValid(currentStep)) {
      if (currentStep === 1) {
        if (formData.title_hu.trim().length < 3) {
          toast.error("Add meg a program címét! (min. 3 karakter)");
        } else if (!formData.categories?.length && !formData.category) {
          toast.error("Válassz legalább egy kategóriát!");
        }
      } else if (currentStep === 2) {
        if (formData.description_hu.trim().length < 20) {
          toast.error("Írd meg a program leírását! (min. 20 karakter)");
        }
      } else {
        toast.error(t("program_creator.fill_required"));
      }
      return;
    }

    // Auto-save on step change (only if we have enough data)
    if (currentStep >= 1) {
      const success = await autoSaveDraft();
      if (!success) return; // Don't advance if save failed
    }
    setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  /**
   * Auto-save draft to Supabase.
   * Returns true on success, false on failure.
   */
  const autoSaveDraft = async (): Promise<boolean> => {
    if (!user) return false;
    setIsSaving(true);

    try {
      let imageUrl = formData.mediaUrl;

      // Upload media file ONLY if a new file is selected (not yet uploaded)
      if (formData.mediaFile) {
        const isLargeFile = formData.mediaFile.size > 5 * 1024 * 1024; // 5MB
        if (isLargeFile) {
          toast.info("Média feltöltése folyamatban...", { duration: 10000, id: 'upload-progress' });
        }

        const fileExt = formData.mediaFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("expert-content")
          .upload(fileName, formData.mediaFile, { upsert: true });

        if (uploadError) {
          console.error('[Studio] Storage upload error:', uploadError);
          // Continue without media — don't block the save
        }

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("expert-content")
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
          // Clear file immediately so it won't re-upload on next step change
          setFormData(prev => ({ ...prev, mediaUrl: imageUrl, mediaFile: null }));
        }

        if (isLargeFile) {
          toast.dismiss('upload-progress');
        }
      }

      // Prepare content URL based on content type
      const contentUrl = formData.contentType === 'recorded'
        ? formData.videoUrl
        : formData.contentType === 'online_live'
        ? formData.meetingLink
        : formData.locationMapUrl;

      // Translation status: only require master locale approval for draft
      const allApproved = formData.isApproved.hu && formData.isApproved.en && formData.isApproved.de;

      const contentData = {
        title: formData.title_hu || "Névtelen program",
        title_en: formData.title_en || null,
        title_de: formData.title_de || null,
        description: formData.description_hu,
        description_en: formData.description_en || null,
        description_de: formData.description_de || null,
        category: formData.categories?.length > 0
          ? formData.categories.join(',')
          : formData.category || null,
        content_type: formData.contentType,
        content_url: contentUrl || null,
        image_url: imageUrl || null,
        thumbnail_url: imageUrl || null,
        price_huf: formData.pricingMode === "purchasable" ? formData.price_huf : 0,
        access_type: formData.pricingMode === "purchasable" ? "paid" : "sponsored",
        max_capacity: formData.contentType !== 'recorded' ? formData.maxParticipants : null,
        is_published: false,
        updated_at: new Date().toISOString(),
        master_locale: formData.masterLocale,
        translation_status: allApproved ? 'approved' : 'needs_review',
        problem_solution: {
          problem: formData.problemStatement || null,
          solution: formData.solutionStatement || null,
        },
      };

      let savedContentId = contentId;

      if (contentId) {
        // UPDATE existing draft
        const { error: updateError } = await supabase
          .from("expert_contents")
          .update(contentData)
          .eq("id", contentId);

        if (updateError) {
          console.error('[Studio] Update expert_contents error:', updateError);
          throw new Error(updateError.message);
        }
      } else {
        // INSERT new draft
        const { data, error } = await supabase
          .from("expert_contents")
          .insert({ ...contentData, creator_id: user.id })
          .select()
          .single();

        if (error) {
          console.error('[Studio] Insert expert_contents error:', error);
          throw new Error(error.message);
        }
        if (data) {
          savedContentId = data.id;
          setContentId(data.id);
        }
      }

      // Run localizations + media library update in PARALLEL (not sequential)
      if (savedContentId) {
        const now = new Date().toISOString();

        const rows = [
          {
            content_id: savedContentId,
            locale: 'hu',
            title: formData.title_hu,
            description: formData.description_hu,
            is_ai_generated: false,
            is_approved: formData.isApproved.hu,
            source_locale: null,
            edited_at: now,
            approved_at: formData.isApproved.hu ? now : null,
          },
          {
            content_id: savedContentId,
            locale: 'en',
            title: formData.title_en || null,
            description: formData.description_en || null,
            is_ai_generated: formData.isAITranslated.en,
            is_approved: formData.isApproved.en,
            source_locale: 'hu',
            translated_at: formData.isAITranslated.en ? now : null,
            edited_at: now,
            approved_at: formData.isApproved.en ? now : null,
          },
          {
            content_id: savedContentId,
            locale: 'de',
            title: formData.title_de || null,
            description: formData.description_de || null,
            is_ai_generated: formData.isAITranslated.de,
            is_approved: formData.isApproved.de,
            source_locale: 'hu',
            translated_at: formData.isAITranslated.de ? now : null,
            edited_at: now,
            approved_at: formData.isApproved.de ? now : null,
          },
        ];

        const parallelOps: Promise<any>[] = [
          supabase
            .from('content_localizations')
            .upsert(rows as any, { onConflict: 'content_id,locale' }),
        ];

        // Media library update runs in parallel too
        if (formData.mediaLibraryId) {
          parallelOps.push(
            supabase
              .from('expert_media')
              .update({ status: 'in_draft', program_id: savedContentId })
              .eq('id', formData.mediaLibraryId)
          );
        }

        await Promise.all(parallelOps);
      }

      return true; // SUCCESS
    } catch (error: any) {
      console.error('[Studio] autoSaveDraft error:', error);
      toast.error("Mentési hiba: " + (error?.message || "Ismeretlen hiba. Próbáld újra!"));
      return false; // FAILURE
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!contentId || !user) return;
    setIsPublishing(true);

    try {
      // First do a final save
      const saveOk = await autoSaveDraft();
      if (!saveOk) {
        toast.error("A mentés sikertelen. Próbáld újra!");
        return;
      }

      // Only require master locale to have content — NOT all 3 locales approved
      // This allows publishing in a single language (e.g. Hungarian only)
      const masterLocale = formData.masterLocale || 'hu';
      const masterTitle = masterLocale === 'hu' ? formData.title_hu
                        : masterLocale === 'en' ? formData.title_en
                        : formData.title_de;
      const masterDesc = masterLocale === 'hu' ? formData.description_hu
                       : masterLocale === 'en' ? formData.description_en
                       : formData.description_de;

      if (!masterTitle || masterTitle.trim().length < 3) {
        toast.error("A cím hiányzik vagy túl rövid!");
        return;
      }
      if (!masterDesc || masterDesc.trim().length < 20) {
        toast.error("A leírás hiányzik vagy túl rövid! (min. 20 karakter)");
        return;
      }
      if (!formData.categories?.length && !formData.category) {
        toast.error("Válassz legalább egy kategóriát a publikáláshoz!");
        return;
      }

      const { error: publishError } = await supabase
        .from("expert_contents")
        .update({
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      if (publishError) {
        console.error('[Studio] Publish error:', publishError);
        throw new Error(publishError.message);
      }

      // Update media library item status to published
      if (formData.mediaLibraryId) {
        await supabase
          .from('expert_media')
          .update({ status: 'published' })
          .eq('id', formData.mediaLibraryId);
      }

      toast.success(t("program_creator.published_success") || "Program sikeresen közzétéve!");
      navigate("/szakertoi-studio");
    } catch (error: any) {
      console.error('[Studio] handlePublish error:', error);
      toast.error("Közzétételi hiba: " + (error?.message || "Ismeretlen hiba"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    const success = await autoSaveDraft();
    if (success) {
      toast.success(t("program_creator.draft_saved") || "Piszkozat mentve!");
      navigate("/szakertoi-studio");
    }
    // If failed, autoSaveDraft already showed error toast — stay on page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with Progress */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/szakertoi-studio")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </Button>
            {/* Save indicator moved to fixed bottom-right */}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full font-medium transition-all
                    ${index === currentStep
                      ? "bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg"
                      : index < currentStep
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </button>
                <span className={`ml-2 text-sm hidden sm:block ${
                  index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                }`}>
                  {t(`program_creator.step_${step}`)}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 rounded ${
                    index < currentStep ? "bg-blue-500" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("program_creator.start_simple_hint")}
                </p>
                <Step1Media formData={formData} setFormData={setFormData} />
              </>
            )}
            {currentStep === 1 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("program_creator.formats_hint")}
                </p>
                <Step2Details formData={formData} setFormData={setFormData} />
              </>
            )}
            {currentStep === 2 && (
              <Step3Localization formData={formData} setFormData={setFormData} />
            )}
            {currentStep === 3 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("program_creator.marketplace_visibility_hint")}
                </p>
                <Step4Preview
                  formData={formData}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  isPublishing={isPublishing}
                  hasPayoutMethod={!!profile?.payout_preference}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Indicator — fixed bottom-right, always visible */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 right-6 z-50 bg-white/90 backdrop-blur-md shadow-lg border border-border/50 rounded-full px-4 py-2 flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-foreground">{t("common.saving")}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/40 p-4">
          <div className="container mx-auto max-w-2xl flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("program_creator.back")}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t("program_creator.next")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramCreatorWizard;

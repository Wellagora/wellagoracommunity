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
  category: string;
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
        pricingMode: data.price_huf && data.price_huf > 0 ? "purchasable" : "sponsor_only",
        price_huf: data.price_huf || 0,
        problemStatement: problemSolution?.problem || "",
        solutionStatement: problemSolution?.solution || "",
        contentType: (data.content_type as ContentType) || "in_person",
        eventDate: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : "",
        eventTime: data.event_date ? new Date(data.event_date).toTimeString().slice(0, 5) : "",
        maxParticipants: data.max_capacity || 10,
        locationAddress: data.event_location || "",
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
      console.error("Error loading content:", error);
      toast.error(t("wizard.load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Media
        return !!formData.mediaUrl || !!formData.mediaFile;
      case 1: // Details
        return formData.title_hu.trim().length >= 3 && !!formData.category;
      case 2: // Localization
        return formData.description_hu.trim().length >= 20;
      case 3: // Preview
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!isStepValid(currentStep)) {
      toast.error(t("program_creator.fill_required"));
      return;
    }
    
    // Auto-save on step change
    await autoSaveDraft();
    setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const autoSaveDraft = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let imageUrl = formData.mediaUrl;

      // Upload media file if exists
      if (formData.mediaFile) {
        const fileExt = formData.mediaFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("expert-content")
          .upload(fileName, formData.mediaFile, { upsert: true });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("expert-content")
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
        }
      }

      // Prepare content URL based on content type
      const contentUrl = formData.contentType === 'recorded' 
        ? formData.videoUrl 
        : formData.contentType === 'online_live' 
        ? formData.meetingLink 
        : formData.locationMapUrl;

      // Build event_date from date + time
      let eventDateISO: string | null = null;
      if (formData.eventDate && formData.contentType !== 'recorded') {
        const dateStr = formData.eventTime 
          ? `${formData.eventDate}T${formData.eventTime}:00` 
          : `${formData.eventDate}T00:00:00`;
        eventDateISO = new Date(dateStr).toISOString();
      }

      const contentData = {
        title: formData.title_hu || "Névtelen program",
        title_en: formData.title_en || null,
        title_de: formData.title_de || null,
        description: formData.description_hu,
        description_en: formData.description_en || null,
        description_de: formData.description_de || null,
        category: formData.category,
        content_type: formData.contentType,
        content_url: contentUrl || null,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        price_huf: formData.pricingMode === "purchasable" ? formData.price_huf : 0,
        access_type: formData.pricingMode === "purchasable" ? "paid" : "sponsored",
        max_capacity: formData.contentType !== 'recorded' ? formData.maxParticipants : null,
        event_date: eventDateISO,
        event_location: formData.contentType === 'in_person' ? (formData.locationAddress || null) : null,
        is_published: false,
        updated_at: new Date().toISOString(),
        // Add problem_solution metadata for AI indexing
        problem_solution: {
          problem: formData.problemStatement || null,
          solution: formData.solutionStatement || null,
        },
      };

      let savedContentId = contentId;

      if (contentId) {
        await supabase.from("expert_contents").update(contentData).eq("id", contentId);
      } else {
        const { data, error } = await supabase
          .from("expert_contents")
          .insert({ ...contentData, creator_id: user.id })
          .select()
          .single();

        if (!error && data) {
          savedContentId = data.id;
          setContentId(data.id);
        }
      }

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

        await supabase
          .from('content_localizations')
          .upsert(rows as any, { onConflict: 'content_id,locale' });

        const allApproved = formData.isApproved.hu && formData.isApproved.en && formData.isApproved.de;
        await supabase
          .from('expert_contents')
          .update({
            master_locale: formData.masterLocale,
            translation_status: allApproved ? 'approved' : 'needs_review',
          })
          .eq('id', savedContentId);
      }

      // Update media library item status if from media library
      if (formData.mediaLibraryId && savedContentId) {
        await supabase
          .from('expert_media')
          .update({ 
            status: 'in_draft',
            program_id: savedContentId 
          })
          .eq('id', formData.mediaLibraryId);
      }

      // Update form with uploaded URL
      if (imageUrl !== formData.mediaUrl) {
        setFormData(prev => ({ ...prev, mediaUrl: imageUrl, mediaFile: null }));
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!contentId || !user) return;
    setIsPublishing(true);

    try {
      const { data: locs, error: locError } = await supabase
        .from('content_localizations')
        .select('locale, is_approved')
        .eq('content_id', contentId);
      if (locError) throw locError;
      const approvedByLocale = (locs || []).reduce((acc: any, row: any) => {
        acc[row.locale] = !!row.is_approved;
        return acc;
      }, {} as Record<string, boolean>);
      const allApproved = approvedByLocale.hu && approvedByLocale.en && approvedByLocale.de;
      if (!allApproved) {
        toast.error(t('creator.translation.needs_review'));
        return;
      }

      await supabase
        .from("expert_contents")
        .update({
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      // Update media library item status to published
      if (formData.mediaLibraryId) {
        await supabase
          .from('expert_media')
          .update({ status: 'published' })
          .eq('id', formData.mediaLibraryId);
      }

      toast.success(t("program_creator.published_success"));
      navigate("/szakertoi-studio");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(t("program_creator.publish_error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    await autoSaveDraft();
    toast.success(t("program_creator.draft_saved"));
    navigate("/szakertoi-studio");
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
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/40">
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
            {isSaving && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t("common.saving")}
              </span>
            )}
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
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg" 
                      : index < currentStep 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
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
                    index < currentStep ? "bg-emerald-500" : "bg-muted"
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
              disabled={!isStepValid(currentStep)}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              {t("program_creator.next")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramCreatorWizard;

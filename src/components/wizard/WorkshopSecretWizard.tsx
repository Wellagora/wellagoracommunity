import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WizardHeader } from "./WizardHeader";
import { WizardFooter } from "./WizardFooter";
import { Step1Basics } from "./steps/Step1Basics";
import { Step2CoverImage } from "./steps/Step2CoverImage";
import { Step3Content } from "./steps/Step3Content";
import { Step4Pricing } from "./steps/Step4Pricing";
import { Step5Preview } from "./steps/Step5Preview";
import { Loader2 } from "lucide-react";

export interface Milestone {
  id: number;
  title: string;
  content: string;
  image_url: string;
  video_url: string;
  order: number;
}

export interface WizardFormData {
  title: string;
  category: string;
  short_description: string;
  image_url: string;
  milestones: Milestone[];
  price_huf: number;
  access_type: "free" | "paid";
}

export const CATEGORIES = [
  { value: "sustainable-living", label: "🌿 Fenntartható Életmód", labelEn: "🌿 Sustainable Living", labelDe: "🌿 Nachhaltiges Leben" },
  { value: "workshop-craft", label: "🔨 Műhely & Kézművesség", labelEn: "🔨 Workshop & Craft", labelDe: "🔨 Werkstatt & Handwerk" },
  { value: "local-gastronomy", label: "🍎 Helyi Gasztronómia", labelEn: "🍎 Local Gastronomy", labelDe: "🍎 Lokale Gastronomie" },
  { value: "community-impact", label: "🤝 Közösségi Hatás", labelEn: "🤝 Community Impact", labelDe: "🤝 Gemeinschaftswirkung" },
  { value: "wellbeing", label: "🧘 Jóllét & Reziliencia", labelEn: "🧘 Wellbeing & Resilience", labelDe: "🧘 Wohlbefinden & Resilienz" },
  { value: "agora-business", label: "💼 Agora Business", labelEn: "💼 Agora Business", labelDe: "💼 Agora Business" },
];

export const PRICE_PRESETS = [1990, 2990, 4990, 7990, 9990];

export const FILE_LIMITS = {
  COVER_IMAGE_MAX_MB: 5,
  MILESTONE_IMAGE_MAX_MB: 2,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

export const validateImageFile = (file: File, maxMB: number): { valid: boolean; error?: string } => {
  if (!FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Csak JPG, PNG vagy WebP formátum engedélyezett" };
  }
  if (file.size > maxMB * 1024 * 1024) {
    return { valid: false, error: `A fájl túl nagy (max ${maxMB}MB)` };
  }
  return { valid: true };
};

export const isYouTubeOrVimeo = (url: string): boolean => {
  if (!url) return true;
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
};

const WorkshopSecretWizard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: editId } = useParams<{ id: string }>();

  const [currentStep, setCurrentStep] = useState(1);
  const [contentId, setContentId] = useState<string | null>(editId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);

  const [formData, setFormData] = useState<WizardFormData>({
    title: "",
    category: "",
    short_description: "",
    image_url: "",
    milestones: [],
    price_huf: 0,
    access_type: "free",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Load existing content for edit mode
  useEffect(() => {
    if (editId && user) {
      loadExistingContent(editId);
    } else if (!editId && user) {
      checkForDraft();
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

      setFormData({
        title: data.title || "",
        category: data.category || "",
        short_description: data.description || "",
        image_url: data.image_url || data.thumbnail_url || "",
        price_huf: data.price_huf || 0,
        access_type: data.price_huf && data.price_huf > 0 ? "paid" : "free",
        milestones: [],
      });

      // Load milestones
      const { data: milestonesData } = await supabase
        .from("content_milestones")
        .select("*")
        .eq("content_id", id)
        .order("order_index", { ascending: true });

      if (milestonesData && milestonesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          milestones: milestonesData.map((m) => ({
            id: Date.now() + Math.random(),
            title: m.title,
            content: m.content || "",
            image_url: m.image_url || "",
            video_url: m.video_url || "",
            order: m.order_index,
          })),
        }));
      }

      setContentId(id);
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error(t("wizard.load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const checkForDraft = async () => {
    try {
      const { data } = await supabase
        .from("expert_contents")
        .select("id, title, updated_at")
        .eq("creator_id", user?.id)
        .eq("is_published", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.title) {
        const continueEdit = window.confirm(
          t("wizard.continue_draft").replace("{{title}}", data.title || "Névtelen vázlat")
        );

        if (continueEdit) {
          navigate(`/szakertoi-studio/${data.id}/szerkesztes`);
        }
      }
    } catch (error) {
      console.error("Error checking draft:", error);
    }
  };

  const autoSaveDraft = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const contentData = {
        title: formData.title || "Névtelen vázlat",
        description: formData.short_description,
        category: formData.category,
        image_url: formData.image_url,
        thumbnail_url: formData.image_url,
        price_huf: formData.price_huf,
        access_type: formData.price_huf > 0 ? "paid" : "free",
        is_published: false,
        updated_at: new Date().toISOString(),
      };

      if (contentId) {
        await supabase.from("expert_contents").update(contentData).eq("id", contentId);
        await saveMilestones(contentId);
      } else {
        const { data, error } = await supabase
          .from("expert_contents")
          .insert({ ...contentData, creator_id: user.id })
          .select()
          .single();

        if (!error && data) {
          setContentId(data.id);
          await saveMilestones(data.id);
        }
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveMilestones = async (cId: string) => {
    // Delete existing milestones
    await supabase.from("content_milestones").delete().eq("content_id", cId);

    // Insert new milestones
    if (formData.milestones.length > 0) {
      const milestonesData = formData.milestones.map((m, index) => ({
        content_id: cId,
        title: m.title || `Mérföldkő ${index + 1}`,
        content: m.content || null,
        image_url: m.image_url || null,
        video_url: m.video_url || null,
        order_index: index + 1,
      }));

      await supabase.from("content_milestones").insert(milestonesData);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 5 && formData.category !== "" && formData.short_description.trim().length >= 20;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!isStepValid(currentStep)) {
      toast.error(t("wizard.fill_required"));
      return;
    }
    await autoSaveDraft();
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePublish = async () => {
    if (!contentId || !user) return;
    setIsPublishing(true);

    try {
      await supabase
        .from("expert_contents")
        .update({
          title: formData.title,
          description: formData.short_description,
          category: formData.category,
          image_url: formData.image_url,
          thumbnail_url: formData.image_url,
          price_huf: formData.price_huf,
          access_type: formData.price_huf > 0 ? "paid" : "free",
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);

      await saveMilestones(contentId);
      toast.success(t("wizard.published_success"));
      navigate("/szakertoi-studio");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(t("wizard.publish_error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    await autoSaveDraft();
    toast.success(t("wizard.draft_saved"));
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
    <div className="min-h-screen bg-background pb-24">
      <WizardHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        progress={progress}
        isSaving={isSaving}
        contentId={contentId}
        onBack={() => navigate("/szakertoi-studio")}
      />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {currentStep === 1 && <Step1Basics formData={formData} setFormData={setFormData} />}
        {currentStep === 2 && <Step2CoverImage formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <Step3Content formData={formData} setFormData={setFormData} />}
        {currentStep === 4 && <Step4Pricing formData={formData} setFormData={setFormData} />}
        {currentStep === 5 && (
          <Step5Preview
            formData={formData}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            isPublishing={isPublishing}
          />
        )}
      </div>

      {currentStep < totalSteps && (
        <WizardFooter
          currentStep={currentStep}
          onNext={handleNext}
          onBack={handleBack}
          canProceed={isStepValid(currentStep)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default WorkshopSecretWizard;

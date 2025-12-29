import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ListChecks,
  Plus,
  Trash2,
  Upload,
  X,
  Video,
  Image as ImageIcon,
  Loader2,
  Lightbulb,
  AlertTriangle,
  HardDrive,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WizardFormData, Milestone, FILE_LIMITS, validateImageFile, isYouTubeOrVimeo } from "../WorkshopSecretWizard";

// ============ Video Helper Functions ============

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getVimeoVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getVideoThumbnail = (url: string): { type: "youtube" | "vimeo" | null; thumbnailUrl: string | null; videoId: string | null } => {
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: "youtube",
      videoId: youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }
  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return { type: "vimeo", videoId: vimeoId, thumbnailUrl: null };
  }
  return { type: null, thumbnailUrl: null, videoId: null };
};

// ============ Video Preview Component ============

const VideoPreview = ({ url }: { url: string }) => {
  const { t } = useLanguage();
  const [vimeoThumbnail, setVimeoThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoInfo = getVideoThumbnail(url);

  useEffect(() => {
    const fetchVimeoThumbnail = async () => {
      const vimeoId = getVimeoVideoId(url);
      if (!vimeoId) return;

      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
        if (!response.ok) throw new Error("Vimeo API error");
        const data = await response.json();
        setVimeoThumbnail(data.thumbnail_url);
      } catch {
        setHasError(true);
        setVimeoThumbnail(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (url?.includes("vimeo.com")) {
      fetchVimeoThumbnail();
    } else {
      setVimeoThumbnail(null);
      setHasError(false);
    }
  }, [url]);

  // No valid video link
  if (!videoInfo.type) return null;

  // Loading state (Vimeo)
  if (isLoading) {
    return (
      <div className="mt-2 h-24 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (hasError && videoInfo.type === "vimeo") {
    return (
      <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {t("wizard.video_preview_error")}
        </p>
      </div>
    );
  }

  const thumbnailUrl = videoInfo.type === "youtube" ? videoInfo.thumbnailUrl : vimeoThumbnail;

  if (!thumbnailUrl) return null;

  return (
    <div className="mt-2 relative group">
      <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
        <img
          src={thumbnailUrl}
          alt="Video preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-black ml-1" />
          </div>
        </div>
        {/* Platform badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={`text-xs ${
              videoInfo.type === "youtube" ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <Video className="h-3 w-3 mr-1" />
            {videoInfo.type === "youtube" ? "YouTube" : "Vimeo"}
          </Badge>
        </div>
      </div>
      {/* Success message */}
      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        {t("wizard.video_link_recognized")}
      </p>
    </div>
  );
};

// ============ Main Component ============

interface Step3ContentProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
}

export const Step3Content = ({ formData, setFormData }: Step3ContentProps) => {
  const { t } = useLanguage();

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        {
          id: Date.now(),
          title: "",
          content: "",
          image_url: "",
          video_url: "",
          order: formData.milestones.length + 1,
        },
      ],
    });
  };

  const updateMilestone = (id: number, field: keyof Milestone, value: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const removeMilestone = (id: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((m) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <ListChecks className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("wizard.step3_title")}</h2>
        <p className="text-muted-foreground">{t("wizard.step3_subtitle")}</p>
      </div>

      {/* Milestones list */}
      <div className="space-y-4">
        {formData.milestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
            onUpdate={updateMilestone}
            onRemove={removeMilestone}
          />
        ))}

        {/* Add milestone button */}
        <button
          type="button"
          onClick={addMilestone}
          className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="h-5 w-5" />
          <span>{t("wizard.add_milestone")}</span>
        </button>
      </div>

      {/* Storage tips */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          {t("wizard.storage_tips")}
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t("wizard.cover_max")}: {FILE_LIMITS.COVER_IMAGE_MAX_MB}MB</li>
          <li>• {t("wizard.milestone_max")}: {FILE_LIMITS.MILESTONE_IMAGE_MAX_MB}MB</li>
          <li>• {t("wizard.video_external")}</li>
        </ul>
      </div>

      {/* Tip */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p className="text-sm text-primary flex items-start gap-2">
          <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{t("wizard.step3_tip")}</span>
        </p>
      </div>
    </div>
  );
};

// ============ Milestone Card ============

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  onUpdate: (id: number, field: keyof Milestone, value: string) => void;
  onRemove: (id: number) => void;
}

const MilestoneCard = ({ milestone, index, onUpdate, onRemove }: MilestoneCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleMilestoneImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, FILE_LIMITS.MILESTONE_IMAGE_MAX_MB);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/milestone-${milestone.id}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("content-images").upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(fileName);

      onUpdate(milestone.id, "image_url", urlData.publicUrl);
      toast.success(t("wizard.image_uploaded"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("wizard.image_upload_error"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-start gap-3">
        {/* Order number */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold">{index + 1}</span>
        </div>

        <div className="flex-1 space-y-3">
          {/* Milestone title */}
          <Input
            value={milestone.title}
            onChange={(e) => onUpdate(milestone.id, "title", e.target.value)}
            placeholder={t("wizard.milestone_title_placeholder")}
            className="bg-background border-border"
          />

          {/* Milestone content */}
          <Textarea
            value={milestone.content}
            onChange={(e) => onUpdate(milestone.id, "content", e.target.value)}
            placeholder={t("wizard.milestone_content_placeholder")}
            className="bg-background border-border min-h-[100px]"
          />

          {/* Media section */}
          <div className="space-y-3 p-3 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium text-muted-foreground">{t("wizard.media_optional")}</p>

            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {t("wizard.milestone_image")}
              </Label>

              {milestone.image_url ? (
                <div className="relative">
                  <img
                    src={milestone.image_url}
                    alt="Milestone"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate(milestone.id, "image_url", "")}
                    className="absolute top-2 right-2 p-1 bg-destructive/80 rounded-full hover:bg-destructive"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2 text-muted-foreground transition-colors">
                    {isUploadingImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">Max {FILE_LIMITS.MILESTONE_IMAGE_MAX_MB}MB</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMilestoneImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              )}
            </div>

            {/* Separator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>{t("wizard.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Video className="h-3 w-3" />
                {t("wizard.milestone_video")}
              </Label>
              <Input
                value={milestone.video_url}
                onChange={(e) => onUpdate(milestone.id, "video_url", e.target.value)}
                placeholder="YouTube vagy Vimeo link"
                className="bg-card border-border text-sm"
              />

              {/* Video Preview */}
              {milestone.video_url && isYouTubeOrVimeo(milestone.video_url) && (
                <VideoPreview url={milestone.video_url} />
              )}

              {milestone.video_url && !isYouTubeOrVimeo(milestone.video_url) && (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-500 flex items-start gap-1">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{t("wizard.video_warning")}</span>
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">💡 {t("wizard.video_tip")}</p>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onRemove(milestone.id)}
          className="p-2 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
};
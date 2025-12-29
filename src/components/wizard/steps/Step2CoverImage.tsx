import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, Trash2, Loader2, Lightbulb } from "lucide-react";
import { WizardFormData, FILE_LIMITS, validateImageFile } from "../WorkshopSecretWizard";

interface Step2CoverImageProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
}

const stockImages = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
  "https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&q=80",
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
];

export const Step2CoverImage = ({ formData, setFormData }: Step2CoverImageProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, FILE_LIMITS.COVER_IMAGE_MAX_MB);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("content-images").upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(fileName);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      toast.success(t("wizard.image_uploaded"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("wizard.image_upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("wizard.step2_title")}</h2>
        <p className="text-muted-foreground">{t("wizard.step2_subtitle")}</p>
      </div>

      {/* Image uploader */}
      <div className="space-y-4">
        {formData.image_url ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary">
            <img
              src={formData.image_url}
              alt="Borítókép"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setFormData({ ...formData, image_url: "" })}
              className="absolute top-3 right-3 p-2 bg-destructive/80 rounded-full hover:bg-destructive transition-colors"
            >
              <Trash2 className="h-5 w-5 text-destructive-foreground" />
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="aspect-video rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{t("wizard.upload_image")}</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WebP • <span className="text-primary">Max {FILE_LIMITS.COVER_IMAGE_MAX_MB}MB</span> • 16:9
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}

        {/* Stock images */}
        {!formData.image_url && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("wizard.or_choose_stock")}</p>
            <div className="grid grid-cols-3 gap-2">
              {stockImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: url.replace("w=400", "w=800") })}
                  className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                >
                  <img src={url} alt={`Stock ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <p className="text-sm text-primary flex items-start gap-2">
          <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{t("wizard.step2_tip")}</span>
        </p>
      </div>
    </div>
  );
};

import { useRef, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Video, Image, X, Camera, FileVideo, FileImage } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { ProgramFormData } from "../ProgramCreatorWizard";

interface Step1MediaProps {
  formData: ProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProgramFormData>>;
}

const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Generate a thumbnail from a video file by capturing the first frame.
 * Returns a Blob of the thumbnail image (JPEG).
 */
const generateVideoThumbnail = (videoFile: File): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    video.onloadeddata = () => {
      // Seek to 1 second (or 0 if very short)
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(blob);
          }, 'image/jpeg', 0.85);
        } else {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    // Timeout fallback after 10 seconds
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    }, 10000);
  });
};

const Step1Media = ({ formData, setFormData }: Step1MediaProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!isVideo && !isImage) {
      toast.error(t("program_creator.invalid_format"));
      return;
    }

    if (file.size > maxSize) {
      toast.error(t("program_creator.file_too_large"));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      mediaFile: file,
      mediaUrl: previewUrl,
      mediaType: isVideo ? "video" : "image",
      thumbnailFile: null,
      thumbnailUrl: "",
    }));

    // Generate thumbnail for videos (runs async in background)
    if (isVideo) {
      toast.info(t("program_creator.generating_thumbnail") || "Borítókép generálása...", { duration: 3000 });
      const thumbnail = await generateVideoThumbnail(file);
      if (thumbnail) {
        setFormData(prev => ({
          ...prev,
          thumbnailFile: thumbnail,
          thumbnailUrl: URL.createObjectURL(thumbnail),
        }));
        toast.success(t("program_creator.thumbnail_generated") || "Borítókép létrehozva!");
      }
    }

    toast.success(isVideo ? t("program_creator.video_added") : t("program_creator.photo_added"));
  }, [setFormData, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const removeMedia = () => {
    if (formData.mediaUrl && formData.mediaFile) {
      URL.revokeObjectURL(formData.mediaUrl);
    }
    setFormData(prev => ({
      ...prev,
      mediaFile: null,
      mediaUrl: "",
      mediaType: null,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("program_creator.step_media")}
        </h2>
        <p className="text-muted-foreground">
          {t("program_creator.media_subtitle")}
        </p>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/mov,video/quicktime,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {formData.mediaUrl ? (
        // Media Preview
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              {formData.mediaType === "video" ? (
                <video
                  src={formData.mediaUrl}
                  className="w-full aspect-video object-cover"
                  controls
                />
              ) : (
                <img
                  src={formData.mediaUrl}
                  alt="Preview"
                  className="w-full aspect-video object-cover"
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-lg"
                onClick={removeMedia}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                {formData.mediaType === "video" ? (
                  <FileVideo className="w-4 h-4" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
                {formData.mediaFile?.name || t("program_creator.uploaded_media")}
              </div>
            </CardContent>
          </Card>

          {/* Show auto-generated thumbnail for video uploads */}
          {formData.mediaType === "video" && formData.thumbnailUrl && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">
                {t("program_creator.cover_image") || "Borítókép (automatikus)"}
              </p>
              <img
                src={formData.thumbnailUrl}
                alt="Video thumbnail"
                className="w-48 aspect-video object-cover rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("program_creator.cover_image_hint") || "Ez a kép jelenik meg a piactéren."}
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("program_creator.change_media_hint")}
          </p>
        </motion.div>
      ) : (
        // Upload Dropzone
        <div
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${isDragging 
              ? "border-blue-500 bg-blue-500/10" 
              : "border-blue-300 hover:border-blue-500 hover:bg-blue-500/5"
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/20 flex items-center justify-center">
              <Upload className="w-10 h-10 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                {t("program_creator.drag_media")}
              </p>
              <p className="text-sm text-muted-foreground">
                MP4, MOV, JPG, PNG, WEBP
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Action Buttons for Mobile */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => videoInputRef.current?.click()}
          className="h-16 flex flex-col items-center justify-center gap-2 border-red-300 hover:border-red-500 hover:bg-red-500/10"
        >
          <Video className="w-6 h-6 text-red-500" />
          <span className="text-sm">{t("program_creator.record_video")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => photoInputRef.current?.click()}
          className="h-16 flex flex-col items-center justify-center gap-2 border-blue-300 hover:border-blue-500 hover:bg-blue-500/10"
        >
          <Camera className="w-6 h-6 text-blue-500" />
          <span className="text-sm">{t("program_creator.take_photo")}</span>
        </Button>
      </div>

      {/* File Size Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          {t("program_creator.file_limits")}
        </p>
      </div>
    </div>
  );
};

export default Step1Media;

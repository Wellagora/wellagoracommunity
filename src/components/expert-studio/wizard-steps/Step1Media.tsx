import { useRef, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Video, Image, X, Camera, FileVideo, FileImage, Link as LinkIcon, RefreshCw } from "lucide-react";
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

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    }, 10000);
  });
};

const Step1Media = ({ formData, setFormData }: Step1MediaProps) => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoLinkInput, setVideoLinkInput] = useState(formData.videoUrl || "");
  const [showUploadOptions, setShowUploadOptions] = useState(!formData.mediaUrl);

  const handleFileSelect = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!isVideo && !isImage) {
      toast.error(language === 'hu'
        ? "Nem támogatott formátum. Használj MP4, MOV, JPG, PNG vagy WEBP fájlt."
        : "Unsupported format. Use MP4, MOV, JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > maxSize) {
      toast.error(language === 'hu'
        ? `A fájl túl nagy! Maximum: ${isVideo ? '250' : '10'} MB`
        : `File too large! Maximum: ${isVideo ? '250' : '10'} MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      mediaFile: file,
      mediaUrl: previewUrl,
      mediaType: isVideo ? "video" : "image",
      thumbnailFile: null,
      thumbnailUrl: "",
    }));
    setShowUploadOptions(false);

    // Generate thumbnail for videos
    if (isVideo) {
      toast.info(language === 'hu' ? "Borítókép generálása..." : "Generating thumbnail...", { duration: 3000 });
      const thumbnail = await generateVideoThumbnail(file);
      if (thumbnail) {
        setFormData(prev => ({
          ...prev,
          thumbnailFile: thumbnail,
          thumbnailUrl: URL.createObjectURL(thumbnail),
        }));
        toast.success(language === 'hu' ? "Borítókép létrehozva!" : "Thumbnail created!");
      }
    }

    toast.success(isVideo
      ? (language === 'hu' ? "Videó hozzáadva!" : "Video added!")
      : (language === 'hu' ? "Kép hozzáadva!" : "Image added!"));
  }, [setFormData, language]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
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
    if (file) await handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
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
      thumbnailFile: null,
      thumbnailUrl: "",
    }));
    setShowUploadOptions(true);
  };

  const handleVideoLinkSave = () => {
    const url = videoLinkInput.trim();
    if (!url) return;

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error(language === 'hu' ? "Érvényes URL-t adj meg (https://...)" : "Enter a valid URL (https://...)");
      return;
    }

    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      contentType: 'recorded',
      // If no image media uploaded, set mediaType for display
      ...(prev.mediaUrl ? {} : { mediaUrl: '', mediaType: 'video' as const }),
    }));
    toast.success(language === 'hu' ? "Videó link mentve!" : "Video link saved!");
  };

  // Check if current media is a blob URL that won't display correctly
  const hasValidMedia = formData.mediaUrl && !formData.mediaUrl.startsWith('blob:') || formData.mediaFile;
  const displayUrl = formData.mediaUrl?.startsWith('blob:') && !formData.mediaFile ? '' : formData.mediaUrl;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'hu' ? 'Média' : 'Media'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'hu'
            ? 'Tölts fel borítóképet, videót, vagy adj meg egy videó linket'
            : 'Upload a cover image, video, or add a video link'}
        </p>
      </div>

      {/* Hidden File Input — accepts ALL common formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,image/jpeg,image/png,image/webp,image/gif,.mp4,.mov,.webm,.avi,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Current Media Preview (if exists) */}
      {displayUrl && !showUploadOptions ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              {formData.mediaType === "video" ? (
                <video
                  src={displayUrl}
                  className="w-full aspect-video object-cover"
                  controls
                />
              ) : (
                <img
                  src={displayUrl}
                  alt="Preview"
                  className="w-full aspect-video object-cover"
                />
              )}
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full shadow-lg bg-white/90 hover:bg-white"
                  onClick={() => setShowUploadOptions(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {language === 'hu' ? 'Csere' : 'Change'}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full shadow-lg"
                  onClick={removeMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {formData.mediaFile && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                  {formData.mediaType === "video" ? <FileVideo className="w-4 h-4" /> : <FileImage className="w-4 h-4" />}
                  {formData.mediaFile.name}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thumbnail preview for videos */}
          {formData.mediaType === "video" && formData.thumbnailUrl && (
            formData.thumbnailUrl.startsWith('blob:') ||
            /(_thumb\.(jpg|jpeg|png|webp))|(\.(jpg|jpeg|png|webp)(\?|$))/i.test(formData.thumbnailUrl)
          ) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">
                {language === 'hu' ? 'Borítókép (automatikusan generált)' : 'Cover image (auto-generated)'}
              </p>
              <img
                src={formData.thumbnailUrl}
                alt="Video thumbnail"
                className="w-48 aspect-video object-cover rounded-lg border border-border"
              />
            </div>
          )}
        </motion.div>
      ) : (
        /* Upload Area */
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/20 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {language === 'hu' ? 'Húzd ide a fájlt vagy kattints' : 'Drag file here or click'}
                </p>
                <p className="text-sm text-muted-foreground">
                  MP4, MOV, JPG, PNG, WEBP — max 250 MB videó, 10 MB kép
                </p>
              </div>
            </motion.div>
          </div>

          {/* Quick buttons row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-14 flex items-center justify-center gap-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <FileVideo className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">
                {language === 'hu' ? 'Fájl kiválasztása' : 'Choose file'}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById('video-link-input');
                el?.focus();
              }}
              className="h-14 flex items-center justify-center gap-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            >
              <LinkIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">
                {language === 'hu' ? 'Link megadása' : 'Add link'}
              </span>
            </Button>
          </div>

          {/* If editing and had media, show back button */}
          {formData.mediaUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadOptions(false)}
              className="mx-auto block text-muted-foreground"
            >
              {language === 'hu' ? '← Vissza a jelenlegi médiához' : '← Back to current media'}
            </Button>
          )}
        </div>
      )}

      {/* Video Link Section — always visible */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/30 to-purple-50/30">
        <CardContent className="p-5">
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-purple-500" />
            {language === 'hu' ? 'Videó link (YouTube, Vimeo, vagy közvetlen URL)' : 'Video link (YouTube, Vimeo, or direct URL)'}
          </Label>
          <div className="flex gap-2">
            <Input
              id="video-link-input"
              type="url"
              value={videoLinkInput}
              onChange={(e) => setVideoLinkInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=... vagy https://vimeo.com/..."
              className="flex-1"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleVideoLinkSave}
              disabled={!videoLinkInput.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {language === 'hu' ? 'Mentés' : 'Save'}
            </Button>
          </div>
          {formData.videoUrl && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              ✓ {language === 'hu' ? 'Videó link mentve' : 'Video link saved'}: {formData.videoUrl.substring(0, 60)}...
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'hu'
              ? 'A videó link a programba beágyazva jelenik meg. Borítóképet fájl feltöltéssel adhatsz hozzá.'
              : 'The video link will be embedded in the program. Upload a file for the cover image.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step1Media;

import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Video, Camera, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface QuickActionBarProps {
  onVideoCapture: (file: File) => void;
  onPhotoCapture: (file: File) => void;
  uploading?: boolean;
}

const QuickActionBar = ({ onVideoCapture, onPhotoCapture, uploading = false }: QuickActionBarProps) => {
  const { t } = useLanguage();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error(t("expert_studio.file_too_large"));
        return;
      }
      onVideoCapture(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(t("expert_studio.file_too_large"));
        return;
      }
      onPhotoCapture(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-3 mb-8"
    >
      {/* Hidden inputs for camera/file access */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/mov,video/quicktime,video/*"
        capture="environment"
        className="hidden"
        onChange={handleVideoCapture}
        disabled={uploading}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
        disabled={uploading}
      />

      {/* Record Video Button */}
      <Button
        variant="outline"
        onClick={() => videoInputRef.current?.click()}
        disabled={uploading}
        className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/15 transition-all duration-300 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        ) : (
          <Video className="w-6 h-6 text-red-500" />
        )}
        <span className="text-sm font-medium text-foreground">
          {t("expert_studio.record_video")}
        </span>
      </Button>

      {/* Upload Photo Button */}
      <Button
        variant="outline"
        onClick={() => photoInputRef.current?.click()}
        disabled={uploading}
        className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 transition-all duration-300 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-blue-500" />
        )}
        <span className="text-sm font-medium text-foreground">
          {t("expert_studio.upload_photo")}
        </span>
      </Button>

      {/* New Program Button */}
      <Link to="/szakertoi-studio/uj">
        <Button
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all duration-300"
        >
          <Plus className="w-6 h-6 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">
            {t("expert_studio.new_program")}
          </span>
        </Button>
      </Link>
    </motion.div>
  );
};

export default QuickActionBar;

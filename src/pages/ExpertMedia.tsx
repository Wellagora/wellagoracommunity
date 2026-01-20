import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import MediaLibrary from "@/components/expert-studio/MediaLibrary";
import QuickActionBar from "@/components/expert-studio/QuickActionBar";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { useExpertMedia, ExpertMedia as ExpertMediaType } from "@/hooks/useExpertMedia";
import { ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExpertMedia = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { 
    media, 
    loading: mediaLoading, 
    uploading, 
    analyzing,
    uploadMedia, 
    analyzeMedia,
    linkMediaToProgram,
    deleteMedia,
    dismissSuggestion
  } = useExpertMedia();

  const handleVideoCapture = async (file: File) => {
    await uploadMedia(file, 'video');
  };

  const handlePhotoCapture = async (file: File) => {
    await uploadMedia(file, 'image');
  };

  const handleConvertToProgram = (mediaItem: ExpertMediaType) => {
    const params = new URLSearchParams({
      mediaId: mediaItem.id,
      mediaUrl: mediaItem.file_url,
      mediaType: mediaItem.file_type,
    });
    navigate(`/szakertoi-studio/uj?${params.toString()}`);
  };

  if (loading) {
    return <ExpertStudioSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      title={t("expert_studio.media_library") || "Médiatár"}
      subtitle={t("expert.media_subtitle") || "Manage your photos and videos"}
      icon={ImageIcon}
      iconColor="text-amber-500"
    >
      <div className="space-y-6">
        <QuickActionBar 
          onVideoCapture={handleVideoCapture}
          onPhotoCapture={handlePhotoCapture}
          uploading={uploading}
        />
        
        <MediaLibrary
          media={media}
          loading={mediaLoading}
          analyzing={analyzing}
          onDelete={deleteMedia}
          onConvertToProgram={handleConvertToProgram}
          onAddToProgram={(mediaItem, programId) => linkMediaToProgram(mediaItem.id, programId)}
          onDismissSuggestion={dismissSuggestion}
          onAnalyze={analyzeMedia}
        />
      </div>
    </DashboardLayout>
  );
};

export default ExpertMedia;

import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Download, Lock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

// Utility functions for video detection
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getVimeoId = (url: string): string | null => {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const ProgramLearnPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fetch program
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check access
  const { data: accessStatus, isLoading: accessLoading } = useQuery({
    queryKey: ["contentAccess", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_content_access_status", {
        p_content_id: id,
        p_user_id: user?.id || null,
      });
      return data as {
        has_access: boolean;
        reason: string;
        access_level: string | null;
        price: number | null;
      };
    },
    enabled: !!id,
  });

  const renderContent = () => {
    if (!program?.content_url) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t("learning.no_content")}
          </h3>
          <p className="text-muted-foreground">
            {t("learning.no_content_description")}
          </p>
        </div>
      );
    }

    const contentUrl = program.content_url;
    const youtubeId = getYouTubeId(contentUrl);
    const vimeoId = getVimeoId(contentUrl);

    if (youtubeId) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={program.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (vimeoId) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={program.title}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Generic URL - show download/open button
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#0A1930] rounded-lg">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--cyan))]/20 flex items-center justify-center mb-6">
          <PlayCircle className="w-10 h-10 text-[hsl(var(--cyan))]" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {t("learning.external_content")}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {t("learning.external_content_description")}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => window.open(contentUrl, "_blank")}
            className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t("learning.open_content")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement("a");
              link.href = contentUrl;
              link.download = "";
              link.click();
            }}
            className="border-[hsl(var(--cyan))]/50 text-[hsl(var(--cyan))] hover:bg-[hsl(var(--cyan))]/10"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("learning.download")}
          </Button>
        </div>
      </div>
    );
  };

  if (programLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-[#0A1930]">
        <div className="flex">
          <div className="w-64 bg-[#112240] border-r border-[hsl(var(--cyan))]/10 min-h-screen p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // No access - redirect
  if (!accessStatus?.has_access) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("learning.access_denied")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("learning.access_denied_description")}
          </p>
          <Button onClick={() => navigate(`/programs/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("learning.back_to_program")}
          </Button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("program.not_found")}
          </h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("program.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-[#112240] border-r border-[hsl(var(--cyan))]/10 min-h-screen p-4 hidden md:block"
        >
          <h2 className="font-bold text-foreground text-lg mb-4 line-clamp-2">
            {program.title}
          </h2>
          <div className="space-y-2">
            <Link
              to={`/programs/${id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(var(--cyan))] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("learning.back_to_overview")}
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {/* Mobile back button */}
          <div className="md:hidden mb-4">
            <Link
              to={`/programs/${id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(var(--cyan))]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("learning.back_to_overview")}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title - visible on mobile */}
            <h1 className="text-2xl font-bold text-foreground mb-6 md:hidden">
              {program.title}
            </h1>

            {/* Content Player */}
            {renderContent()}

            {/* Description below player */}
            {program.description && (
              <div className="mt-8 bg-[#112240] rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  {t("learning.about_content")}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {program.description}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProgramLearnPage;

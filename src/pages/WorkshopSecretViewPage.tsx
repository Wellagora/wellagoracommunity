import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Gift,
  Building2,
  Wrench,
  ChevronDown,
  CheckCircle,
  Lightbulb,
  ZoomIn,
  Video,
  ExternalLink,
  Trophy,
  Lock,
  ShoppingCart,
  X,
  Play,
  ChevronRight,
} from "lucide-react";
import ExpertProfileModal from "@/components/creator/ExpertProfileModal";
import { VoucherSection } from "@/components/voucher/VoucherSection";
import { ExpertServicesSection } from "@/components/creator/ExpertServicesSection";

// Helper functions for video ID extraction
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

// Access check function
const checkAccess = async (
  contentId: string,
  userId: string
): Promise<{
  hasAccess: boolean;
  reason: "free" | "purchased" | "sponsored" | "no_access" | "no_licenses";
}> => {
  const { data: content } = await supabase
    .from("expert_contents")
    .select("access_type, total_licenses, used_licenses, creator_id")
    .eq("id", contentId)
    .single();

  if (!content) return { hasAccess: false, reason: "no_access" };

  // Creator always has access
  if (content.creator_id === userId) {
    return { hasAccess: true, reason: "free" };
  }

  // Free content - everyone has access
  if (content.access_type === "free") {
    return { hasAccess: true, reason: "free" };
  }

  // Check content_access table
  const { data: access } = await supabase
    .from("content_access")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (access) {
    return {
      hasAccess: true,
      reason: content.access_type === "sponsored" ? "sponsored" : "purchased",
    };
  }

  // Sponsored content - auto-grant if licenses available
  if (content.access_type === "sponsored") {
    const totalLicenses = content.total_licenses || 0;
    const usedLicenses = content.used_licenses || 0;
    
    if (usedLicenses < totalLicenses) {
      await supabase.from("content_access").insert({
        user_id: userId,
        content_id: contentId,
        access_type: "sponsored",
        amount_paid: 0,
      });

      await supabase
        .from("expert_contents")
        .update({ used_licenses: usedLicenses + 1 })
        .eq("id", contentId);

      return { hasAccess: true, reason: "sponsored" };
    } else {
      return { hasAccess: false, reason: "no_licenses" };
    }
  }

  return { hasAccess: false, reason: "no_access" };
};

// Workshop Header Component
const WorkshopHeader = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("workshop.back_to_marketplace")}
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

// Master Card Component
const MasterCard = ({ creator }: { creator: any }) => {
  const { t } = useLanguage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!creator) return null;

  return (
    <>
      <Card className="bg-card border-border p-5">
        {/* Clickable avatar and name */}
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-4 mb-4 w-full text-left hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-16 w-16 border-2 border-primary cursor-pointer">
            <AvatarImage src={creator.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {creator.first_name?.[0]}
              {creator.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-1">
              <Sparkles className="h-3 w-3 mr-1" />
              {t("workshop.your_master")}
            </Badge>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
              {creator.first_name} {creator.last_name}
            </h3>
            {creator.expert_title && (
              <p className="text-sm text-muted-foreground">{creator.expert_title}</p>
            )}
          </div>
        </button>
        
        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {creator.bio}
          </p>
        )}

        {/* "View full profile" link */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
        >
          {t('workshop.view_full_profile')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Profile Modal */}
      <ExpertProfileModal
        expertId={creator.id}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

// Sponsor Card Component
const SponsorCard = ({ sponsor }: { sponsor: any }) => {
  const { t } = useLanguage();

  if (!sponsor) return null;

  return (
    <Card className="bg-accent/10 border-accent/30 p-5">
      <div className="flex items-center gap-3 mb-3">
        <Gift className="h-5 w-5 text-accent" />
        <span className="text-sm font-medium text-accent">
          {t("workshop.sponsored_content")}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {sponsor.organization_logo_url ? (
          <img
            src={sponsor.organization_logo_url}
            alt={sponsor.organization_name}
            className="h-12 w-12 rounded-lg object-contain bg-white p-1"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">
            {t("workshop.made_free_by")}
          </p>
          <p className="font-semibold text-foreground">
            {sponsor.organization_name || t("workshop.anonymous_sponsor")}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Sponsor Banner Component
const SponsorBanner = ({ sponsorship, t }: { sponsorship: any; t: any }) => {
  const hasActiveSponsorship = sponsorship?.is_active && 
    (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);

  if (!sponsorship || !hasActiveSponsorship) return null;

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 flex items-center gap-4">
      {sponsorship.sponsor?.logo_url && (
        <img 
          src={sponsorship.sponsor.logo_url} 
          alt={sponsorship.sponsor.name}
          className="h-14 w-14 rounded-lg object-contain bg-white p-1" 
        />
      )}
      <div>
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
          <Gift className="h-3 w-3 mr-1" />
          {t('workshop.sponsored_content')}
        </Badge>
        <p className="font-bold text-green-700 mt-1">{sponsorship.sponsor?.name}</p>
        <p className="text-sm text-green-600">
          {t('workshop.made_free_by_sponsor').replace('{{name}}', sponsorship.sponsor?.name || '')}
        </p>
      </div>
    </div>
  );
};

// Workshop Hero Component
const WorkshopHero = ({ content, sponsorship, t }: { content: any; sponsorship: any; t: any }) => {
  if (!content) return null;

  return (
    <div className="mb-8">
      {content.image_url && (
        <div className="relative max-h-[400px] overflow-hidden rounded-xl mb-6">
          <img
            src={content.image_url}
            alt={content.title}
            className="w-full object-cover max-h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      
      {/* Sponsor Banner */}
      <SponsorBanner sponsorship={sponsorship} t={t} />
      
      <div className="space-y-4">
        <Badge className="bg-primary/20 text-primary border-primary/30">
          {content.category}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {content.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {content.description}
        </p>
      </div>
    </div>
  );
};

// Tools Section Component
const ToolsSection = ({ tools }: { tools: string }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const toolsList = tools
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);

  if (toolsList.length === 0) return null;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-left lg:cursor-default"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {t("workshop.tools_needed")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("workshop.tools_subtitle")}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground lg:hidden transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={`px-5 pb-5 ${isExpanded ? "block" : "hidden lg:block"}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {toolsList.map((tool, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted rounded-lg"
            >
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{tool}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Video Embed Component
const VideoEmbed = ({ url }: { url: string }) => {
  const youtubeId = getYouTubeVideoId(url);
  const vimeoId = getVimeoVideoId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&loop=1&playlist=${youtubeId}&controls=1`}
          title="Video"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&muted=1&loop=1`}
          title="Video"
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-4 bg-card rounded-xl hover:bg-muted transition-colors"
    >
      <Video className="h-5 w-5 text-primary" />
      <span>Videó megtekintése</span>
      <ExternalLink className="h-4 w-4 ml-auto" />
    </a>
  );
};

// Image Zoom Modal Component
const ImageZoomModal = ({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 z-10"
        >
          <X className="h-6 w-6 text-white" />
        </button>
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </DialogContent>
    </Dialog>
  );
};

// Milestone Card Component
const MilestoneCard = ({
  milestone,
  index,
  totalCount,
}: {
  milestone: any;
  index: number;
  totalCount: number;
}) => {
  const { t } = useLanguage();
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  return (
    <div className="relative">
      {/* Connecting line */}
      {index < totalCount - 1 && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent" />
      )}

      <Card className="bg-card border-0 shadow-lg overflow-hidden">
        {/* Step header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30">
              {index + 1}
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {milestone.title || `${t("workshop.step")} ${index + 1}`}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {milestone.content && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {milestone.content}
              </p>
            </div>
          )}

          {/* Image */}
          {milestone.image_url && (
            <div className="relative">
              <img
                src={milestone.image_url}
                alt={milestone.title}
                className="w-full rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
                onClick={() => setIsImageZoomed(true)}
              />
              <button
                onClick={() => setIsImageZoomed(true)}
                className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-lg hover:bg-black/70"
              >
                <ZoomIn className="h-5 w-5 text-white" />
              </button>
            </div>
          )}

          {/* Video */}
          {milestone.video_url && <VideoEmbed url={milestone.video_url} />}

          {/* Master Tip */}
          {milestone.tip && (
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-xl" />
              <div className="relative p-5 bg-gradient-to-r from-accent/10 to-accent/5 border-2 border-accent rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-accent mb-1">
                      {t("workshop.master_tip")}
                    </h4>
                    <p className="text-foreground font-medium">
                      {milestone.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {isImageZoomed && milestone.image_url && (
        <ImageZoomModal
          src={milestone.image_url}
          alt={milestone.title}
          onClose={() => setIsImageZoomed(false)}
        />
      )}
    </div>
  );
};

// Completion Section Component
const CompletionSection = ({ creatorName }: { creatorName: string }) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 p-8 mt-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <Trophy className="h-10 w-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold mb-3">
        {t("workshop.completion_title")}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {t("workshop.completion_message").replace("{{name}}", creatorName)}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("workshop.back_to_marketplace")}
        </Button>
      </div>
    </Card>
  );
};

// Access Denied View Component
const AccessDeniedView = ({
  reason,
  contentId,
}: {
  reason: string;
  contentId: string | undefined;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-border p-8 max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-3">
          {reason === "no_licenses"
            ? t("workshop.no_licenses_title")
            : t("workshop.access_denied_title")}
        </h2>
        <p className="text-muted-foreground mb-6">
          {reason === "no_licenses"
            ? t("workshop.no_licenses_message")
            : t("workshop.access_denied_message")}
        </p>
        <div className="flex flex-col gap-3">
          {reason === "no_access" && contentId && (
            <Button
              onClick={() => navigate(`/piacer/${contentId}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("workshop.purchase_access")}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/piacer")}>
            {t("workshop.back_to_marketplace")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main Component
const WorkshopSecretViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessReason, setAccessReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sponsorship, setSponsorship] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!id || !user) return;

      setIsLoading(true);

      // Check access
      const accessResult = await checkAccess(id, user.id);
      setHasAccess(accessResult.hasAccess);
      setAccessReason(accessResult.reason);

      if (!accessResult.hasAccess) {
        setIsLoading(false);
        return;
      }

      // Load content with sponsorship data
      const { data: contentData } = await supabase
        .from("expert_contents")
        .select(
          `
          *,
          creator:profiles!creator_id(
            id, first_name, last_name, avatar_url, bio, location_city, expert_title
          ),
          sponsorship:content_sponsorships(
            id, total_licenses, used_licenses, is_active,
            sponsor:sponsors(id, name, logo_url)
          )
        `
        )
        .eq("id", id)
        .single();

      if (contentData) {
        setContent(contentData);
        
        // Set sponsorship info
        const activeSponsorship = contentData.sponsorship?.[0];
        setSponsorship(activeSponsorship);

        // Load milestones
        const { data: milestonesData } = await supabase
          .from("content_milestones")
          .select("*")
          .eq("content_id", id)
          .order("order_index", { ascending: true });

        setMilestones(milestonesData || []);
      }

      setIsLoading(false);
    };

    loadContent();
  }, [id, user]);

  const hasActiveSponsorship = sponsorship?.is_active && 
    (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);
  const remaining = sponsorship ? (sponsorship.total_licenses || 0) - (sponsorship.used_licenses || 0) : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return <AccessDeniedView reason={accessReason} contentId={id} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkshopHeader
        title={content?.title || ""}
        onBack={() => navigate("/piacer")}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sticky Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <MasterCard creator={content?.creator} />
              {sponsorship && hasActiveSponsorship && (
                <Card className="bg-green-500/10 border-green-500/30 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {t("workshop.sponsored_content")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {sponsorship.sponsor?.logo_url ? (
                      <img
                        src={sponsorship.sponsor.logo_url}
                        alt={sponsorship.sponsor.name}
                        className="h-12 w-12 rounded-lg object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("workshop.made_free_by")}
                      </p>
                      <p className="font-semibold text-foreground">
                        {sponsorship.sponsor?.name || t("workshop.anonymous_sponsor")}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              {/* Voucher Section */}
              <VoucherSection 
                contentId={id || ''} 
                hasAccess={hasAccess || false}
                creatorLocation={content?.creator?.location_city}
              />
              {/* Expert Services */}
              {content?.creator?.id && (
                <ExpertServicesSection expertId={content.creator.id} />
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 max-w-3xl">
            <WorkshopHero content={content} sponsorship={sponsorship} t={t} />

            {/* Mobile: Master, Sponsor, Voucher cards */}
            <div className="lg:hidden space-y-4 mb-8">
              <MasterCard creator={content?.creator} />
              {sponsorship && hasActiveSponsorship && (
                <SponsorBanner sponsorship={sponsorship} t={t} />
              )}
              <VoucherSection 
                contentId={id || ''} 
                hasAccess={hasAccess || false}
                creatorLocation={content?.creator?.location_city}
              />
              {content?.creator?.id && (
                <ExpertServicesSection expertId={content.creator.id} />
              )}
            </div>

            {/* Tools section */}
            {content?.tools_needed && (
              <ToolsSection tools={content.tools_needed} />
            )}

            {/* Milestones */}
            <div className="space-y-8 mt-8">
              {milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  totalCount={milestones.length}
                />
              ))}
            </div>

            {/* Completion section */}
            <CompletionSection
              creatorName={`${content?.creator?.first_name || ""} ${
                content?.creator?.last_name || ""
              }`}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default WorkshopSecretViewPage;

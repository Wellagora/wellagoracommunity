import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Star, 
  Plus, 
  Settings, 
  Eye,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpertContent {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  is_featured: boolean;
  price_huf: number | null;
  created_at: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
}

const CreatorDashboardPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Route guard - redirect if not creator
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (profile && profile.user_role !== "creator") {
      toast.error(t("creator.creators_only"));
      navigate("/dashboard");
    }
  }, [user, profile, navigate, t]);

  // Fetch creator's programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["creatorPrograms", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("*")
        .eq("creator_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ExpertContent[];
    },
    enabled: !!user && profile?.user_role === "creator",
  });

  // Determine content status
  const getContentStatus = (content: ExpertContent): "draft" | "pending" | "published" | "rejected" => {
    if (content.rejection_reason) return "rejected";
    if (content.is_published) return "published";
    if (content.reviewed_at === null && !content.is_published) return "pending";
    return "draft";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">{t("creator.status_draft")}</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">{t("creator.status_pending")}</Badge>;
      case "published":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">{t("creator.status_published")}</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">{t("creator.status_rejected")}</Badge>;
      default:
        return null;
    }
  };

  // Show payout banner if needed
  const showPayoutBanner = profile && 
    profile.stripe_onboarding_complete === false && 
    profile.payout_preference === null;

  // Prevent rendering if not creator
  if (!profile || profile.user_role !== "creator") {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-[#00E5FF] mx-auto mb-4 animate-pulse" />
          <p className="text-white/70">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30">
              <Sparkles className="h-6 w-6 text-[#00E5FF]" />
            </div>
            <h1 className="text-3xl font-bold text-white">{t("creator.studio")}</h1>
          </div>
          <p className="text-white/60">{t("creator.dashboard")}</p>
        </div>

        {/* Payout Banner */}
        {showPayoutBanner && (
          <Card className="mb-6 bg-gradient-to-r from-[#00E5FF]/10 to-[#00E5FF]/5 border-[#00E5FF]/30 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#00E5FF]" />
                <div>
                  <p className="font-medium text-white">{t("creator.setup_payout")}</p>
                  <p className="text-sm text-white/60">{t("creator.setup_payout_desc")}</p>
                </div>
              </div>
              <Button 
                asChild
                className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#0A1930] font-semibold"
              >
                <Link to="/profile">{t("creator.setup_button")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#112240] border-[#1E3A5F] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#00E5FF]/10">
                  <DollarSign className="h-6 w-6 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0 Ft</p>
                  <p className="text-sm text-white/60">{t("creator.stats_revenue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-[#1E3A5F] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#00E5FF]/10">
                  <Users className="h-6 w-6 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-white/60">{t("creator.stats_students")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-[#1E3A5F] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#00E5FF]/10">
                  <BookOpen className="h-6 w-6 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{programs?.length ?? 0}</p>
                  <p className="text-sm text-white/60">{t("creator.stats_programs")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-[#1E3A5F] backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#00E5FF]/10">
                  <Star className="h-6 w-6 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0.0</p>
                  <p className="text-sm text-white/60">{t("creator.stats_rating")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            className="h-auto py-4 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00E5FF]/90 hover:to-[#00B8D4]/90 text-[#0A1930] font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("creator.new_program")}
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            className="h-auto py-4 border-[#1E3A5F] bg-[#112240] hover:bg-[#1E3A5F] text-white"
          >
            <Link to="/profile">
              <Settings className="h-5 w-5 mr-2" />
              {t("creator.profile_settings")}
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 border-[#1E3A5F] bg-[#112240] hover:bg-[#1E3A5F] text-white"
          >
            <Eye className="h-5 w-5 mr-2" />
            {t("creator.view_preview")}
          </Button>
        </div>

        {/* Programs Section */}
        <Card className="bg-[#112240] border-[#1E3A5F] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00E5FF]" />
              {t("creator.my_programs")}
            </CardTitle>
            <CardDescription className="text-white/60">
              {t("creator.dashboard")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-[#0A1930]/50">
                    <Skeleton className="h-12 w-12 rounded-lg bg-[#1E3A5F]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-[#1E3A5F]" />
                      <Skeleton className="h-3 w-2/3 bg-[#1E3A5F]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !programs || programs.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-[#00E5FF]/10 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#00E5FF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t("creator.empty_title")}</h3>
                <p className="text-white/60 mb-6">{t("creator.empty_desc")}</p>
                <Button className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00E5FF]/90 hover:to-[#00B8D4]/90 text-[#0A1930] font-semibold">
                  <Plus className="h-5 w-5 mr-2" />
                  {t("creator.first_program")}
                </Button>
              </div>
            ) : (
              /* Programs List */
              <div className="space-y-4">
                <TooltipProvider>
                  {programs.map((program) => {
                    const status = getContentStatus(program);
                    return (
                      <div 
                        key={program.id} 
                        className="flex items-center gap-4 p-4 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930] transition-colors border border-transparent hover:border-[#00E5FF]/20"
                      >
                        <div className="p-3 rounded-lg bg-[#00E5FF]/10">
                          {status === "published" ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : status === "pending" ? (
                            <Clock className="h-6 w-6 text-orange-400" />
                          ) : status === "rejected" ? (
                            <XCircle className="h-6 w-6 text-red-400" />
                          ) : (
                            <FileText className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">{program.title}</h4>
                            {program.is_featured && (
                              <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                            )}
                          </div>
                          <p className="text-sm text-white/60 truncate">{program.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(status)}
                          {status === "rejected" && program.rejection_reason && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#112240] border-[#1E3A5F] text-white max-w-xs">
                                <p className="text-xs font-medium mb-1">{t("creator.rejection_reason")}:</p>
                                <p className="text-xs text-white/80">{program.rejection_reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
                          >
                            {t("creator.edit_program")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </TooltipProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorDashboardPage;

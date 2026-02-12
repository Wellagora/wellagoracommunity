import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  User,
  BookOpen,
  Calendar,
  Crown,
  ShoppingCart,
  Sparkles,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";
import StarRating from "@/components/reviews/StarRating";
import GracefulPlaceholder from "@/components/GracefulPlaceholder";
import SEOHead from "@/components/SEOHead";
import { useShareTracking } from "@/hooks/useShareTracking";

const CreatorPublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();

  const dateLocales = { hu, en: enUS, de };

  // Track UTM-based share clicks
  useShareTracking({ expertId: id });

  // Fetch creator profile with all localized fields - use maybeSingle to avoid errors
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["creatorProfile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar_url, bio, bio_en, bio_de, expert_title, expert_title_en, expert_title_de, expert_bio_long, expertise_areas, is_verified_expert, created_at, location_city, social_links, references_links"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch creator's programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["creatorPrograms", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("*, category, title_en, title_de, description_en, description_de")
        .eq("creator_id", id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch total students count (from content_access)
  const { data: totalMembers } = useQuery({
    queryKey: ["creatorMembers", id],
    queryFn: async () => {
      if (!programs || programs.length === 0) return 0;
      const programIds = programs.map(p => p.id);
      const { count, error } = await supabase
        .from("content_access")
        .select("*", { count: "exact", head: true })
        .in("content_id", programIds);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!programs && programs.length > 0,
  });

  // Fetch average ratings for programs
  const { data: programRatings } = useQuery({
    queryKey: ["creatorProgramRatings", id, programs?.map((p) => p.id)],
    queryFn: async () => {
      if (!programs) return {};
      const ratings: Record<string, { avg: number; count: number }> = {};
      for (const program of programs) {
        const { data: reviews } = await supabase
          .from("content_reviews")
          .select("rating")
          .eq("content_id", program.id);
        
        if (reviews && reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          ratings[program.id] = {
            avg: sum / reviews.length,
            count: reviews.length,
          };
        }
      }
      return ratings;
    },
    enabled: !!programs && programs.length > 0,
  });

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
            {t("program.free_access")}
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            {t("common.registered")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("program.purchase")}
          </Badge>
        );
      case "sponsored":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {t("common.sponsor")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-8" />
          <Skeleton className="h-80 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-md max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("expert_profile.not_found")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("expert_profile.not_found_desc")}
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("program.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expertTitle = getLocalizedField(creator, 'expert_title');

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic OG meta tags for social sharing */}
      <SEOHead
        title={`${creator.first_name} ${creator.last_name} — ${expertTitle || t('common.expert')}`}
        description={getLocalizedField(creator, 'bio')?.substring(0, 155) || `${creator.first_name} ${creator.last_name} — WellAgora`}
        image={creator.avatar_url || undefined}
        url={`/szakertok/${creator.id}`}
        type="website"
      />

      {/* Hero Section with Blurred Background */}
      <div className="relative">
        {/* Blurred Background Cover */}
        <div 
          className="absolute inset-0 h-80 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-cyan-500/20"
          style={{
            backgroundImage: creator.avatar_url 
              ? `url(${creator.avatar_url})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) saturate(1.5)',
            opacity: 0.6,
          }}
        />
        <div className="absolute inset-0 h-80 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-foreground bg-white/80 backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("program.back")}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-12"
          >
            {/* 3D Circular Avatar */}
            <div className="relative mb-6">
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-emerald-500/40 blur-xl scale-110"
              />
              <Avatar 
                className="w-40 h-40 border-4 border-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] relative"
              >
                <AvatarImage 
                  src={creator.avatar_url || undefined} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white text-4xl font-bold">
                  {creator.first_name?.[0]}
                  {creator.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {creator.is_verified_expert && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Name and Title */}
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {creator.first_name} {creator.last_name}
            </h1>
            
            {expertTitle && (
              <p className="text-xl text-muted-foreground mb-3">
                {expertTitle}
              </p>
            )}

            {creator.location_city && (
              <div className="flex items-center gap-1 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{creator.location_city}</span>
              </div>
            )}

            {/* Expertise Areas */}
            {creator.expertise_areas && creator.expertise_areas.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {creator.expertise_areas.map((area: string) => (
                  <Badge
                    key={area}
                    className="bg-white/80 backdrop-blur-sm text-foreground border border-border/50 shadow-sm"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 -mt-8 relative z-20">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12"
        >
          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {programs?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("creator.program_count")}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {totalMembers || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("creator.total_students")}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold text-foreground">
                {format(new Date(creator.created_at), "yyyy", {
                  locale: dateLocales[language as keyof typeof dateLocales] || enUS,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("creator.member_since")}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 1: Mesterbemutatkozó (Bio) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t("expert_profile.bio_title")}
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap text-lg leading-relaxed">
                  {creator.expert_bio_long || getLocalizedField(creator, 'bio') || t("creator.no_bio")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2: Műhelytitkaim (Programs Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {t("expert_profile.my_secrets")}
          </h2>

          {programsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => {
                const rating = programRatings?.[program.id];
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link to={`/piacer/${program.id}`}>
                      <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                        <CardContent className="p-0">
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-emerald-500/10 relative overflow-hidden">
                            {program.thumbnail_url || program.image_url ? (
                              <img
                                src={program.thumbnail_url || program.image_url}
                                alt={getLocalizedField(program, 'title')}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {getLocalizedField(program, 'title')}
                            </h3>

                            {/* Rating */}
                            {rating && rating.count > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <StarRating rating={Math.round(rating.avg)} size="sm" />
                                <span className="text-sm text-muted-foreground">
                                  {rating.avg.toFixed(1)} ({rating.count})
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 flex-wrap">
                              {getAccessBadge(program.access_level || program.access_type)}
                              {program.category && (
                                <Badge
                                  variant="outline"
                                  className="border-border/50 text-muted-foreground"
                                >
                                  {program.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Beautiful Placeholder Card */
            <Card className="bg-gradient-to-br from-primary/5 via-emerald-500/5 to-cyan-500/5 border-dashed border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("expert_profile.coming_soon_title")}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t("expert_profile.coming_soon_desc")}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorPublicProfilePage;
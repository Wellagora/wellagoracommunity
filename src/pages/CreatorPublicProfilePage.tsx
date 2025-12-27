import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  BookOpen,
  Calendar,
  Crown,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";
import StarRating from "@/components/reviews/StarRating";

const CreatorPublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const dateLocales = { hu, en: enUS, de };

  // Fetch creator profile
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["creatorProfile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar_url, bio, expertise_areas, is_verified_expert, created_at"
        )
        .eq("id", id)
        .single();
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
        .select("*, category")
        .eq("creator_id", id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch total students count (from transactions)
  const { data: totalStudents } = useQuery({
    queryKey: ["creatorStudents", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", id);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!id,
  });

  // Fetch average ratings for programs
  const { data: programRatings } = useQuery({
    queryKey: ["creatorProgramRatings", id, programs?.map((p) => p.id)],
    queryFn: async () => {
      if (!programs) return {};
      const ratings: Record<string, { avg: number; count: number }> = {};
      for (const program of programs) {
        const [avgResult, countResult] = await Promise.all([
          supabase.rpc("get_content_average_rating", { p_content_id: program.id }),
          supabase.rpc("get_content_review_count", { p_content_id: program.id }),
        ]);
        ratings[program.id] = {
          avg: (avgResult.data as number) || 0,
          count: (countResult.data as number) || 0,
        };
      }
      return ratings;
    },
    enabled: !!programs && programs.length > 0,
  });

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {t("program.free_access")}
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {t("common.registered")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("program.purchase")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-[#0A1930]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-24 mb-8" />
          <div className="bg-[#112240] rounded-xl p-8">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("creator.not_found")}
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("program.back")}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="bg-[#112240] rounded-xl overflow-hidden mb-8">
            <div className="p-8">
              {/* Avatar and Name */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <Avatar className="w-24 h-24 border-4 border-[hsl(var(--cyan))]/30">
                  <AvatarImage src={creator.avatar_url || undefined} />
                  <AvatarFallback className="bg-[hsl(var(--cyan))]/20 text-[hsl(var(--cyan))] text-2xl">
                    {creator.first_name?.[0]}
                    {creator.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {creator.first_name} {creator.last_name}
                    </h1>
                    {creator.is_verified_expert && (
                      <CheckCircle2 className="w-6 h-6 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  {/* Expertise Areas */}
                  {creator.expertise_areas && creator.expertise_areas.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {creator.expertise_areas.map((area) => (
                        <Badge
                          key={area}
                          className="bg-[hsl(var(--cyan))]/20 text-[hsl(var(--cyan))] border-[hsl(var(--cyan))]/30"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#0A1930]/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-[hsl(var(--cyan))] mb-1">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {programs?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("creator.program_count")}
                  </div>
                </div>
                <div className="bg-[#0A1930]/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-[hsl(var(--cyan))] mb-1">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {totalStudents || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("creator.total_students")}
                  </div>
                </div>
                <div className="bg-[#0A1930]/50 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                  <div className="flex items-center justify-center gap-2 text-[hsl(var(--cyan))] mb-1">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {format(new Date(creator.created_at), "yyyy. MMMM", {
                      locale: dateLocales[language as keyof typeof dateLocales] || enUS,
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("creator.member_since")}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t("creator.about")}
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {creator.bio || t("creator.no_bio")}
                </p>
              </div>
            </div>
          </div>

          {/* Programs Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t("creator.all_programs")}
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
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/programs/${program.id}`}>
                        <Card className="bg-[#112240] border-[hsl(var(--cyan))]/10 hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--cyan))]/5 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--primary))]/10">
                              {program.thumbnail_url ? (
                                <img
                                  src={program.thumbnail_url}
                                  alt={program.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-4xl opacity-30">📚</div>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                {program.title}
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
                                {getAccessBadge(program.access_level)}
                                {program.category && (
                                  <Badge
                                    variant="outline"
                                    className="border-[hsl(var(--cyan))]/30 text-muted-foreground"
                                  >
                                    {program.category}
                                  </Badge>
                                )}
                                {program.access_level === "one_time_purchase" &&
                                  program.price_huf && (
                                    <span className="text-sm text-muted-foreground">
                                      {program.price_huf.toLocaleString()} Ft
                                    </span>
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
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>{t("creator.empty_title")}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorPublicProfilePage;

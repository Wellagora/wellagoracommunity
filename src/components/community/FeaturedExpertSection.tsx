import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Award, ArrowRight, Loader2 } from "lucide-react";

interface FeaturedExpert {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  expert_title: string | null;
  expert_title_en: string | null;
  expert_title_de: string | null;
  bio: string | null;
  bio_en: string | null;
  bio_de: string | null;
  location: string | null;
  programCount: number;
  avgRating: number;
}

// Demo featured expert
const DEMO_FEATURED_EXPERT: FeaturedExpert = {
  id: "demo-expert-featured",
  first_name: "Kovács",
  last_name: "István",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  expert_title: "Kemencés mester, hagyományőrző",
  expert_title_en: "Wood-fired oven master, tradition keeper",
  expert_title_de: "Holzofen-Meister, Traditionsbewahrer",
  bio: "Több mint 20 éve foglalkozom a hagyományos kemencés sütés művészetével. Célom, hogy átadjam ezt a tudást a következő generációknak.",
  bio_en: "I have been practicing the art of traditional wood-fired baking for over 20 years. My goal is to pass on this knowledge to the next generation.",
  bio_de: "Seit über 20 Jahren praktiziere ich die Kunst des traditionellen Holzofenbackens. Mein Ziel ist es, dieses Wissen an die nächste Generation weiterzugeben.",
  location: "Őriszentpéter",
  programCount: 8,
  avgRating: 4.9,
};

const FeaturedExpertSection = () => {
  const { t, language } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<FeaturedExpert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedExpert = async () => {
      if (isDemoMode) {
        setExpert(DEMO_FEATURED_EXPERT);
        setLoading(false);
        return;
      }

      try {
        // Fetch a verified expert with highest program count or rating
        const { data: experts } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url, expert_title, expert_title_en, expert_title_de, bio, bio_en, bio_de, location")
          .eq("user_role", "expert")
          .eq("is_verified_expert", true)
          .limit(10);

        if (experts && experts.length > 0) {
          // Get program counts for each expert
          const expertsWithStats = await Promise.all(
            experts.map(async (exp) => {
              const { count } = await supabase
                .from("expert_contents")
                .select("id", { count: "exact", head: true })
                .eq("creator_id", exp.id)
                .eq("is_published", true);

              const { data: reviews } = await supabase
                .from("content_reviews")
                .select("rating, content_id")
                .in(
                  "content_id",
                  (
                    await supabase
                      .from("expert_contents")
                      .select("id")
                      .eq("creator_id", exp.id)
                  ).data?.map((c) => c.id) || []
                );

              const avgRating =
                reviews && reviews.length > 0
                  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                  : 0;

              return {
                ...exp,
                programCount: count || 0,
                avgRating,
              };
            })
          );

          // Sort by rating then program count
          const sorted = expertsWithStats.sort(
            (a, b) => b.avgRating - a.avgRating || b.programCount - a.programCount
          );

          if (sorted[0]) {
            setExpert(sorted[0]);
          }
        }

        // Fallback to demo if no experts found
        if (!expert) {
          setExpert(DEMO_FEATURED_EXPERT);
        }
      } catch (error) {
        console.error("Error fetching featured expert:", error);
        setExpert(DEMO_FEATURED_EXPERT);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedExpert();
  }, [isDemoMode]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expert) return null;

  // Manual localization since FeaturedExpert type doesn't match LocalizedRecord
  const getLocalizedValue = (fieldBase: string): string => {
    const langSuffix = language === 'en' ? '_en' : language === 'de' ? '_de' : '';
    const langField = `${fieldBase}${langSuffix}` as keyof FeaturedExpert;
    const baseField = fieldBase as keyof FeaturedExpert;
    
    if (langSuffix && expert[langField]) {
      return expert[langField] as string;
    }
    return (expert[baseField] as string) || '';
  };

  const localizedTitle = getLocalizedValue('expert_title');
  const localizedBio = getLocalizedValue('bio');

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("community.featured_expert_title") || "A hónap szakértője"}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-amber-50 via-card to-orange-50 border-amber-200/50 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-28 h-28 md:w-32 md:h-32 ring-4 ring-amber-200 shadow-xl">
                  <AvatarImage src={expert.avatar_url || undefined} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-2xl font-bold">
                    {expert.first_name?.[0]}{expert.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0 shadow-md">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {expert.avgRating.toFixed(1)}
                </Badge>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {expert.first_name} {expert.last_name}
                </h3>
                <p className="text-amber-700 font-medium mb-2">
                  {localizedTitle}
                </p>
                {expert.location && (
                  <p className="text-sm text-muted-foreground mb-4">
                    📍 {expert.location}
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {localizedBio}
                </p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {expert.programCount} {t("community.programs_count") || "program"}
                  </Badge>
                  <Button
                    onClick={() => navigate(`/expert/${expert.id}`)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {t("community.view_profile") || "Profil megtekintése"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default FeaturedExpertSection;

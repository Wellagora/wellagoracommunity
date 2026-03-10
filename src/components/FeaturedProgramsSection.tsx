import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Crown, ShoppingCart, Gift, Leaf, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/lib/imageResolver";
import { VerifiedExpertBadge } from "@/components/marketplace/VerifiedExpertBadge";
import { ShareButton } from "@/components/ui/ShareButton";

// Category translations
const CATEGORY_LABELS: Record<string, { hu: string; en: string; de: string }> = {
  workshop: { hu: 'MŰHELY', en: 'WORKSHOP', de: 'WORKSHOP' },
  gastronomy: { hu: 'GASZTRONÓMIA', en: 'GASTRONOMY', de: 'GASTRONOMIE' },
  wellness: { hu: 'WELLNESS', en: 'WELLNESS', de: 'WELLNESS' },
  sustainability: { hu: 'FENNTARTHATÓSÁG', en: 'SUSTAINABILITY', de: 'NACHHALTIGKEIT' },
  community: { hu: 'KÖZÖSSÉG', en: 'COMMUNITY', de: 'GEMEINSCHAFT' },
  crafts: { hu: 'KÉZMŰVESSÉG', en: 'CRAFTS', de: 'KUNSTHANDWERK' },
  permaculture: { hu: 'PERMAKULTÚRA', en: 'PERMACULTURE', de: 'PERMAKULTUR' },
  education: { hu: 'OKTATÁS', en: 'EDUCATION', de: 'BILDUNG' },
  energy: { hu: 'ENERGIA', en: 'ENERGY', de: 'ENERGIE' },
  health: { hu: 'EGÉSZSÉG', en: 'HEALTH', de: 'GESUNDHEIT' },
};

const getCategoryLabel = (category: string, language: string): string => {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category.toUpperCase();
  return labels[language as keyof typeof labels] || labels.hu;
};

const ImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-muted">
    <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center shadow-sm border border-border/50">
      <Leaf className="w-8 h-8 text-muted-foreground" />
    </div>
  </div>
);

const FeaturedProgramsSection = () => {
  const { t, language } = useLanguage();

  // Fetch REAL published programs from Supabase
  const { data: featuredPrograms = [], isLoading } = useQuery({
    queryKey: ['featured-programs', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_contents')
        .select(`
          id,
          title,
          title_en,
          title_de,
          description,
          image_url,
          thumbnail_url,
          access_type,
          price_huf,
          is_sponsored,
          category,
          creator_id,
          profiles:creator_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        return [];
      }

      return (data || []).map((content: any) => {
        const localizedTitle = language === 'en' ? (content.title_en || content.title) :
                              language === 'de' ? (content.title_de || content.title) :
                              content.title;

        return {
          id: content.id,
          title: localizedTitle || '',
          image_url: resolveImageUrl(content.image_url),
          thumbnail_url: resolveImageUrl(content.thumbnail_url),
          access_type: content.access_type,
          price_huf: content.price_huf,
          is_sponsored: content.is_sponsored,
          category: content.category,
          creator: content.profiles ? {
            first_name: content.profiles.first_name,
            last_name: content.profiles.last_name,
            avatar_url: content.profiles.avatar_url,
          } : null,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const getAccessBadge = (program: {
    access_type: string | null;
    is_sponsored?: boolean | null;
    price_huf?: number | null;
  }) => {
    if (program.is_sponsored) {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
          <Gift className="w-3 h-3 mr-1" />
          {t("marketplace.free_via_sponsor")}
        </Badge>
      );
    }

    switch (program.access_type) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
            {t("program.free_access")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'PRÉMIUM' : 'Premium'}
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("program.purchase")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
            {t("program.free_access")}
          </Badge>
        );
    }
  };

  // Don't render if no real programs exist yet
  if (!isLoading && featuredPrograms.length === 0) return null;

  // Show loading skeleton
  if (isLoading) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("program.featured")}</h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPrograms.map((program: any, index: number) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
              >
                <Link to={`/piacer/${program.id}`} className="block group">
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:scale-[1.02]">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-black/[0.02] to-black/[0.06] overflow-hidden relative">
                        {program.thumbnail_url || program.image_url ? (
                          <img
                            src={program.thumbnail_url || program.image_url || ""}
                            alt={typeof program.title === "string" ? program.title : ""}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={program.thumbnail_url || program.image_url ? "hidden" : ""}>
                          <ImagePlaceholder />
                        </div>

                        {/* Featured badge */}
                        <div className="absolute top-4 left-4">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold tracking-wide uppercase shadow-lg shadow-amber-500/25"
                          >
                            <TrendingUp className="w-3 h-3" />
                            {language === 'hu' ? 'KIEMELT' : language === 'de' ? 'EMPFOHLEN' : 'FEATURED'}
                          </motion.span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Category */}
                        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40 mb-3 block">
                          {getCategoryLabel(program.category || 'workshop', language)}
                        </span>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                          {typeof program.title === "string" ? program.title : ""}
                        </h3>

                        {/* Expert */}
                        {program.creator && (
                          <div className="flex items-center gap-2 mt-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={program.creator.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-muted">
                                {program.creator.first_name?.[0]}{program.creator.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {program.creator.first_name} {program.creator.last_name}
                            </span>
                            <VerifiedExpertBadge size="sm" />
                          </div>
                        )}

                        {/* Access badge + Share */}
                        <div className="mt-4 flex items-center justify-between">
                          {getAccessBadge(program)}
                          <ShareButton
                            url={`/piacer/${program.id}`}
                            title={typeof program.title === "string" ? program.title : ""}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProgramsSection;

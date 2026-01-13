import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Crown, ShoppingCart, Gift, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PROGRAMS, getMockExpertById, getLocalizedExpertName, getLocalizedSponsorName, formatPriceByLanguage } from "@/data/mockData";

const ImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-muted">
    <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center shadow-sm border border-border/50">
      <Leaf className="w-8 h-8 text-muted-foreground" />
    </div>
  </div>
);

const FeaturedProgramsSection = () => {
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();

  // HARD ENFORCEMENT: featured section shows ONLY mock programs
  const featuredPrograms = MOCK_PROGRAMS
    .filter((p) => p.is_featured)
    .map((mp) => {
      const creator = getMockExpertById(mp.creator_id);
      const localizedCreatorName = creator ? getLocalizedExpertName(creator, language) : null;
      const localizedSponsorName = getLocalizedSponsorName(mp, language);

      return {
        id: mp.id,
        title: getLocalizedField(mp as unknown as Record<string, unknown>, "title"),
        thumbnail_url: mp.thumbnail_url,
        image_url: mp.image_url,
        access_level: mp.access_level,
        price_huf: mp.price_huf,
        is_sponsored: mp.is_sponsored,
        sponsor_name: localizedSponsorName,
        creator: creator && localizedCreatorName
          ? {
              id: creator.id,
              first_name: localizedCreatorName.firstName,
              last_name: localizedCreatorName.lastName,
              avatar_url: creator.avatar_url,
            }
          : null,
      };
    })
    .slice(0, 6);

  const getAccessBadge = (program: {
    access_level: string | null;
    is_sponsored?: boolean;
    sponsor_name?: string | null;
    price_huf?: number | null;
  }) => {
    const priceInfo = formatPriceByLanguage(program.price_huf || 0, language);
    const sponsorLabel = language === 'de' ? 'Gesponsert von' : language === 'en' ? 'Sponsored by' : 'Támogató';
    
    // SINGLE elegant badge for sponsored content
    if (program.is_sponsored && program.sponsor_name) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs font-medium">
            {sponsorLabel}: {program.sponsor_name}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{language === 'hu' ? '0 Ft' : '0 €'}</span>
            {program.price_huf && program.price_huf > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {priceInfo.originalPrice}
              </span>
            )}
          </div>
        </div>
      );
    }

    switch (program.access_level) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
            {t("program.free_access")}
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">
            {t("common.registered")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
            <Crown className="w-3 h-3 mr-1" />Premium
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("program.purchase")}
          </Badge>
        );
      case "sponsored":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            <Gift className="w-3 h-3 mr-1" />
            {t("marketplace.free_via_sponsor")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (featuredPrograms.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          {/* Header - Monochrome */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{t("program.featured")}</h2>
          </div>

          {/* Grid - Ultra Minimalist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPrograms.map((program, index) => (
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
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image with smooth zoom */}
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

                        {/* Featured star - Monochrome */}
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center">
                            <Star className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      </div>

                      {/* Ultra-Minimal Content */}
                      <div className="p-6">
                        {/* Category */}
                        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40 mb-3 block">
                          Featured
                        </span>
                        
                        {/* Title - Serif */}
                        <h3 className="font-serif text-xl font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                          {typeof program.title === "string" ? program.title : ""}
                        </h3>
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

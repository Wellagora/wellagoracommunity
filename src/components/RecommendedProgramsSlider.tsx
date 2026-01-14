import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Sparkles, Gift, ShoppingCart, BookOpen, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PROGRAMS, MOCK_EXPERTS, getLocalizedExpertName, getLocalizedSponsorName, formatPriceByLanguage } from "@/data/mockData";

const RecommendedProgramsSlider = () => {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // FORCE MOCK DATA ONLY - no database fallback for clean preview mode
  const programs = MOCK_PROGRAMS.map(p => {
    const creator = MOCK_EXPERTS.find(e => e.id === p.creator_id);
    const localizedCreatorName = creator ? getLocalizedExpertName(creator, language) : null;
    const localizedSponsorName = getLocalizedSponsorName(p, language);
    
    return {
      id: p.id,
      title: language === 'en' ? p.title_en : language === 'de' ? p.title_de : p.title,
      description: language === 'en' ? p.description_en : language === 'de' ? p.description_de : p.description,
      image_url: p.image_url,
      thumbnail_url: p.thumbnail_url,
      access_type: p.access_type,
      price_huf: p.price_huf,
      sponsor_name: localizedSponsorName,
      sponsor_logo_url: p.sponsor_logo_url,
      is_sponsored: p.is_sponsored,
      creator: localizedCreatorName && creator ? {
        first_name: localizedCreatorName.firstName,
        last_name: localizedCreatorName.lastName,
        avatar_url: creator.avatar_url
      } : null
    };
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getAccessBadge = (program: typeof programs[0]) => {
    const priceInfo = formatPriceByLanguage(program.price_huf || 0, language);
    const sponsorLabel = language === 'de' ? 'Gesponsert von' : language === 'en' ? 'Sponsored by' : 'Támogató';
    
    // SINGLE elegant badge for sponsored content - no redundant text
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
    
    // Paid content
    if (program.price_huf && program.price_huf > 0) {
      return (
        <Badge className="bg-slate-600 text-white border-0">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {priceInfo.price}
        </Badge>
      );
    }
    
    // Open content
    return (
      <Badge className="bg-blue-600 text-white border-0">
        {t("marketplace.open_content")}
      </Badge>
    );
  };

  // Placeholder for missing images
  const ImagePlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center shadow-sm border border-border/50">
        <Leaf className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  );

  if (!programs || programs.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-gradient-to-b from-background via-black/[0.01] to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
        >
          {/* Header - Monochrome */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{t("index.workshop_secrets_title")}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="glass"
                size="icon"
                onClick={() => scroll("left")}
                className="hidden md:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => scroll("right")}
                className="hidden md:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Link to="/piacer">
                <Button variant="outline" size="sm">
                  {t("index.view_all_secrets")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Horizontal scrolling - Ultra Minimalist Cards */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                className="w-[320px] flex-shrink-0 snap-start"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
              >
                <Link to={`/piacer/${program.id}`} className="block group">
                  <Card className="h-full overflow-hidden">
                    {/* Image with smooth zoom */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-black/[0.02] to-black/[0.06] relative overflow-hidden">
                      {program.image_url || program.thumbnail_url ? (
                        <img
                          src={program.image_url || program.thumbnail_url || ''}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={program.image_url || program.thumbnail_url ? 'hidden' : ''}>
                        <ImagePlaceholder />
                      </div>
                    </div>
                    
                    {/* Ultra-Minimal Content */}
                    <CardContent className="p-6">
                      {/* Category */}
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40 mb-3 block">
                        Workshop
                      </span>
                      
                      {/* Title - Serif */}
                      <h3 className="font-serif text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
                        {program.title}
                      </h3>
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

export default RecommendedProgramsSlider;

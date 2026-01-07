import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Sparkles, Gift, ShoppingCart, BookOpen, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PROGRAMS, MOCK_EXPERTS, getLocalizedExpertName, getLocalizedSponsorName } from "@/data/mockData";

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
    // Check for sponsored content - "Sponsored by: [Name]" logic
    if (program.is_sponsored && program.sponsor_name) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
            {t('marketplace.sponsored_by_label')}: {program.sponsor_name}
          </Badge>
          <Badge className="bg-primary text-white border-0 text-xs">
            <Gift className="w-3 h-3 mr-1" />
            {t('marketplace.free_via_sponsor')}
          </Badge>
          {program.price_huf && program.price_huf > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("marketplace.value_label")}: {program.price_huf.toLocaleString()} Ft
            </span>
          )}
        </div>
      );
    }
    
    // Paid content
    if (program.price_huf && program.price_huf > 0) {
      return (
        <Badge className="bg-slate-600 text-white border-0">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {program.price_huf.toLocaleString()} Ft
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
    <section className="py-12 bg-gradient-to-r from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("index.workshop_secrets_title")}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full hidden md:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full hidden md:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Link to="/piacer">
                <Button variant="ghost" className="gap-2">
                  {t("index.view_all_secrets")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Horizontal scrolling container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                className="w-[300px] flex-shrink-0 snap-start"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to={`/piacer/${program.id}`}>
                  <Card className="h-full bg-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 group overflow-hidden">
                    {/* Image with fallback placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                      {program.image_url || program.thumbnail_url ? (
                        <img
                          src={program.image_url || program.thumbnail_url || ''}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Hide the broken image and show placeholder
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={program.image_url || program.thumbnail_url ? 'hidden' : ''}>
                        <ImagePlaceholder />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {program.title}
                      </h3>
                      
                      {/* Expert Avatar + Name */}
                      {program.creator && (
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={program.creator.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {program.creator.first_name?.[0]}{program.creator.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {program.creator.first_name} {program.creator.last_name}
                          </span>
                        </div>
                      )}
                      
                      {/* Badge */}
                      <div className="flex items-center justify-between">
                        {getAccessBadge(program)}
                        <Button size="sm" variant="secondary" className="ml-2">
                          {t("common.view")}
                        </Button>
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

export default RecommendedProgramsSlider;

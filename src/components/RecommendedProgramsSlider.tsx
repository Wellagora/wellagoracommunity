import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl } from "@/lib/imageResolver";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Sparkles, Gift, ShoppingCart, BookOpen, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Program {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  access_type: string | null;
  price_huf: number | null;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  is_sponsored: boolean | null;
  category: string | null;
  creator: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

const RecommendedProgramsSlider = () => {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real published programs from database
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['recommended-programs', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_contents')
        .select(`
          id,
          title,
          title_en,
          title_de,
          description,
          description_en,
          description_de,
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
        .limit(8);
      
      if (error) {
        console.error('Error fetching programs:', error);
        return [];
      }
      
      // Map and localize the data
      return (data || []).map((content: any) => {
        const localizedTitle = language === 'en' ? (content.title_en || content.title) :
                              language === 'de' ? (content.title_de || content.title) :
                              content.title;
        const localizedDescription = language === 'en' ? (content.description_en || content.description) :
                                     language === 'de' ? (content.description_de || content.description) :
                                     content.description;
        
        return {
          id: content.id,
          title: localizedTitle || '',
          description: localizedDescription,
          image_url: resolveImageUrl(content.image_url),
          thumbnail_url: resolveImageUrl(content.thumbnail_url),
          access_type: content.access_type,
          price_huf: content.price_huf,
          sponsor_name: null,
          sponsor_logo_url: null,
          is_sponsored: content.is_sponsored,
          category: content.category,
          creator: content.profiles ? {
            first_name: content.profiles.first_name,
            last_name: content.profiles.last_name,
            avatar_url: content.profiles.avatar_url
          } : null
        } as Program;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  // Placeholder for missing images
  const ImagePlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center shadow-sm border border-border/50">
        <Leaf className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-10 bg-gradient-to-b from-background via-black/[0.01] to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[320px] h-[300px] rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!programs || programs.length === 0) {
    return (
      <section className="py-10 bg-gradient-to-b from-background via-black/[0.01] to-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("marketplace.no_programs")}
            </h3>
            <p className="text-muted-foreground">
              {t("marketplace.no_programs_desc")}
            </p>
          </div>
        </div>
      </section>
    );
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("index.workshop_secrets_title")}</h2>
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
                      {program.category && (
                        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/40 mb-3 block">
                          {t(`categories.${program.category}`)}
                        </span>
                      )}
                      
                      {/* Title - Serif */}
                      <h3 className="text-lg font-medium text-foreground leading-snug line-clamp-2 group-hover:text-black transition-colors duration-300">
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

import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Gift, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Sponsorship {
  id: string;
  total_licenses: number;
  used_licenses: number | null;
  is_active: boolean | null;
  sponsor: Sponsor | null;
}

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
  creator?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  sponsorship?: Sponsorship[] | null;
}

const WorkshopSecretsSlider = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ["workshopSecretsSlider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select(`
          id, title, description, image_url, thumbnail_url, access_type, price_huf,
          sponsor_name, sponsor_logo_url,
          creator:profiles!expert_contents_creator_id_fkey (
            first_name, last_name, avatar_url
          ),
          sponsorship:content_sponsorships(
            id, total_licenses, used_licenses, is_active,
            sponsor:sponsors(id, name, logo_url)
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Program[];
    },
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

  const getAccessBadge = (program: Program) => {
    const sponsorship = program.sponsorship?.[0];
    const hasActiveSponsorship = sponsorship?.is_active && 
      (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);
    
    // Támogatott tartalom - elsődleges prioritás
    if (hasActiveSponsorship) {
      return (
        <Badge className="bg-green-600 text-white border-0">
          <Gift className="w-3 h-3 mr-1" />
          {t("marketplace.supported")} • {sponsorship.sponsor?.name}
        </Badge>
      );
    }
    // Fizetős tartalom
    if (program.access_type === "paid" && program.price_huf && program.price_huf > 0) {
      return (
        <Badge className="bg-slate-800 text-white border-0">
          <ShoppingCart className="w-3 h-3 mr-1" />
          {program.price_huf.toLocaleString()} Ft
        </Badge>
      );
    }
    // Szabad hozzáférés (valóban ingyenes)
    return (
      <Badge className="bg-blue-600 text-white border-0">
        {t("marketplace.open_access")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("index.workshop_secrets_title")}</h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[300px] flex-shrink-0">
                <Card className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                      <img
                        src={program.image_url || program.thumbnail_url || 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=800&q=80'}
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=800&q=80';
                        }}
                      />
                      {/* Támogató overlay - csak ha aktív szponzoráció van */}
                      {(() => {
                        const sponsorship = program.sponsorship?.[0];
                        const hasActiveSponsorship = sponsorship?.is_active && 
                          (sponsorship.used_licenses || 0) < (sponsorship.total_licenses || 0);
                        
                        if (hasActiveSponsorship) {
                          return (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600 text-white rounded-full shadow-lg">
                              {sponsorship.sponsor?.logo_url ? (
                                <img
                                  src={sponsorship.sponsor.logo_url}
                                  alt={sponsorship.sponsor.name}
                                  className="h-5 w-5 rounded-full object-contain bg-white p-0.5"
                                />
                              ) : (
                                <Gift className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {t("marketplace.supported")}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {program.title}
                      </h3>
                      {program.creator && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {program.creator.first_name} {program.creator.last_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {getAccessBadge(program)}
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

export default WorkshopSecretsSlider;

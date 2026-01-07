import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Crown, ShoppingCart, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PROGRAMS, getMockExpertById } from "@/data/mockData";

const FeaturedProgramsSection = () => {
  const { t, language } = useLanguage();
  const { getLocalizedField } = useLocalizedContent();

  const { data: dbFeaturedPrograms, isLoading } = useQuery({
    queryKey: ['featuredPrograms'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expert_contents')
        .select(`
          id, title, title_en, title_de, image_url, thumbnail_url, access_level, price_huf,
          is_sponsored, sponsor_name,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url
          )
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(6);
      return data;
    },
  });

  // Get featured mock programs with localization
  const mockFeaturedPrograms = MOCK_PROGRAMS
    .filter(p => p.is_featured)
    .map(mp => {
      const creator = getMockExpertById(mp.creator_id);
      return {
        id: mp.id,
        title: getLocalizedField(mp as unknown as Record<string, unknown>, 'title'),
        image_url: mp.image_url,
        thumbnail_url: mp.thumbnail_url,
        access_level: mp.access_level,
        price_huf: mp.price_huf,
        is_sponsored: mp.is_sponsored,
        sponsor_name: mp.sponsor_name,
        creator: creator ? {
          id: creator.id,
          first_name: creator.first_name,
          last_name: creator.last_name,
          avatar_url: creator.avatar_url
        } : null
      };
    });

  // Combine - prioritize mock data for clean slate
  const featuredPrograms = [...mockFeaturedPrograms, ...(dbFeaturedPrograms || [])].slice(0, 6);

  const getAccessBadge = (program: { access_level: string | null; is_sponsored?: boolean; sponsor_name?: string | null; price_huf?: number | null }) => {
    if (program.is_sponsored && program.sponsor_name) {
      return (
        <div className="flex flex-col gap-0.5">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            <Gift className="w-3 h-3 mr-1" />
            {t('marketplace.free_via_sponsor')}
          </Badge>
          {program.price_huf && program.price_huf > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {t('marketplace.value_label')}: {program.price_huf.toLocaleString()} Ft
            </span>
          )}
        </div>
      );
    }
    switch (program.access_level) {
      case 'free':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">{t('program.free_access')}</Badge>;
      case 'registered':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">{t('common.registered')}</Badge>;
      case 'premium':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'one_time_purchase':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-xs"><ShoppingCart className="w-3 h-3 mr-1" />{t('program.purchase')}</Badge>;
      case 'sponsored':
        return <Badge className="bg-primary/20 text-primary border-primary/30 text-xs"><Gift className="w-3 h-3 mr-1" />{t('marketplace.free_via_sponsor')}</Badge>;
      default:
        return null;
    }
  };

  // Don't render if no featured programs
  if (!isLoading && featuredPrograms.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('program.featured')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl animate-pulse">
                <div className="aspect-video bg-muted rounded-t-xl" />
                <div className="p-4">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('program.featured')}</h2>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/piacer/${program.id}`}>
                  <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden group">
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden relative">
                        {program.thumbnail_url ? (
                          <img 
                            src={program.thumbnail_url} 
                            alt={typeof program.title === 'string' ? program.title : ''}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-5xl opacity-30">📚</div>
                          </div>
                        )}
                        {/* Featured Star Overlay */}
                        <div className="absolute top-3 right-3">
                          <div className="bg-amber-500/90 rounded-full p-1.5">
                            <Star className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {typeof program.title === 'string' ? program.title : ''}
                        </h3>
                        
                        {/* Creator */}
                        {program.creator && (
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-5 h-5 border border-white shadow-sm">
                              <AvatarImage src={program.creator.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {program.creator.first_name?.[0]}{program.creator.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {program.creator.first_name} {program.creator.last_name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {getAccessBadge(program)}
                          {program.access_level === 'one_time_purchase' && program.price_huf && (
                            <span className="text-sm font-medium text-primary">
                              {program.price_huf.toLocaleString()} Ft
                            </span>
                          )}
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

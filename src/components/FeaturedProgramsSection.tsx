import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedProgramsSection = () => {
  const { t } = useLanguage();

  const { data: featuredPrograms, isLoading } = useQuery({
    queryKey: ['featuredPrograms'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expert_contents')
        .select('id, title, image_url, thumbnail_url, access_level, price_huf')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(6);
      return data;
    },
  });

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case 'free':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">{t('program.free_access')}</Badge>;
      case 'registered':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">{t('common.registered')}</Badge>;
      case 'premium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'one_time_purchase':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"><ShoppingCart className="w-3 h-3 mr-1" />{t('program.purchase')}</Badge>;
      default:
        return null;
    }
  };

  // Don't render if no featured programs
  if (!isLoading && (!featuredPrograms || featuredPrograms.length === 0)) {
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
            {featuredPrograms?.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/programs/${program.id}`}>
                  <Card className="bg-card border-border/50 hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(var(--cyan))]/5 overflow-hidden group">
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--primary))]/10 overflow-hidden relative">
                        {program.thumbnail_url ? (
                          <img 
                            src={program.thumbnail_url} 
                            alt={program.title}
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
                        <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-[hsl(var(--cyan))] transition-colors">
                          {program.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          {getAccessBadge(program.access_level)}
                          {program.access_level === 'one_time_purchase' && program.price_huf && (
                            <span className="text-sm font-medium text-[hsl(var(--cyan))]">
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

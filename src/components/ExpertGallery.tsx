import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatarUrl } from "@/lib/imageResolver";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SmartTiltCard } from "@/components/ui/SmartTiltCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpertProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  expert_title: string | null;
  location: string | null;
  bio: string | null;
}

const ExpertGallery = () => {
  const { t, language } = useLanguage();

  // Fetch verified experts from Supabase
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ['experts-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, expert_title, location, bio')
        .or('user_role.eq.expert,user_role.eq.creator,is_verified_expert.eq.true')
        .limit(8);
      
      if (error) {
        console.error('Error fetching experts:', error);
        return [];
      }
      
      return (data || []) as ExpertProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-foreground/5" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>
          <div className="flex gap-4 justify-center">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[280px] h-[373px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no experts
  if (experts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30 relative overflow-hidden">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-foreground/5" />
      
      <div className="container mx-auto px-4">
        {/* Header - Editorial style */}
        <div className="text-center mb-8">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium"
          >
            {t('home.experts_subtitle')}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mt-4 tracking-tight"
          >
            {t('home.experts_title')}
          </motion.h2>
        </div>

        {/* Swipeable Carousel */}
        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {experts.map((expert) => (
                <CarouselItem key={expert.id} className="pl-4 basis-[280px] md:basis-[320px]">
                  <SmartTiltCard>
                    <Link 
                      to={`/szakertok/${expert.id}`} 
                      className="block group"
                    >
                      {/* Portrait Card - 3:4 Aspect Ratio */}
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                        {/* Full-bleed Photo */}
                        <img
                          src={resolveAvatarUrl(expert.avatar_url) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=533&fit=crop'}
                          alt={`${expert.first_name || ''} ${expert.last_name || ''}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Gradient Overlay - Dark to transparent at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Content Overlay at Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium mb-1">
                            {expert.location || t('roles.expert')}
                          </p>
                          <h3 className="text-xl font-serif font-semibold text-white leading-tight">
                            {expert.first_name} {expert.last_name}
                          </h3>
                          <p className="text-white/70 text-sm mt-2 line-clamp-2">
                            {expert.expert_title || expert.bio}
                          </p>
                        </div>

                        {/* Subtle hover border glow */}
                        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
                      </div>
                    </Link>
                  </SmartTiltCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows - Premium Black Style */}
            <CarouselPrevious className="hidden md:flex -left-12 bg-foreground text-background border-0 hover:bg-foreground/80 w-10 h-10" />
            <CarouselNext className="hidden md:flex -right-12 bg-foreground text-background border-0 hover:bg-foreground/80 w-10 h-10" />
          </Carousel>
          
          {/* Mobile scroll hint */}
          <p className="text-center text-xs text-muted-foreground mt-4 md:hidden uppercase tracking-widest">
            ← Swipe →
          </p>
        </div>

        {/* View All Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link 
            to="/piacer" 
            className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground text-sm uppercase tracking-[0.2em] font-medium transition-colors group"
          >
            <span>{t('home.view_all')}</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
      
      {/* Ultra-thin bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-foreground/5" />
    </section>
  );
};

export default ExpertGallery;

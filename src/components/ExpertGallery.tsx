import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Expert {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  expert_title: string | null;
  expert_title_en: string | null;
  expert_title_de: string | null;
  location_city: string | null;
  is_verified_expert: boolean | null;
}

// Placeholder experts for when no real data exists
const placeholderExperts: Expert[] = [
  { id: 'placeholder-1', first_name: 'Hamarosan', last_name: '', avatar_url: null, expert_title: null, expert_title_en: null, expert_title_de: null, location_city: null, is_verified_expert: false },
  { id: 'placeholder-2', first_name: 'Hamarosan', last_name: '', avatar_url: null, expert_title: null, expert_title_en: null, expert_title_de: null, location_city: null, is_verified_expert: false },
  { id: 'placeholder-3', first_name: 'Hamarosan', last_name: '', avatar_url: null, expert_title: null, expert_title_en: null, expert_title_de: null, location_city: null, is_verified_expert: false },
];

const ExpertGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // Fetch experts/creators from Supabase (relaxed filter for dev)
  const { data: experts, isLoading } = useQuery({
    queryKey: ['homepage-experts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, expert_title, expert_title_en, expert_title_de, location_city, is_verified_expert')
        .or('user_role.eq.expert,user_role.eq.creator,is_verified_expert.eq.true')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Expert[];
    },
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Get localized expert title
  const getExpertTitle = (expert: Expert) => {
    if (language === 'en' && expert.expert_title_en) return expert.expert_title_en;
    if (language === 'de' && expert.expert_title_de) return expert.expert_title_de;
    return expert.expert_title;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center w-48 flex-shrink-0">
                <Skeleton className="w-36 h-36 rounded-full" />
                <Skeleton className="h-5 w-24 mt-4" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Use real experts or fallback to placeholders
  const displayExperts = experts && experts.length > 0 ? experts : placeholderExperts;
  const isPlaceholder = !experts || experts.length === 0;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-wide" style={{ letterSpacing: '0.02em' }}>
              {t('home.experts_title')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('home.experts_subtitle')}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Link to="/piacer" className="ml-4">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/5 font-medium">
                {t('home.view_all')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Expert Slider */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {displayExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              style={{ scrollSnapAlign: "start" }}
            >
              {isPlaceholder ? (
                // Placeholder card - not clickable
                <div className="flex flex-col items-center text-center w-48 flex-shrink-0 opacity-60">
                  <div className="relative">
                    <Avatar 
                      className="w-36 h-36 border-2 border-white"
                      style={{
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 20px 50px -10px rgba(0, 0, 0, 0.12)',
                      }}
                    >
                      <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500 text-2xl font-semibold">
                        ?
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="mt-4 font-semibold text-muted-foreground">
                    {t('common.master_onboarding')}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {t('common.coming_soon')}
                  </p>
                </div>
              ) : (
                // Real expert card - clickable
                <Link
                  to={`/szakertok/${expert.id}`}
                  className="flex flex-col items-center text-center group w-48 flex-shrink-0"
                >
                  <div className="relative">
                    <Avatar 
                      className="w-36 h-36 border-2 border-white group-hover:scale-105 transition-all duration-300"
                      style={{
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 20px 50px -10px rgba(0, 0, 0, 0.12)',
                      }}
                    >
                      <AvatarImage 
                        src={expert.avatar_url || undefined} 
                        alt={`${expert.first_name} ${expert.last_name}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-semibold">
                        {expert.first_name?.[0]}
                        {expert.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    {expert.is_verified_expert && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {expert.first_name} {expert.last_name}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {getExpertTitle(expert) || expert.location_city || t('roles.expert')}
                  </p>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: View All button */}
        <div className="mt-6 text-center md:hidden">
          <Link to="/piacer">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg">
              {t('home.all_experts')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExpertGallery;
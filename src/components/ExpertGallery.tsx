import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_EXPERTS, getLocalizedExpertName } from "@/data/mockData";

const ExpertGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // FORCE MOCK DATA ONLY - for clean, consistent preview
  const experts = MOCK_EXPERTS.map(e => {
    const localizedName = getLocalizedExpertName(e, language);
    return {
      id: e.id,
      first_name: localizedName.firstName,
      last_name: localizedName.lastName,
      avatar_url: e.avatar_url,
      expert_title: language === 'en' ? e.expert_title_en : language === 'de' ? e.expert_title_de : e.expert_title,
      location_city: e.location_city,
      is_verified_expert: e.is_verified_expert
    };
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

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

        {/* Expert Slider - CENTERED */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 px-4 justify-center flex-wrap md:flex-nowrap"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {experts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              style={{ scrollSnapAlign: "start" }}
            >
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
                  {expert.expert_title || expert.location_city || t('roles.expert')}
                </p>
              </Link>
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

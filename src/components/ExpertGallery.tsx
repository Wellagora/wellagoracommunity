import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_EXPERTS, getLocalizedExpertName } from "@/data/mockData";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ExpertGallery = () => {
  const { t, language } = useLanguage();

  // FORCE MOCK DATA ONLY - for clean, consistent preview
  const experts = MOCK_EXPERTS.slice(0, 5).map(e => {
    const localizedName = getLocalizedExpertName(e, language);
    return {
      id: e.id,
      first_name: localizedName.firstName,
      last_name: localizedName.lastName,
      avatar_url: e.avatar_url,
      expert_title: language === 'en' ? e.expert_title_en : language === 'de' ? e.expert_title_de : e.expert_title,
      location_city: e.location_city,
    };
  });

  return (
    <section className="py-12 bg-[#F8F9FA] relative overflow-hidden">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
      
      <div className="container mx-auto px-4">
        {/* Header - Editorial style */}
        <div className="text-center mb-8">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.3em] text-black/40 font-medium"
          >
            {t('home.experts_subtitle')}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-semibold text-black mt-4 tracking-tight"
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
              {experts.map((expert, index) => (
                <CarouselItem key={expert.id} className="pl-4 basis-[280px] md:basis-[320px]">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to={`/szakertok/${expert.id}`} 
                      className="block group"
                    >
                      {/* Portrait Card - 3:4 Aspect Ratio */}
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#E5E5E5]">
                        {/* Full-bleed Photo */}
                        <img
                          src={expert.avatar_url || '/placeholder.svg'}
                          alt={`${expert.first_name} ${expert.last_name}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Gradient Overlay - Dark to transparent at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Content Overlay at Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium mb-1">
                            {expert.location_city || t('roles.expert')}
                          </p>
                          <h3 className="text-xl font-serif font-semibold text-white leading-tight">
                            {expert.first_name} {expert.last_name}
                          </h3>
                          <p className="text-white/70 text-sm mt-2 line-clamp-2">
                            {expert.expert_title}
                          </p>
                        </div>

                        {/* Subtle hover border glow */}
                        <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
                      </div>
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows - Premium Black Style */}
            <CarouselPrevious className="hidden md:flex -left-12 bg-black text-white border-0 hover:bg-black/80 w-10 h-10" />
            <CarouselNext className="hidden md:flex -right-12 bg-black text-white border-0 hover:bg-black/80 w-10 h-10" />
          </Carousel>
          
          {/* Mobile scroll hint */}
          <p className="text-center text-xs text-black/30 mt-4 md:hidden uppercase tracking-widest">
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
            className="inline-flex items-center gap-3 text-black/70 hover:text-black text-sm uppercase tracking-[0.2em] font-medium transition-colors group"
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
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
    </section>
  );
};

export default ExpertGallery;

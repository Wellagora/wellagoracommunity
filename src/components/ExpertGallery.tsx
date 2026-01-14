import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_EXPERTS, getLocalizedExpertName } from "@/data/mockData";

const ExpertGallery = () => {
  const { t, language } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <section className="py-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
      
      <div className="container mx-auto px-4">
        {/* Header - Editorial style */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-xs uppercase tracking-[0.3em] text-black/40 font-medium"
          >
            {t('home.experts_subtitle')}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-semibold text-black mt-4 tracking-tight"
          >
            {t('home.experts_title')}
          </motion.h2>
        </div>

        {/* Harmonica / Accordion Expert Cards */}
        <div className="flex justify-center items-stretch gap-2 md:gap-3 h-[420px] md:h-[500px] max-w-5xl mx-auto">
          {experts.map((expert, index) => {
            const isHovered = hoveredIndex === index;
            const hasHover = hoveredIndex !== null;
            
            return (
              <motion.div
                key={expert.id}
                className="relative cursor-pointer overflow-hidden rounded-2xl"
                style={{
                  flex: isHovered ? 3 : hasHover ? 0.5 : 1,
                  transition: 'flex 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 80, 
                  damping: 20, 
                  delay: index * 0.1 
                }}
              >
                <Link to={`/szakertok/${expert.id}`} className="block w-full h-full">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                    style={{
                      backgroundImage: expert.avatar_url 
                        ? `url(${expert.avatar_url})` 
                        : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: isHovered 
                        ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
                        : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                    }}
                  />

                  {/* Light-Leak Border Effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.15) 25%, transparent 50%, rgba(255,255,255,0.1) 75%, transparent 100%)',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      WebkitMaskComposite: 'xor',
                      padding: '1px',
                    }}
                  />

                  {/* Vertical Text (Collapsed State) */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 flex items-center justify-center transition-all duration-500"
                    style={{
                      width: isHovered ? '0px' : '100%',
                      opacity: isHovered ? 0 : 1,
                      overflow: 'hidden',
                    }}
                  >
                    <div 
                      className="whitespace-nowrap text-white/90 font-medium text-sm tracking-[0.15em] uppercase"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      {expert.first_name} {expert.last_name}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                    }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ 
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10 
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    >
                      <span className="text-xs uppercase tracking-[0.25em] text-white/60 font-medium">
                        {expert.location_city || t('roles.expert')}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mt-2 leading-tight">
                        {expert.first_name}<br/>{expert.last_name}
                      </h3>
                      <p className="text-white/70 text-sm mt-3 line-clamp-2 max-w-xs">
                        {expert.expert_title}
                      </p>
                      
                      {/* View Profile indicator */}
                      <div className="mt-4 flex items-center gap-2 text-white/80 text-xs uppercase tracking-[0.2em]">
                        <span>{t('common.view_profile') || 'View Profile'}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className="text-center mt-12"
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

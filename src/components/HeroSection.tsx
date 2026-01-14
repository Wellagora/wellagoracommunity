import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based parallax for typography
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const line1Y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const line2Y = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const line3Y = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  // Track mouse for liquid button effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const registrationPaths = [
    {
      id: 'member',
      title: t('landing.card_member_title'),
      description: t('landing.card_member_desc_short'),
      cta: t('landing.card_member_cta'),
      link: '/auth?role=member',
    },
    {
      id: 'expert',
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
    },
    {
      id: 'sponsor',
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="min-h-[85vh] flex items-center justify-center py-12 relative overflow-hidden bg-[#FAFAFA]"
    >
      {/* Clean Ghost-Grey Background */}
      <div className="absolute inset-0 -z-10 bg-[#FAFAFA]" />
      
      {/* Subtle stipple texture overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <motion.div 
        style={{ opacity }}
        className="max-w-6xl mx-auto px-4 text-center relative z-10"
      >
        {/* Kinetic Typographic Hero - Tighter vertical rhythm */}
        <div className="mb-6">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-semibold text-black leading-[0.95] tracking-tight"
          >
            <motion.span 
              style={{ y: line1Y }}
              className="block relative"
            >
              <span className="relative">
                {t('landing.hero_line1')}
                {/* Stipple mask effect */}
                <span 
                  className="absolute inset-0 text-transparent bg-clip-text opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '4px 4px',
                    WebkitBackgroundClip: 'text',
                  }}
                >
                  {t('landing.hero_line1')}
                </span>
              </span>
            </motion.span>
            <motion.span 
              style={{ y: line2Y }}
              className="block mt-1 text-black/80"
            >
              {t('landing.hero_line2')}
            </motion.span>
            <motion.span 
              style={{ y: line3Y }}
              className="block mt-1 text-black/60"
            >
              {t('landing.hero_line3')}
            </motion.span>
          </motion.h1>
        </div>

        {/* Power CTA Button - Prominent placement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="mb-8"
        >
          <Link to="/auth">
            <Button 
              size="lg"
              className="px-10 py-5 text-lg font-medium rounded-full bg-black text-white hover:bg-black/90 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02]"
            >
              {t('landing.cta_join')}
            </Button>
          </Link>
        </motion.div>

        {/* Subtitle - Secondary to CTA */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className="text-base md:text-lg text-black/40 max-w-xl mx-auto font-light tracking-wide mb-8"
        >
          {t('landing.hero_subtitle')}
        </motion.p>

        {/* Compact Feature Cards - Secondary to CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
          {registrationPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20, 
                delay: 0.4 + index * 0.08 
              }}
              className="group relative"
            >
              <Link to={path.link} className="block">
                {/* Light-Leak Border */}
                <div 
                  className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(0,0,0,0.08) 25%, transparent 50%, rgba(0,0,0,0.06) 75%, transparent 100%)',
                    animation: 'spin 4s linear infinite',
                  }}
                />
                
                <div 
                  className="relative bg-white/80 backdrop-blur-xl rounded-xl p-5 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03), 0 12px 32px -8px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Category indicator */}
                  <div className="text-[9px] uppercase tracking-[0.25em] text-black/25 font-medium mb-2">
                    {path.id === 'member' ? '01' : path.id === 'expert' ? '02' : '03'}
                  </div>

                  {/* Title - Lighter weight */}
                  <h3 className="text-base font-serif font-medium text-black/80 group-hover:text-black transition-colors">
                    {path.title}
                  </h3>

                  {/* Description - Compact */}
                  <p className="text-black/35 text-xs mt-1.5 leading-relaxed font-light">
                    {path.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ultra-thin bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
    </section>
  );
};

export default HeroSection;

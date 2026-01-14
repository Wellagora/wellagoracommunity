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
      className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden bg-[#FAFAFA]"
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
        {/* Kinetic Typographic Hero */}
        <div className="mb-16">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif font-semibold text-black leading-[0.95] tracking-tight"
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
              className="block mt-2 text-black/80"
            >
              {t('landing.hero_line2')}
            </motion.span>
            <motion.span 
              style={{ y: line3Y }}
              className="block mt-2 text-black/60"
            >
              {t('landing.hero_line3')}
            </motion.span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className="text-lg md:text-xl text-black/50 max-w-2xl mx-auto font-light tracking-wide"
        >
          {t('landing.hero_subtitle')}
        </motion.p>

        {/* Ultra-Minimalist Cards with Light-Leak Effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16 max-w-4xl mx-auto">
          {registrationPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 80, 
                damping: 20, 
                delay: 0.4 + index * 0.1 
              }}
              className="group relative"
            >
              <Link to={path.link} className="block">
                {/* Light-Leak Border */}
                <div 
                  className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(0,0,0,0.08) 25%, transparent 50%, rgba(0,0,0,0.06) 75%, transparent 100%)',
                    animation: 'spin 4s linear infinite',
                  }}
                />
                
                <div 
                  className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 transition-all duration-500 group-hover:-translate-y-2"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 24px 64px -16px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Category indicator */}
                  <div className="text-[10px] uppercase tracking-[0.3em] text-black/30 font-medium mb-4">
                    {path.id === 'member' ? '01' : path.id === 'expert' ? '02' : '03'}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-serif font-semibold text-black group-hover:text-black/80 transition-colors">
                    {path.title}
                  </h3>

                  {/* Description */}
                  <p className="text-black/40 text-sm mt-2 leading-relaxed">
                    {path.description}
                  </p>

                  {/* Liquid Button */}
                  <div className="mt-6">
                    <Button 
                      className="w-full liquid-button relative overflow-hidden"
                    >
                      <span className="relative z-10">{path.cta}</span>
                    </Button>
                  </div>
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

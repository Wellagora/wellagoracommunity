import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SmartTiltCard } from "@/components/ui/SmartTiltCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerAnimation";

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-based parallax for typography
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const line1Y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const line2Y = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const line3Y = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const registrationPaths = [
    {
      id: 'member',
      title: t('landing.card_member_title'),
      description: t('landing.card_member_desc_short'),
      link: '/auth?role=member',
    },
    {
      id: 'expert',
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      link: '/auth?role=expert',
    },
    {
      id: 'sponsor',
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      link: '/auth?role=sponsor',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="min-h-[70vh] flex items-center justify-center py-8 relative overflow-hidden bg-white"
    >
      {/* Background is now handled globally by AppLayout */}

      <motion.div 
        style={{ opacity }}
        className="max-w-6xl mx-auto px-4 text-center relative z-10"
      >
        {/* Kinetic Typographic Hero */}
        <div className="mb-6">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-black leading-[0.95] tracking-tight"
          >
            <motion.span 
              style={{ y: line1Y }}
              className="block relative"
            >
              {t('landing.hero_line1')}
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

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="text-base md:text-lg text-black/40 max-w-xl mx-auto font-light tracking-wide mb-6"
        >
          {t('landing.hero_subtitle')}
        </motion.p>

        {/* CTA Cards with Glassmorphism on top of Liquid Background */}
        <div className="relative">
          
          {/* Cards Grid with Stagger + SmartTiltCard */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto relative z-10">
            {registrationPaths.map((path) => (
              <StaggerItem key={path.id}>
                <SmartTiltCard>
                  <Link to={path.link} className="block">
                    <div 
                      className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 min-h-[100px] flex flex-col justify-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Title - NO numbers */}
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {path.title}
                      </h3>

                      {/* Static description - NO hover swap */}
                      <p className="text-slate-500 text-sm leading-snug font-light">
                        {path.description}
                      </p>
                    </div>
                  </Link>
                </SmartTiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </motion.div>

      {/* Ultra-thin bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
    </section>
  );
};

export default HeroSection;

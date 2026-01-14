import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Interactive wave background component
const WaveBackground = ({ mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden">
      {/* Ambient wave layers */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${50 + mouseX * 0.02}% ${50 + mouseY * 0.02}%, rgba(0,0,0,0.03) 0%, transparent 50%)`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
      
      {/* Slow ambient flow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(135deg, 
            transparent 0%, 
            rgba(0,0,0,0.02) 25%, 
            transparent 50%, 
            rgba(0,0,0,0.015) 75%, 
            transparent 100%)`,
          backgroundSize: "400% 400%",
        }}
      />
    </div>
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for wave effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 100,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      benefit: t('landing.card_member_benefit'),
      cta: t('landing.card_member_cta'),
      link: '/auth?role=member',
    },
    {
      id: 'expert',
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      benefit: t('landing.card_expert_benefit'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
    },
    {
      id: 'sponsor',
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      benefit: t('landing.card_sponsor_benefit'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="min-h-[75vh] flex items-center justify-center py-8 relative overflow-hidden bg-[#FFFFFF]"
    >
      {/* Clean Solid White Background */}
      <div className="absolute inset-0 -z-10 bg-[#FFFFFF]" />
      
      {/* Interactive Wave Background */}
      <WaveBackground mouseX={mousePosition.x} mouseY={mousePosition.y} />
      
      {/* Subtle stipple texture overlay */}
      <div 
        className="absolute inset-0 -z-5 opacity-[0.015]"
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

        {/* Subtitle - Secondary to cards */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="text-base md:text-lg text-black/40 max-w-xl mx-auto font-light tracking-wide mb-5"
        >
          {t('landing.hero_subtitle')}
        </motion.p>

        {/* Interactive Action Cards - Primary Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {registrationPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20, 
                delay: 0.3 + index * 0.1 
              }}
              className="group relative"
              onMouseEnter={() => setHoveredCard(path.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Link to={path.link} className="block">
                {/* Smooth hover animation - scale + gradient background */}
                <div 
                  className="relative bg-white rounded-2xl p-6 min-h-[120px] flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out group-hover:scale-[1.02]"
                  style={{
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Animated gradient background on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(139,92,246,0.05) 100%)',
                    }}
                  />
                  
                  {/* Subtle glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: 'inset 0 0 40px rgba(16,185,129,0.08)',
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Title */}
                    <h3 className="text-xl font-serif font-semibold text-black/90 group-hover:text-black transition-colors duration-300 mb-2">
                      {path.title}
                    </h3>

                    {/* Description / Benefit - Animated swap */}
                    <div className="relative h-10 overflow-hidden">
                      <AnimatePresence mode="wait">
                        {hoveredCard === path.id ? (
                          <motion.p
                            key="benefit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-emerald-600 text-sm leading-snug font-medium"
                          >
                            ✨ {path.benefit}
                          </motion.p>
                        ) : (
                          <motion.p
                            key="description"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-black/40 text-sm leading-snug font-light"
                          >
                            {path.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
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

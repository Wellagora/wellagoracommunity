import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Animated wave background - MONOCHROME slate/silver tones
const AnimatedWaveBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Wave 1 - Slate */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(100, 116, 139, 0.15), rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.15), transparent)',
        }}
      />
      
      {/* Wave 2 - Lighter slate */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(203, 213, 225, 0.1), rgba(226, 232, 240, 0.15), rgba(203, 213, 225, 0.1), transparent)',
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

// 3D Tilt Card for Hero CTA cards
const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const scale = useSpring(1, { stiffness: 200, damping: 20 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Invert Y for natural tilt feel
    rotateX.set((-mouseY / rect.height) * 8);
    rotateY.set((mouseX / rect.width) * 8);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for subtle parallax
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
      {/* Clean white background */}
      <div className="absolute inset-0 -z-20 bg-white" />
      
      {/* Subtle ambient parallax layer - MONOCHROME */}
      <motion.div
        className="absolute inset-0 -z-15 opacity-30"
        style={{
          background: `radial-gradient(ellipse at ${50 + mousePosition.x * 0.02}% ${50 + mousePosition.y * 0.02}%, rgba(100, 116, 139, 0.08) 0%, transparent 60%)`,
        }}
      />
      
      {/* Stipple texture overlay */}
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
        {/* Kinetic Typographic Hero */}
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

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="text-base md:text-lg text-black/40 max-w-xl mx-auto font-light tracking-wide mb-6"
        >
          {t('landing.hero_subtitle')}
        </motion.p>

        {/* CTA Cards with Animated Background */}
        <div className="relative">
          {/* Animated wave background behind cards */}
          <AnimatedWaveBackground />
          
          {/* Cards Grid with 3D Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto relative z-10">
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
              >
                <TiltCard>
                  <Link to={path.link} className="block">
                    <div 
                      className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 min-h-[100px] flex flex-col justify-center border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Title - NO numbers */}
                      <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
                        {path.title}
                      </h3>

                      {/* Static description - NO hover swap */}
                      <p className="text-slate-500 text-sm leading-snug font-light">
                        {path.description}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Ultra-thin bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
    </section>
  );
};

export default HeroSection;

import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight, Sprout, Sparkles, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartTiltCard } from "@/components/ui/SmartTiltCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerAnimation";
import { getHeroImage } from "@/constants/heroImages";

const HERO_BG = getHeroImage('homepage');

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const registrationPaths = [
    {
      id: 'member',
      title: t('landing.card_member_title'),
      description: t('landing.card_member_desc_short'),
      link: '/auth?role=member',
      icon: Sprout,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'expert',
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      link: '/auth?role=expert',
      icon: Sparkles,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'sponsor',
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      link: '/auth?role=sponsor',
      icon: Handshake,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <>
      {/* Hero with background image */}
      <section
        ref={sectionRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax background image */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 -top-20 -bottom-20"
        >
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />

        {/* Content */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center py-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            {t('home.hero_title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
          >
            <Link to="/piacer">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                {t('home.hero_cta')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Registration cards — below the hero */}
      <section className="py-10 bg-[#FEFCF7]">
        <div className="max-w-4xl mx-auto px-4">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {registrationPaths.map((path) => (
              <StaggerItem key={path.id}>
                <SmartTiltCard>
                  <Link to={path.link} className="block">
                    <div className={`relative ${path.bgColor} rounded-2xl p-6 min-h-[100px] flex flex-col justify-center border border-slate-200/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                      <div className="flex items-center gap-3 mb-2">
                        <path.icon className={`w-6 h-6 ${path.iconColor}`} />
                        <h3 className="text-xl font-semibold text-slate-900">
                          {path.title}
                        </h3>
                      </div>
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
      </section>
    </>
  );
};

export default HeroSection;

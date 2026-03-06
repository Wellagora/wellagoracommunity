import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Leaf, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const headlines: Record<string, { line1: string; line2: string; subtitle: string }> = {
    hu: {
      line1: "Helyi tudás.",
      line2: "Közösségi hatás.",
      subtitle: "Regionális fenntarthatósági közösségi platform — Szakértők, közösség, valós változás.",
    },
    en: {
      line1: "Local Knowledge.",
      line2: "Community Impact.",
      subtitle: "Regional sustainability community platform — Experts, community, real change.",
    },
    de: {
      line1: "Lokales Wissen.",
      line2: "Gemeinschaftliche Wirkung.",
      subtitle: "Regionale Nachhaltigkeits-Gemeinschaftsplattform — Experten, Gemeinschaft, echte Veränderung.",
    },
  };

  const h = headlines[language] || headlines.hu;

  const valueProps = [
    {
      icon: Users,
      title: language === 'hu' ? 'Szakértők' : language === 'de' ? 'Experten' : 'Experts',
      desc: language === 'hu'
        ? 'Helyi szakértők osztják meg tudásukat workshopokon és programokon keresztül.'
        : language === 'de'
        ? 'Lokale Experten teilen ihr Wissen durch Workshops und Programme.'
        : 'Local experts share their knowledge through workshops and programs.',
    },
    {
      icon: Leaf,
      title: language === 'hu' ? 'Fenntarthatóság' : language === 'de' ? 'Nachhaltigkeit' : 'Sustainability',
      desc: language === 'hu'
        ? 'Regionális tudásmegosztás a fenntartható életmódért és közösségekért.'
        : language === 'de'
        ? 'Regionaler Wissensaustausch für nachhaltiges Leben und Gemeinschaften.'
        : 'Regional knowledge sharing for sustainable living and communities.',
    },
    {
      icon: Award,
      title: language === 'hu' ? 'Közösség' : language === 'de' ? 'Gemeinschaft' : 'Community',
      desc: language === 'hu'
        ? 'Csatlakozz egy aktív közösséghez, ahol a tudás megosztása valós hatást hoz.'
        : language === 'de'
        ? 'Tritt einer aktiven Gemeinschaft bei, in der Wissensaustausch echte Wirkung erzielt.'
        : 'Join an active community where sharing knowledge creates real impact.',
    },
  ];

  return (
    <>
      {/* HERO with emerald-to-teal gradient */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500" />

        {/* Organic SVG shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <path d="M0,300 C360,100 720,500 1440,200 L1440,600 L0,600 Z" fill="white" />
          <ellipse cx="200" cy="150" rx="300" ry="200" fill="white" opacity="0.05" />
          <ellipse cx="1200" cy="400" rx="250" ry="180" fill="white" opacity="0.04" />
        </svg>

        <motion.div
          style={{ opacity }}
          className="relative z-10 container mx-auto px-4 py-20 md:py-28 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
          >
            <span className="block">{h.line1}</span>
            <span className="block text-white/90">{h.line2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
          >
            {h.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth?role=member">
              <Button
                size="lg"
                className="rounded-full bg-white text-emerald-700 hover:bg-white/90 hover:shadow-lg font-semibold px-8 min-w-[200px] transition-all"
              >
                {language === 'hu' ? 'Csatlakozom' : language === 'de' ? 'Mitmachen' : 'Join Now'}
              </Button>
            </Link>
            <Link to="/auth?role=expert">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 text-white hover:bg-white/10 font-semibold px-8 min-w-[200px] transition-all"
              >
                {language === 'hu' ? 'Szakértő vagyok' : language === 'de' ? 'Ich bin Experte' : "I'm an Expert"}
              </Button>
            </Link>
          </motion.div>

          {/* Regional identity hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 text-sm text-white/50"
          >
            {language === 'hu'
              ? '🌍 Magyarország · Káli-medence — Első pilot régió'
              : language === 'de'
              ? '🌍 Ungarn · Káli-Becken — Erste Pilotregion'
              : '🌍 Hungary · Káli Basin — First pilot region'}
          </motion.p>
        </motion.div>
      </section>

      {/* VALUE PROPOSITION — 3 columns */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {valueProps.map((vp, i) => (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <vp.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{vp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{vp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;

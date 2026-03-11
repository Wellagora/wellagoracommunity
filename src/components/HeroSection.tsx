import { Link } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Sparkles, ArrowRight, Leaf, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProgressBar } from "@/components/gamification/UserProgressBar";

interface HeroSectionProps {
  userName?: string;
  showProgress?: boolean;
}

/** Warm, community-focused hero images — crossfade slideshow */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop&q=80', // diverse team workshop, warm light
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80', // mature man smiling portrait
  'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1200&h=800&fit=crop&q=80', // woman at desk, professional
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=800&fit=crop&q=80', // outdoor community garden
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=800&fit=crop&q=80', // team collaboration, mixed ages
];

const HeroSection = ({ userName, showProgress }: HeroSectionProps = {}) => {
  const isLoggedIn = !!userName;
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [currentImg, setCurrentImg] = useState(0);

  // Crossfade every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const textY = useTransform(smoothProgress, [0, 1], [0, 60]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0.3]);

  // Real stats from Supabase for social proof
  const { data: stats } = useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [membersRes, expertsRes, programsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).or('user_role.eq.expert,user_role.eq.creator'),
        supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ]);
      return {
        members: membersRes.count || 0,
        experts: expertsRes.count || 0,
        programs: programsRes.count || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const headlines: Record<string, { line1: string; accent: string; line2: string; subtitle: string }> = {
    hu: {
      line1: "Ahol a helyi tudás",
      accent: "közösséggé",
      line2: "válik.",
      subtitle: "Szakértők, közösségek fóruma — a fenntartható életmód és tudásmegosztás új formája.",
    },
    en: {
      line1: "Where local knowledge",
      accent: "becomes",
      line2: "community.",
      subtitle: "A forum for experts and communities — a new form of sustainable living and knowledge sharing.",
    },
    de: {
      line1: "Wo lokales Wissen",
      accent: "zur Gemeinschaft",
      line2: "wird.",
      subtitle: "Ein Forum für Experten und Gemeinschaften — eine neue Form nachhaltigen Lebens und Wissensaustauschs.",
    },
  };

  const h = headlines[language] || headlines.hu;

  const valueProps = [
    {
      icon: Users,
      title: language === 'hu' ? 'Közösség' : language === 'de' ? 'Gemeinschaft' : 'Community',
      desc: language === 'hu'
        ? 'Helyi szakértők és tagok aktív közössége, ahol a tudás valódi hatást hoz.'
        : language === 'de'
        ? 'Aktive Gemeinschaft lokaler Experten und Mitglieder, wo Wissen echte Wirkung erzielt.'
        : 'Active community of local experts and members where knowledge creates real impact.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Leaf,
      title: language === 'hu' ? 'Fenntarthatóság' : language === 'de' ? 'Nachhaltigkeit' : 'Sustainability',
      desc: language === 'hu'
        ? 'Regionális tudásmegosztás a fenntartható életmódért és közösségekért.'
        : language === 'de'
        ? 'Regionaler Wissensaustausch für nachhaltiges Leben und Gemeinschaften.'
        : 'Regional knowledge sharing for sustainable living and communities.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Award,
      title: language === 'hu' ? 'Alkotás' : language === 'de' ? 'Kreativität' : 'Creation',
      desc: language === 'hu'
        ? 'Workshopok, kurzusok és események — hozd létre, oszd meg, inspirálj.'
        : language === 'de'
        ? 'Workshops, Kurse und Events — erstellen, teilen, inspirieren.'
        : 'Workshops, courses and events — create, share, inspire.',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <>
      {/* HERO — Storetasker-inspired: warm photo + text split layout */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-[#f5f0eb] min-h-[85vh] flex items-center"
      >
        {/* Background slideshow — full bleed, warm overlay */}
        <div className="absolute inset-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={HERO_IMAGES[currentImg]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Warm overlay — like Storetasker's earthy tone */}
          <div className="absolute inset-0 bg-[#6b5b4e]/60" />
        </div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 container mx-auto px-6 py-24 md:py-32"
        >
          {isLoggedIn ? (
            /* ===== LOGGED-IN HERO ===== */
            <div className="max-w-3xl">
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.08] tracking-tight"
                >
                  {language === 'hu' ? `Üdv újra, ` : language === 'de' ? `Willkommen zurück, ` : `Welcome back, `}
                  <span className="font-semibold">{userName}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
                >
                  {h.subtitle}
                </motion.p>
              </motion.div>

              {/* Progress bar */}
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-8 max-w-md"
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <UserProgressBar />
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* ===== NON-LOGGED-IN HERO ===== */
            <div className="max-w-3xl">
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.08] tracking-tight"
                >
                  {h.line1}{' '}
                  <span className="font-semibold">{h.accent}</span>{' '}
                  {h.line2}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
                >
                  {h.subtitle}
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link to="/auth?role=member">
                  <Button
                    size="lg"
                    className="rounded-md bg-white hover:bg-white/90 text-[#3d3429] font-semibold px-8 w-full sm:w-auto sm:min-w-[200px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300"
                  >
                    {language === 'hu' ? 'Csatlakozom' : language === 'de' ? 'Jetzt beitreten' : 'Join Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth?role=expert">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-md border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold px-8 w-full sm:w-auto sm:min-w-[200px] transition-all duration-300"
                  >
                    {language === 'hu' ? 'Szakértő vagyok' : language === 'de' ? 'Ich bin Experte' : "I'm an Expert"}
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof — simple row */}
              {stats && (stats.members > 0 || stats.experts > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mt-12 flex flex-wrap gap-8"
                >
                  {stats.members > 0 && (
                    <div>
                      <span className="text-2xl font-bold text-white">{stats.members}+</span>
                      <span className="text-sm text-white/70 ml-2">
                        {language === 'hu' ? 'tag' : language === 'de' ? 'Mitglieder' : 'members'}
                      </span>
                    </div>
                  )}
                  {stats.experts > 0 && (
                    <div>
                      <span className="text-2xl font-bold text-white">{stats.experts}+</span>
                      <span className="text-sm text-white/70 ml-2">
                        {language === 'hu' ? 'szakértő' : language === 'de' ? 'Experten' : 'experts'}
                      </span>
                    </div>
                  )}
                  {stats.programs > 0 && (
                    <div>
                      <span className="text-2xl font-bold text-white">{stats.programs}+</span>
                      <span className="text-sm text-white/70 ml-2">
                        {language === 'hu' ? 'program' : language === 'de' ? 'Programme' : 'programs'}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Slideshow dots indicator */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentImg ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* VALUE PROPOSITION — Clean white section below hero */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {valueProps.map((vp, i) => (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl p-7 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${vp.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
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

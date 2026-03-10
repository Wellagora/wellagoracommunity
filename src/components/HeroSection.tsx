import { Link } from "react-router-dom";
import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Sparkles, ArrowRight, Leaf, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProgressBar } from "@/components/gamification/UserProgressBar";

interface HeroSectionProps {
  /** If provided, shows personalized logged-in hero */
  userName?: string;
  showProgress?: boolean;
}

/**
 * Orbital ring animation — Circle.so inspired
 * Renders concentric rings with orbiting dots (blue/purple glow)
 */
const OrbitalRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
    {/* Outer ring */}
    <div className="absolute w-[700px] h-[700px] md:w-[900px] md:h-[900px] rounded-full border border-white/[0.07]">
      <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-300/60 shadow-[0_0_12px_rgba(147,197,253,0.5)] animate-orbit-slow" />
    </div>
    {/* Middle ring */}
    <div className="absolute w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full border border-white/[0.05]">
      <div className="absolute w-2 h-2 rounded-full bg-blue-200/50 shadow-[0_0_10px_rgba(191,219,254,0.4)] animate-orbit-medium" />
    </div>
    {/* Inner ring */}
    <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-white/[0.04]">
      <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-orbit-fast" />
    </div>
  </div>
);

/**
 * Floating particle field for depth
 */
const generateParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 23 + 11) % 100}%`,
    top: `${(i * 31 + 17) % 100}%`,
    size: 2 + (i % 3),
    duration: 20 + (i % 7) * 4,
    delay: (i * 1.7) % 8,
    opacity: 0.1 + (i % 5) * 0.06,
  }));

const HeroSection = ({ userName, showProgress }: HeroSectionProps = {}) => {
  const isLoggedIn = !!userName;
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const particles = useMemo(() => generateParticles(12), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const textY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0.2]);
  const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.97]);
  const badgeY = useTransform(smoothProgress, [0, 1], [0, -30]);

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
      title: language === 'hu' ? 'Alkotás' : language === 'de' ? 'Kreativität' : 'Creation',
      desc: language === 'hu'
        ? 'Workshopok, kurzusok és események — hozd létre, oszd meg, inspirálj.'
        : language === 'de'
        ? 'Workshops, Kurse und Events — erstellen, teilen, inspirieren.'
        : 'Workshops, courses and events — create, share, inspire.',
    },
  ];

  return (
    <>
      {/* HERO — Circle.so deep blue/purple gradient with orbital animation */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F0F35 0%, #131347 25%, #1a1a5e 50%, #131347 75%, #0F0F35 100%)',
        }}
      >
        {/* Orbital rings animation */}
        <OrbitalRings />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [p.opacity, p.opacity * 1.8, p.opacity],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Radial glow at center — depth effect */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-400/8 rounded-full blur-[80px]" />
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 container mx-auto px-5 pt-24 pb-20 md:pt-36 md:pb-32"
        >
          {isLoggedIn ? (
            /* ===== LOGGED-IN HERO CONTENT ===== */
            <>
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight max-w-3xl mx-auto"
                >
                  {language === 'hu' ? `Üdv újra, ${userName}!` : language === 'de' ? `Willkommen zurück, ${userName}!` : `Welcome back, ${userName}!`}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto text-center"
                >
                  {h.subtitle}
                </motion.p>
              </motion.div>

              {/* Progress bar on hero */}
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8 max-w-md mx-auto"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-5">
                    <UserProgressBar variant="dark" />
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* ===== NON-LOGGED-IN HERO CONTENT ===== */
            <>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ y: badgeY }}
                className="flex justify-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-medium text-white/90">
                    {language === 'hu' ? 'Közösségi fenntarthatósági platform' : language === 'de' ? 'Gemeinschaftliche Nachhaltigkeitsplattform' : 'Community Sustainability Platform'}
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.15] tracking-tight max-w-4xl mx-auto"
                >
                  {h.line1}{' '}
                  <span className="text-white">
                    {h.accent}
                  </span>{' '}
                  {h.line2}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-5 text-base md:text-xl text-white/90 max-w-2xl mx-auto text-center leading-relaxed px-2"
                >
                  {h.subtitle}
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
              >
                <Link to="/auth?role=member">
                  <Button
                    size="lg"
                    className="rounded-full bg-white hover:bg-white/90 text-[#0F0F35] font-semibold px-8 w-full sm:w-auto sm:min-w-[220px] shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.35)] transition-all duration-300"
                  >
                    {language === 'hu' ? 'Csatlakozom' : language === 'de' ? 'Jetzt beitreten' : 'Join Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth?role=expert">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-semibold px-8 w-full sm:w-auto sm:min-w-[220px] transition-all duration-300"
                  >
                    {language === 'hu' ? 'Szakértő vagyok' : language === 'de' ? 'Ich bin Experte' : "I'm an Expert"}
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              {stats && (stats.members > 0 || stats.experts > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-14 flex flex-wrap justify-center gap-8 md:gap-12"
                >
                  {stats.members > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-white">{stats.members}</span>
                        <span className="text-sm text-white/80 ml-1.5">
                          {language === 'hu' ? 'tag' : language === 'de' ? 'Mitglieder' : 'members'}
                        </span>
                      </div>
                    </div>
                  )}
                  {stats.experts > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Award className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-white">{stats.experts}</span>
                        <span className="text-sm text-white/80 ml-1.5">
                          {language === 'hu' ? 'szakértő' : language === 'de' ? 'Experten' : 'experts'}
                        </span>
                      </div>
                    </div>
                  )}
                  {stats.programs > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-white">{stats.programs}</span>
                        <span className="text-sm text-white/80 ml-1.5">
                          {language === 'hu' ? 'program' : language === 'de' ? 'Programme' : 'programs'}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Bottom gradient fade to white — seamless transition to value props */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* VALUE PROPOSITION — Domestika-inspired clean cards */}
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
                className="relative group bg-card rounded-2xl p-7 border border-border/50 hover:border-blue-300/30 hover:shadow-[0_8px_40px_rgba(37,99,235,0.08)] hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
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

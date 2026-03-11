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
  userName?: string;
  showProgress?: boolean;
}

/**
 * Decorative geometric shapes — PolyWorks-inspired colorful blobs
 */
const GeometricShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {/* Large coral/orange circle — top right */}
    <div className="absolute -top-20 -right-20 w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-br from-orange-200/40 to-rose-200/30 blur-sm" />
    {/* Blue-green blob — bottom left */}
    <div className="absolute -bottom-32 -left-24 w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-tr from-teal-200/30 to-sky-200/25 blur-sm" />
    {/* Small yellow accent — mid-left */}
    <div className="absolute top-1/3 left-[8%] w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-amber-300/25 rotate-12" />
    {/* Small blue square — mid-right */}
    <div className="absolute top-[20%] right-[12%] w-12 h-12 md:w-20 md:h-20 rounded-xl bg-blue-400/20 -rotate-12" />
    {/* Tiny green circle */}
    <div className="absolute bottom-[30%] right-[20%] w-8 h-8 md:w-12 md:h-12 rounded-full bg-emerald-400/20" />
    {/* Dotted pattern — subtle texture */}
    <div className="absolute top-[15%] left-[15%] w-32 h-32 opacity-[0.04]"
      style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }}
    />
  </div>
);

const HeroSection = ({ userName, showProgress }: HeroSectionProps = {}) => {
  const isLoggedIn = !!userName;
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

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
      {/* HERO — Bright, clean, fresh design */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white"
      >
        {/* Decorative geometric shapes */}
        <GeometricShapes />

        <motion.div
          style={{ opacity }}
          className="relative z-10 container mx-auto px-5 pt-24 pb-16 md:pt-32 md:pb-24"
        >
          {isLoggedIn ? (
            /* ===== LOGGED-IN HERO CONTENT ===== */
            <>
              <motion.div style={{ y: textY }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-medium text-blue-700">
                      {language === 'hu' ? 'Online' : 'Online'}
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight max-w-3xl mx-auto"
                >
                  {language === 'hu' ? `Üdv újra, ` : language === 'de' ? `Willkommen zurück, ` : `Welcome back, `}
                  <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  !
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-center"
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
                  className="mt-8 max-w-md mx-auto"
                >
                  <div className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-5">
                    <UserProgressBar />
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
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground/80">
                    {language === 'hu' ? 'Közösségi fenntarthatósági platform' : language === 'de' ? 'Gemeinschaftliche Nachhaltigkeitsplattform' : 'Community Sustainability Platform'}
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08] tracking-tight max-w-4xl mx-auto"
                >
                  {h.line1}{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                    {h.accent}
                  </span>{' '}
                  {h.line2}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed"
                >
                  {h.subtitle}
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
              >
                <Link to="/auth?role=member">
                  <Button
                    size="lg"
                    className="rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold px-8 w-full sm:w-auto sm:min-w-[220px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {language === 'hu' ? 'Csatlakozom' : language === 'de' ? 'Jetzt beitreten' : 'Join Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth?role=expert">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-foreground/15 text-foreground hover:bg-foreground/5 hover:border-foreground/25 font-semibold px-8 w-full sm:w-auto sm:min-w-[220px] transition-all duration-300"
                  >
                    {language === 'hu' ? 'Szakértő vagyok' : language === 'de' ? 'Ich bin Experte' : "I'm an Expert"}
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof — pill-style stats */}
              {stats && (stats.members > 0 || stats.experts > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4"
                >
                  {stats.members > 0 && (
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04]">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-foreground">{stats.members}</span>
                        <span className="text-sm text-muted-foreground ml-1.5">
                          {language === 'hu' ? 'tag' : language === 'de' ? 'Mitglieder' : 'members'}
                        </span>
                      </div>
                    </div>
                  )}
                  {stats.experts > 0 && (
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04]">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-foreground">{stats.experts}</span>
                        <span className="text-sm text-muted-foreground ml-1.5">
                          {language === 'hu' ? 'szakértő' : language === 'de' ? 'Experten' : 'experts'}
                        </span>
                      </div>
                    </div>
                  )}
                  {stats.programs > 0 && (
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04]">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-foreground">{stats.programs}</span>
                        <span className="text-sm text-muted-foreground ml-1.5">
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
      </section>

      {/* VALUE PROPOSITION — Colorful card grid */}
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

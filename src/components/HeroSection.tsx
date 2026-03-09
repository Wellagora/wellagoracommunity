import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Sparkles, ArrowRight, Leaf, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

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
      subtitle: "Szakértők, alkotók és közösségi tagok platformja — a fenntartható életmód és tudásmegosztás új formája.",
    },
    en: {
      line1: "Where local knowledge",
      accent: "becomes",
      line2: "community.",
      subtitle: "A platform for experts, creators and community members — a new form of sustainable living and knowledge sharing.",
    },
    de: {
      line1: "Wo lokales Wissen",
      accent: "zur Gemeinschaft",
      line2: "wird.",
      subtitle: "Eine Plattform für Experten, Kreative und Community-Mitglieder — eine neue Form nachhaltigen Lebens und Wissensaustauschs.",
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
      {/* HERO — Modern, light with bold typography */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-white"
      >
        {/* Subtle ambient gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-50/50 rounded-full blur-[80px]" />
        </div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {language === 'hu' ? 'Közösségi creator platform' : language === 'de' ? 'Community Creator Plattform' : 'Community Creator Platform'}
              </span>
            </div>
          </motion.div>

          {/* Headline — Large, bold, one clear message */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight max-w-4xl mx-auto"
          >
            {h.line1}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {h.accent}
            </span>{' '}
            {h.line2}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed"
          >
            {h.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth?role=member">
              <Button
                size="lg"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 min-w-[200px] shadow-lg shadow-emerald-600/25 transition-all hover:shadow-xl hover:shadow-emerald-600/30"
              >
                {language === 'hu' ? 'Csatlakozom ingyen' : language === 'de' ? 'Kostenlos beitreten' : 'Join for Free'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth?role=expert">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-foreground/20 text-foreground hover:bg-foreground/5 font-semibold px-8 min-w-[200px] transition-all"
              >
                {language === 'hu' ? 'Szakértő vagyok' : language === 'de' ? 'Ich bin Experte' : "I'm an Expert"}
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof — real stats */}
          {stats && (stats.members > 0 || stats.experts > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12"
            >
              {stats.members > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{stats.members}</span>
                    <span className="text-sm text-muted-foreground ml-1.5">
                      {language === 'hu' ? 'tag' : language === 'de' ? 'Mitglieder' : 'members'}
                    </span>
                  </div>
                </div>
              )}
              {stats.experts > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{stats.experts}</span>
                    <span className="text-sm text-muted-foreground ml-1.5">
                      {language === 'hu' ? 'szakértő' : language === 'de' ? 'Experten' : 'experts'}
                    </span>
                  </div>
                </div>
              )}
              {stats.programs > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{stats.programs}</span>
                    <span className="text-sm text-muted-foreground ml-1.5">
                      {language === 'hu' ? 'program' : language === 'de' ? 'Programme' : 'programs'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* VALUE PROPOSITION — Bento-style cards */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50/80">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {valueProps.map((vp, i) => (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group bg-white rounded-2xl p-6 border border-border/50 hover:border-emerald-200/60 hover:shadow-lg transition-all duration-300"
              >
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-amber-50/0 group-hover:from-emerald-50/50 group-hover:to-amber-50/30 transition-all duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <vp.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{vp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{vp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;

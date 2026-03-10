import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Sparkles, Star, CheckCircle2, ArrowRight, Leaf, Heart, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const FoundingExpertPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // Fetch current expert count
  const { data: expertCount } = useQuery({
    queryKey: ['founding-expert-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'expert');
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  const spotsRemaining = Math.max(0, 20 - (expertCount || 0));

  const benefits = [
    {
      icon: Star,
      titleKey: 'founding_expert.benefit_1_title',
      descKey: 'founding_expert.benefit_1_desc',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Users,
      titleKey: 'founding_expert.benefit_2_title',
      descKey: 'founding_expert.benefit_2_desc',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: BookOpen,
      titleKey: 'founding_expert.benefit_3_title',
      descKey: 'founding_expert.benefit_3_desc',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Heart,
      titleKey: 'founding_expert.benefit_4_title',
      descKey: 'founding_expert.benefit_4_desc',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
  ];

  const steps = [
    { num: '1', key: 'founding_expert.step_1' },
    { num: '2', key: 'founding_expert.step_2' },
    { num: '3', key: 'founding_expert.step_3' },
  ];

  const seoDescription = language === 'hu'
    ? 'Legyél a WellAgora első 20 Founding Expert-je! Prémium hozzáférés, kiemelt profil és közösségi hatás.'
    : language === 'de'
    ? 'Werden Sie einer der ersten 20 Founding Experts von WellAgora! Premium-Zugang und hervorgehobenes Profil.'
    : 'Be one of WellAgora\'s first 20 Founding Experts! Premium access, featured profile, and community impact.';

  return (
    <>
      <SEOHead
        title={language === 'hu' ? 'Founding Expert Program — WellAgora' : `Founding Expert Program — WellAgora`}
        description={seoDescription}
        url="/founding-expert"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-emerald-50/40" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                {language === 'hu' ? 'Korlátozott lehetőség' : language === 'de' ? 'Begrenzte Möglichkeit' : 'Limited Opportunity'}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('founding_expert.hero_title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('founding_expert.hero_subtitle')}
              </p>

              {/* Spots Counter */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-lg border border-amber-100 mb-8">
                <div className="flex items-center gap-1.5">
                  {[...Array(Math.min(spotsRemaining, 20))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i < (expertCount || 0) ? 'bg-amber-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {spotsRemaining > 0
                    ? language === 'hu'
                      ? `Még ${spotsRemaining} hely elérhető a 20-ból`
                      : language === 'de'
                      ? `Noch ${spotsRemaining} von 20 Plätzen verfügbar`
                      : `${spotsRemaining} of 20 spots remaining`
                    : language === 'hu'
                    ? 'Minden hely betelt!'
                    : language === 'de'
                    ? 'Alle Plätze sind belegt!'
                    : 'All spots are taken!'}
                </span>
              </div>

              {/* CTA */}
              <div>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg" asChild>
                  <Link to={user ? "/profile" : "/auth"}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('founding_expert.cta_apply')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t('founding_expert.benefits_title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex gap-4">
                        <div className={`w-12 h-12 rounded-xl ${benefit.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${benefit.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {t(benefit.titleKey)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(benefit.descKey)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to Apply */}
        <section className="py-12 bg-gradient-to-b from-white to-amber-50/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t('founding_expert.how_to_apply_title')}
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-5 bg-white rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <p className="text-foreground pt-1.5">
                    {t(step.key)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Leaf className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t('founding_expert.final_cta_title')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                {t('founding_expert.final_cta_desc')}
              </p>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8" asChild>
                <Link to={user ? "/profile" : "/auth"}>
                  {t('founding_expert.cta_apply')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FoundingExpertPage;

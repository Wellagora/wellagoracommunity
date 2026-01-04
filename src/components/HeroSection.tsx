import { Link } from "react-router-dom";
import { Users, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { t } = useLanguage();

  const registrationPaths = [
    {
      id: 'member',
      icon: Users,
      title: t('landing.card_member_title'),
      description: t('landing.card_member_desc_short'),
      cta: t('landing.card_member_cta'),
      link: '/auth?role=member',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-white',
      borderColor: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-400',
      hoverShadow: 'hover:shadow-lg hover:shadow-cyan-100/50',
      iconGradient: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      buttonBg: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      cardBg: 'bg-gradient-to-br from-purple-50 to-white',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400',
      hoverShadow: 'hover:shadow-lg hover:shadow-purple-100/50',
      iconGradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
      buttonBg: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      cardBg: 'bg-gradient-to-br from-amber-50 to-white',
      borderColor: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      hoverShadow: 'hover:shadow-lg hover:shadow-amber-100/50',
      iconGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden flex flex-col items-center justify-center">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-slate-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Helyi értékek. Átadott tudás.{' '}
            <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Élő közösség.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('landing.hero_subtitle')}
          </motion.p>

          {/* Registration Cards - Integrated in Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {registrationPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="group"
                >
                  <Card
                    className={`relative overflow-hidden border-2 ${path.cardBg} ${path.borderColor} ${path.hoverBorder} ${path.hoverShadow} transition-all duration-300 hover:-translate-y-1 rounded-2xl`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl ${path.iconGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {path.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-600 text-sm mb-5">
                        {path.description}
                      </p>
                      
                      {/* CTA Button */}
                      <Link to={path.link} className="w-full">
                        <Button 
                          className={`w-full text-white ${path.buttonBg}`}
                        >
                          {path.cta}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
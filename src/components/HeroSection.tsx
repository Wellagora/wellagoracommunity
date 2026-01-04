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
      borderColor: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-500',
      selectedBorder: 'border-cyan-500',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      buttonBg: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-500',
      selectedBorder: 'border-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonBg: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      borderColor: 'border-amber-200',
      hoverBorder: 'hover:border-amber-500',
      selectedBorder: 'border-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
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
            {t('landing.hero_title')}
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
                >
                  <Card
                    className={`relative overflow-hidden border-2 ${path.borderColor} ${path.hoverBorder} bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${path.iconBg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-6 h-6 ${path.iconColor}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {path.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-600 text-sm mb-4">
                        {path.description}
                      </p>
                      
                      {/* CTA Button */}
                      <Link to={path.link} className="w-full">
                        <Button 
                          size="sm"
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
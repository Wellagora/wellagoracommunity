import { Link } from "react-router-dom";
import { Users, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      gradient: 'from-cyan-400 to-cyan-600',
      shadowColor: 'shadow-cyan-500/10 hover:shadow-cyan-500/20',
      buttonGradient: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      buttonShadow: 'shadow-cyan-500/30',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      gradient: 'from-purple-400 to-purple-600',
      shadowColor: 'shadow-purple-500/10 hover:shadow-purple-500/20',
      buttonGradient: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      buttonShadow: 'shadow-purple-500/30',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      gradient: 'from-amber-400 to-amber-600',
      shadowColor: 'shadow-amber-500/10 hover:shadow-amber-500/20',
      buttonGradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      buttonShadow: 'shadow-amber-500/30',
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-white">
      {/* Subtle dot pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-100/50 to-cyan-50/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-100/40 to-purple-50/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-100/30 to-amber-50/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-900 font-inter"
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
            className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-inter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('landing.hero_subtitle')}
          </motion.p>

          {/* Premium Registration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {registrationPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <div
                    className={`
                      relative overflow-hidden
                      bg-white/80 backdrop-blur-sm
                      border border-slate-200/50
                      shadow-xl ${path.shadowColor}
                      rounded-2xl p-6
                      hover:shadow-2xl
                      transition-all duration-300
                      cursor-pointer
                    `}
                  >
                    {/* Gradient icon container */}
                    <div className={`
                      w-14 h-14 rounded-xl mx-auto
                      bg-gradient-to-br ${path.gradient}
                      flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                      shadow-lg ${path.buttonShadow}
                    `}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mt-4 font-inter">
                      {path.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-slate-600 text-sm mt-1 font-inter">
                      {path.description}
                    </p>
                    
                    {/* CTA Button */}
                    <Link to={path.link} className="block mt-5">
                      <Button 
                        className={`
                          w-full text-white font-medium
                          bg-gradient-to-r ${path.buttonGradient}
                          shadow-lg ${path.buttonShadow}
                          transition-all duration-300
                        `}
                      >
                        {path.cta}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;
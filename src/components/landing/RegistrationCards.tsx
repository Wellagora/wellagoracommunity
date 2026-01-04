import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const RegistrationCards = () => {
  const { t } = useLanguage();

  const registrationPaths = [
    {
      id: 'member',
      icon: Users,
      title: t('landing.card_member_title') || 'Tag vagyok',
      description: t('landing.card_member_desc') || 'Fedezd fel a támogatott Műhelytitokokat és használd a kuponokat',
      cta: t('landing.card_member_cta') || 'Regisztrálok Tagként',
      link: '/auth?role=member',
      borderColor: 'border-cyan-500/50',
      iconColor: 'text-cyan-400',
      bgGlow: 'from-cyan-500/10 to-transparent',
      hoverBorder: 'hover:border-cyan-400',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title') || 'Szakértő vagyok',
      description: t('landing.card_expert_desc') || 'Oszd meg a tudásodat, validáld a kuponokat, kapj tiszteletdíjat',
      cta: t('landing.card_expert_cta') || 'Szakértőként csatlakozom',
      link: '/auth?role=expert',
      borderColor: 'border-purple-500/50',
      iconColor: 'text-purple-400',
      bgGlow: 'from-purple-500/10 to-transparent',
      hoverBorder: 'hover:border-purple-400',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title') || 'Támogató vagyok',
      description: t('landing.card_sponsor_desc') || 'Támogasd a közösséget, kezeld a kampányokat, mérd az eredményeket',
      cta: t('landing.card_sponsor_cta') || 'Támogatóként belépek',
      link: '/auth?role=sponsor',
      borderColor: 'border-amber-500/50',
      iconColor: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      hoverBorder: 'hover:border-amber-400',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.hero_title') || 'Helyi Szaktudás. Vállalati Támogatás. Közösségi Érték.'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.hero_subtitle') || 'Csatlakozz a regionális tudásmegosztó ökoszisztémához'}
          </p>
        </motion.div>

        {/* Registration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {registrationPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`relative overflow-hidden border-2 ${path.borderColor} ${path.hoverBorder} bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                >
                  {/* Background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${path.bgGlow} opacity-50`} />
                  
                  <CardContent className="relative z-10 p-6 flex flex-col items-center text-center min-h-[280px]">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-card/80 border border-border/50 flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${path.iconColor}`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {path.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-6 flex-1">
                      {path.description}
                    </p>
                    
                    {/* CTA Button */}
                    <Link to={path.link} className="w-full">
                      <Button 
                        variant="outline" 
                        className={`w-full ${path.borderColor} ${path.hoverBorder} hover:bg-card/50`}
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
    </section>
  );
};

export default RegistrationCards;

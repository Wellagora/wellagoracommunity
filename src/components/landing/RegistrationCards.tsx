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
      description: t('landing.card_member_desc_short') || 'Kuponok és tartalmak felfedezése',
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
      description: t('landing.card_expert_desc_short') || 'Tudásmegosztás, tiszteletdíj',
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
      description: t('landing.card_sponsor_desc_short') || 'Kampányok, eredmények mérése',
      cta: t('landing.card_sponsor_cta') || 'Támogatóként belépek',
      link: '/auth?role=sponsor',
      borderColor: 'border-amber-500/50',
      iconColor: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      hoverBorder: 'hover:border-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
      {registrationPaths.map((path, index) => {
        const Icon = path.icon;
        return (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
          >
            <Card
              className={`relative overflow-hidden border-2 ${path.borderColor} ${path.hoverBorder} bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Background glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${path.bgGlow} opacity-50`} />
              
              <CardContent className="relative z-10 p-4 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center mb-3">
                  <Icon className={`w-6 h-6 ${path.iconColor}`} />
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {path.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4">
                  {path.description}
                </p>
                
                {/* CTA Button */}
                <Link to={path.link} className="w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
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
  );
};

export default RegistrationCards;

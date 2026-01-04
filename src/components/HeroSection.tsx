import { Link } from "react-router-dom";
import { Users, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      buttonClass: 'bg-cyan-600 hover:bg-cyan-700',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      buttonClass: 'bg-violet-600 hover:bg-violet-700',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-20">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Clean headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
          Helyi értékek. Átadott tudás.
          <br />
          Élő közösség.
        </h1>

        <p className="text-xl text-slate-600 mt-6 max-w-2xl mx-auto">
          {t('landing.hero_subtitle')}
        </p>

        {/* Premium cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {registrationPaths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className="bg-white border border-slate-200 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Icon container */}
                <div className={`w-14 h-14 rounded-2xl ${path.iconBg} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-7 w-7 ${path.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mt-4">
                  {path.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mt-1">
                  {path.description}
                </p>

                {/* CTA Button */}
                <Link to={path.link} className="block mt-5">
                  <Button className={`w-full text-white font-medium ${path.buttonClass}`}>
                    {path.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
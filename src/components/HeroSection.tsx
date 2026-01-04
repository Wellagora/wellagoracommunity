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
      iconBg: 'bg-[#007AFF]/10',
      iconColor: 'text-[#007AFF]',
      buttonClass: 'bg-[#007AFF] hover:bg-[#0056b3]',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      iconBg: 'bg-[#007AFF]/10',
      iconColor: 'text-[#007AFF]',
      buttonClass: 'bg-[#007AFF] hover:bg-[#0056b3]',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      iconBg: 'bg-[#007AFF]/10',
      iconColor: 'text-[#007AFF]',
      buttonClass: 'bg-[#007AFF] hover:bg-[#0056b3]',
    },
  ];

  return (
    <section className="min-h-screen bg-white flex items-center justify-center py-20">
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
                className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
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
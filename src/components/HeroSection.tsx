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
      iconGradient: 'from-emerald-400 to-teal-500',
      buttonClass: 'bg-[#34C759] hover:bg-[#2DB14E]',
    },
    {
      id: 'expert',
      icon: Sparkles,
      title: t('landing.card_expert_title'),
      description: t('landing.card_expert_desc_short'),
      cta: t('landing.card_expert_cta'),
      link: '/auth?role=expert',
      iconGradient: 'from-sky-400 to-blue-500',
      buttonClass: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      id: 'sponsor',
      icon: Building2,
      title: t('landing.card_sponsor_title'),
      description: t('landing.card_sponsor_desc_short'),
      cta: t('landing.card_sponsor_cta'),
      link: '/auth?role=sponsor',
      iconGradient: 'from-amber-400 to-orange-500',
      buttonClass: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">
      {/* Subtle Pastel Mesh Gradient Background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, hsl(199 89% 96%) 0%, hsl(166 76% 96%) 40%, hsl(142 71% 96%) 100%)',
        }}
      />
      {/* Subtle mesh overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(199 89% 85% / 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, hsl(166 76% 85% / 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, hsl(142 71% 85% / 0.3) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        {/* Clean headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
          Helyi értékek. Átadott tudás.
          <br />
          Élő közösség.
        </h1>

        <p className="text-xl text-slate-600 mt-6 max-w-2xl mx-auto">
          {t('landing.hero_subtitle')}
        </p>

        {/* Premium 3D cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {registrationPaths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 group"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 20px 50px -10px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Icon container with pastel gradient */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.iconGradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
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
                  <Button className={`w-full text-white font-medium ${path.buttonClass} shadow-lg`}>
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
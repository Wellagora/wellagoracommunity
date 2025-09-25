import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { useLanguage } from "@/contexts/LanguageContext";
import sustainabilityVision from "@/assets/sustainability-vision.png";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <HeroSection />

      {/* Features Overview with 3D Cards */}
      <section className="py-20 bg-gradient-subtle border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up-3d">
            <h2 className="text-5xl font-bold text-foreground mb-6">
              {t('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Link to="/challenges" className="animate-slide-in-3d">
              <FeatureCard3D 
                icon={<span className="text-3xl">🌱</span>}
                title={t('features.challenges.title')}
                description={t('features.challenges.description')}
                className="hover:border-primary/60 cursor-pointer h-full"
              />
            </Link>

            <Link to="/ai-assistant" className="animate-slide-in-3d" style={{ animationDelay: '0.1s' }}>
              <FeatureCard3D 
                icon={<span className="text-3xl">🤖</span>}
                title={t('features.ai.title')}
                description={t('features.ai.description')}
                className="hover:border-secondary/60 cursor-pointer h-full"
              />
            </Link>

            <Link to="/community" className="animate-slide-in-3d" style={{ animationDelay: '0.2s' }}>
              <FeatureCard3D 
                icon={<span className="text-3xl">👥</span>}
                title={t('features.community.title')}
                description={t('features.community.description')}
                className="hover:border-accent/60 cursor-pointer h-full"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with enhanced 3D logo */}
      <footer className="bg-gradient-wave py-16 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-wave-pattern opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-3xl shadow-glow group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                    alt="Wellagora Logo" 
                    className="w-24 h-24 object-contain logo-enhanced"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-sm">✨</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-6xl font-bold text-foreground">
                  Wellagora
                </span>
                <p className="text-foreground/80 text-xl font-medium mt-2">Sustainability Community Platform</p>
              </div>
            </div>
            
            <p className="text-foreground/90 text-lg mb-4 font-medium">
              {t('footer.tagline')}
            </p>
            
            <p className="text-foreground/60 text-sm">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
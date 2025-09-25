import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Leaf, Users, Target, Globe, TrendingUp, Sparkles, Heart, Star } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <HeroSection />

      {/* Features Overview */}
      <section className="py-24 bg-gradient-subtle border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-up-3d">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">{t('features.badge')}</span>
            </div>
            <h2 className="text-6xl font-bold text-foreground mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('features.title')}
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link to="/challenges" className="animate-slide-in-3d group">
              <FeatureCard3D 
                icon={
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                }
                title={t('features.challenges.title')}
                description={t('features.challenges.description')}
                className="hover:border-primary/60 cursor-pointer h-full bg-card/60 backdrop-blur-sm"
              />
            </Link>

            <Link to="/ai-assistant" className="animate-slide-in-3d group" style={{ animationDelay: '0.1s' }}>
              <FeatureCard3D 
                icon={
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                }
                title={t('features.ai.title')}
                description={t('features.ai.description')}
                className="hover:border-secondary/60 cursor-pointer h-full bg-card/60 backdrop-blur-sm"
              />
            </Link>

            <Link to="/community" className="animate-slide-in-3d group" style={{ animationDelay: '0.2s' }}>
              <FeatureCard3D 
                icon={
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-success rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                }
                title={t('features.community.title')}
                description={t('features.community.description')}
                className="hover:border-accent/60 cursor-pointer h-full bg-card/60 backdrop-blur-sm"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* Impact Stories */}
      <section className="py-24 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-up">
            <div className="inline-flex items-center space-x-2 bg-accent/10 px-6 py-3 rounded-full mb-6">
              <Heart className="w-5 h-5 text-accent" />
              <span className="text-accent font-semibold">{t('impact.badge')}</span>
            </div>
            <h2 className="text-5xl font-bold text-foreground mb-8">
              {t('impact.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('impact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 hover:border-primary/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-premium animate-fade-up">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">2.5M kg</div>
              <div className="text-muted-foreground mb-4">{t('impact.co2_saved')}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('impact.co2_description')}
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 hover:border-secondary/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-premium animate-fade-up delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">10,000+</div>
              <div className="text-muted-foreground mb-4">{t('impact.champions')}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('impact.champions_description')}
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 hover:border-accent/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-premium animate-fade-up delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-success rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground mb-4">{t('impact.countries')}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('impact.countries_description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-wave-pattern opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-fade-up">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Star className="w-5 h-5 text-warning" />
              <span className="text-white font-semibold">{t('cta.badge')}</span>
            </div>
            <h2 className="text-6xl font-bold text-white mb-8 leading-tight">
              {t('cta.title')}
            </h2>
            <p className="text-2xl text-white/90 mb-12 leading-relaxed">
              {t('cta.description')}
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-glow hover:shadow-premium hover:-translate-y-2"
            >
              <span>{t('cta.button')}</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-wave py-20 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-wave-pattern opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:space-x-12 mb-12">
              <div className="relative group mb-8 lg:mb-0">
                <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-3xl shadow-glow group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                    alt="Wellagora Logo" 
                    className="w-36 h-36 object-contain logo-enhanced"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-warning rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-8xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Wellagora
                </h3>
                <p className="text-foreground/80 text-2xl font-medium mb-4">Sustainability Community Platform</p>
                <p className="text-foreground/90 text-xl font-medium">
                  {t('footer.tagline')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/30">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-foreground/80">{t('footer.stats.champions')}</div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/30">
                <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                <div className="text-foreground/80">{t('footer.stats.countries')}</div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/30">
                <div className="text-3xl font-bold text-success mb-2">2.5M</div>
                <div className="text-foreground/80">{t('footer.stats.co2_saved')}</div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/30">
                <div className="text-3xl font-bold text-accent mb-2">50,000+</div>
                <div className="text-foreground/80">{t('footer.stats.challenges')}</div>
              </div>
            </div>
            
            <p className="text-foreground/60 text-lg">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
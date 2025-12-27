import { Link } from "react-router-dom";
import { Sparkles, Globe, Users, Target, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const HeroSection = () => {
  const { stats, loading } = useCommunityStats();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-mountain-mist"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-aqua-glow"></div>
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-r from-primary/20 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-gradient-to-r from-accent/15 to-info/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full"></div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Refined Organic Shapes */}
      <div className="absolute inset-0 bg-organic-shapes opacity-30"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Impact Platform Badge */}
          <div className="inline-flex items-center space-x-3 bg-glass backdrop-blur-xl px-6 py-3 rounded-full border border-accent/20 mb-6 animate-fade-up shadow-glow">
            <Zap className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-white font-semibold text-sm tracking-wide uppercase">{t('hero.impact_badge')}</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>

          {/* Main Headline with Gradient Text */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-bold mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              {t('hero.headline_part1')}
            </span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-accent via-secondary to-info bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                {t('hero.headline_part2')}
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-info rounded-full opacity-60 blur-sm"></div>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed font-body animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.subheadline')}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center space-x-2 bg-glass/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-white/90 text-sm font-medium">{t('hero.trust_badge_members')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-glass/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-white/90 text-sm font-medium">{t('hero.trust_badge_challenges')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-glass/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-white/90 text-sm font-medium">{t('hero.trust_badge_impact')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth">
              <Button 
                variant="premium" 
                size="lg" 
                className="text-lg px-10 py-7 rounded-2xl group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin transition-transform" />
                  {t('hero.cta_primary')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link to="/piacer">
              <Button 
                variant="glass" 
                size="lg" 
                className="group text-lg px-10 py-7 rounded-2xl text-white border-white/20 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300"
              >
                <Globe className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                <span>{t('hero.cta_secondary')}</span>
              </Button>
            </Link>
          </div>

          {/* Enhanced Stats Section with Icons and Animated Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { 
                icon: Users, 
                value: loading ? 0 : stats.members, 
                label: t('hero.stat_members'), 
                gradient: "from-primary to-info",
                suffix: "+"
              },
              { 
                icon: Target, 
                value: loading ? 0 : stats.completions, 
                label: t('hero.stat_completions'), 
                gradient: "from-info to-accent",
                suffix: "+"
              },
              { 
                icon: TrendingUp, 
                value: loading ? 0 : stats.points, 
                label: t('hero.stat_points'), 
                gradient: "from-accent to-success",
                suffix: ""
              },
              { 
                icon: Zap, 
                value: loading ? 0 : stats.activeChallenges, 
                label: t('hero.stat_active_challenges'), 
                gradient: "from-primary to-accent",
                suffix: ""
              }
            ].map((stat, index) => (
              <Card 
                key={index} 
                className="bg-glass/80 backdrop-blur-xl border border-primary/10 hover:border-accent/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow group cursor-default"
              >
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} mx-auto mb-3 lg:mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-vibrant bg-clip-text text-transparent mb-1">
                    {loading ? (
                      <div className="h-8 w-16 mx-auto bg-white/10 rounded animate-pulse"></div>
                    ) : (
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs lg:text-sm font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;

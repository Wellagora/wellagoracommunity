import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Globe, Users, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated Organic Background */}
      <div className="absolute inset-0 bg-organic-shapes opacity-60"></div>
      <div className="absolute inset-0 bg-wave-pattern opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Brand Badge */}
          <div className="inline-flex items-center space-x-3 bg-glass backdrop-blur-xl px-8 py-4 rounded-full border border-white/30 mb-8 animate-fade-up shadow-glow">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-white font-bold text-lg tracking-wide">Nature Meets Technology</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>

          {/* Achievement Badge */}
          <div className="inline-flex items-center space-x-2 bg-glass/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">Join 12,500+ Sustainability Champions</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl lg:text-8xl font-heading font-bold text-white mb-8 leading-tight animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Build Your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
                Handprint
              </span>
              <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-aqua rounded-full opacity-70 blur-sm"></div>
            </span>
            <br />
            <span className="text-white/95">
              Shape the
            </span>
            {" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-white/90 mb-14 max-w-4xl mx-auto leading-relaxed font-body animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Wellagora unites{" "}
            <span className="text-accent font-semibold">citizens</span>,{" "}
            <span className="text-secondary font-semibold">businesses</span>,{" "}
            <span className="text-primary font-semibold">governments</span>, and{" "}
            <span className="text-success font-semibold">NGOs</span>
            <br />
            to create measurable positive environmental impact through personalized programs and community action
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth">
              <Button variant="premium" size="lg" className="group text-lg px-12 py-7 rounded-2xl">
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="glass" size="lg" className="group text-lg px-12 py-7 rounded-2xl">
                <Globe className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                <span>Explore Programs</span>
              </Button>
            </Link>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: Users, value: "12,500+", label: "Active Champions", gradient: "from-primary to-secondary" },
              { icon: Target, value: "58,000+", label: "Programs Completed", gradient: "from-secondary to-accent" },
              { icon: TrendingUp, value: "3.2M kg", label: "CO₂ Reduced", gradient: "from-accent to-success" },
              { icon: Globe, value: "65+", label: "Countries", gradient: "from-success to-info" }
            ].map((stat, index) => (
              <Card key={index} className="bg-glass backdrop-blur-xl border-white/30 hover:border-white/50 transition-all hover:-translate-y-2 hover:shadow-glow group">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

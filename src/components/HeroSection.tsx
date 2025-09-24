import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  ArrowRight,
  Users,
  Target,
  Zap,
  Globe
} from "lucide-react";
import heroImage from "@/assets/hero-tech.jpg";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Active Members" },
    { icon: Target, value: "2.5M", label: "Challenges Completed" },
    { icon: Zap, value: "180", label: "Partner Organizations" },
    { icon: Globe, value: "25", label: "Regions Connected" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-nature">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Sustainable technology and green innovation" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/96 via-background/88 to-background/92"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-primary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-ocean opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-10">
          {/* Hero Badge */}
          <div className="animate-fade-up">
            <Badge className="bg-glass border-primary/30 text-primary px-6 py-3 text-sm font-medium backdrop-blur-md hover-lift">
              🌱 Regional Sustainability Orchestrator Platform
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-bold text-foreground leading-[0.9] text-balance">
              Unite Your Region for{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent relative">
                Sustainable Impact
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-primary rounded-full opacity-30"></div>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-body">
              Connect municipalities, businesses, NGOs, and citizens in coordinated sustainability actions 
              with AI-powered personalization, gamification, and community-driven change.
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-spring px-10 py-6 text-xl font-semibold rounded-2xl hover-lift group"
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 px-10 py-6 text-xl rounded-2xl backdrop-blur-sm bg-glass hover-lift group"
            >
              <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16 animate-fade-up" style={{ animationDelay: "0.6s" }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="bg-glass backdrop-blur-md rounded-3xl p-8 shadow-premium hover:shadow-glow transition-spring hover-lift group border border-white/20"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-gradient-primary rounded-2xl group-hover:scale-110 transition-transform">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground text-center">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Stakeholder Types */}
          <div className="pt-12 animate-fade-up" style={{ animationDelay: "0.8s" }}>
            <p className="text-lg text-muted-foreground mb-8 font-medium">Trusted by stakeholders across regions</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "🏛️ Municipalities",
                "🏢 Businesses", 
                "❤️ NGOs",
                "👥 Citizens",
                "🎓 Schools",
                "🌐 Regional Bodies"
              ].map((stakeholder) => (
                <Badge 
                  key={stakeholder}
                  variant="secondary" 
                  className="px-6 py-3 text-base bg-glass backdrop-blur-md border-white/20 hover:bg-primary/10 hover:border-primary/30 transition-spring hover-lift"
                >
                  {stakeholder}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-xl animate-float hidden lg:block"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-ocean opacity-20 rounded-full blur-xl animate-float hidden lg:block" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-8 w-20 h-20 bg-gradient-sunset opacity-20 rounded-full blur-xl animate-float hidden lg:block" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-primary/20 rounded-full blur-lg animate-pulse hidden lg:block"></div>
    </section>
  );
};

export default HeroSection;
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
import heroImage from "@/assets/hero-sustainability.jpg";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Active Members" },
    { icon: Target, value: "2.5M", label: "Challenges Completed" },
    { icon: Zap, value: "180", label: "Partner Organizations" },
    { icon: Globe, value: "25", label: "Regions Connected" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Sustainable community collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Hero Badge */}
          <div className="animate-slide-up">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              🌱 Regional Sustainability Orchestrator Platform
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Unite Your Region for{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Sustainable Impact
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect municipalities, businesses, NGOs, and citizens in coordinated sustainability actions 
              with AI-powered personalization, gamification, and community-driven change.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-smooth px-8 py-4 text-lg font-semibold"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary/30 hover:bg-primary/5 px-8 py-4 text-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-eco transition-smooth"
              >
                <div className="flex flex-col items-center space-y-2">
                  <stat.icon className="w-8 h-8 text-primary mb-2" />
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stakeholder Types Preview */}
          <div className="pt-8 animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <p className="text-muted-foreground mb-6">Trusted by stakeholders across regions</p>
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
                  className="px-4 py-2 text-sm hover:bg-primary/10 transition-smooth"
                >
                  {stakeholder}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-accent/10 rounded-full animate-float hidden lg:block" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-8 w-12 h-12 bg-success/10 rounded-full animate-float hidden lg:block" style={{ animationDelay: "2s" }}></div>
    </section>
  );
};

export default HeroSection;
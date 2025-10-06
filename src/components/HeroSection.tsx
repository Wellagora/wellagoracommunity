import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Globe, Users, Target, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-light-transition overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 wave-bg">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Brand Tagline */}
          <div className="inline-flex items-center space-x-3 bg-glass backdrop-blur-md px-8 py-4 rounded-full border border-white/20 mb-6 animate-fade-up">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-white-elegant text-lg font-bold tracking-wide">Together we thrive</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>

          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-2 bg-glass/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 mb-8 animate-fade-up delay-100">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium">Join 10,000+ Sustainability Champions</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 animate-fade-up delay-200">
            Build Your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-success via-primary to-accent bg-clip-text text-transparent animate-pulse">
                Handprint
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-success via-primary to-accent rounded-full opacity-60"></div>
            </span>
            <br />
            <span className="text-white/90">
              Shape the
            </span>
            {" "}
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              World
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-up delay-300">
            Wellagora unites{" "}
            <span className="text-primary font-semibold">citizens</span>,{" "}
            <span className="text-secondary font-semibold">businesses</span>,{" "}
            <span className="text-accent font-semibold">municipalities</span>, and{" "}
            <span className="text-success font-semibold">NGOs</span>
            <br />
            to create measurable positive environmental impact through 
            AI-powered personalized challenges and community action.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-up delay-400">
            <Link
              to="/auth"
              className="group bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-glow hover:shadow-premium hover:-translate-y-2 flex items-center space-x-3"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/challenges"
              className="group bg-glass backdrop-blur-md border-2 border-white/30 hover:border-primary/50 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:-translate-y-2 flex items-center space-x-3"
            >
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore Challenges</span>
            </Link>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-up delay-500">
            <div className="bg-glass backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">10,000+</div>
              <div className="text-white/80 text-sm">Active Champions</div>
            </div>
            
            <div className="bg-glass backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-success/40 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 bg-success/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">50,000+</div>
              <div className="text-white/80 text-sm">Challenges Completed</div>
            </div>
            
            <div className="bg-glass backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-secondary/40 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">2.5M kg</div>
              <div className="text-white/80 text-sm">CO₂ Reduced</div>
            </div>
            
            <div className="bg-glass backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-accent/40 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">50+</div>
              <div className="text-white/80 text-sm">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import sustainabilityVision from "@/assets/sustainability-vision.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <HeroSection />

      {/* Features Overview */}
      <section className="py-20 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Sustainable Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform combines gamification, AI guidance, and community collaboration 
              to make sustainability engaging and achievable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link to="/challenges" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-primary/40">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">10 Challenge Categories</h3>
              <p className="text-white/80">
                From Energy Efficiency to Biodiversity - comprehensive sustainability challenges 
                tailored for citizens, businesses, municipalities, and NGOs.
              </p>
            </Link>

            <Link to="/ai-assistant" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-secondary/40">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-secondary transition-colors">AI Assistant</h3>
              <p className="text-white/80">
                Personalized sustainability guidance powered by AI. Get custom recommendations 
                based on your role, location, and progress.
              </p>
            </Link>

            <Link to="/community" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-accent/40">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent transition-colors">Community Hub</h3>
              <p className="text-white/80">
                Connect with like-minded individuals, share progress, participate in forums, 
                and celebrate achievements together.
              </p>
            </Link>

            <Link to="/dashboard" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-warning/40">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-warning transition-colors">Impact Dashboard</h3>
              <p className="text-white/80">
                Track your Carbon Handprint, visualize progress, and see your positive 
                environmental impact grow over time.
              </p>
            </Link>

            <Link to="/dashboard" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-destructive/40">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-destructive transition-colors">Gamification</h3>
              <p className="text-white/80">
                Earn points, unlock badges, climb leaderboards, and participate in 
                seasonal events to stay motivated on your sustainability journey.
              </p>
            </Link>

            <Link to="/auth" className="bg-glass backdrop-blur-md p-8 rounded-2xl shadow-glow border border-white/20 hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group hover:border-success/40">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-success transition-colors">Secure Authentication</h3>
              <p className="text-white/80">
                Role-based access with secure user profiles powered by Supabase. 
                Your data is safe and your journey is personalized.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of sustainability champions already making positive impact 
            through our platform. Start your journey today!
          </p>
          <Link
            to="/auth"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-premium hover:-translate-y-1 hover:shadow-glow"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-wave py-16 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-wave-pattern opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="relative group">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-3xl shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                    alt="Wellagora Logo" 
                    className="w-10 h-10 object-contain filter brightness-110"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs">✨</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary via-success to-secondary bg-clip-text text-transparent">
                  Wellagora
                </span>
                <p className="text-white/80 text-lg font-medium mt-1">Sustainability Community Platform</p>
              </div>
            </div>
            
            <div className="bg-glass backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8 max-w-2xl mx-auto">
              <p className="text-white/90 text-lg mb-4 font-medium">
                "Together We Thrive - Building a sustainable future, one action at a time."
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                  <span>10,000+ Champions</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span>50+ Countries</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                  <span>2.5M kg CO₂ Saved</span>
                </span>
              </div>
            </div>
            
            <p className="text-white/60 text-sm">© 2024 Wellagora. All rights reserved. | Making sustainability accessible for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
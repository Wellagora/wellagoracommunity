import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import sustainabilityVision from "@/assets/sustainability-vision.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Build a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Sustainable Future
              </span>
              {" "}Together
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Join our global community of citizens, businesses, municipalities, and NGOs 
              working together to create positive environmental impact through actionable challenges 
              and AI-powered guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-premium hover:-translate-y-1"
              >
                Start Your Journey
              </Link>
              <Link
                to="/dashboard"
                className="border-2 border-slate-600 hover:border-primary text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-glow"
              >
                Explore Challenges
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Impact Section - Remove this entire section */}

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
            <Link to="/challenges" className="bg-gradient-to-br from-primary/20 to-success/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">10 Challenge Categories</h3>
              <p className="text-muted-foreground">
                From Energy Efficiency to Biodiversity - comprehensive sustainability challenges 
                tailored for citizens, businesses, municipalities, and NGOs.
              </p>
            </Link>

            <Link to="/ai-assistant" className="bg-gradient-to-br from-secondary/20 to-accent/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-secondary transition-colors">AI Assistant</h3>
              <p className="text-muted-foreground">
                Personalized sustainability guidance powered by AI. Get custom recommendations 
                based on your role, location, and progress.
              </p>
            </Link>

            <Link to="/community" className="bg-gradient-to-br from-accent/20 to-secondary/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">Community Hub</h3>
              <p className="text-muted-foreground">
                Connect with like-minded individuals, share progress, participate in forums, 
                and celebrate achievements together.
              </p>
            </Link>

            <Link to="/dashboard" className="bg-gradient-to-br from-warning/20 to-primary/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-warning transition-colors">Impact Dashboard</h3>
              <p className="text-muted-foreground">
                Track your Carbon Handprint, visualize progress, and see your positive 
                environmental impact grow over time.
              </p>
            </Link>

            <Link to="/dashboard" className="bg-gradient-to-br from-destructive/20 to-warning/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-destructive transition-colors">Gamification</h3>
              <p className="text-muted-foreground">
                Earn points, unlock badges, climb leaderboards, and participate in 
                seasonal events to stay motivated on your sustainability journey.
              </p>
            </Link>

            <Link to="/auth" className="bg-gradient-to-br from-success/20 to-accent/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1 cursor-pointer group">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-success transition-colors">Secure Authentication</h3>
              <p className="text-muted-foreground">
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
      <footer className="bg-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-lg">
                <img 
                  src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                  alt="Wellagora Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-foreground">Wellagora</span>
            </div>
            <p className="text-muted-foreground mb-4">Together We Thrive - Building a sustainable future, one action at a time.</p>
            <p className="text-muted-foreground/60 text-sm">© 2024 Wellagora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
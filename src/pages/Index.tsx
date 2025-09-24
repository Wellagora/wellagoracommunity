import Navigation from "@/components/Navigation";
import sustainabilityVision from "@/assets/sustainability-vision.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-card to-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Build a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Sustainable Future
              </span>
              {" "}Together
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join our global community of citizens, businesses, municipalities, and NGOs 
              working together to create positive environmental impact through actionable challenges 
              and AI-powered guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-premium hover:-translate-y-1">
                Start Your Journey
              </button>
              <button className="border-2 border-border hover:border-primary text-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-glow">
                Explore Challenges
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Impact Section - Dark Theme */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Transforming Sustainability Through{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Global Connection
                </span>
              </h2>
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  Every action counts when millions of individuals, businesses, and organizations 
                  unite for a common purpose. Our platform connects sustainability champions 
                  worldwide, creating unprecedented collective impact.
                </p>
                <p>
                  Join a movement where innovation meets dedication, where local actions 
                  create global change, and where your contribution becomes part of 
                  something extraordinary.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-2xl">
                <img 
                  src={sustainabilityVision} 
                  alt="Global Sustainability Network - Connected Earth"
                  className="w-full h-auto object-cover rounded-2xl"
                />
                <div className="absolute inset-4 rounded-2xl bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="bg-gradient-to-br from-primary/20 to-success/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">10 Challenge Categories</h3>
              <p className="text-muted-foreground">
                From Energy Efficiency to Biodiversity - comprehensive sustainability challenges 
                tailored for citizens, businesses, municipalities, and NGOs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-secondary/20 to-accent/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">AI Assistant</h3>
              <p className="text-muted-foreground">
                Personalized sustainability guidance powered by AI. Get custom recommendations 
                based on your role, location, and progress.
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent/20 to-secondary/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Community Hub</h3>
              <p className="text-muted-foreground">
                Connect with like-minded individuals, share progress, participate in forums, 
                and celebrate achievements together.
              </p>
            </div>

            <div className="bg-gradient-to-br from-warning/20 to-primary/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Impact Dashboard</h3>
              <p className="text-muted-foreground">
                Track your Carbon Handprint, visualize progress, and see your positive 
                environmental impact grow over time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-destructive/20 to-warning/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Gamification</h3>
              <p className="text-muted-foreground">
                Earn points, unlock badges, climb leaderboards, and participate in 
                seasonal events to stay motivated on your sustainability journey.
              </p>
            </div>

            <div className="bg-gradient-to-br from-success/20 to-accent/20 p-8 rounded-2xl shadow-card border border-border hover:shadow-premium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Secure Authentication</h3>
              <p className="text-muted-foreground">
                Role-based access with secure user profiles powered by Supabase. 
                Your data is safe and your journey is personalized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary border-b border-border">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of sustainability champions already making positive impact 
            through our platform. Start your journey today!
          </p>
          <button className="bg-background hover:bg-card text-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-premium hover:-translate-y-1 hover:shadow-glow">
            Get Started Now
          </button>
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
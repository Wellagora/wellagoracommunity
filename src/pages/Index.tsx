import Navigation from "@/components/Navigation";
import sustainabilityVision from "@/assets/sustainability-vision.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Build a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                Sustainable Future
              </span>
              {" "}Together
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our global community of citizens, businesses, municipalities, and NGOs 
              working together to create positive environmental impact through actionable challenges 
              and AI-powered guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg">
                Start Your Journey
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Explore Challenges
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Platform Matters Section */}
      <section className="py-24 bg-gradient-to-br from-background via-card to-background modern-tech">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Why a Sustainability Community Platform Matters
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Sustainability challenges are complex and interconnected, 
                  requiring collective action that transcends traditional boundaries. 
                  Our platform serves as the vital bridge connecting executives, 
                  managers, entrepreneurs, and passionate individuals to drive 
                  meaningful real-world impact.
                </p>
                <p>
                  This isn't just another networking site—it's a movement where 
                  knowledge meets action, and every voice contributes to building a 
                  greener, more sustainable future for generations to come.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-premium">
                <img 
                  src={sustainabilityVision} 
                  alt="Global Sustainability Vision - Earth surrounded by orbital networks representing interconnected sustainability efforts"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Sustainable Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines gamification, AI guidance, and community collaboration 
              to make sustainability engaging and achievable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl shadow-sm border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">10 Challenge Categories</h3>
              <p className="text-gray-600">
                From Energy Efficiency to Biodiversity - comprehensive sustainability challenges 
                tailored for citizens, businesses, municipalities, and NGOs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-sm border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Assistant</h3>
              <p className="text-gray-600">
                Personalized sustainability guidance powered by AI. Get custom recommendations 
                based on your role, location, and progress.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-sm border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Hub</h3>
              <p className="text-gray-600">
                Connect with like-minded individuals, share progress, participate in forums, 
                and celebrate achievements together.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-sm border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Impact Dashboard</h3>
              <p className="text-gray-600">
                Track your Carbon Handprint, visualize progress, and see your positive 
                environmental impact grow over time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl shadow-sm border border-pink-200">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gamification</h3>
              <p className="text-gray-600">
                Earn points, unlock badges, climb leaderboards, and participate in 
                seasonal events to stay motivated on your sustainability journey.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-sm border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Authentication</h3>
              <p className="text-gray-600">
                Role-based access with secure user profiles powered by Supabase. 
                Your data is safe and your journey is personalized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of sustainability champions already making positive impact 
            through our platform. Start your journey today!
          </p>
          <button className="bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-lg">
                <img 
                  src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                  alt="Wellagora Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Wellagora</span>
            </div>
            <p className="text-gray-400 mb-4">Together We Thrive - Building a sustainable future, one action at a time.</p>
            <p className="text-gray-500 text-sm">© 2024 Wellagora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
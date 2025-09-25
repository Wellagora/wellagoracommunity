import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Heart,
  ChevronDown,
  LogOut,
  Sparkles,
  Users,
  Leaf
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSelector from "./LanguageSelector";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const userRoles = [
    { name: "Citizen", icon: User, gradient: "from-emerald-400 to-green-600", description: "Individual sustainability journey" },
    { name: "Business", icon: Building2, gradient: "from-blue-400 to-indigo-600", description: "Corporate sustainability goals" },
    { name: "Municipal", icon: MapPin, gradient: "from-orange-400 to-red-500", description: "City-wide initiatives" },
    { name: "NGO", icon: Heart, gradient: "from-purple-400 to-pink-600", description: "Community organization" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-background/95 backdrop-blur-xl border-b border-border shadow-premium sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row - Logo and Community Info */}
        <div className="flex justify-between items-center h-16 border-b border-border">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="relative group">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-2xl shadow-premium group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                  alt="Wellagora Logo" 
                  className="w-12 h-12 object-contain logo-enhanced"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-2 h-2 text-warning-foreground" />
                </div>
              </div>
            </Link>
            <Link to="/" className="flex flex-col group">
              <span className="text-3xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                Wellagora
              </span>
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Sustainability Community</span>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>

          {/* Community Stats and Language Selector */}
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border">
              <Leaf className="w-4 h-4 text-success" />
              <span className="text-foreground font-medium">2.4k Active Champions</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              <span className="text-foreground font-medium">Live Impact: 847 CO₂ saved today</span>
            </div>
            <LanguageSelector />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-card/50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>

        {/* Bottom Row - Navigation and Actions */}
        <div className="flex justify-between items-center h-16">
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <span className="relative">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/challenges" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <span className="relative">
                Challenges
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/community" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <Users className="w-4 h-4" />
              <span className="relative">
                Community Hub
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/dashboard" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <span className="relative">
                Impact Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/ai-assistant" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl hover:from-accent/30 hover:to-secondary/30 transition-all duration-300 font-medium text-accent-foreground">
              <span className="text-lg">🤖</span>
              <span>AI Sustainability Coach</span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-card/80 to-background/80 backdrop-blur-sm rounded-xl border border-border">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    {profile?.role && (
                      <span className="text-xs text-primary capitalize">
                        {profile.role} Champion
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth" className="px-6 py-2.5 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 shadow-premium hover:shadow-glow hover:scale-105 transform">
                  Join Community
                </Link>
                <Link to="/auth" className="px-6 py-2.5 border-2 border-border hover:border-primary hover:bg-card/50 text-foreground rounded-xl font-medium transition-all duration-300">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-sm border-t border-border py-4 rounded-b-2xl shadow-premium">
            <div className="space-y-3">
              <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                <span className="text-lg">🏠</span>
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/challenges" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                <span className="text-lg">🎯</span>
                <span className="font-medium">Challenges</span>
              </Link>
              <Link to="/community" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-medium">Community Hub</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                <span className="text-lg">📊</span>
                <span className="font-medium">Impact Dashboard</span>
              </Link>
              <Link to="/ai-assistant" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 text-accent-foreground rounded-xl">
                <span className="text-lg">🤖</span>
                <span className="font-medium">AI Sustainability Coach</span>
              </Link>
              
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        {profile?.role && (
                          <div className="text-xs text-primary capitalize">
                            {profile.role} Champion
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/auth" className="block w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground py-3 rounded-xl font-semibold text-center transition-all duration-300">
                      Join Community
                    </Link>
                    <Link to="/auth" className="block w-full border-2 border-border hover:border-primary hover:bg-card/50 text-foreground py-3 rounded-xl font-medium text-center transition-all duration-300">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
import { useState } from "react";
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
    <nav className="bg-white/95 backdrop-blur-xl border-b border-emerald-200/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row - Logo and Community Info */}
        <div className="flex justify-between items-center h-16 border-b border-emerald-100/50">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                  alt="Wellagora Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-2 h-2 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                Wellagora
              </span>
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Sustainability Community</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className="text-emerald-700 font-medium">2.4k Active Champions</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-blue-700 font-medium">Live Impact: 847 CO₂ saved today</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Bottom Row - Navigation and Actions */}
        <div className="flex justify-between items-center h-16">
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#challenges" className="group flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 font-medium">
              <span className="relative">
                Challenges
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a href="/community" className="group flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 font-medium">
              <Users className="w-4 h-4" />
              <span className="relative">
                Community Hub
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a href="/dashboard" className="group flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 font-medium">
              <span className="relative">
                Impact Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <a href="/ai-assistant" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl hover:from-purple-200 hover:to-blue-200 transition-all duration-300 font-medium text-purple-700">
              <span className="text-lg">🤖</span>
              <span>AI Sustainability Coach</span>
            </a>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    {profile?.role && (
                      <span className="text-xs text-emerald-600 capitalize">
                        {profile.role} Champion
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a href="/auth" className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
                  Join Community
                </a>
                <a href="/auth" className="px-6 py-2.5 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 rounded-xl font-medium transition-all duration-300">
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Role Selector Row - Only show when not logged in */}
        {!user && (
          <div className="hidden lg:flex items-center justify-center py-3 border-t border-emerald-100/50">
            <div className="flex items-center space-x-2 mr-4">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700 font-medium">Choose your role:</span>
            </div>
            <div className="flex items-center space-x-3">
              {userRoles.map((role) => (
                <button 
                  key={role.name}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-transparent bg-gradient-to-r ${role.gradient} bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 font-medium text-sm hover:scale-105 transform`}
                  title={role.description}
                >
                  <role.icon className="w-4 h-4" />
                  <span>{role.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-emerald-200 py-4 rounded-b-2xl shadow-lg">
            <div className="space-y-3">
              <a href="#challenges" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors">
                <span className="text-lg">🎯</span>
                <span className="font-medium">Challenges</span>
              </a>
              <a href="/community" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-medium">Community Hub</span>
              </a>
              <a href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors">
                <span className="text-lg">📊</span>
                <span className="font-medium">Impact Dashboard</span>
              </a>
              <a href="/ai-assistant" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-xl">
                <span className="text-lg">🤖</span>
                <span className="font-medium">AI Sustainability Coach</span>
              </a>
              
              <div className="pt-4 border-t border-emerald-100 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-emerald-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        {profile?.role && (
                          <div className="text-xs text-emerald-600 capitalize">
                            {profile.role} Champion
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <a href="/auth" className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold text-center transition-all duration-300">
                      Join Community
                    </a>
                    <a href="/auth" className="block w-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 py-3 rounded-xl font-medium text-center transition-all duration-300">
                      Sign In
                    </a>
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
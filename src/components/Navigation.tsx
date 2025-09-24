import { useState } from "react";
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Heart,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const userRoles = [
    { name: "Citizen", icon: User, color: "bg-emerald-500", description: "Individual sustainability journey" },
    { name: "Business", icon: Building2, color: "bg-blue-500", description: "Corporate sustainability goals" },
    { name: "Municipal", icon: MapPin, color: "bg-orange-500", description: "City-wide initiatives" },
    { name: "NGO", icon: Heart, color: "bg-purple-500", description: "Community organization" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-2xl shadow-sm">
              <img 
                src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                alt="Wellagora Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">Wellagora</span>
              <span className="text-xs text-gray-500 font-medium">Together We Thrive</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#challenges" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Challenges
            </a>
            <a href="/community" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Community
            </a>
            <a href="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Dashboard
            </a>
            <a href="/ai-assistant" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              AI Assistant
            </a>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  {profile?.role && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      {profile.role}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  {userRoles.map((role) => (
                    <button 
                      key={role.name}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-medium text-sm"
                      title={role.description}
                    >
                      <role.icon className="w-4 h-4" />
                      <span>{role.name}</span>
                    </button>
                  ))}
                </div>
                <a href="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Get Started
                </a>
                <a href="/auth" className="border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
                  Sign In
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-2">
              <a href="#challenges" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Challenges
              </a>
              <a href="/community" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Community
              </a>
              <a href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Dashboard
              </a>
              <a href="/ai-assistant" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                AI Assistant
              </a>
              <div className="pt-4 space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <a href="/auth" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-center">
                      Get Started
                    </a>
                    <a href="/auth" className="block w-full border border-emerald-200 hover:bg-emerald-50 text-gray-700 py-3 rounded-xl font-medium text-center">
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
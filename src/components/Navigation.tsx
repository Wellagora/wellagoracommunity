import { useState } from "react";
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Heart,
  ChevronDown
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userRoles = [
    { name: "Citizen", icon: User, color: "bg-emerald-500", description: "Individual sustainability journey" },
    { name: "Business", icon: Building2, color: "bg-blue-500", description: "Corporate sustainability goals" },
    { name: "Municipal", icon: MapPin, color: "bg-orange-500", description: "City-wide initiatives" },
    { name: "NGO", icon: Heart, color: "bg-purple-500", description: "Community organization" },
  ];

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

          {/* User Roles & Actions */}
          <div className="hidden md:flex items-center space-x-6">
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
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Get Started
            </button>
            <button className="border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
              Sign In
            </button>
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
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold">
                  Get Started
                </button>
                <button className="w-full border border-emerald-200 hover:bg-emerald-50 text-gray-700 py-3 rounded-xl font-medium">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
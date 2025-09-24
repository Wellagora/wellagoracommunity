import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthModal from "./auth/AuthModal";
import { 
  Menu, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Heart,
  Leaf,
  Users,
  Trophy,
  MessageCircle,
  Settings
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  const userRoles = [
    { name: "Citizen", icon: User, color: "bg-success", description: "Individual sustainability journey" },
    { name: "Business", icon: Building2, color: "bg-accent", description: "Corporate sustainability goals" },
    { name: "Municipal", icon: MapPin, color: "bg-warning", description: "City-wide initiatives" },
    { name: "NGO", icon: Heart, color: "bg-primary", description: "Community organization" },
  ];

  return (
    <nav className="bg-glass backdrop-blur-md border-b border-white/20 shadow-premium sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-primary rounded-2xl shadow-glow hover-lift">
              <img 
                src="/lovable-uploads/89cff010-b0aa-4aa1-b97e-999c469cae09.png" 
                alt="Wellagora Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-bold text-foreground">Wellagora</span>
              <span className="text-sm text-muted-foreground font-medium">Together We Thrive</span>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#challenges" className="text-foreground hover:text-primary transition-spring font-medium text-lg hover-lift px-3 py-2 rounded-lg">
              Challenges
            </a>
            <a href="/community" className="text-foreground hover:text-primary transition-spring font-medium text-lg hover-lift px-3 py-2 rounded-lg">
              Community
            </a>
            <a href="/dashboard" className="text-foreground hover:text-primary transition-spring font-medium text-lg hover-lift px-3 py-2 rounded-lg">
              Dashboard
            </a>
            <a href="/ai-assistant" className="text-foreground hover:text-primary transition-spring font-medium text-lg hover-lift px-3 py-2 rounded-lg">
              AI Assistant
            </a>
          </div>

          {/* Enhanced User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {userRoles.map((role) => (
                <Button 
                  key={role.name}
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary/10 hover:border-primary/50 transition-spring font-medium bg-glass backdrop-blur-md border-white/20 hover-lift"
                  title={role.description}
                >
                  <role.icon className="w-4 h-4 mr-2" />
                  {role.name}
                </Button>
              ))}
            </div>
            <Button 
              className="bg-gradient-primary hover:shadow-glow transition-spring px-8 py-3 text-lg font-semibold rounded-xl hover-lift"
              onClick={() => {
                setAuthMode("register");
                setIsAuthModalOpen(true);
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-spring font-medium bg-glass backdrop-blur-md hover-lift px-6 py-3 rounded-xl"
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
            >
              Sign In
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#challenges" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md">
                Challenges
              </a>
              <a href="#community" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md">
                Community
              </a>
              <a href="#impact" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md">
                Impact
              </a>
              <a href="#ai-coach" className="block px-3 py-2 text-foreground hover:bg-muted rounded-md">
                AI Coach
              </a>
              <div className="pt-4 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {userRoles.map((role) => (
                    <Button 
                      key={role.name}
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                    >
                      <role.icon className="w-4 h-4 mr-2" />
                      {role.name}
                    </Button>
                  ))}
                </div>
                <Button 
                  className="w-full mt-3 bg-gradient-primary"
                  onClick={() => {
                    setAuthMode("register");
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </nav>
  );
};

export default Navigation;
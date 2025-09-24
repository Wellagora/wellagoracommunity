import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const userRoles = [
    { name: "Citizen", icon: User, color: "bg-success", description: "Individual sustainability journey" },
    { name: "Business", icon: Building2, color: "bg-accent", description: "Corporate sustainability goals" },
    { name: "Municipal", icon: MapPin, color: "bg-warning", description: "City-wide initiatives" },
    { name: "NGO", icon: Heart, color: "bg-primary", description: "Community organization" },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/lovable-uploads/89cff010-b0aa-4aa1-b97e-999c469cae09.png" 
                alt="Wellagora Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">Wellagora</span>
              <span className="text-xs text-muted-foreground">Together We Thrive</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#challenges" className="text-foreground hover:text-primary transition-smooth">
              Challenges
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-smooth">
              Community
            </a>
            <a href="#impact" className="text-foreground hover:text-primary transition-smooth">
              Impact
            </a>
            <a href="#ai-coach" className="text-foreground hover:text-primary transition-smooth">
              AI Coach
            </a>
          </div>

          {/* User Role Selection & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {userRoles.map((role) => (
                <Button 
                  key={role.name}
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary/10 transition-smooth"
                  title={role.description}
                >
                  <role.icon className="w-4 h-4 mr-1" />
                  {role.name}
                </Button>
              ))}
            </div>
            <Button variant="default" className="bg-gradient-primary hover:shadow-glow transition-smooth">
              Get Started
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
                <Button className="w-full mt-3 bg-gradient-primary">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
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
  Leaf,
  Globe,
  Zap,
  Edit3,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

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
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-2xl shadow-premium group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                  alt="Wellagora Logo" 
                  className="w-16 h-16 object-contain logo-enhanced"
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
              <span className="text-foreground font-medium">{t('nav.community_stats.champions')}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              <span className="text-foreground font-medium">Élő Hatás: 847 CO₂ megtakarítás ma</span>
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
                {t('nav.home')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/challenges" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <span className="relative">
                {t('nav.challenges')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/community" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <Users className="w-4 h-4" />
              <span className="relative">
                {t('nav.community')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/matching" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <Heart className="w-4 h-4" />
              <span className="relative">
                Partnerek
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link to="/dashboard" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
              <span className="relative">
                {t('nav.dashboard')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            {user && profile?.user_role !== "citizen" && (
              <Link to="/organization" className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium">
                <Building2 className="w-4 h-4" />
                <span className="relative">
                  Szervezet
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            )}
            <Link to="/ai-assistant" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl hover:from-accent/30 hover:to-secondary/30 transition-all duration-300 font-medium text-accent-foreground">
              <span className="text-lg">🤖</span>
              <span>{t('nav.ai_assistant')}</span>
            </Link>
            <Link to="/revolutionary" className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg hover:from-primary/20 hover:to-accent/20 transition-all duration-300 font-medium">
              <Zap className="w-4 h-4 text-primary" />
              <span>Revolutionary</span>
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-primary to-accent text-white text-xs px-1.5 py-0.5">
                NEW
              </Badge>
            </Link>
            <Link to="/dynamic-regional" className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-success/10 to-warning/10 border border-success/30 rounded-lg hover:from-success/20 hover:to-warning/20 transition-all duration-300 font-medium">
              <Globe className="w-4 h-4 text-success" />
              <span>Dynamic 3D</span>
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-success to-warning text-white text-xs px-1.5 py-0.5">
                3D
              </Badge>
            </Link>
            <Link to="/interactive-map" className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-warning/10 to-destructive/10 border border-warning/30 rounded-lg hover:from-warning/20 hover:to-destructive/20 transition-all duration-300 font-medium">
              <MapPin className="w-4 h-4 text-warning" />
              <span>Stakeholder Térkép</span>
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-warning to-destructive text-white text-xs px-1.5 py-0.5">
                MAP
              </Badge>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-card/80 to-background/80 backdrop-blur-sm rounded-xl border border-border hover:from-card hover:to-background/90 transition-all duration-300"
                >
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
                     {profile?.user_role && (
                       <span className="text-xs text-primary capitalize">
                         {profile?.user_role} {t('common.champion')}
                       </span>
                     )}
                  </div>
                </Link>
                
                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-primary hover:bg-card/50 rounded-xl transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Profil</span>
                  </Link>
                  
            {profile?.user_role !== "citizen" && (
              <>
                <Link
                  to="/organization"
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl hover:from-accent/30 hover:to-secondary/30 transition-all duration-300 font-medium text-accent-foreground"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">Szervezet</span>
                </Link>
                {(profile?.user_role === 'business' || profile?.email === 'admin@wellagora.com') && (
                  <Link
                    to="/business-sponsorship"
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-success/20 border border-primary/30 rounded-xl hover:from-primary/30 hover:to-success/30 transition-all duration-300 font-medium text-primary"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Szponzoráció</span>
                  </Link>
                )}
              </>
            )}
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('nav.sign_out')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth" className="px-6 py-2.5 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 shadow-premium hover:shadow-glow hover:scale-105 transform">
                  {t('nav.join_community')}
                </Link>
                <Link to="/auth" className="px-6 py-2.5 border-2 border-border hover:border-primary hover:bg-card/50 text-foreground rounded-xl font-medium transition-all duration-300">
                  {t('nav.sign_in')}
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
              <Link to="/matching" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Partnerek</span>
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
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-3 px-4 py-3 bg-card/50 backdrop-blur-sm rounded-xl hover:bg-card/70 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {profile?.first_name} {profile?.last_name}
                        </div>
                         {profile?.user_role && (
                           <div className="text-xs text-primary capitalize">
                             {profile?.user_role} Champion
                           </div>
                         )}
                      </div>
                    </Link>
                    {user && profile?.user_role !== "citizen" && (
                      <Link 
                        to="/organization" 
                        className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors"
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">Szervezeti Dashboard</span>
                      </Link>
                    )}
                    
                    {/* Mobile Quick Actions */}
                    <Link to="/profile" className="w-full flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors">
                      <Edit3 className="w-5 h-5" />
                      <span className="font-medium">Profil szerkesztése</span>
                    </Link>
                    
                    {profile?.user_role !== "citizen" && (
                      <Link to="/organization" className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 text-accent-foreground rounded-xl">
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">Szervezeti dashboard</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Kijelentkezés</span>
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
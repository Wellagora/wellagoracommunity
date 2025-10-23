import { useState, useEffect } from "react";
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
  CreditCard,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  // Check if user has admin access - SECURITY: Server-side verification
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setHasAdminAccess(false);
        return;
      }

      try {
        // Server-side admin verification via edge function
        const { data, error } = await supabase.functions.invoke('verify-admin-access');
        setHasAdminAccess(!error && data?.hasAccess === true);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        setHasAdminAccess(false);
      }
    };

    checkAdminAccess();
  }, [user]);

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
        {/* Mobile Compact Header */}
        <div className="lg:hidden flex justify-between items-center h-14">
          {/* Logo - Compact */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-success rounded-xl shadow-md">
              <img 
                src="/lovable-uploads/3911d8a5-aebe-4ede-83a5-33c26952916a.png" 
                alt="Wellagora Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-lg font-bold text-foreground">Wellagora</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl hover:bg-card/50 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Desktop Header - Top Row - Logo and Community Info */}
        <div className="hidden lg:flex justify-between items-center h-16 border-b border-border">
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
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border">
              <Leaf className="w-4 h-4 text-success" />
              <span className="text-foreground font-medium">{t('nav.community_stats.champions')}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              <span className="text-foreground font-medium hidden xl:inline">{t('nav.live_impact')}</span>
              <span className="text-foreground font-medium xl:hidden">Live: 847 CO₂</span>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Desktop Bottom Row - Navigation and Actions */}
        <div className="hidden lg:flex justify-between items-center h-16">
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
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
            <Link to="/regional-hub" className="group flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-success/10 to-warning/10 border border-success/30 rounded-lg hover:from-success/20 hover:to-warning/20 transition-all duration-300 font-medium">
              <MapPin className="w-4 h-4 text-success" />
              <span className="hidden xl:inline">{t('nav.regional_hub')}</span>
              <span className="xl:hidden">{t('nav.regional_hub_short')}</span>
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-success to-warning text-white text-xs px-1.5 py-0.5">
                {t('nav.regional_hub_badge')}
              </Badge>
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
                  {t('nav.organization_label')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-success group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            )}
            <Link to="/ai-assistant" className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl hover:from-accent/30 hover:to-secondary/30 transition-all duration-300 font-medium text-accent-foreground">
              <span className="text-lg">🤖</span>
              <span>{t('nav.ai_assistant')}</span>
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
                    <span className="text-sm font-medium">{t('nav.edit_profile')}</span>
                  </Link>
                  
            {profile?.user_role !== "citizen" && (
              <>
                <Link
                  to="/organization"
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl hover:from-accent/30 hover:to-secondary/30 transition-all duration-300 font-medium text-accent-foreground"
                >
                  <Building2 className="w-4 h-4" />
                   <span className="text-sm">{t('nav.organization_label')}</span>
                </Link>
                {(profile?.user_role === 'business' || profile?.email === 'attila.kelemen@proself.org') && (
                  <Link
                    to="/business-sponsorship"
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-success/20 border border-primary/30 rounded-xl hover:from-primary/30 hover:to-success/30 transition-all duration-300 font-medium text-primary"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">{t('nav.sponsorship_label')}</span>
                  </Link>
                )}
              </>
            )}
            
            {hasAdminAccess && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 font-medium text-purple-600"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">{t('nav.admin_dashboard')}</span>
              </Link>
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
          <div className="lg:hidden bg-background/95 backdrop-blur-sm border-t border-border py-3 rounded-b-2xl shadow-premium">
            <div className="space-y-2 px-2">
              {/* User Profile Section - Mobile */}
              {user && (
                <div className="pb-3 mb-3 border-b border-border">
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 px-3 py-2.5 bg-card/50 backdrop-blur-sm rounded-xl hover:bg-card/70 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
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
                </div>
              )}

              {/* Navigation Links */}
              <Link 
                to="/" 
                className="flex items-center space-x-3 px-3 py-2.5 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">{t('nav.home')}</span>
              </Link>
              
              <Link 
                to="/challenges" 
                className="flex items-center space-x-3 px-3 py-2.5 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🎯</span>
                <span className="font-medium">{t('nav.challenges')}</span>
              </Link>
              
              <Link 
                to="/community" 
                className="flex items-center space-x-3 px-3 py-2.5 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">{t('nav.community')}</span>
              </Link>
              
              <Link 
                to="/regional-hub" 
                className="flex items-center space-x-3 px-3 py-2.5 bg-gradient-to-r from-success/20 to-warning/20 border border-success/30 text-success-foreground rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{t('nav.regional_hub')}</span>
                <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-success to-warning text-white text-xs">{t('nav.regional_hub_badge')}</Badge>
              </Link>
              
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-3 px-3 py-2.5 text-muted-foreground hover:bg-card/50 hover:text-primary rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">{t('nav.dashboard')}</span>
              </Link>
              
              <Link 
                to="/ai-assistant" 
                className="flex items-center space-x-3 px-3 py-2.5 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 text-accent-foreground rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🤖</span>
                <span className="font-medium">{t('nav.ai_assistant')}</span>
              </Link>
              
              {/* Language Selector - Mobile */}
              <div className="pt-3 mt-3 border-t border-border">
                <div className="px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">Nyelv / Language</div>
                  <LanguageSelector />
                </div>
              </div>

              {/* Additional Actions for Logged in Users */}
              {user && (
                <div className="pt-3 mt-3 border-t border-border space-y-2">
                  {profile?.user_role !== "citizen" && (
                    <Link 
                      to="/organization"
                      className="flex items-center space-x-3 px-3 py-2.5 bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">{t('nav.organization_label')}</span>
                    </Link>
                  )}
                  
                  {hasAdminAccess && (
                    <Link 
                      to="/admin"
                      className="flex items-center space-x-3 px-3 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">{t('nav.admin_dashboard')}</span>
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('nav.sign_out')}</span>
                  </button>
                </div>
              )}

              {/* Auth Buttons for Non-Logged in Users */}
              {!user && (
                <div className="pt-3 mt-3 border-t border-border space-y-2">
                  <Link 
                    to="/auth" 
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{t('nav.join_community')}</span>
                  </Link>
                  <Link 
                    to="/auth" 
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 border-2 border-border hover:border-primary hover:bg-card/50 text-foreground rounded-xl font-medium transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{t('nav.sign_in')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
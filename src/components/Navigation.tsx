import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Users as UsersIcon,
  LogOut,
  Home,
  Inbox,
  ChevronDown,
  ShieldCheck,
  Calendar,
  LayoutDashboard,
  Store,
  Sparkles,
  Building2,
} from "lucide-react";
import { WellBotAvatar } from "@/components/ai/WellBotAvatar";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import wellagoraLogo from "@/assets/wellagora-logo.png";
import LanguageSelector from "./LanguageSelector";

// Helper to determine effective role from database user_role
const getEffectiveRole = (userRole: string | undefined): 'member' | 'expert' | 'sponsor' => {
  if (!userRole) return 'member';
  if (['expert', 'creator'].includes(userRole)) return 'expert';
  if (['sponsor', 'business', 'government', 'ngo'].includes(userRole)) return 'sponsor';
  return 'member';
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeView, setActiveView] = useState<'member' | 'expert' | 'sponsor' | null>(null);
  const { user, profile, signOut, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine user's role from profile
  const effectiveRole = getEffectiveRole(profile?.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;

  // Load activeView from localStorage on mount (only for super admins)
  useEffect(() => {
    if (isSuperAdmin) {
      const savedView = localStorage.getItem('adminActiveView') as 'member' | 'expert' | 'sponsor' | null;
      if (savedView && ['member', 'expert', 'sponsor'].includes(savedView)) {
        setActiveView(savedView);
      }
    } else {
      setActiveView(null);
    }
  }, [isSuperAdmin]);

  // Handle view change for super admins and redirect to corresponding dashboard
  const handleViewChange = (view: 'member' | 'expert' | 'sponsor') => {
    setActiveView(view);
    localStorage.setItem('adminActiveView', view);
    
    // Redirect to the corresponding dashboard
    switch (view) {
      case 'expert':
        navigate('/szakertoi-studio');
        break;
      case 'sponsor':
        navigate('/tamogatoi-kozpont');
        break;
      case 'member':
      default:
        navigate('/iranyitopult');
        break;
    }
  };

  // Get display label for current view
  const getViewLabel = (view: 'member' | 'expert' | 'sponsor' | null): string => {
    switch (view) {
      case 'member': return t('roles.explorer');
      case 'expert': return t('roles.expert');
      case 'sponsor': return t('roles.sponsor');
      default: return 'Admin';
    }
  };

  // The role to use for routing/navigation (activeView takes precedence for super admins)
  const displayRole = (isSuperAdmin && activeView) ? activeView : effectiveRole;

  // Load unread message count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("recipient_user_id", user.id)
          .eq("status", "unread");

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (error) {
        logger.error('Error loading unread count', error, 'Navigation');
      }
    };

    loadUnreadCount();

    // Subscribe to changes
    const channel = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_user_id=eq.${user?.id}`,
        },
        () => {
          loadUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get dashboard route based on user's role (or activeView for super admins)
  const getDashboardRoute = useCallback((): string => {
    if (!user) return '/auth';
    
    // For super admins with activeView, route to the corresponding dashboard
    const roleToUse = (isSuperAdmin && activeView) ? activeView : effectiveRole;
    
    switch (roleToUse) {
      case 'expert':
        return '/szakertoi-studio';
      case 'sponsor':
        return '/tamogatoi-kozpont';
      case 'member':
      default:
        return '/iranyitopult';
    }
  }, [user, isSuperAdmin, activeView, effectiveRole]);

  // Get dashboard label based on role
  const getDashboardLabel = useCallback((): string => {
    if (!user) return t('nav.sign_in');
    
    const roleToUse = (isSuperAdmin && activeView) ? activeView : effectiveRole;
    
    switch (roleToUse) {
      case 'expert':
        return t('nav.expert_studio');
      case 'sponsor':
        return t('nav.sponsor_center');
      case 'member':
      default:
        return t('nav.control_panel');
    }
  }, [user, isSuperAdmin, activeView, effectiveRole, t]);

  // Get role display text
  const getRoleDisplayText = (): string => {
    if (isSuperAdmin && activeView) {
      return `Super Admin (${getViewLabel(activeView)})`;
    }
    if (isSuperAdmin) return 'Super Admin';
    switch (effectiveRole) {
      case 'expert':
        return t('nav.role_expert');
      case 'sponsor':
        return t('nav.role_supporter');
      case 'member':
      default:
        return t('nav.role_member');
    }
  };

  // Build nav items based on user role (WellBot moved to right side)
  const navItems = useMemo(() => {
    // Simplified navigation for logged-out users
    if (!user || !profile) {
      return [
        { path: "/", label: t("nav.home"), icon: Home },
        { path: "/piacer", label: t("nav.marketplace"), icon: Store },
        { path: "/esemenyek", label: t("nav.events"), icon: Calendar },
      ];
    }

    // Full navigation for logged-in users
    const baseItems = [
      { path: "/", label: t("nav.home"), icon: Home },
      { path: "/piacer", label: t("nav.marketplace"), icon: Store },
      { path: "/esemenyek", label: t("nav.events"), icon: Calendar },
      { path: "/community", label: t("nav.community"), icon: UsersIcon },
    ];

    // Use displayRole (which considers activeView for super admins)
    // Expert: show Expert Studio link
    if (displayRole === 'expert') {
      return [
        ...baseItems,
        { 
          path: "/szakertoi-studio", 
          label: t("nav.expert_studio"), 
          icon: Sparkles,
          iconColor: "#00E5FF"
        },
      ];
    }

    // Sponsor: show Sponsor Center link
    if (displayRole === 'sponsor') {
      return [
        ...baseItems,
        { 
          path: "/tamogatoi-kozpont", 
          label: t("nav.sponsor_center"), 
          icon: Building2,
          iconColor: "#FFD700"
        },
      ];
    }

    // Member: show Control Panel link
    return [
      ...baseItems,
      { path: "/iranyitopult", label: t("nav.control_panel"), icon: LayoutDashboard },
    ];
  }, [user, profile, t, displayRole]);

  return (
    <>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-[110] bg-gradient-to-r from-amber-400 to-orange-400 text-white py-1 px-4 flex items-center justify-center gap-3 text-sm font-medium shadow-md">
          <span className="flex items-center gap-1">
            🎭 Demo mód
          </span>
          <button
            onClick={() => {
              signOut();
              navigate('/auth');
            }}
            className="bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full text-xs font-semibold transition-colors"
          >
            Kilépés
          </button>
        </div>
      )}
      
      <nav className={`fixed left-0 right-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-slate-200 ${isDemoMode ? 'top-8' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pr-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left - Slightly offset to create space */}
            <Link to="/" className="flex items-center shrink-0 z-10 -ml-1 sm:ml-0">
              <img src={wellagoraLogo} alt="WellAgora" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation - Center - positioned with margin to avoid overlap with right side */}
            <div className="hidden md:flex flex-1 justify-center items-center">
              <div className="flex items-center gap-x-3 mr-[280px]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
                        active 
                          ? "bg-[#111111] text-white" 
                          : "text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7]"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop Actions - Right - ALWAYS visible with shrink-0 */}
            <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
              {/* Super Admin View Switcher - Apple iOS Segmented Control */}
              {isSuperAdmin && user && (
                <div className="flex items-center bg-[#F5F5F7] rounded-lg p-1 shadow-sm shrink-0">
                  <button
                    onClick={() => handleViewChange('member')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeView === 'member'
                        ? 'bg-white text-[#34C759] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('roles.explorer')}
                  </button>
                  <button
                    onClick={() => handleViewChange('expert')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeView === 'expert'
                        ? 'bg-white text-[#007AFF] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('roles.expert')}
                  </button>
                  <button
                    onClick={() => handleViewChange('sponsor')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeView === 'sponsor'
                        ? 'bg-white text-amber-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('roles.sponsor')}
                  </button>
                </div>
              )}

              {/* WellBot Button - Moved here from center nav to prevent overlap */}
              <Link
                to="/ai-assistant"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 shrink-0 ${
                  isActive('/ai-assistant')
                    ? "bg-[#111111] text-white"
                    : "text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7]"
                }`}
              >
                <div style={{ transform: 'scaleX(-1)' }}>
                  <WellBotAvatar size="xs" mood="neutral" />
                </div>
                <span className="hidden lg:inline">{t("nav.wellbot")}</span>
              </Link>

              {/* Language Selector */}
              <div className="shrink-0">
                <LanguageSelector />
              </div>

            {user ? (
              <>
                {/* Inbox with Badge */}
                <Link to="/inbox" className="relative p-2 text-foreground/80 hover:text-foreground transition-colors">
                  <Inbox className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.first_name?.[0]}
                          {profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden xl:inline">{profile?.first_name}</span>
                      <ChevronDown className="h-4 w-4 text-foreground/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" style={{ right: 0 }}>
                    {/* User info header */}
                    <div className="px-2 py-1.5 border-b mb-1">
                      <p className="font-medium text-sm">{profile?.first_name} {profile?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{getRoleDisplayText()}</p>
                    </div>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        {t("nav.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/inbox" className="flex items-center gap-2 cursor-pointer">
                        <Inbox className="h-4 w-4" />
                        {t("nav.messages")}
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-5 text-xs">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Dashboard shortcut */}
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardRoute()} className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        {getDashboardLabel()}
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Super Admin link - clearly visible */}
                    {isSuperAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin-panel"
                            className="flex items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Adminisztrációs Központ
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.sign_out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <MagneticButton variant="outline" size="sm" strength={0.2} className="shrink-0" asChild>
                  <Link to="/auth">{t("nav.sign_in")}</Link>
                </MagneticButton>
                <MagneticButton size="sm" strength={0.3} className="shrink-0" asChild>
                  <Link to="/auth">{t("nav.join_community")}</Link>
                </MagneticButton>
              </div>
            )}
          </div>

          {/* Mobile Actions Row: WellBot + Language + Auth/Profile + Menu */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            {/* WellBot Button - Always visible, min 44px touch target */}
            <Link
              to="/ai-assistant"
              className={`flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full transition-all duration-300 ${
                isActive('/ai-assistant')
                  ? "bg-[#111111] text-white"
                  : "text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7]"
              }`}
            >
              <div style={{ transform: 'scaleX(-1)' }}>
                <WellBotAvatar size="xs" mood="neutral" />
              </div>
            </Link>
            
            {/* Language Selector - Compact */}
            <div className="shrink-0">
              <LanguageSelector />
            </div>

            {/* Profile Avatar (logged in) or nothing (logged out) */}
            {user && profile && (
              <Link
                to="/profile"
                className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px]"
              >
                <Avatar className="h-8 w-8 ring-2 ring-black/5">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-black text-white text-xs">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            
            {/* Hamburger Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-11 h-11 min-w-[44px] min-h-[44px]">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={wellagoraLogo} alt="WellAgora" className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-8">
                  {/* User Profile - Mobile */}
                  {user && profile && (
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile.first_name?.[0]}
                          {profile.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-foreground/70 capitalize truncate">
                          {getRoleDisplayText()}
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Language Selector - Mobile */}
                  <div className="px-3">
                    <LanguageSelector />
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const hasCustomColor = 'iconColor' in item && item.iconColor;
                      const isWellBot = 'isWellBot' in item && item.isWellBot;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            active
                              ? hasCustomColor
                                ? "bg-indigo-100 text-indigo-700"
                                : isWellBot
                                  ? "bg-gradient-to-r from-indigo-100 to-sky-100 text-indigo-700"
                                  : "bg-primary text-primary-foreground"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          {isWellBot ? (
                            <div style={{ transform: 'scaleX(-1)' }}>
                              <WellBotAvatar size="xs" mood="neutral" />
                            </div>
                          ) : Icon ? (
                            <Icon
                              className="h-5 w-5"
                              style={hasCustomColor ? { color: item.iconColor as string } : undefined}
                            />
                          ) : null}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Super Admin View Switcher - Mobile iOS Segmented Control */}
                  {isSuperAdmin && (
                    <div className="px-3 py-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-3">{t('nav.switch_role')}</p>
                      <div className="flex bg-[#F5F5F7] rounded-lg p-1">
                        <button
                          onClick={() => handleViewChange('member')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeView === 'member'
                              ? 'bg-white text-[#007AFF] shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t('roles.explorer')}
                        </button>
                        <button
                          onClick={() => handleViewChange('expert')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeView === 'expert'
                              ? 'bg-white text-[#007AFF] shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t('roles.expert')}
                        </button>
                        <button
                          onClick={() => handleViewChange('sponsor')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeView === 'sponsor'
                              ? 'bg-white text-[#007AFF] shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t('roles.sponsor')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Super Admin link - Mobile */}
                  {isSuperAdmin && (
                    <Link
                      to="/super-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#007AFF] hover:bg-blue-50 transition-colors"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-medium">Super Admin</span>
                    </Link>
                  )}

                  {/* Auth Actions - Mobile */}
                  <div className="pt-4 border-t space-y-2 mt-auto">
                    {user ? (
                      <>
                        <Link
                          to="/inbox"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Inbox className="h-5 w-5" />
                          <span className="font-medium">{t("nav.messages")}</span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t("nav.sign_out")}
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            {t("nav.sign_in")}
                          </Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            {t("nav.join_community")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
};

export default Navigation;

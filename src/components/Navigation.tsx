import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
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
  Heart,
  Wallet,
  BarChart3,
  Coins,
  Star,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { getUserBalance, WELLPOINTS_QUERY_KEY } from "@/lib/wellpoints";
import { getExpertMetrics, getSponsorMetrics, type RoleMetrics } from "@/lib/roleMetrics";
import wellagoraLogo from "@/assets/wellagora-logo.png";
import LanguageSelector from "./LanguageSelector";
import { RoleSwitcher } from "./admin/RoleSwitcher";
import { NotificationBell } from "./notifications/NotificationBell";

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
  const { user, profile, signOut, isDemoMode, viewAsRole, setViewAsRole } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine user's role from profile
  const effectiveRole = getEffectiveRole(profile?.user_role);
  const isSuperAdmin = profile?.is_super_admin === true || 
    profile?.email === 'attila.kelemen@proself.org';
  
  // The role to use for routing/navigation (viewAsRole takes precedence for super admins)
  const displayRole = (isSuperAdmin && viewAsRole) ? viewAsRole : effectiveRole;
  
  // Fetch role-specific metrics with React Query using displayRole
  const { data: roleMetrics } = useQuery({
    queryKey: ['roleMetrics', user?.id, displayRole],
    queryFn: async (): Promise<RoleMetrics> => {
      if (!user) return { type: 'member', wellpoints: 0 };
      
      if (displayRole === 'expert') {
        const metrics = await getExpertMetrics(user.id);
        return { type: 'expert', ...metrics };
      } else if (displayRole === 'sponsor') {
        const metrics = await getSponsorMetrics(user.id);
        return { type: 'sponsor', ...metrics };
      } else {
        const balance = await getUserBalance(user.id);
        return { type: 'member', wellpoints: balance };
      }
    },
    enabled: !!user,
  });

  // Handle view change for super admins and redirect to corresponding dashboard
  const handleViewChange = (view: 'member' | 'expert' | 'sponsor') => {
    setViewAsRole(view);
    
    // Redirect to the corresponding dashboard using centralized paths
    switch (view) {
      case 'expert':
        navigate('/expert-studio');
        break;
      case 'sponsor':
        navigate('/sponsor-dashboard');
        break;
      case 'member':
      default:
        navigate('/programs');
        break;
    }
  };

  // Get display label for current view
  const getViewLabel = (view: string | null): string => {
    switch (view) {
      case 'member': return t('roles.explorer');
      case 'expert': return t('roles.expert');
      case 'sponsor': return t('roles.sponsor');
      case 'admin': return 'Admin';
      default: return 'Admin';
    }
  };


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

  // Get dashboard route based on user's role (or viewAsRole for super admins)
  // member -> /my-agora, expert -> /expert-studio, sponsor -> /sponsor-dashboard
  const getDashboardRoute = useCallback((): string => {
    if (!user) return '/auth';
    
    // Super admin viewing as a role
    if (isSuperAdmin && viewAsRole) {
      switch (viewAsRole) {
        case 'expert': return '/expert-studio';
        case 'sponsor': return '/sponsor-dashboard';
        case 'member': return '/my-agora';
        default: return '/admin';
      }
    }
    
    // Super admin without viewAsRole goes to admin panel
    if (isSuperAdmin) return '/admin';
    
    // Regular users based on their actual role
    switch (effectiveRole) {
      case 'expert': return '/expert-studio';
      case 'sponsor': return '/sponsor-dashboard';
      case 'member':
      default: return '/my-agora';
    }
  }, [user, isSuperAdmin, viewAsRole, effectiveRole]);

  // Get dashboard label based on role - matches current route context
  const getDashboardLabel = useCallback((): string => {
    if (!user) return t('nav.sign_in');
    
    // Super admin viewing as a role
    if (isSuperAdmin && viewAsRole) {
      switch (viewAsRole) {
        case 'expert': return t('nav.expert_studio');
        case 'sponsor': return t('nav.sponsor_center');
        case 'member': return t('nav.control_panel');
        default: return 'Admin';
      }
    }
    
    // Super admin without viewAsRole
    if (isSuperAdmin) return 'Admin';
    
    // Regular users
    switch (effectiveRole) {
      case 'expert': return t('nav.expert_studio');
      case 'sponsor': return t('nav.sponsor_center');
      case 'member':
      default: return t('nav.control_panel');
    }
  }, [user, isSuperAdmin, viewAsRole, effectiveRole, t]);

  // Get role display text
  const getRoleDisplayText = (): string => {
    if (isSuperAdmin && viewAsRole) {
      return `Super Admin (${getViewLabel(viewAsRole)})`;
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

  // STRICT Role-based navigation - each role sees ONLY their items
  const navItems = useMemo(() => {
    // Logged-out users: Home, Marketplace, Events, Community
    if (!user || !profile) {
      return [
        { path: "/", label: t("nav.home"), icon: Home },
        { path: "/programs", label: t("nav.marketplace"), icon: Store },
        { path: "/events", label: t("nav.events"), icon: Calendar },
        { path: "/community", label: t("nav.community"), icon: UsersIcon },
      ];
    }

    // Role-specific navigation
    const roleToUse = (isSuperAdmin && viewAsRole) ? viewAsRole : effectiveRole;

    // MEMBER: Piactér, Események, Közösség, Agórám
    if (roleToUse === 'member') {
      return [
        { path: "/programs", label: t("nav.marketplace"), icon: Store },
        { path: "/events", label: t("nav.events"), icon: Calendar },
        { path: "/community", label: t("nav.community"), icon: UsersIcon },
        { path: "/my-agora", label: t("nav.my_agora"), icon: LayoutDashboard },
      ];
    }

    // EXPERT: Szakértői Stúdió, Piactér, Közösség, Események
    if (roleToUse === 'expert') {
      return [
        { path: "/expert-studio", label: t("nav.expert_studio"), icon: Sparkles, iconColor: "text-amber-500" },
        { path: "/programs", label: t("nav.marketplace"), icon: Store },
        { path: "/community", label: t("nav.community"), icon: UsersIcon },
        { path: "/events", label: t("nav.events"), icon: Calendar },
      ];
    }

    // SPONSOR: Támogatói Központ, Események, Pénzügyek
    if (roleToUse === 'sponsor') {
      return [
        { path: "/sponsor-dashboard", label: t("nav.sponsor_hub"), icon: Building2, iconColor: "text-blue-500" },
        { path: "/events", label: t("nav.events"), icon: Calendar },
        { path: "/sponsor-dashboard/finances", label: t("nav.finances"), icon: BarChart3 },
      ];
    }

    // Default fallback
    return [
      { path: "/programs", label: t("nav.marketplace"), icon: Store },
    ];
  }, [user, profile, t, isSuperAdmin, viewAsRole, effectiveRole]);

  // Role-based accent color for header - Admin gets Indigo
  const getRoleAccentColor = (): string => {
    if (!user || !profile) return "border-slate-200";
    
    // Super Admin always gets Indigo regardless of viewAsRole
    if (isSuperAdmin) return "border-indigo-600";
    
    const roleToUse = effectiveRole;
    switch (roleToUse) {
      case 'member': return "border-emerald-500";
      case 'expert': return "border-amber-500";
      case 'sponsor': return "border-blue-500";
      default: return "border-slate-200";
    }
  };

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
      
      <nav className={`fixed left-0 right-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b-2 ${getRoleAccentColor()} ${isDemoMode ? 'top-8' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center gap-2 shrink-0 z-10">
              <img src={wellagoraLogo} alt="WellAgora" className="h-9 sm:h-10 w-auto object-contain" />
              <span className="text-sm font-medium text-gray-500 hidden sm:inline">WellAgora</span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex flex-1 justify-center items-center">
              <div className="flex items-center gap-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap border-b-2 ${
                        active 
                          ? "text-[#111111] border-[#111111]" 
                          : "text-[#6E6E73] border-transparent hover:text-[#111111] hover:border-[#D1D1D6]"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop Actions - Right */}
            <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
              {/* God Mode Role Switcher - Only for Super Admins */}
              <RoleSwitcher />

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

              {/* Notification Bell */}
              {user && (
                <div className="shrink-0">
                  <NotificationBell />
                </div>
              )}

            {user ? (
              <>
                {/* Role-specific Metrics */}
                <TooltipProvider>
                  {roleMetrics?.type === 'member' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/my-agora" 
                          className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
                        >
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold text-amber-700">{roleMetrics.wellpoints}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('wallet.your_balance')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {roleMetrics?.type === 'expert' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/expert-studio" 
                          className="flex items-center gap-2 px-3 py-1 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors"
                        >
                          <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                          <span className="text-sm font-semibold text-purple-700">{roleMetrics.avgRating} ({roleMetrics.reviewCount})</span>
                          <span className="text-purple-300">|</span>
                          <span className="text-sm font-semibold text-emerald-600">{roleMetrics.monthlyRevenue.toLocaleString('hu-HU')} Ft</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Szakértői metrikák</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {roleMetrics?.type === 'sponsor' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/sponsor-hub" 
                          className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-700">{t('sponsor.people_reached_badge').replace('{{count}}', String(roleMetrics.supportedMembers))}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('sponsor.people_reached_tooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>

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
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {profile?.first_name?.[0]}
                            {profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {/* Admin Badge - Elegant indicator */}
                        {isSuperAdmin && (
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.5 text-[8px] font-bold bg-indigo-600 text-white rounded-sm leading-none">
                            ADMIN
                          </span>
                        )}
                      </div>
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

            {/* Notification Bell - Mobile */}
            {user && (
              <div className="shrink-0">
                <NotificationBell />
              </div>
            )}

            {/* Role-specific Metrics - Mobile (compact version) */}
            {user && roleMetrics && (
              <>
                {roleMetrics.type === 'member' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link 
                          to="/my-agora" 
                          className="flex items-center gap-1"
                        >
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-700">{roleMetrics.wellpoints}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('wallet.your_balance')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {roleMetrics.type === 'expert' && (
                  <Link 
                    to="/expert-studio" 
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 text-purple-500 fill-purple-500" />
                    <span className="text-xs font-semibold text-purple-700">{roleMetrics.avgRating}</span>
                  </Link>
                )}
                {roleMetrics.type === 'sponsor' && (
                  <Link 
                    to="/sponsor-hub" 
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">{roleMetrics.supportedMembers}</span>
                  </Link>
                )}
              </>
            )}

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
                    <span className="text-sm font-medium text-gray-500">WellAgora</span>
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
                            viewAsRole === 'member'
                              ? 'bg-white text-[#007AFF] shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t('roles.explorer')}
                        </button>
                        <button
                          onClick={() => handleViewChange('expert')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            viewAsRole === 'expert'
                              ? 'bg-white text-[#007AFF] shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t('roles.expert')}
                        </button>
                        <button
                          onClick={() => handleViewChange('sponsor')}
                          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            viewAsRole === 'sponsor'
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
                      to="/admin"
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

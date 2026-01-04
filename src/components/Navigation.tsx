import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Users as UsersIcon,
  LogOut,
  Home,
  Bot,
  Inbox,
  ChevronDown,
  ShieldCheck,
  Heart,
  Calendar,
  LayoutDashboard,
  Store,
  Sparkles,
  Building2,
} from "lucide-react";
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
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine user's role from profile
  const effectiveRole = getEffectiveRole(profile?.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;

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

  // Get dashboard route based on user's role
  const getDashboardRoute = useCallback((): string => {
    if (!user) return '/auth';
    if (isSuperAdmin) return '/super-admin';
    
    switch (effectiveRole) {
      case 'expert':
        return '/szakertoi-studio';
      case 'sponsor':
        return '/tamogatoi-kozpont';
      case 'member':
      default:
        return '/iranyitopult';
    }
  }, [user, isSuperAdmin, effectiveRole]);

  // Get dashboard label based on role
  const getDashboardLabel = useCallback((): string => {
    if (!user) return t('nav.sign_in');
    if (isSuperAdmin) return 'Admin';
    
    switch (effectiveRole) {
      case 'expert':
        return t('nav.expert_studio');
      case 'sponsor':
        return t('nav.sponsor_center');
      case 'member':
      default:
        return t('nav.control_panel');
    }
  }, [user, isSuperAdmin, effectiveRole, t]);

  // Get role display text
  const getRoleDisplayText = (): string => {
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

  // Build nav items based on user role
  const navItems = useMemo(() => {
    // Simplified navigation for logged-out users
    if (!user || !profile) {
      return [
        { path: "/", label: t("nav.home"), icon: Home },
        { path: "/piacer", label: t("nav.marketplace"), icon: Store },
        { path: "/esemenyek", label: t("nav.events"), icon: Calendar },
        { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
      ];
    }

    // Full navigation for logged-in users
    const baseItems = [
      { path: "/", label: t("nav.home"), icon: Home },
      { path: "/piacer", label: t("nav.marketplace"), icon: Store },
      { path: "/esemenyek", label: t("nav.events"), icon: Calendar },
      { path: "/community", label: t("nav.community"), icon: UsersIcon },
    ];

    // Expert: show Expert Studio link
    if (effectiveRole === 'expert') {
      return [
        ...baseItems,
        { 
          path: "/szakertoi-studio", 
          label: t("nav.expert_studio"), 
          icon: Sparkles,
          iconColor: "#00E5FF"
        },
        { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
      ];
    }

    // Sponsor: show Sponsor Center link
    if (effectiveRole === 'sponsor') {
      return [
        ...baseItems,
        { 
          path: "/tamogatoi-kozpont", 
          label: t("nav.sponsor_center"), 
          icon: Building2,
          iconColor: "#FFD700"
        },
        { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
      ];
    }

    // Member: show Control Panel link
    return [
      ...baseItems,
      { path: "/iranyitopult", label: t("nav.control_panel"), icon: LayoutDashboard },
      { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
    ];
  }, [user, profile, t, effectiveRole]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img src={wellagoraLogo} alt="WellAgora" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const hasCustomColor = 'iconColor' in item && item.iconColor;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active 
                      ? hasCustomColor 
                        ? "bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]" 
                        : "text-primary-foreground bg-primary" 
                      : "text-foreground/90 hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon 
                    className="h-4 w-4" 
                    style={hasCustomColor ? { color: item.iconColor } : undefined}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions - Right */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

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
                  <DropdownMenuContent align="end" className="w-56">
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
                    
                    {/* Super Admin link */}
                    {isSuperAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/super-admin"
                            className="flex items-center gap-2 cursor-pointer text-purple-600 dark:text-purple-400"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Super Admin
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
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/auth">{t("nav.sign_in")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">{t("nav.join_community")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-md">
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
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            active
                              ? hasCustomColor
                                ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                                : "bg-primary text-primary-foreground"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={hasCustomColor ? { color: item.iconColor } : undefined}
                          />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Super Admin link - Mobile */}
                  {isSuperAdmin && (
                    <Link
                      to="/super-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
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
  );
};

export default Navigation;

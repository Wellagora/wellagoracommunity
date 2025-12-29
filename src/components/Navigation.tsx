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
import { useViewMode } from "@/contexts/ViewModeContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import wellagoraLogo from "@/assets/wellagora-logo.png";
import LanguageSelector from "./LanguageSelector";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { viewMode, setViewMode, isSuperAdmin, getEffectiveRole } = useViewMode();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const effectiveRole = getEffectiveRole();
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

  // Role switching handler for regular users
  const handleRoleSwitch = useCallback(async (newRole: 'citizen' | 'creator' | 'business') => {
    if (!user || isRoleSwitching) return;
    
    setIsRoleSwitching(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      if (newRole === 'creator') {
        toast.success(t('nav.switched_to_expert'));
        navigate('/szakertoi-studio');
      } else if (newRole === 'business') {
        toast.success(t('nav.switched_to_supporter'));
        navigate('/tamogato-panel');
      } else {
        toast.success(t('nav.switched_to_member'));
        navigate('/dashboard');
      }
    } catch (error) {
      logger.error('Error switching role', error, 'Navigation');
      toast.error(t('common.error'));
    } finally {
      setIsRoleSwitching(false);
    }
  }, [user, isRoleSwitching, refreshProfile, navigate, t]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Compute paths based on role
  const isCreator = profile?.user_role === 'creator';
  const isSponsor = ['business', 'government', 'ngo'].includes(profile?.user_role || '');

  // Build nav items based on user role
  const navItems = useMemo(() => {
    const baseItems = [
      { path: "/", label: t("nav.home"), icon: Home },
      { path: "/piacer", label: t("nav.marketplace"), icon: Store },
      { path: "/esemenyek", label: t("nav.events"), icon: Calendar },
      { path: "/community", label: t("nav.community"), icon: UsersIcon },
    ];

    if (!user || !profile) {
      return [
        ...baseItems,
        { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
        { path: "/sponsor", label: t("nav.sponsors"), icon: Heart },
      ];
    }

    // Creator/Expert: show Expert Studio, hide Control Panel
    if (isCreator) {
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

    // Supporter: show Control Panel
    if (isSponsor) {
      return [
        ...baseItems,
        { path: "/iranyitopult", label: t("nav.control_panel"), icon: LayoutDashboard },
        { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
      ];
    }

    // Regular user (citizen): show Control Panel
    return [
      ...baseItems,
      { path: "/iranyitopult", label: t("nav.control_panel"), icon: LayoutDashboard },
      { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
    ];
  }, [user, profile, t, isCreator, isSponsor]);

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
            {/* Language Selector is next - Super Admin view switcher removed, role switch is in profile dropdown */}

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
                    
                    {/* Role Switcher - available for all logged-in users */}
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {t('nav.switch_role')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch('citizen')}
                        disabled={isRoleSwitching}
                        className={`flex items-center gap-2 cursor-pointer ${
                          profile?.user_role === 'citizen' ? 'bg-accent' : ''
                        }`}
                      >
                        <User className="h-4 w-4" />
                        {t('nav.role_member')}
                        {profile?.user_role === 'citizen' && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            ✓
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch('creator')}
                        disabled={isRoleSwitching}
                        className={`flex items-center gap-2 cursor-pointer ${
                          profile?.user_role === 'creator' ? 'bg-[#00E5FF]/10' : ''
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-[#00E5FF]" />
                        <span className={profile?.user_role === 'creator' ? 'text-[#00E5FF]' : ''}>
                          {t('nav.role_expert')}
                        </span>
                        {profile?.user_role === 'creator' && (
                          <Badge className="ml-auto text-xs bg-[#00E5FF] text-black">
                            ✓
                          </Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch('business')}
                        disabled={isRoleSwitching}
                        className={`flex items-center gap-2 cursor-pointer ${
                          isSponsor ? 'bg-[#FFD700]/10' : ''
                        }`}
                      >
                        <Building2 className="h-4 w-4 text-[#FFD700]" />
                        <span className={isSponsor ? 'text-[#FFD700]' : ''}>
                          {t('nav.role_supporter')}
                        </span>
                        {isSponsor && (
                          <Badge className="ml-auto text-xs bg-[#FFD700] text-black">
                            ✓
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    </>
                    
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
                        <p className="text-xs text-foreground/70 capitalize truncate">{profile.user_role}</p>
                      </div>
                    </Link>
                  )}

                  {/* Navigation Links - Mobile */}
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
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            active
                              ? hasCustomColor
                                ? "bg-[#00E5FF]/20 text-[#00E5FF] font-medium shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                                : "text-primary-foreground bg-primary font-medium"
                              : "text-foreground/90 hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <Icon 
                            className="h-5 w-5 shrink-0" 
                            style={hasCustomColor ? { color: item.iconColor } : undefined}
                          />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    })}

                    {/* Szakértői Stúdió - Mobile (Cyan) */}
                    {user && isCreator && (
                      <Link
                        to="/szakertoi-studio"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive("/szakertoi-studio")
                            ? "bg-[#00E5FF]/20 text-[#00E5FF] font-medium shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                            : "text-[#00E5FF] hover:bg-[#00E5FF]/10"
                        }`}
                      >
                        <Sparkles className="h-5 w-5 shrink-0 text-[#00E5FF]" />
                        <span className="text-sm font-medium">{t("nav.expert_studio")}</span>
                      </Link>
                    )}

                    {/* Támogató Panel - Mobile (Gold) */}
                    {user && isSponsor && (
                      <Link
                        to="/tamogato-panel"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive("/tamogato-panel")
                            ? "bg-[#FFD700]/20 text-[#FFD700] font-medium shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                            : "text-[#FFD700] hover:bg-[#FFD700]/10"
                        }`}
                      >
                        <Building2 className="h-5 w-5 shrink-0 text-[#FFD700]" />
                        <span className="text-sm font-medium">{t("nav.supporter_panel")}</span>
                      </Link>
                    )}

                    {user && (
                      <>
                        <Link
                          to="/inbox"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive("/inbox")
                              ? "text-primary-foreground bg-primary font-medium"
                              : "text-foreground/90 hover:text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <Inbox className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium flex-1">{t("nav.messages")}</span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </Link>
                        {isSuperAdmin && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                              isActive("/super-admin")
                                ? "text-primary bg-accent font-medium"
                                : "text-purple-600 dark:text-purple-400 hover:bg-accent/50"
                            }`}
                          >
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium">Super Admin</span>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                  {/* Super Admin view switcher removed - role switching is in profile dropdown */}
                  {/* Language Selector - Mobile */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-foreground/70 mb-2 px-3">{t("nav.language") || "Language"}</p>
                    <LanguageSelector />
                  </div>

                  {/* Auth Actions - Mobile */}
                  {user ? (
                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        {t("nav.sign_out")}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-border space-y-2">
                      <Button asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link to="/auth">{t("nav.join_community")}</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link to="/auth">{t("nav.sign_in")}</Link>
                      </Button>
                    </div>
                  )}
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

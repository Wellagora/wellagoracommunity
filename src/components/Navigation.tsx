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
  Check,
} from "lucide-react";
import { useAuth, ActiveView } from "@/contexts/AuthContext";
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
  const [isViewSwitching, setIsViewSwitching] = useState(false);
  const { user, profile, signOut, activeView, availableViews, setActiveView } = useAuth();
  const { isSuperAdmin } = useViewMode();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

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

  // View switching handler - persists to database via AuthContext
  const handleViewSwitch = useCallback(async (newView: ActiveView) => {
    if (isViewSwitching || activeView === newView) return;
    
    setIsViewSwitching(true);
    try {
      await setActiveView(newView);
      
      // Navigate to appropriate dashboard
      if (newView === 'expert') {
        toast.success(t('nav.switched_to_expert'));
        navigate('/szakertoi-studio');
      } else if (newView === 'sponsor') {
        toast.success(t('nav.switched_to_supporter'));
        navigate('/iranyitopult');
      } else {
        toast.success(t('nav.switched_to_member'));
        navigate('/iranyitopult');
      }
    } catch (error) {
      logger.error('Error switching view', error, 'Navigation');
      toast.error(t('common.error'));
    } finally {
      setIsViewSwitching(false);
    }
  }, [activeView, isViewSwitching, setActiveView, navigate, t]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Compute paths based on active view
  const isExpertView = activeView === 'expert';
  const isSponsorView = activeView === 'sponsor';

  // Build nav items based on active view
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

    // Expert view: show Expert Studio
    if (isExpertView) {
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

    // Sponsor or Member view: show Control Panel
    return [
      ...baseItems,
      { path: "/iranyitopult", label: t("nav.control_panel"), icon: LayoutDashboard },
      { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
    ];
  }, [user, profile, t, isExpertView]);

  // View options for the switcher
  const viewOptions = useMemo(() => [
    { value: 'member' as ActiveView, label: t('nav.role_member'), icon: User, color: undefined },
    { value: 'expert' as ActiveView, label: t('nav.role_expert'), icon: Sparkles, color: '#00E5FF' },
    { value: 'sponsor' as ActiveView, label: t('nav.role_supporter'), icon: Building2, color: '#FFD700' },
  ], [t]);

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
                    
                    {/* View Switcher - Super Admin sees ALL, others see their available views */}
                    {(isSuperAdmin || availableViews.length > 1) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          {t('nav.switch_role')}
                        </DropdownMenuLabel>
                        {viewOptions
                          .filter(option => isSuperAdmin || availableViews.includes(option.value))
                          .map(option => {
                            const Icon = option.icon;
                            const isCurrentView = activeView === option.value;
                            return (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleViewSwitch(option.value)}
                                disabled={isViewSwitching}
                                className={`flex items-center gap-2 cursor-pointer ${
                                  isCurrentView ? (option.color ? `bg-[${option.color}]/10` : 'bg-accent') : ''
                                }`}
                              >
                                <Icon 
                                  className="h-4 w-4" 
                                  style={option.color ? { color: option.color } : undefined}
                                />
                                <span style={isCurrentView && option.color ? { color: option.color } : undefined}>
                                  {option.label}
                                </span>
                                {isCurrentView && (
                                  <Check className="h-4 w-4 ml-auto" style={option.color ? { color: option.color } : undefined} />
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                      </>
                    )}
                    
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
                          {activeView === 'expert' ? t('nav.role_expert') : 
                           activeView === 'sponsor' ? t('nav.role_supporter') : 
                           t('nav.role_member')}
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* View Switcher - Mobile: Super Admin sees ALL */}
                  {user && (isSuperAdmin || availableViews.length > 1) && (
                    <div className="space-y-1 p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground px-2 mb-2">{t('nav.switch_role')}</p>
                      {viewOptions
                        .filter(option => isSuperAdmin || availableViews.includes(option.value))
                        .map(option => {
                          const Icon = option.icon;
                          const isCurrentView = activeView === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                handleViewSwitch(option.value);
                                setIsMobileMenuOpen(false);
                              }}
                              disabled={isViewSwitching}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                isCurrentView 
                                  ? option.color 
                                    ? `bg-[${option.color}]/20` 
                                    : 'bg-accent' 
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <Icon 
                                className="h-5 w-5" 
                                style={option.color ? { color: option.color } : undefined}
                              />
                              <span 
                                className="font-medium"
                                style={isCurrentView && option.color ? { color: option.color } : undefined}
                              >
                                {option.label}
                              </span>
                              {isCurrentView && (
                                <Check 
                                  className="h-4 w-4 ml-auto" 
                                  style={option.color ? { color: option.color } : undefined}
                                />
                              )}
                            </button>
                          );
                        })}
                    </div>
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
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Language & Actions - Mobile */}
                  <div className="mt-auto pt-4 border-t border-border space-y-2">
                    <LanguageSelector />
                    
                    {user ? (
                      <>
                        <Link
                          to="/inbox"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Inbox className="h-5 w-5" />
                          {t("nav.messages")}
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </Link>
                        
                        {isSuperAdmin && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          >
                            <ShieldCheck className="h-5 w-5" />
                            Super Admin
                          </Link>
                        )}
                        
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          {t("nav.sign_out")}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                            {t("nav.sign_in")}
                          </Link>
                        </Button>
                        <Button className="w-full" asChild>
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

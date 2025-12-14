import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  LogOut,
  Home,
  Target,
  Users as UsersIcon,
  Bot,
  Inbox,
  ChevronDown,
  ShieldCheck,
  Heart,
  Eye,
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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import wellagoraLogo from "@/assets/wellagora-logo.png";
import LanguageSelector from "./LanguageSelector";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile, signOut } = useAuth();
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
        console.error("Error loading unread count:", error);
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

  // Compute dashboard path based on effective role (including super admin view mode)
  const dashboardPath = useMemo(() => {
    if (!user || !profile) return null;
    if (["business", "government", "ngo"].includes(effectiveRole)) {
      return "/organization";
    }
    return "/dashboard";
  }, [user, profile, effectiveRole]);

  const navItems = useMemo(() => {
    const items = [
      { path: "/", label: t("nav.home"), icon: Home },
      { path: "/challenges", label: t("nav.challenges"), icon: Target },
      { path: "/community", label: t("nav.community"), icon: UsersIcon },
      { path: "/ai-assistant", label: "WellBot AI", icon: Bot },
      ...(!user ? [{ path: "/sponsor", label: t("nav.sponsors"), icon: Heart }] : []),
    ];

    // Add dashboard based on user type and view mode
    if (dashboardPath) {
      items.splice(3, 0, {
        path: dashboardPath,
        label: t("nav.dashboard"),
        icon: Home,
      });
    }

    return items;
  }, [user, t, dashboardPath]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img src={wellagoraLogo} alt="WellAgora" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active ? "text-primary bg-accent" : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions - Right */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Super Admin View Mode Switcher */}
            {isSuperAdmin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <Eye className="h-3.5 w-3.5 text-purple-500" />
                      <Select
                        value={viewMode}
                        onValueChange={(value: "super_admin" | "business" | "citizen") => setViewMode(value)}
                      >
                        <SelectTrigger className="w-[110px] h-7 text-xs border-0 bg-transparent p-0 focus:ring-0 text-purple-600 dark:text-purple-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="business">Cég nézet</SelectItem>
                          <SelectItem value="citizen">Felhasználó</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tesztelési nézet váltás</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {user ? (
              <>
                {/* Inbox with Badge */}
                <Link to="/inbox" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
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
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
          <div className="lg:hidden">
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
                        <p className="text-xs text-muted-foreground capitalize truncate">{profile.user_role}</p>
                      </div>
                    </Link>
                  )}

                  {/* Navigation Links - Mobile */}
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            active
                              ? "text-primary bg-accent font-medium"
                              : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    })}

                    {user && (
                      <>
                        <Link
                          to="/inbox"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive("/inbox")
                              ? "text-primary bg-accent font-medium"
                              : "text-muted-foreground hover:text-primary hover:bg-accent/50"
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
                  {/* Super Admin View Mode Switcher - Mobile */}
                  {isSuperAdmin && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 px-3">Tesztelési nézet</p>
                      <div className="px-3">
                        <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <Eye className="h-4 w-4 text-purple-500" />
                          <Select
                            value={viewMode}
                            onValueChange={(value: "super_admin" | "business" | "citizen") => setViewMode(value)}
                          >
                            <SelectTrigger className="flex-1 h-8 text-sm border-0 bg-transparent focus:ring-0 text-purple-600 dark:text-purple-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                              <SelectItem value="business">Cég nézet</SelectItem>
                              <SelectItem value="citizen">Felhasználó</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Language Selector - Mobile */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 px-3">{t("nav.language") || "Language"}</p>
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

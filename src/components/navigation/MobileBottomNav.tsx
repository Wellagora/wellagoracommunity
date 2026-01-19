import { Link, useLocation } from "react-router-dom";
import { Store, BookOpen, Bell, User, Sparkles, Building2, LayoutDashboard, Heart, Wallet, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  path: string;
  icon: typeof Store;
  labelKey: string;
  iconColor?: string;
}

// Helper to determine effective role from database user_role
const getEffectiveRole = (userRole: string | undefined): 'member' | 'expert' | 'sponsor' => {
  if (!userRole) return 'member';
  if (['expert', 'creator'].includes(userRole)) return 'expert';
  if (['sponsor', 'business', 'government', 'ngo'].includes(userRole)) return 'sponsor';
  return 'member';
};

const MobileBottomNav = () => {
  const { t } = useLanguage();
  const { user, profile, viewAsRole } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine user's role from profile
  const baseRole = getEffectiveRole(profile?.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;
  
  // Super admin can view as different role
  const effectiveRole = (isSuperAdmin && viewAsRole) ? viewAsRole : baseRole;

  // Load unread notifications count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error loading notification count:", error);
      }
    };

    loadUnreadCount();

    // Subscribe to changes
    const channel = supabase
      .channel("notifications_mobile")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // STRICT Role-specific navigation items - each role sees ONLY their items
  const getNavItems = (): NavItem[] => {
    // Members see: Piactér, Kedvencek, Értesítések, Profil
    if (effectiveRole === 'member') {
      return [
        { path: "/programs", icon: Store, labelKey: "mobile_nav.discover" },
        { path: "/kedvencek", icon: Heart, labelKey: "mobile_nav.favorites" },
        { path: "/ertesitesek", icon: Bell, labelKey: "mobile_nav.notifications" },
        { path: "/profile", icon: User, labelKey: "mobile_nav.profile" },
      ];
    }

    // Experts ONLY see: Stúdió, Analitika, Profil (NO marketplace unless explicit)
    if (effectiveRole === 'expert') {
      return [
        { path: "/expert-studio", icon: Sparkles, labelKey: "mobile_nav.my_studio", iconColor: "text-amber-500" },
        { path: "/expert-studio", icon: BarChart3, labelKey: "mobile_nav.analytics" },
        { path: "/ertesitesek", icon: Bell, labelKey: "mobile_nav.notifications" },
        { path: "/profile", icon: User, labelKey: "mobile_nav.profile" },
      ];
    }

    // Sponsors ONLY see: Dashboard, Kampányok, Kredit, Profil
    if (effectiveRole === 'sponsor') {
      return [
        { path: "/sponsor-dashboard", icon: Building2, labelKey: "mobile_nav.dashboard", iconColor: "text-blue-500" },
        { path: "/sponsor-dashboard", icon: Wallet, labelKey: "mobile_nav.credits" },
        { path: "/ertesitesek", icon: Bell, labelKey: "mobile_nav.notifications" },
        { path: "/profile", icon: User, labelKey: "mobile_nav.profile" },
      ];
    }

    // Default fallback (logged out - should not show)
    return [
      { path: "/programs", icon: Store, labelKey: "mobile_nav.discover" },
      { path: "/profile", icon: User, labelKey: "mobile_nav.profile" },
    ];
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    // Handle exact match or path prefix for nested routes
    if (path === "/programs") {
      return location.pathname.startsWith("/programs") || location.pathname.startsWith("/piacer") || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Don't show on auth pages, admin pages, or if not logged in
  const hiddenPaths = ["/auth", "/admin-panel"];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  
  if (shouldHide || !user) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/[0.05] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isNotifications = item.path === "/ertesitesek";
          const uniqueKey = `${item.path}-${item.labelKey}-${index}`;
          
          // Role-specific glow colors
          const getGlowColor = () => {
            if (!active) return "";
            switch (effectiveRole) {
              case 'member': return "text-emerald-600";
              case 'expert': return "text-amber-500";
              case 'sponsor': return "text-blue-500";
              default: return "text-black";
            }
          };
          
          const getGlowShadow = () => {
            if (!active) return "";
            switch (effectiveRole) {
              case 'member': return "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";
              case 'expert': return "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
              case 'sponsor': return "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]";
              default: return "";
            }
          };

          return (
            <Link
              key={uniqueKey}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] relative group"
            >
              <motion.div
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  active ? getGlowColor() : "text-black/40"
                }`}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className={`relative transition-all duration-300 ${active ? getGlowShadow() : ""}`}>
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                  {isNotifications && unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </div>
                <span className={`text-[9px] mt-0.5 font-medium ${active ? "font-semibold" : ""} line-clamp-1`}>
                  {t(item.labelKey)}
                </span>
                
                {/* Active indicator - role-colored dot */}
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      effectiveRole === 'member' ? 'bg-emerald-500' :
                      effectiveRole === 'expert' ? 'bg-amber-500' :
                      effectiveRole === 'sponsor' ? 'bg-blue-500' : 'bg-black'
                    }`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  UserCheck,
  Building2,
  CalendarDays,
  FolderKanban,
  Wallet,
  History
} from 'lucide-react';

const AdminLayout = () => {
  const { user, profile, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  // Security Check: Verify super admin access
  useEffect(() => {
    const checkAccess = () => {
      // Allow demo mode admin
      if (isDemoMode && profile?.user_role === 'admin') {
        setAccessChecked(true);
        return;
      }

      // Check real super admin status from profile
      if (!profile?.is_super_admin) {
        toast.error(t('admin.access_denied'), {
          description: t('admin.access_denied_description'),
          icon: <AlertTriangle className="h-5 w-5" />
        });
        navigate('/', { replace: true });
        return;
      }

      setAccessChecked(true);
    };

    if (profile !== undefined) {
      checkAccess();
    }
  }, [profile, isDemoMode, navigate, t]);

  // Main navigation items
  const mainNavItems = [
    { 
      path: '/admin-panel', 
      icon: LayoutDashboard, 
      label: t('admin.nav.dashboard'),
      exact: true 
    },
    { 
      path: '/admin-panel/projects', 
      icon: FolderKanban, 
      label: t('admin.nav.projects') 
    },
    { 
      path: '/admin-panel/experts', 
      icon: UserCheck, 
      label: t('admin.nav.experts') 
    },
    { 
      path: '/admin-panel/sponsors', 
      icon: Building2, 
      label: t('admin.nav.sponsors') 
    },
    { 
      path: '/admin-panel/programs', 
      icon: Shield, 
      label: t('admin.nav.programs') 
    },
    { 
      path: '/admin-panel/events', 
      icon: CalendarDays, 
      label: t('admin.nav.events') 
    },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { 
      path: '/admin-panel/financials', 
      icon: Wallet, 
      label: 'Pénzügyek'
    },
    { 
      path: '/admin-panel/users', 
      icon: Users, 
      label: t('admin.nav.users') 
    },
    { 
      path: '/admin-panel/feedback', 
      icon: MessageSquare, 
      label: t('admin.nav.feedback') 
    },
    { 
      path: '/admin-panel/analytics', 
      icon: BarChart3, 
      label: t('admin.nav.analytics') 
    },
    { 
      path: '/admin-panel/audit', 
      icon: History, 
      label: 'Rendszernapló'
    },
    { 
      path: '/admin-panel/settings', 
      icon: Settings, 
      label: t('admin.nav.settings') 
    },
  ];

  const navItems = [...mainNavItems, ...secondaryNavItems];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleExitAdmin = () => {
    navigate('/');
  };

  // Show loading while checking access
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const NavItem = ({ item }: { item: { path: string; icon: typeof LayoutDashboard; label: string; exact?: boolean } }) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.exact);

    return (
      <NavLink
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
          "hover:bg-slate-700",
          active && "bg-emerald-600 text-white",
          !active && "text-slate-300",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!sidebarCollapsed && (
          <span className="truncate">{item.label}</span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="font-semibold text-white">Super Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dark Sidebar - Fixed height, no page scroll */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 z-50",
          "flex flex-col flex-shrink-0 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-500" />
              <span className="font-semibold text-white">Super Admin</span>
            </div>
          )}
          {sidebarCollapsed && (
            <Shield className="h-6 w-6 text-emerald-500 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation - scrollable only if menu items exceed height */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
            
            {/* Divider */}
            <div className="my-3 border-t border-slate-700" />
            
            {secondaryNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Exit Admin Button */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleExitAdmin}
            className={cn(
              "w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-700",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && t('admin.nav.exit')}
          </Button>
        </div>
      </aside>

      {/* Main Content - Only this area scrolls */}
      <main className="flex-1 h-full overflow-y-auto lg:pt-0 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

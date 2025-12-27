import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Building2, 
  Users, 
  CreditCard, 
  Receipt, 
  Target, 
  Bot, 
  Settings,
  TrendingUp,
  Activity,
  Calendar,
  CalendarPlus,
  Sparkles,
  FileCheck,
  Clock,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import OrganizationsManager from "@/components/superadmin/OrganizationsManager";
import SubscriptionsManager from "@/components/superadmin/SubscriptionsManager";
import InvoicesManager from "@/components/superadmin/InvoicesManager";
import UsersManager from "@/components/superadmin/UsersManager";
import ProjectsManager from "@/components/superadmin/ProjectsManager";
import ProgramsManager from "@/components/superadmin/ProgramsManager";
import EventsManager from "@/components/superadmin/EventsManager";
import AIAnalyticsDashboard from "@/components/admin/AIAnalyticsDashboard";
import SystemSettings from "@/components/superadmin/SystemSettings";
import CreatorManager from "@/components/superadmin/CreatorManager";
import ContentModerationPanel from "@/components/superadmin/ContentModerationPanel";
import FinancialOverview from "@/components/superadmin/FinancialOverview";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  iconColor?: string;
};

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Áttekintés', icon: LayoutDashboard },
  { id: 'projects', label: 'Projektek', icon: FolderKanban },
  { id: 'organizations', label: 'Szervezetek', icon: Building2 },
  { id: 'users', label: 'Felhasználók', icon: Users },
  { id: 'creators', label: 'Kreátorok', icon: Sparkles, iconColor: '#FFD700' },
  { id: 'content-moderation', label: 'Moderáció', icon: FileCheck },
  { id: 'financial', label: 'Pénzügyek', icon: TrendingUp },
  { id: 'subscriptions', label: 'Előfizetések', icon: CreditCard },
  { id: 'invoices', label: 'Számlák', icon: Receipt },
  { id: 'programs', label: 'Programok', icon: Target },
  { id: 'events', label: 'Események', icon: Calendar },
  { id: 'ai-analytics', label: 'AI Analytics', icon: Bot },
  { id: 'settings', label: 'Beállítások', icon: Settings },
];

interface PlatformStats {
  total_users: number;
  total_creators: number;
  verified_creators: number;
  active_creators: number;
  pending_content: number;
  published_content: number;
  stripe_connected: number;
  total_carbon_handprint: number;
  total_programs: number;
  total_events: number;
}

const SuperAdminSidebar = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Super Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={isActive ? "bg-accent text-accent-foreground" : ""}
                      tooltip={item.label}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={item.iconColor ? { color: item.iconColor } : undefined}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const OverviewTab = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Fetch stats using React Query
  const { data: stats, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_platform_stats');
      if (error) throw error;
      setLastRefresh(Date.now());
      return data as unknown as PlatformStats;
    },
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Update seconds ago counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefresh) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleManualRefresh = () => {
    refetch();
  };

  const unverifiedCreators = (stats?.total_creators || 0) - (stats?.verified_creators || 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="bg-destructive/10 border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Hiba a betöltéskor</h3>
            <p className="text-muted-foreground">Nem sikerült betölteni a statisztikákat</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Újrapróbálás
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Áttekintés</h2>
          <p className="text-muted-foreground">
            Kulcsfontosságú mutatók és statisztikák a teljes platformról
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Utoljára frissítve: {secondsAgo} másodperce
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50 hover:bg-card/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Összes Felhasználó
            </CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.total_users || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur border-border/50 hover:bg-card/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kreátorok
            </CardTitle>
            <Sparkles className="h-5 w-5 text-[#FFD700]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.total_creators || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur border-border/50 hover:bg-card/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktív Programok
            </CardTitle>
            <Target className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.total_programs || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-card/30 backdrop-blur border-border/50 hover:bg-card/40 transition-all ${(stats?.pending_content || 0) > 0 ? 'border-orange-500/50' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Függő Tartalmak
            </CardTitle>
            <Clock className={`h-5 w-5 ${(stats?.pending_content || 0) > 0 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(stats?.pending_content || 0) > 0 ? 'text-orange-500' : ''}`}>
              {(stats?.pending_content || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={`bg-[#112240] border-border/50 hover:border-[#FFD700] transition-all cursor-pointer ${unverifiedCreators > 0 ? 'border-[#FFD700]/50' : ''}`}
          onClick={() => onNavigate('creators')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFD700]" />
              Kreátor Jóváhagyások
              {unverifiedCreators > 0 && (
                <Badge className="ml-auto bg-[#FFD700] text-black">
                  {unverifiedCreators}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Hitelesítésre váró szakértők
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between hover:bg-[#FFD700]/10">
              Megtekintés
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className={`bg-[#112240] border-border/50 hover:border-orange-500 transition-all cursor-pointer ${(stats?.pending_content || 0) > 0 ? 'border-orange-500/50' : ''}`}
          onClick={() => onNavigate('content-moderation')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-orange-500" />
              Tartalom Moderáció
              {(stats?.pending_content || 0) > 0 && (
                <Badge className="ml-auto bg-orange-500 text-white">
                  {stats?.pending_content}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Jóváhagyásra váró tartalmak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between hover:bg-orange-500/10">
              Moderálás
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:border-[#FFD700] transition-all cursor-pointer"
          onClick={() => onNavigate('financial')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#FFD700]" />
              Platform Áttekintés
            </CardTitle>
            <CardDescription>
              {stats?.total_programs || 0} program, {stats?.total_events || 0} esemény
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between hover:bg-[#FFD700]/10">
              Részletek
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed bg-card/30 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            További Funkciók
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            További admin funkciók (Projektek, Szervezetek, Felhasználók, Előfizetések, stb.) a bal oldali menüből elérhetők.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const SuperAdminPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const checkSuperAdminRole = async () => {
      // Still loading auth state
      if (authLoading) return;

      // No user logged in - redirect to auth
      if (!user) {
        setIsSuperAdmin(false);
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin'
        });

        if (error) {
          setIsSuperAdmin(false);
          navigate('/dashboard');
          return;
        }

        setIsSuperAdmin(data);
        if (!data) {
          navigate('/dashboard');
        }
      } catch (error) {
        setIsSuperAdmin(false);
        navigate('/dashboard');
      }
    };

    checkSuperAdminRole();
  }, [user, authLoading, navigate]);

  // Show loading while checking auth and role
  if (authLoading || isSuperAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Hozzáférés ellenőrzése...</p>
        </div>
      </div>
    );
  }

  // Redirect handled in useEffect, but show nothing if not super admin
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navigation />
      
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <SuperAdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
          
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-6 lg:p-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                      Üdvözöljük, {profile?.first_name}!
                    </p>
                  </div>
                </div>
                <CreateEventDialog 
                  trigger={
                    <Button className="gap-2">
                      <CalendarPlus className="w-4 h-4" />
                      Új esemény
                    </Button>
                  }
                />
              </div>

              {activeTab === 'overview' && <OverviewTab onNavigate={handleTabChange} />}
              {activeTab === 'organizations' && <OrganizationsManager />}
              {activeTab === 'subscriptions' && <SubscriptionsManager />}
              {activeTab === 'invoices' && <InvoicesManager />}
              {activeTab === 'users' && <UsersManager />}
              {activeTab === 'creators' && <CreatorManager />}
              {activeTab === 'content-moderation' && <ContentModerationPanel />}
              {activeTab === 'financial' && <FinancialOverview onNavigate={handleTabChange} />}
              {activeTab === 'projects' && <ProjectsManager />}
              {activeTab === 'programs' && <ProgramsManager />}
              {activeTab === 'events' && <EventsManager />}
              {activeTab === 'ai-analytics' && <AIAnalyticsDashboard />}
              {activeTab === 'settings' && <SystemSettings />}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SuperAdminPage;

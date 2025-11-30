import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import AIAnalyticsDashboard from "@/components/admin/AIAnalyticsDashboard";
import SystemSettings from "@/components/superadmin/SystemSettings";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
};

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Áttekintés', icon: LayoutDashboard },
  { id: 'projects', label: 'Projektek', icon: FolderKanban },
  { id: 'organizations', label: 'Szervezetek', icon: Building2 },
  { id: 'users', label: 'Felhasználók', icon: Users },
  { id: 'subscriptions', label: 'Előfizetések', icon: CreditCard },
  { id: 'invoices', label: 'Számlák', icon: Receipt },
  { id: 'programs', label: 'Programok', icon: Target },
  { id: 'ai-analytics', label: 'AI Analytics', icon: Bot },
  { id: 'settings', label: 'Beállítások', icon: Settings },
];

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
                      <Icon className="h-5 w-5" />
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

const OverviewTab = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalOrganizations: 0,
    activeSubscriptions: 0,
    activePrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [projectsRes, usersRes, orgsRes, subsRes, programsRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('organizations').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('challenge_definitions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ]);

        setStats({
          totalProjects: projectsRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalOrganizations: orgsRes.count || 0,
          activeSubscriptions: subsRes.count || 0,
          activePrograms: programsRes.count || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const kpiCards = [
    {
      title: 'Összes Projekt',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-blue-500',
    },
    {
      title: 'Összes Felhasználó',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Összes Szervezet',
      value: stats.totalOrganizations,
      icon: Building2,
      color: 'text-purple-500',
    },
    {
      title: 'Aktív Előfizetések',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: 'text-orange-500',
    },
    {
      title: 'Havi Bevétel',
      value: 'Hamarosan',
      icon: TrendingUp,
      color: 'text-emerald-500',
      isPlaceholder: true,
    },
    {
      title: 'Aktív Programok',
      value: stats.activePrograms,
      icon: Target,
      color: 'text-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
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
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Áttekintés</h2>
        <p className="text-muted-foreground">
          Kulcsfontosságú mutatók és statisztikák a teljes platformról
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {card.isPlaceholder ? (
                    <span className="text-xl text-muted-foreground">{card.value}</span>
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            További Funkciók
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            További admin funkciók (Projektek, Szervezetek, Felhasználók, Előfizetések, stb.) hamarosan elérhetők lesznek.
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

  useEffect(() => {
    const checkSuperAdminRole = async () => {
      if (!user || authLoading) return;

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin'
        });

        if (error) {
          console.error('Error checking super_admin role:', error);
          setIsSuperAdmin(false);
          navigate('/dashboard');
          return;
        }

        setIsSuperAdmin(data);
        if (!data) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking super_admin role:', error);
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
          <SuperAdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-2">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Üdvözöljük, {profile?.first_name}!
                  </p>
                </div>
              </div>

              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'organizations' && <OrganizationsManager />}
              {activeTab === 'subscriptions' && <SubscriptionsManager />}
              {activeTab === 'invoices' && <InvoicesManager />}
              {activeTab === 'users' && <UsersManager />}
              {activeTab === 'projects' && <ProjectsManager />}
              {activeTab === 'programs' && <ProgramsManager />}
              {activeTab === 'ai-analytics' && <AIAnalyticsDashboard />}
              {activeTab === 'settings' && <SystemSettings />}
              {activeTab !== 'overview' && activeTab !== 'organizations' && activeTab !== 'subscriptions' && activeTab !== 'invoices' && activeTab !== 'users' && activeTab !== 'projects' && activeTab !== 'programs' && activeTab !== 'ai-analytics' && activeTab !== 'settings' && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Ez a funkció hamarosan elérhető lesz.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SuperAdminPage;

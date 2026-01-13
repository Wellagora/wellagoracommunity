import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Calendar, 
  MessageSquare,
  Activity,
  RefreshCw,
  Shield,
  Settings,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  experts: number;
  sponsors: number;
  members: number;
  activePrograms: number;
  pendingFeedback: number;
}

const AdminDashboardNew = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    
    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        setStats({
          totalUsers: 156,
          experts: 24,
          sponsors: 8,
          members: 124,
          activePrograms: 45,
          pendingFeedback: 7
        });
        setLoading(false);
        return;
      }

      // Real data: fetch from Supabase in parallel
      const [
        profilesResult,
        expertsResult,
        sponsorsResult,
        membersResult,
        feedbackResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'expert'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'sponsor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'member'),
        supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('status', 'new')
      ]);

      // Try to get programs count if table exists
      let activePrograms = 0;
      try {
        const { count } = await supabase.from('expert_contents').select('*', { count: 'exact', head: true }).eq('is_published', true);
        activePrograms = count || 0;
      } catch {
        activePrograms = 0;
      }

      setStats({
        totalUsers: profilesResult.count || 0,
        experts: expertsResult.count || 0,
        sponsors: sponsorsResult.count || 0,
        members: membersResult.count || 0,
        activePrograms,
        pendingFeedback: feedbackResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalUsers: 0,
        experts: 0,
        sponsors: 0,
        members: 0,
        activePrograms: 0,
        pendingFeedback: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isDemoMode]);

  const statCards = [
    { 
      label: t('admin.stats.total_users'), 
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      onClick: () => navigate('/admin/users')
    },
    { 
      label: t('admin.stats.experts'), 
      value: stats?.experts || 0,
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      onClick: () => navigate('/admin/users?role=expert')
    },
    { 
      label: t('admin.stats.sponsors'), 
      value: stats?.sponsors || 0,
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      onClick: () => navigate('/admin/users?role=sponsor')
    },
    { 
      label: t('admin.stats.members'), 
      value: stats?.members || 0,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      onClick: () => navigate('/admin/users?role=member')
    },
    { 
      label: t('admin.stats.active_programs'), 
      value: stats?.activePrograms || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    { 
      label: t('admin.stats.pending_feedback'), 
      value: stats?.pendingFeedback || 0,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      highlight: (stats?.pendingFeedback || 0) > 0,
      onClick: () => navigate('/admin/feedback')
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {t('admin.dashboard.refresh')}
        </Button>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-amber-800 dark:text-amber-200">
            {t('admin.dashboard.demo_mode')}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label}
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                stat.highlight && "ring-2 ring-red-500"
              )}
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-full", stat.bgColor)}>
                      <Icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('admin.dashboard.quick_actions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-5 w-5 text-blue-600" />
              <span>{t('admin.actions.manage_users')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin/moderation')}
            >
              <Shield className="h-5 w-5 text-purple-600" />
              <span>{t('admin.actions.moderation')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin/feedback')}
            >
              <MessageSquare className="h-5 w-5 text-red-600" />
              <span>{t('admin.actions.view_feedback')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <span>{t('admin.actions.analytics')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardNew;

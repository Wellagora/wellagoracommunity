import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  BarChart3,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskQueueItem {
  task_type: string;
  count: number;
  label_hu: string;
  label_en: string;
}

interface DashboardStats {
  totalUsers: number;
  experts: number;
  sponsors: number;
  members: number;
  activePrograms: number;
  pendingFeedback: number;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

// Mock task queue for demo mode
const MOCK_TASK_QUEUE: TaskQueueItem[] = [
  { task_type: 'expert_verification', count: 5, label_hu: 'Szakértők hitelesítése', label_en: 'Expert Verification' },
  { task_type: 'program_review', count: 3, label_hu: 'Programok jóváhagyása', label_en: 'Program Review' },
  { task_type: 'sponsor_activation', count: 2, label_hu: 'Szponzor aktiválás', label_en: 'Sponsor Activation' },
  { task_type: 'pending_feedback', count: 7, label_hu: 'Visszajelzések', label_en: 'Pending Feedback' },
];

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Káli-medence Közösség', slug: 'kali-medence', is_active: true },
  { id: 'proj-2', name: 'Balaton-felvidék Projekt', slug: 'balaton-felvidek', is_active: true },
  { id: 'proj-3', name: 'Demo Projekt', slug: 'demo', is_active: false },
];

const AdminDashboardNew = () => {
  const { t, language } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [taskQueue, setTaskQueue] = useState<TaskQueueItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
        setTaskQueue(MOCK_TASK_QUEUE);
        setProjects(MOCK_PROJECTS);
        setLoading(false);
        return;
      }

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, slug, is_active')
        .order('name');
      
      setProjects(projectsData || []);

      // Fetch task queue from view
      const { data: taskData } = await supabase
        .from('admin_task_queue')
        .select('*');
      
      setTaskQueue(taskData || []);

      // Fetch stats in parallel
      const [
        profilesResult,
        expertsResult,
        sponsorsResult,
        membersResult,
        feedbackResult,
        programsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'creator'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('user_role', ['business', 'government', 'ngo']),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'member'),
        supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('challenge_definitions').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats({
        totalUsers: profilesResult.count || 0,
        experts: expertsResult.count || 0,
        sponsors: sponsorsResult.count || 0,
        members: membersResult.count || 0,
        activePrograms: programsResult.count || 0,
        pendingFeedback: feedbackResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
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
    fetchData();
  }, [isDemoMode]);

  // Task queue item config
  const getTaskConfig = (taskType: string) => {
    switch (taskType) {
      case 'expert_verification':
        return { 
          icon: UserCheck, 
          color: 'text-indigo-600', 
          bgColor: 'bg-indigo-50 dark:bg-indigo-950',
          route: '/admin-panel/users?role=creator&status=pending'
        };
      case 'program_review':
        return { 
          icon: ClipboardList, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50 dark:bg-purple-950',
          route: '/admin-panel/programs?status=pending'
        };
      case 'sponsor_activation':
        return { 
          icon: Building2, 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-50 dark:bg-amber-950',
          route: '/admin-panel/sponsors?status=pending'
        };
      case 'pending_feedback':
        return { 
          icon: MessageSquare, 
          color: 'text-red-600', 
          bgColor: 'bg-red-50 dark:bg-red-950',
          route: '/admin-panel/feedback'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-slate-600', 
          bgColor: 'bg-slate-50 dark:bg-slate-950',
          route: '/admin-panel'
        };
    }
  };

  const totalPendingTasks = taskQueue.reduce((sum, t) => sum + t.count, 0);

  const statCards = [
    { 
      label: t('admin.stats.total_users'), 
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      onClick: () => navigate('/admin-panel/users')
    },
    { 
      label: t('admin.stats.experts'), 
      value: stats?.experts || 0,
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      onClick: () => navigate('/admin-panel/users?role=creator')
    },
    { 
      label: t('admin.stats.sponsors'), 
      value: stats?.sponsors || 0,
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      onClick: () => navigate('/admin-panel/sponsors')
    },
    { 
      label: t('admin.stats.active_programs'), 
      value: stats?.activePrograms || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      onClick: () => navigate('/admin-panel/programs')
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-emerald-500" />
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('admin.dashboard.select_project')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.dashboard.all_projects')}</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
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

      {/* Task Queue Section - CRITICAL */}
      <Card className={cn(
        "border-2",
        totalPendingTasks > 0 ? "border-amber-300 dark:border-amber-700" : "border-emerald-300 dark:border-emerald-700"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                totalPendingTasks > 0 ? "bg-amber-100 dark:bg-amber-900" : "bg-emerald-100 dark:bg-emerald-900"
              )}>
                {totalPendingTasks > 0 ? (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{t('admin.dashboard.task_queue')}</CardTitle>
                <CardDescription>
                  {totalPendingTasks > 0 
                    ? t('admin.dashboard.tasks_pending', { count: totalPendingTasks })
                    : t('admin.dashboard.all_tasks_complete')
                  }
                </CardDescription>
              </div>
            </div>
            {totalPendingTasks > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {totalPendingTasks}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {taskQueue.map((task) => {
                const config = getTaskConfig(task.task_type);
                const Icon = config.icon;
                const label = language === 'hu' ? task.label_hu : task.label_en;
                
                return (
                  <Card 
                    key={task.task_type}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]",
                      task.count > 0 && "ring-2 ring-amber-400 dark:ring-amber-600"
                    )}
                    onClick={() => navigate(config.route)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <Badge 
                          variant={task.count > 0 ? "destructive" : "secondary"}
                          className="text-lg"
                        >
                          {task.count}
                        </Badge>
                      </div>
                      <p className="mt-3 font-medium text-sm">{label}</p>
                      {task.count > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {t('admin.dashboard.review_now')}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
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
                      <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
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

      {/* Quick Management Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('admin.dashboard.quick_actions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin-panel/projects')}
            >
              <FolderOpen className="h-5 w-5 text-emerald-600" />
              <span>{t('admin.actions.manage_projects')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin-panel/users?role=creator')}
            >
              <UserCheck className="h-5 w-5 text-indigo-600" />
              <span>{t('admin.actions.verify_experts')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin-panel/programs')}
            >
              <ClipboardList className="h-5 w-5 text-purple-600" />
              <span>{t('admin.actions.review_programs')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin-panel/sponsors')}
            >
              <Briefcase className="h-5 w-5 text-amber-600" />
              <span>{t('admin.actions.manage_sponsors')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate('/admin-panel/analytics')}
            >
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>{t('admin.actions.analytics')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardNew;
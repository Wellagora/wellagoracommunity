import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Ticket,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Types
interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  userGrowthTrend: number;
  totalPrograms: number;
  newProgramsThisMonth: number;
  totalPosts: number;
  postsThisWeek: number;
  totalLikes: number;
  totalComments: number;
  vouchersIssued: number;
  vouchersRedeemed: number;
  redemptionRate: number;
  totalEvents: number;
  upcomingEvents: number;
  usersByRole: { role: string; count: number }[];
  programsByCategory: { category: string; count: number }[];
  userGrowthData: { week: string; users: number }[];
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  created_at: string;
}

interface AdminOutletContext {
  selectedProjectId: string | null;
}

const AdminAnalytics = () => {
  const { t } = useLanguage();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    userGrowthTrend: 0,
    totalPrograms: 0,
    newProgramsThisMonth: 0,
    totalPosts: 0,
    postsThisWeek: 0,
    totalLikes: 0,
    totalComments: 0,
    vouchersIssued: 0,
    vouchersRedeemed: 0,
    redemptionRate: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    usersByRole: [],
    programsByCategory: [],
    userGrowthData: [],
    recentActivity: []
  });

  // Helper to get date ranges
  const getDateRanges = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(now.getDate() - 56);
    
    return {
      startOfMonth: startOfMonth.toISOString(),
      startOfWeek: startOfWeek.toISOString(),
      eightWeeksAgo: eightWeeksAgo.toISOString(),
      now: now.toISOString()
    };
  };

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    const dates = getDateRanges();

    try {
      // 1. USER STATS
      let profilesQuery = supabase
        .from('profiles')
        .select('user_role, created_at');
      if (selectedProjectId) profilesQuery = profilesQuery.eq('project_id', selectedProjectId);
      const { data: profiles } = await profilesQuery;

      const totalUsers = profiles?.length || 0;
      const newUsersThisMonth = profiles?.filter(p => p.created_at >= dates.startOfMonth).length || 0;
      
      // Calculate user growth by week (last 8 weeks)
      const userGrowthData: { week: string; users: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const usersInWeek = profiles?.filter(p => {
          const created = new Date(p.created_at);
          return created >= weekStart && created < weekEnd;
        }).length || 0;
        
        userGrowthData.push({
          week: `W${8-i}`,
          users: usersInWeek
        });
      }

      // User growth trend (compare last 4 weeks to previous 4 weeks)
      const lastFourWeeks = userGrowthData.slice(4).reduce((sum, w) => sum + w.users, 0);
      const prevFourWeeks = userGrowthData.slice(0, 4).reduce((sum, w) => sum + w.users, 0);
      const userGrowthTrend = prevFourWeeks > 0 ? Math.round(((lastFourWeeks - prevFourWeeks) / prevFourWeeks) * 100) : 0;

      // Users by role
      const roleMap = new Map<string, number>();
      profiles?.forEach(p => {
        const role = p.user_role || 'member';
        roleMap.set(role, (roleMap.get(role) || 0) + 1);
      });
      const usersByRole = Array.from(roleMap.entries())
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      // 2. PROGRAM STATS
      let programsQuery = supabase
        .from('expert_contents')
        .select('id, status, category, created_at')
        .eq('status', 'published');
      if (selectedProjectId) programsQuery = programsQuery.eq('region_id', selectedProjectId);
      const { data: programs } = await programsQuery;

      const totalPrograms = programs?.length || 0;
      const newProgramsThisMonth = programs?.filter(p => p.created_at >= dates.startOfMonth).length || 0;

      // Programs by category (top 5)
      const categoryMap = new Map<string, number>();
      programs?.forEach(p => {
        if (p.category) {
          categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
        }
      });
      const programsByCategory = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 3. EVENT STATS
      let eventsQuery = supabase
        .from('events')
        .select('id, start_date, category, created_at');
      if (selectedProjectId) eventsQuery = eventsQuery.eq('project_id', selectedProjectId);
      const { data: events } = await eventsQuery;

      const totalEvents = events?.length || 0;
      const upcomingEvents = events?.filter(e => new Date(e.start_date) >= new Date()).length || 0;

      // 4. COMMUNITY STATS
      const { data: posts } = await supabase
        .from('community_posts')
        .select('id, post_type, created_at, likes_count, comments_count');

      const totalPosts = posts?.length || 0;
      const postsThisWeek = posts?.filter(p => p.created_at >= dates.startOfWeek).length || 0;
      const totalLikes = posts?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;

      // 5. VOUCHER STATS
      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('id, status, created_at');

      const vouchersIssued = vouchers?.length || 0;
      const vouchersRedeemed = vouchers?.filter(v => v.status === 'redeemed').length || 0;
      const redemptionRate = vouchersIssued > 0 ? Math.round((vouchersRedeemed / vouchersIssued) * 100) : 0;

      // 6. ACTIVITY TIMELINE
      const { data: activity } = await supabase
        .from('activity_log')
        .select('id, action, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setAnalytics({
        totalUsers,
        newUsersThisMonth,
        userGrowthTrend,
        totalPrograms,
        newProgramsThisMonth,
        totalPosts,
        postsThisWeek,
        totalLikes,
        totalComments,
        vouchersIssued,
        vouchersRedeemed,
        redemptionRate,
        totalEvents,
        upcomingEvents,
        usersByRole,
        programsByCategory,
        userGrowthData,
        recentActivity: activity || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedProjectId]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analitika</h1>
          <p className="text-muted-foreground">Platform statisztikák és metrikák</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Frissítés
        </Button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Összes Felhasználó</p>
                  <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                  <p className={cn(
                    "text-sm flex items-center gap-1",
                    analytics.userGrowthTrend >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {analytics.userGrowthTrend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(analytics.userGrowthTrend)}% ez hónapban
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Közzétett Programok</p>
                  <p className="text-2xl font-bold">{analytics.totalPrograms.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">+{analytics.newProgramsThisMonth} ez hónapban</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Közösségi Posztok</p>
                  <p className="text-2xl font-bold">{analytics.totalPosts.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{analytics.postsThisWeek} ezen a héten</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kupon Beváltási Arány</p>
                  <p className="text-2xl font-bold">{analytics.redemptionRate}%</p>
                  <p className="text-sm text-muted-foreground">{analytics.vouchersRedeemed} / {analytics.vouchersIssued}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Felhasználói Növekedés (8 hét)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="Új felhasználók"
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programs by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Programok Kategóriánként (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.programsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Activity and Stats */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Legutóbbi Aktivitás
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nincs aktivitás</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gyors Statisztikák</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="space-y-4">
                {/* Events */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Események</p>
                      <p className="text-xs text-muted-foreground">{analytics.upcomingEvents} közelgő</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{analytics.totalEvents}</p>
                </div>

                {/* Community Engagement */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Közösségi Interakciók</p>
                      <p className="text-xs text-muted-foreground">Likeok és kommentek</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{(analytics.totalLikes + analytics.totalComments).toLocaleString()}</p>
                </div>

                {/* Users by Role */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-3">Felhasználók Szerepkör Szerint</p>
                  <div className="space-y-2">
                    {analytics.usersByRole.slice(0, 4).map((role) => {
                      const roleLabels: Record<string, string> = { member: 'Tag', expert: 'Szakértő', sponsor: 'Szponzor', admin: 'Admin' };
                      return (
                        <div key={role.role} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{roleLabels[role.role] || role.role}</span>
                          <Badge variant="secondary" className="text-xs">{role.count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Voucher Stats */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Kupon Statisztikák</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Kiadott</p>
                      <p className="text-lg font-bold">{analytics.vouchersIssued}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Beváltott</p>
                      <p className="text-lg font-bold">{analytics.vouchersRedeemed}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Types
interface DailyStats {
  date: string;
  pageViews: number;
  uniqueSessions: number;
  events: number;
}

interface PageStats {
  page: string;
  views: number;
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface EventStats {
  event: string;
  count: number;
}

interface EventStats {
  event: string;
  count: number;
}

// Mock data for demo mode
const generateMockDailyStats = (days: number): DailyStats[] => {
  const data: DailyStats[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 200) + 50,
      uniqueSessions: Math.floor(Math.random() * 80) + 20,
      events: Math.floor(Math.random() * 150) + 30,
    });
  }
  return data;
};

const MOCK_PAGE_STATS: PageStats[] = [
  { page: '/', views: 523 },
  { page: '/piacer', views: 412 },
  { page: '/kozosseg', views: 287 },
  { page: '/ai-assistant', views: 234 },
  { page: '/szakertoi-studio', views: 156 },
  { page: '/tamogatoi-kozpont', views: 98 },
  { page: '/esemenyek', views: 87 },
  { page: '/profil', views: 76 },
];

const MOCK_DEVICE_STATS: DeviceStats[] = [
  { device: 'mobile', count: 456, percentage: 52 },
  { device: 'desktop', count: 312, percentage: 36 },
  { device: 'tablet', count: 105, percentage: 12 },
];

const MOCK_EVENT_STATS: EventStats[] = [
  { event: 'page_view', count: 2341 },
  { event: 'voucher_view', count: 456 },
  { event: 'voucher_claim_start', count: 234 },
  { event: 'voucher_claim_complete', count: 189 },
  { event: 'wellbot_open', count: 312 },
  { event: 'wellbot_message', count: 567 },
  { event: 'feed_like', count: 234 },
  { event: 'feedback_submit', count: 23 },
];

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#10b981',
  desktop: '#6366f1',
  tablet: '#f59e0b',
};

const AdminAnalytics = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalPageViews = dailyStats.reduce((sum, d) => sum + d.pageViews, 0);
    const totalSessions = dailyStats.reduce((sum, d) => sum + d.uniqueSessions, 0);
    const totalEvents = dailyStats.reduce((sum, d) => sum + d.events, 0);
    
    // Calculate trend (compare last half to first half)
    const mid = Math.floor(dailyStats.length / 2);
    const firstHalf = dailyStats.slice(0, mid).reduce((sum, d) => sum + d.pageViews, 0);
    const secondHalf = dailyStats.slice(mid).reduce((sum, d) => sum + d.pageViews, 0);
    const trend = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    return { totalPageViews, totalSessions, totalEvents, trend };
  }, [dailyStats]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    const days = parseInt(timeRange);

    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        setDailyStats(generateMockDailyStats(days));
        setPageStats(MOCK_PAGE_STATS);
        setDeviceStats(MOCK_DEVICE_STATS);
        setEventStats(MOCK_EVENT_STATS);
        setLoading(false);
        return;
      }

      // Real data from Supabase
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Daily stats
      const { data: rawEvents, error } = await supabase
        .from('analytics_events')
        .select('event_name, page_path, device_type, session_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Process daily stats
      const dailyMap = new Map<string, { pageViews: number; sessions: Set<string>; events: number }>();
      
      rawEvents?.forEach(event => {
        const date = event.created_at?.split('T')[0] || '';
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { pageViews: 0, sessions: new Set(), events: 0 });
        }
        const day = dailyMap.get(date)!;
        if (event.event_name === 'page_view') day.pageViews++;
        if (event.session_id) day.sessions.add(event.session_id);
        day.events++;
      });

      const processedDaily: DailyStats[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = dailyMap.get(dateStr);
        processedDaily.push({
          date: dateStr,
          pageViews: dayData?.pageViews || 0,
          uniqueSessions: dayData?.sessions.size || 0,
          events: dayData?.events || 0,
        });
      }
      setDailyStats(processedDaily);

      // Page stats
      const pageMap = new Map<string, number>();
      rawEvents?.filter(e => e.event_name === 'page_view').forEach(event => {
        const page = event.page_path || '/';
        pageMap.set(page, (pageMap.get(page) || 0) + 1);
      });
      const processedPages: PageStats[] = Array.from(pageMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);
      setPageStats(processedPages);

      // Device stats
      const deviceMap = new Map<string, number>();
      rawEvents?.forEach(event => {
        const device = event.device_type || 'desktop';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });
      const totalDevices = Array.from(deviceMap.values()).reduce((sum, c) => sum + c, 0);
      const processedDevices: DeviceStats[] = Array.from(deviceMap.entries())
        .map(([device, count]) => ({
          device,
          count,
          percentage: Math.round((count / totalDevices) * 100)
        }));
      setDeviceStats(processedDevices);

      // Event stats
      const eventMap = new Map<string, number>();
      rawEvents?.forEach(event => {
        eventMap.set(event.event_name, (eventMap.get(event.event_name) || 0) + 1);
      });
      const processedEvents: EventStats[] = Array.from(eventMap.entries())
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setEventStats(processedEvents);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isDemoMode, timeRange]);

  // Device icon helper
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  // Voucher funnel data
  const voucherFunnel = useMemo(() => {
    const view = eventStats.find(e => e.event === 'voucher_view')?.count || 0;
    const start = eventStats.find(e => e.event === 'voucher_claim_start')?.count || 0;
    const complete = eventStats.find(e => e.event === 'voucher_claim_complete')?.count || 0;
    return [
      { stage: t('admin.analytics.funnel_view'), count: view, fill: '#6366f1' },
      { stage: t('admin.analytics.funnel_start'), count: start, fill: '#f59e0b' },
      { stage: t('admin.analytics.funnel_complete'), count: complete, fill: '#10b981' },
    ];
  }, [eventStats, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.analytics.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('admin.analytics.last_7_days')}</SelectItem>
              <SelectItem value="14">{t('admin.analytics.last_14_days')}</SelectItem>
              <SelectItem value="30">{t('admin.analytics.last_30_days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.analytics.total_page_views')}</p>
                  <p className="text-2xl font-bold">{totals.totalPageViews.toLocaleString()}</p>
                  <p className={cn(
                    "text-sm flex items-center gap-1",
                    totals.trend >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {totals.trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(totals.trend)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">{t('admin.analytics.unique_sessions')}</p>
                  <p className="text-2xl font-bold">{totals.totalSessions.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
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
                  <p className="text-sm text-muted-foreground">{t('admin.analytics.total_events')}</p>
                  <p className="text-2xl font-bold">{totals.totalEvents.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-amber-600" />
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
                  <p className="text-sm text-muted-foreground">{t('admin.analytics.conversion_rate')}</p>
                  <p className="text-2xl font-bold">
                    {voucherFunnel[0].count > 0 
                      ? Math.round((voucherFunnel[2].count / voucherFunnel[0].count) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Page Views Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.analytics.page_views_over_time')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => value.slice(5)}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pageViews" 
                      name={t('admin.analytics.page_views')}
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniqueSessions" 
                      name={t('admin.analytics.sessions')}
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voucher Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.analytics.voucher_funnel')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={voucherFunnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="stage" type="category" width={80} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {voucherFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.analytics.top_pages')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="page" className="text-xs" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.analytics.device_breakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="flex items-center gap-6">
                <div className="h-48 w-48 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceStats}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        {deviceStats.map((entry) => (
                          <Cell key={entry.device} fill={DEVICE_COLORS[entry.device] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {deviceStats.map((device) => {
                    const Icon = getDeviceIcon(device.device);
                    return (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: DEVICE_COLORS[device.device] || '#94a3b8' }}
                          />
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{t(`admin.analytics.device_${device.device}`)}</span>
                        </div>
                        <span className="font-medium">{device.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.analytics.top_events')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {eventStats.map((event) => (
                <Badge key={event.event} variant="secondary" className="text-sm py-1 px-3">
                  {event.event}: {event.count.toLocaleString()}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
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
  Activity,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Briefcase,
  FolderOpen,
  Sparkles,
  UserCheck,
  ClipboardList
} from 'lucide-react';

interface AdminOutletContext {
  selectedProjectId: string | null;
}

type KpiTileState = {
  loading: boolean;
  value: number | null;
  unavailable: boolean;
};

type CreditOverviewState = {
  loading: boolean;
  purchases: number | null;
  spend: number | null;
  balance: number | null;
  unavailable: boolean;
};

type CreditTx30dState = {
  loading: boolean;
  value: number | null;
  unavailable: boolean;
};

interface Project {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Káli-medence Közösség', slug: 'kali-medence', is_active: true },
  { id: 'proj-2', name: 'Balaton-felvidék Projekt', slug: 'balaton-felvidek', is_active: true },
  { id: 'proj-3', name: 'Demo Projekt', slug: 'demo', is_active: false },
];

const AdminDashboardNew = () => {
  const { t, language } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  const adminBasePath = '/admin';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [platformOverview, setPlatformOverview] = useState<Record<string, KpiTileState>>({
    totalUsers: { loading: true, value: null, unavailable: false },
    creators: { loading: true, value: null, unavailable: false },
    sponsors: { loading: true, value: null, unavailable: false },
    activeProjects: { loading: true, value: null, unavailable: false },
    activePrograms: { loading: true, value: null, unavailable: false },
    activeSponsoredPrograms: { loading: true, value: null, unavailable: false },
  });

  const [creditOverview, setCreditOverview] = useState<CreditOverviewState>({
    loading: true,
    purchases: null,
    spend: null,
    balance: null,
    unavailable: false,
  });

  const [creditTx30d, setCreditTx30d] = useState<CreditTx30dState>({
    loading: true,
    value: null,
    unavailable: false,
  });

  const purchasedTypes = useMemo(() => ['purchase', 'subscription', 'initial', 'rollover', 'bonus'], []);
  const spentTypes = useMemo(() => ['deduction', 'sponsorship', 'usage', 'spend'], []);

  const setKpiLoading = () => {
    setPlatformOverview({
      totalUsers: { loading: true, value: null, unavailable: false },
      creators: { loading: true, value: null, unavailable: false },
      sponsors: { loading: true, value: null, unavailable: false },
      activeProjects: { loading: true, value: null, unavailable: false },
      activePrograms: { loading: true, value: null, unavailable: false },
      activeSponsoredPrograms: { loading: true, value: null, unavailable: false },
    });
    setCreditOverview({
      loading: true,
      purchases: null,
      spend: null,
      balance: null,
      unavailable: false,
    });
    setCreditTx30d({
      loading: true,
      value: null,
      unavailable: false,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setKpiLoading();
    
    try {
      if (isDemoMode) {
        setProjects(MOCK_PROJECTS);
        setPlatformOverview({
          totalUsers: { loading: false, value: 156, unavailable: false },
          creators: { loading: false, value: 24, unavailable: false },
          sponsors: { loading: false, value: 8, unavailable: false },
          activeProjects: { loading: false, value: 2, unavailable: false },
          activePrograms: { loading: false, value: 45, unavailable: false },
          activeSponsoredPrograms: { loading: false, value: 12, unavailable: false },
        });
        setCreditOverview({
          loading: false,
          purchases: 1500000,
          spend: 750000,
          balance: 750000,
          unavailable: false,
        });
        setCreditTx30d({ loading: false, value: 38, unavailable: false });
        setLoading(false);
        return;
      }

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, slug, is_active')
        .order('name');
      
      setProjects(projectsData || []);

      // Read-only KPI tiles (isolated queries, must never crash)
      const safeCount = async (table: string, build: (q: any) => any) => {
        let q = supabase.from(table).select('*', { count: 'exact', head: true });
        // Apply project filter where applicable
        if (selectedProjectId) {
          if (table === 'profiles') q = q.eq('project_id', selectedProjectId);
          else if (table === 'expert_contents') q = q.eq('region_id', selectedProjectId);
          else if (table === 'events') q = q.eq('project_id', selectedProjectId);
        }
        const res = await build(q);
        if (res.error) throw res.error;
        return res.count || 0;
      };

      const loadCreditTx30d = async () => {
        try {
          const value = await safeCount('credit_transactions', (q) =>
            q.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          );
          setCreditTx30d({ loading: false, value, unavailable: false });
        } catch (e: any) {
          // KPI fetch failed
          setCreditTx30d({ loading: false, value: null, unavailable: true });
        }
      };

      const loadKpiTile = async (key: keyof typeof platformOverview, fn: () => Promise<number>) => {
        try {
          const value = await fn();
          setPlatformOverview((prev) => ({
            ...prev,
            [key]: { loading: false, value, unavailable: false },
          }));
        } catch (e) {
          // KPI fetch failed
          setPlatformOverview((prev) => ({
            ...prev,
            [key]: { loading: false, value: null, unavailable: true },
          }));
        }
      };

      const loadCreditOverview = async () => {
        try {
          const { data, error } = await supabase.from('credit_transactions').select('credits, transaction_type');
          if (error) throw error;
          const rows = (data || []) as { credits: number; transaction_type: string }[];
          const purchases = rows
            .filter((r) => purchasedTypes.includes(r.transaction_type))
            .reduce((sum, r) => sum + (r.credits || 0), 0);
          const spend = Math.abs(
            rows
              .filter((r) => spentTypes.includes(r.transaction_type))
              .reduce((sum, r) => sum + (r.credits || 0), 0)
          );
          const balance = Math.max(0, purchases - spend);
          setCreditOverview({ loading: false, purchases, spend, balance, unavailable: false });
        } catch (e: any) {
          // KPI fetch failed
          setCreditOverview({ loading: false, purchases: null, spend: null, balance: null, unavailable: true });
        }
      };

      await Promise.all([
        loadKpiTile('totalUsers', () => safeCount('profiles', (q) => q)),
        loadKpiTile('creators', () => safeCount('profiles', (q) => q.eq('user_role', 'creator'))),
        loadKpiTile('sponsors', () => safeCount('sponsors', (q) => q)),
        loadKpiTile('activeProjects', () => safeCount('projects', (q) => q.eq('is_active', true))),
        loadKpiTile('activePrograms', () => safeCount('expert_contents', (q) => q.eq('is_published', true))),
        loadKpiTile('activeSponsoredPrograms', () => safeCount('content_sponsorships', (q) => q.eq('is_active', true))),
        loadCreditOverview(),
        loadCreditTx30d(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode, selectedProjectId]);

  const KpiTile = ({
    label,
    state,
  }: {
    label: string;
    state: KpiTileState;
  }) => {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">
          {state.loading ? (
            <Skeleton className="h-7 w-16" />
          ) : state.unavailable ? (
            <span className="text-sm text-muted-foreground">{t('common.no_data')}</span>
          ) : (
            state.value ?? 0
          )}
        </div>
      </div>
    );
  };

  const CreditTile = ({
    label,
    value,
    loading: isLoading,
    unavailable,
  }: {
    label: string;
    value: number | null;
    loading: boolean;
    unavailable: boolean;
  }) => (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : unavailable ? (
          <span className="text-sm text-muted-foreground">{t('common.no_data')}</span>
        ) : (
          value ?? 0
        )}
      </div>
    </div>
  );

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
          {selectedProjectId && (
            <Badge variant="outline" className="text-sm border-emerald-500 text-emerald-700">
              <FolderOpen className="h-3 w-3 mr-1" />
              {projects.find(p => p.id === selectedProjectId)?.name || 'Szűrt projekt'}
            </Badge>
          )}
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

      {/* Platform áttekintés (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('admin.dashboard.platform_overview.title')}</CardTitle>
          <CardDescription>{t('admin.dashboard.platform_overview.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.users')} state={platformOverview.totalUsers} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.creators')} state={platformOverview.creators} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.sponsors')} state={platformOverview.sponsors} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.active_projects')} state={platformOverview.activeProjects} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.published_programs')} state={platformOverview.activePrograms} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.sponsored_programs')} state={platformOverview.activeSponsoredPrograms} />
            <KpiTile label={t('admin.dashboard.platform_overview.kpis.credit_transactions_30d')} state={creditTx30d} />
            <CreditTile
              label={t('admin.dashboard.platform_overview.kpis.credit_purchases_total')}
              value={creditOverview.purchases}
              loading={creditOverview.loading}
              unavailable={creditOverview.unavailable}
            />
            <CreditTile
              label={t('admin.dashboard.platform_overview.kpis.credit_spend_total')}
              value={creditOverview.spend}
              loading={creditOverview.loading}
              unavailable={creditOverview.unavailable}
            />
            <CreditTile
              label={t('admin.dashboard.platform_overview.kpis.credit_balance_platform')}
              value={creditOverview.balance}
              loading={creditOverview.loading}
              unavailable={creditOverview.unavailable}
            />
          </div>
        </CardContent>
      </Card>

      {/* Riasztások / kockázatok (MVP: empty state) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.dashboard.alerts.title')}</CardTitle>
          <CardDescription>{t('admin.dashboard.alerts.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t('admin.dashboard.alerts.empty')}</div>
        </CardContent>
      </Card>

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
              onClick={() => navigate(`${adminBasePath}/projects`)}
            >
              <FolderOpen className="h-5 w-5 text-emerald-600" />
              <span>{t('admin.actions.manage_projects')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate(`${adminBasePath}/users?role=creator`)}
            >
              <UserCheck className="h-5 w-5 text-indigo-600" />
              <span>{t('admin.actions.verify_experts')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate(`${adminBasePath}/programs`)}
            >
              <ClipboardList className="h-5 w-5 text-purple-600" />
              <span>{t('admin.actions.review_programs')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate(`${adminBasePath}/sponsors`)}
            >
              <Briefcase className="h-5 w-5 text-amber-600" />
              <span>{t('admin.actions.manage_sponsors')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-4"
              onClick={() => navigate(`${adminBasePath}/analytics`)}
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
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TrendingUp,
  Users,
  Sparkles,
  CreditCard,
  FileText,
  Leaf,
  Target,
  MapPin,
  DollarSign,
  Percent,
  Clock,
  Lock,
  RefreshCw,
  Download,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

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

interface RegionData {
  village: string;
  count: number;
}

interface FinancialOverviewProps {
  onNavigate?: (tab: string) => void;
}

const FinancialOverview = ({ onNavigate }: FinancialOverviewProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [programParticipants, setProgramParticipants] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Fetch stats using React Query
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
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

  // Load additional data
  useEffect(() => {
    const loadExtraData = async () => {
      // Get regional distribution
      const { data: events } = await supabase
        .from('events')
        .select('village')
        .not('village', 'is', null);

      if (events) {
        const villageCount: Record<string, number> = {};
        events.forEach(event => {
          if (event.village) {
            villageCount[event.village] = (villageCount[event.village] || 0) + 1;
          }
        });
        const regionArray = Object.entries(villageCount)
          .map(([village, count]) => ({ village, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setRegionData(regionArray);
      }

      // Get total program participants
      const { count } = await supabase
        .from('challenge_completions')
        .select('*', { count: 'exact', head: true })
        .eq('validation_status', 'approved');

      setProgramParticipants(count || 0);
    };

    loadExtraData();
  }, []);

  const handleManualRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#FFD700]" />
            {t('admin.financial_overview') || 'Pénzügyi Áttekintés'}
          </h2>
          <p className="text-muted-foreground">
            Platform statisztikák és pénzügyi áttekintés
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {t('admin.last_updated') || 'Utoljára frissítve'}: {secondsAgo} {t('admin.seconds_ago') || 'másodperce'}
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

      {/* Creator Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFD700]/20">
                <Sparkles className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.total_creators') || 'Összes Kreátor'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.verified_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.verified_experts') || 'Hitelesített Szakértők'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.active_creators') || 'Aktív Kreátorok'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFD700]/20">
                <CreditCard className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.stripe_connected || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stripe_connected') || 'Stripe Összekapcsolva'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.published_content || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.published_content') || 'Közzétett Tartalmak'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors ${(stats?.pending_content || 0) > 0 ? 'border-orange-500/50' : ''}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${(stats?.pending_content || 0) > 0 ? 'bg-orange-500/20' : 'bg-amber-500/20'}`}>
                <Clock className={`h-5 w-5 ${(stats?.pending_content || 0) > 0 ? 'text-orange-400' : 'text-amber-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${(stats?.pending_content || 0) > 0 ? 'text-orange-400' : ''}`}>
                  {stats?.pending_content || 0}
                </p>
                <p className="text-sm text-muted-foreground">{t('admin.pending_approval') || 'Jóváhagyásra Vár'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_programs || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.active_programs') || 'Aktív Programok'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50 hover:bg-[#112240]/80 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_events || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.total_events') || 'Események'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Placeholder Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border-dashed border-[#FFD700]/30 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#FFD700]">
              <DollarSign className="h-5 w-5" />
              {t('admin.total_sales') || 'Összes Értékesítés'}
              <Lock className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-muted-foreground">-</p>
              <Badge variant="outline" className="mt-2 border-[#FFD700]/30 text-[#FFD700]">
                {t('admin.coming_soon') || 'Hamarosan'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tranzakció követés hamarosan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Percent className="h-5 w-5" />
              {t('admin.platform_commission') || 'Platform Jutalék'}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-auto text-xs text-muted-foreground cursor-help">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>15% platform jutalék minden értékesítésből</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold">15%</p>
              <p className="text-sm text-muted-foreground mt-1">Alapértelmezett</p>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Platform jutalék minden értékesítésből
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-dashed border-cyan-500/30 opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Clock className="h-5 w-5" />
              {t('admin.pending_payouts') || 'Kifizetésre Vár'}
              <Lock className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-muted-foreground">-</p>
              <Badge variant="outline" className="mt-2 border-cyan-500/30 text-cyan-400">
                {t('admin.coming_soon') || 'Hamarosan'}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Stripe/Wise</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="gap-2 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
          onClick={() => onNavigate?.('creators')}
        >
          <Sparkles className="h-4 w-4 text-[#FFD700]" />
          Kreátorok Kezelése
        </Button>
        <Button
          variant="outline"
          className="gap-2 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10"
          onClick={() => onNavigate?.('content-moderation')}
        >
          <FileText className="h-4 w-4 text-amber-400" />
          Tartalom Moderáció
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  className="gap-2 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Download className="h-4 w-4" />
                  {t('admin.export_csv') || 'Exportálás (CSV)'}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('admin.coming_soon') || 'Hamarosan'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Ecosystem Health Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#112240] border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FFD700]" />
              Hitelesített Szakértők Aránya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hitelesített / Összes</span>
                <span className="font-semibold text-[#FFD700]">
                  {stats?.verified_creators || 0} / {stats?.total_creators || 0}
                </span>
              </div>
              <div className="h-3 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD700] to-amber-400 transition-all duration-500"
                  style={{
                    width: `${stats?.total_creators ? ((stats.verified_creators || 0) / stats.total_creators) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_creators ? Math.round(((stats.verified_creators || 0) / stats.total_creators) * 100) : 0}% hitelesítve
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-cyan-400" />
              Stripe Összekapcsolási Arány
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stripe aktív / Összes kreátor</span>
                <span className="font-semibold text-cyan-400">
                  {stats?.stripe_connected || 0} / {stats?.total_creators || 0}
                </span>
              </div>
              <div className="h-3 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500"
                  style={{
                    width: `${stats?.total_creators ? ((stats.stripe_connected || 0) / stats.total_creators) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_creators ? Math.round(((stats.stripe_connected || 0) / stats.total_creators) * 100) : 0}% összekapcsolva
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Impact & Regional Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-[#112240] border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-400" />
              Közösségi Hatás
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="font-semibold">Carbon Handprint</p>
                  <p className="text-sm text-muted-foreground">Összesített pozitív hatás</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {Math.round(stats?.total_carbon_handprint || 0)} kg
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-semibold">Program Teljesítések</p>
                  <p className="text-sm text-muted-foreground">Jóváhagyott befejezések</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {programParticipants}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Regionális Eloszlás
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regionData.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nincs elegendő adat
              </p>
            ) : (
              <div className="space-y-3">
                {regionData.map((region, index) => (
                  <div key={region.village} className="flex items-center gap-3">
                    <div className="w-6 text-center">
                      <Badge
                        variant="outline"
                        className={
                          index === 0
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'text-muted-foreground'
                        }
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{region.village}</span>
                        <span className="text-sm text-muted-foreground">
                          {region.count} esemény
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{
                            width: `${(region.count / (regionData[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;

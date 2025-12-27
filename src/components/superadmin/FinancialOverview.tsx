import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';

interface PlatformStats {
  total_users: number;
  total_creators: number;
  verified_creators: number;
  active_creators: number;
  pending_content_count: number;
  stripe_connected_count: number;
  total_carbon_handprint: number;
}

interface RegionData {
  village: string;
  count: number;
}

const FinancialOverview = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [programParticipants, setProgramParticipants] = useState(0);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get platform stats via RPC
      const { data: platformStats, error: statsError } = await supabase
        .rpc('get_admin_platform_stats');

      if (statsError) {
        console.error('Error loading platform stats:', statsError);
      } else if (platformStats) {
        setStats(platformStats as unknown as PlatformStats);
      }

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
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32" />
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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-500" />
          {t('admin.financial_overview')}
        </h2>
        <p className="text-muted-foreground">
          Platform statisztikák és pénzügyi áttekintés
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-[#112240] border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.total_creators')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.verified_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.verified_experts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_creators || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.active_creators')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pending_content_count || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.pending_content')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <CreditCard className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.stripe_connected_count || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stripe_connected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <DollarSign className="h-5 w-5" />
              {t('admin.total_sales')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-muted-foreground">-</p>
              <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-400">
                {t('admin.coming_soon')}
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
              {t('admin.platform_commission')}
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

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Clock className="h-5 w-5" />
              {t('admin.pending_payouts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-muted-foreground">-</p>
              <Badge variant="outline" className="mt-2 border-cyan-500/30 text-cyan-400">
                {t('admin.coming_soon')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Stripe/Wise kifizetések követése
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Community Impact Row */}
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

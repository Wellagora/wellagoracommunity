import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Ticket, 
  Users, 
  TrendingUp, 
  Eye, 
  Gift, 
  Plus,
  ArrowRight,
  Download,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Campaign {
  id: string;
  is_active: boolean;
  total_licenses: number;
  used_licenses: number;
  content: {
    id: string;
    title: string;
    image_url: string | null;
    thumbnail_url: string | null;
    creator: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface Stats {
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  utilizationRate: number;
  redemptionRate: number;
  impressions: number;
  activeCampaigns: number;
}

// Mock traffic data for demo
const generateTrafficData = () => {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('hu-HU', { weekday: 'short' }),
      redemptions: Math.floor(Math.random() * 15 + 2),
      views: Math.floor(Math.random() * 50 + 10),
    });
  }
  return data;
};

const SponsorDashboardView = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trafficData] = useState(generateTrafficData());

  useEffect(() => {
    const loadSponsorData = async () => {
      if (!user) return;

      try {
        // Fetch sponsorships for this user/organization
        const { data: sponsorships, error } = await supabase
          .from('content_sponsorships')
          .select(`
            id, is_active, total_licenses, used_licenses,
            content:expert_contents(
              id, title, image_url, thumbnail_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error loading sponsorships:', error);
        } else if (sponsorships) {
          // Transform the data to match our interface
          const transformedData: Campaign[] = sponsorships.map((s: any) => ({
            id: s.id,
            is_active: s.is_active,
            total_licenses: s.total_licenses || 0,
            used_licenses: s.used_licenses || 0,
            content: s.content ? {
              id: s.content.id,
              title: s.content.title,
              image_url: s.content.image_url,
              thumbnail_url: s.content.thumbnail_url,
              creator: null
            } : null
          }));
          setCampaigns(transformedData);
          calculateStats(transformedData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSponsorData();
  }, [user, profile?.email]);

  const calculateStats = (data: Campaign[]) => {
    const totalLicenses = data.reduce((sum, c) => sum + (c.total_licenses || 0), 0);
    const usedLicenses = data.reduce((sum, c) => sum + (c.used_licenses || 0), 0);
    const activeCampaigns = data.filter(c => c.is_active).length;
    
    setStats({
      totalLicenses,
      usedLicenses,
      availableLicenses: totalLicenses - usedLicenses,
      utilizationRate: totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0,
      redemptionRate: Math.floor(Math.random() * 30 + 60), // Demo data
      impressions: Math.floor(Math.random() * 500 + 200), // Demo data
      activeCampaigns,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('sponsor_dashboard.title') || 'Támogatói Központ'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.organization || profile?.first_name} - {t('sponsor_dashboard.overview') || 'Áttekintés'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button 
            onClick={() => navigate('/piacer')}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('control_panel.new_sponsorship') || 'Új támogatás indítása'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Licenses */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('sponsor_dashboard.total_licenses') || 'Összes Licenc'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalLicenses || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.usedLicenses || 0} {t('sponsor_dashboard.used') || 'felhasználva'} ({stats?.utilizationRate || 0}%)
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Ticket className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('sponsor_dashboard.active_users') || 'Aktív Felhasználók'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.usedLicenses || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Rate */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('sponsor_dashboard.redemption_rate') || 'Beváltási Arány'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.redemptionRate || 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Reach */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('sponsor_dashboard.community_reach') || 'Közösségi Elérés'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.impressions || 0}+
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {t('sponsor_dashboard.campaigns') || 'Aktív Kampányok'}
            </CardTitle>
            <Badge variant="secondary">{stats?.activeCampaigns || 0} aktív</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  {t('control_panel.no_sponsorships_hint') || 'Még nincs szponzorációd'}
                </p>
                <Button onClick={() => navigate('/piacer')}>
                  {t('control_panel.start_sponsoring') || 'Támogatás indítása'}
                </Button>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const progress = campaign.total_licenses > 0 
                  ? (campaign.used_licenses / campaign.total_licenses) * 100 
                  : 0;
                
                return (
                  <div 
                    key={campaign.id} 
                    className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={campaign.content?.thumbnail_url || campaign.content?.image_url || '/placeholder.svg'} 
                            alt={campaign.content?.title || ''} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {campaign.content?.title || 'Ismeretlen tartalom'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.content?.creator?.first_name} {campaign.content?.creator?.last_name}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={campaign.is_active ? "default" : "secondary"}
                        className={campaign.is_active ? "bg-green-600" : ""}
                      >
                        {campaign.is_active ? 'Aktív' : 'Keret betelt'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t('control_panel.licenses_used') || 'Licenc felhasználás'}
                        </span>
                        <span className="font-medium">
                          {campaign.used_licenses} / {campaign.total_licenses}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })
            )}
            
            {campaigns.length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2"
                onClick={() => navigate('/piacer')}
              >
                {t('control_panel.new_sponsorship') || 'Új támogatás indítása'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('sponsor_dashboard.foot_traffic') || 'Voucher Forgalom (elmúlt 7 nap)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorRedemptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--cyan))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--cyan))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="redemptions" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRedemptions)" 
                    name="Beváltások"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--cyan))" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                    name="Megtekintések"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorDashboardView;

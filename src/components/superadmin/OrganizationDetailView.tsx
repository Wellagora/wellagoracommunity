import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ExternalLink,
  CreditCard,
  Coins,
  FileText,
  Users,
  Building2,
  Calendar
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationDetailViewProps {
  organizationId: string;
  onBack: () => void;
}

interface OrganizationData {
  id: string;
  name: string;
  type: 'business' | 'citizen' | 'government' | 'ngo';
  location: string | null;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  employee_count: number | null;
  created_at: string;
  is_public: boolean;
}

interface KPIData {
  subscription: { plan: string; status: string } | null;
  totalCredits: number;
  invoiceCount: number;
  memberCount: number;
}

const OrganizationDetailView = ({ organizationId, onBack }: OrganizationDetailViewProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [kpis, setKpis] = useState<KPIData>({
    subscription: null,
    totalCredits: 0,
    invoiceCount: 0,
    memberCount: 0
  });

  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);

  const loadOrganizationData = async () => {
    setLoading(true);
    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch member count
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch invoice count
      const { count: invoiceCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch total credits from all organization members
      const { data: memberIds } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', organizationId);

      let totalCredits = 0;
      if (memberIds && memberIds.length > 0) {
        const { data: creditsData } = await supabase
          .from('sponsor_credits')
          .select('available_credits')
          .in('sponsor_user_id', memberIds.map(m => m.id));

        totalCredits = creditsData?.reduce((sum, c) => sum + (c.available_credits || 0), 0) || 0;
      }

      setKpis({
        subscription: subData ? { plan: subData.plan_type, status: subData.status || 'active' } : null,
        totalCredits,
        invoiceCount: invoiceCount || 0,
        memberCount: memberCount || 0
      });

    } catch (error: any) {
      toast({
        title: 'Hiba',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      business: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      government: 'bg-green-500/10 text-green-500 border-green-500/20',
      ngo: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      citizen: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return colors[type as keyof typeof colors] || colors.citizen;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      expired: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Szervezet nem található</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Vissza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Vissza a listához
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {organization.logo_url ? (
              <img 
                src={organization.logo_url} 
                alt={organization.name}
                className="w-24 h-24 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{organization.name}</h1>
                <Badge className={getTypeBadgeColor(organization.type)}>
                  {organization.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                {organization.location && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {organization.location}
                  </div>
                )}
                {organization.website_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={organization.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Weboldal
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Regisztráció: {new Date(organization.created_at).toLocaleDateString('hu-HU')}
                </div>
                {organization.employee_count && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {organization.employee_count} munkatárs
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Előfizetés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.subscription ? (
              <div>
                <p className="text-2xl font-bold">{kpis.subscription.plan}</p>
                <Badge className={getStatusBadgeColor(kpis.subscription.status)} variant="outline">
                  {kpis.subscription.status}
                </Badge>
              </div>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">Nincs</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              Kreditek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.totalCredits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Elérhető kredit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Számlák
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.invoiceCount}</p>
            <p className="text-xs text-muted-foreground">Összes számla</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Tagok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.memberCount}</p>
            <p className="text-xs text-muted-foreground">Regisztrált tag</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Áttekintés</TabsTrigger>
              <TabsTrigger value="subscription">Előfizetés</TabsTrigger>
              <TabsTrigger value="invoices">Számlák</TabsTrigger>
              <TabsTrigger value="members">Tagok</TabsTrigger>
              <TabsTrigger value="sponsorships">Szponzorálások</TabsTrigger>
              <TabsTrigger value="activity">Aktivitás</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Organization Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Leírás</h3>
                {organization.description ? (
                  <p className="text-muted-foreground leading-relaxed">{organization.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Nincs leírás megadva</p>
                )}
              </div>

              {/* Basic Stats Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Statisztikák</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Tagok</p>
                    <p className="text-2xl font-bold">{kpis.memberCount}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Számlák</p>
                    <p className="text-2xl font-bold">{kpis.invoiceCount}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Kreditek</p>
                    <p className="text-2xl font-bold">{kpis.totalCredits}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Láthatóság</p>
                    <p className="text-2xl font-bold">{organization.is_public ? 'Nyilvános' : 'Privát'}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Legutóbbi aktivitás</h3>
                <div className="border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Az aktivitási napló hamarosan elérhető lesz</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Előfizetés kezelés hamarosan</p>
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Számlák kezelés hamarosan</p>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Tagok kezelés hamarosan</p>
              </div>
            </TabsContent>

            <TabsContent value="sponsorships" className="mt-6">
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Szponzorálások hamarosan</p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Aktivitási napló hamarosan</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDetailView;

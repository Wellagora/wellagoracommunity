import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Calendar,
  Plus,
  RefreshCw,
  Eye
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

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  price_paid: number | null;
  auto_renew: boolean | null;
  currency: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;
  avatar_url: string | null;
  created_at: string;
}

interface Sponsorship {
  id: string;
  challenge_id: string;
  challenge_title?: string;
  package_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  credit_cost: number | null;
  region: string;
}

interface ActivityItem {
  id: string;
  type: 'credit' | 'invoice' | 'sponsorship' | 'subscription';
  description: string;
  timestamp: string;
  icon: string;
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

  // Tab-specific data
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

  // Dialog states
  const [createSubDialogOpen, setCreateSubDialogOpen] = useState(false);
  const [editSubDialogOpen, setEditSubDialogOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    plan_type: '',
    price_paid: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    currency: 'HUF'
  });

  useEffect(() => {
    loadOrganizationData();
    loadSubscriptionPlans();
  }, [organizationId]);

  const loadSubscriptionPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (data) setSubscriptionPlans(data);
  };

  const loadSubscriptionData = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription(data);
  };

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    setInvoices(data || []);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, user_role, avatar_url, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    setMembers(data || []);
  };

  const loadSponsorships = async () => {
    const { data: sponsorshipsData } = await supabase
      .from('challenge_sponsorships')
      .select('*')
      .eq('sponsor_organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (sponsorshipsData) {
      // Fetch challenge titles
      const challengeIds = sponsorshipsData.map(s => s.challenge_id);
      const { data: challengesData } = await supabase
        .from('challenge_definitions')
        .select('id, title')
        .in('id', challengeIds);

      const challengeMap = new Map(challengesData?.map(c => [c.id, c.title]) || []);

      const enrichedSponsorships = sponsorshipsData.map(s => ({
        ...s,
        challenge_title: challengeMap.get(s.challenge_id) || 'Ismeretlen program'
      }));

      setSponsorships(enrichedSponsorships);
    }
  };

  const loadActivities = async () => {
    const allActivities: ActivityItem[] = [];

    // Get member IDs
    const { data: memberIds } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId);

    const userIds = memberIds?.map(m => m.id) || [];

    // Credit transactions
    if (userIds.length > 0) {
      const { data: credits } = await supabase
        .from('credit_transactions')
        .select('*')
        .in('sponsor_user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(10);

      credits?.forEach(c => {
        allActivities.push({
          id: c.id,
          type: 'credit',
          description: `Kredit tranzakció: ${c.credits > 0 ? '+' : ''}${c.credits} kredit - ${c.description || c.transaction_type}`,
          timestamp: c.created_at,
          icon: 'coins'
        });
      });
    }

    // Invoices
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    invoicesData?.forEach(inv => {
      allActivities.push({
        id: inv.id,
        type: 'invoice',
        description: inv.paid_at 
          ? `Számla kifizetve: ${inv.invoice_number} - ${inv.amount.toLocaleString()} HUF`
          : `Számla létrehozva: ${inv.invoice_number} - ${inv.amount.toLocaleString()} HUF`,
        timestamp: inv.paid_at || inv.created_at,
        icon: 'receipt'
      });
    });

    // Sponsorships
    const { data: sponsorshipsData } = await supabase
      .from('challenge_sponsorships')
      .select('*, challenge_definitions(title)')
      .eq('sponsor_organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    sponsorshipsData?.forEach(s => {
      allActivities.push({
        id: s.id,
        type: 'sponsorship',
        description: `Program szponzorálás: ${(s as any).challenge_definitions?.title || 'Ismeretlen'} - ${s.package_type}`,
        timestamp: s.created_at || s.start_date,
        icon: 'heart'
      });
    });

    // Subscriptions
    const { data: subscriptionsData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5);

    subscriptionsData?.forEach(sub => {
      allActivities.push({
        id: sub.id,
        type: 'subscription',
        description: `Előfizetés: ${sub.plan_type} - ${sub.status}`,
        timestamp: sub.created_at,
        icon: 'credit-card'
      });
    });

    // Sort all activities by timestamp
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 20
    setActivities(allActivities.slice(0, 20));
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} perce`;
    if (diffHours < 24) return `${diffHours} órája`;
    if (diffDays < 7) return `${diffDays} napja`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hete`;
    return `${Math.floor(diffDays / 30)} hónapja`;
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'coins': return Coins;
      case 'receipt': return FileText;
      case 'heart': return CreditCard;
      case 'credit-card': return CreditCard;
      default: return Calendar;
    }
  };

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
      expired: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      paid: 'bg-green-500/10 text-green-500 border-green-500/20',
      overdue: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const handleCreateSubscription = async () => {
    try {
      const { error } = await supabase.from('subscriptions').insert({
        organization_id: organizationId,
        plan_type: subForm.plan_type,
        price_paid: parseFloat(subForm.price_paid),
        start_date: subForm.start_date,
        end_date: subForm.end_date,
        status: subForm.status,
        currency: subForm.currency
      });

      if (error) throw error;

      toast({ title: 'Sikeres', description: 'Előfizetés létrehozva' });
      setCreateSubDialogOpen(false);
      loadOrganizationData();
      loadSubscriptionData();
    } catch (error: any) {
      toast({ title: 'Hiba', description: error.message, variant: 'destructive' });
    }
  };

  const handleExtendSubscription = async () => {
    if (!subscription) return;
    try {
      const currentEndDate = new Date(subscription.end_date || Date.now());
      const newEndDate = new Date(currentEndDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .update({ end_date: newEndDate.toISOString().split('T')[0] })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({ title: 'Sikeres', description: 'Előfizetés meghosszabbítva 1 évvel' });
      loadSubscriptionData();
    } catch (error: any) {
      toast({ title: 'Hiba', description: error.message, variant: 'destructive' });
    }
  };

  const calculateDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="border rounded-lg bg-card p-6">
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
      </div>

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
      <div className="border rounded-lg bg-card p-6">
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

            <TabsContent value="subscription" className="mt-6" onFocus={loadSubscriptionData}>
              {subscription ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Előfizetés részletei</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExtendSubscription}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Hosszabbítás
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditSubDialogOpen(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Szerkesztés
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-muted-foreground">Csomag típus</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-lg font-semibold">{subscription.plan_type}</p>
                          <Badge className={getStatusBadgeColor(subscription.status)} variant="outline">
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Ár</Label>
                        <p className="text-lg font-semibold mt-1">
                          {subscription.price_paid?.toLocaleString()} {subscription.currency || 'HUF'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Kezdés dátuma</Label>
                        <p className="text-lg font-semibold mt-1">
                          {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('hu-HU') : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Lejárat dátuma</Label>
                        <p className="text-lg font-semibold mt-1">
                          {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('hu-HU') : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Automatikus megújítás</Label>
                        <p className="text-lg font-semibold mt-1">
                          {subscription.auto_renew ? 'Igen' : 'Nem'}
                        </p>
                      </div>
                      {subscription.end_date && (
                        <div>
                          <Label className="text-muted-foreground">Hátralévő napok</Label>
                          <p className="text-lg font-semibold mt-1">
                            {calculateDaysRemaining(subscription.end_date)} nap
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg p-12 text-center space-y-4">
                  <p className="text-muted-foreground text-lg">Nincs aktív előfizetés</p>
                  <Button onClick={() => setCreateSubDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Előfizetés létrehozása
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-6" onFocus={loadInvoices}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Számlák ({invoices.length})</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Új számla
                  </Button>
                </div>

                {invoices.length === 0 ? (
                  <div className="border rounded-lg p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nincsenek számlák</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Számla szám</TableHead>
                          <TableHead>Típus</TableHead>
                          <TableHead>Összeg</TableHead>
                          <TableHead>Státusz</TableHead>
                          <TableHead>Dátum</TableHead>
                          <TableHead>Fizetve</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.type}</TableCell>
                            <TableCell>{invoice.amount.toLocaleString()} HUF</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(invoice.status)} variant="outline">
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(invoice.created_at).toLocaleDateString('hu-HU')}</TableCell>
                            <TableCell>
                              {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('hu-HU') : '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6" onFocus={loadMembers}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Tagok ({members.length})</h3>
                </div>

                {members.length === 0 ? (
                  <div className="border rounded-lg p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nincsenek tagok</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback>
                                {member.first_name[0]}{member.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getTypeBadgeColor(member.user_role)} variant="outline">
                                {member.user_role}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Csatlakozott: {new Date(member.created_at).toLocaleDateString('hu-HU')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sponsorships" className="mt-6" onFocus={loadSponsorships}>
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Aktív szponzorálások</p>
                          <p className="text-2xl font-bold">
                            {sponsorships.filter(s => s.status === 'active').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Összes költött kredit</p>
                          <p className="text-2xl font-bold">
                            {sponsorships.reduce((sum, s) => sum + (s.credit_cost || 0), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Szponzorálások ({sponsorships.length})</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Új szponzorálás
                  </Button>
                </div>

                {sponsorships.length === 0 ? (
                  <div className="border rounded-lg p-12 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Még nincs szponzorált program</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program neve</TableHead>
                          <TableHead>Csomag típus</TableHead>
                          <TableHead>Státusz</TableHead>
                          <TableHead>Kezdés</TableHead>
                          <TableHead>Lejárat</TableHead>
                          <TableHead>Kredit költség</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sponsorships.map((sponsorship) => (
                          <TableRow key={sponsorship.id}>
                            <TableCell className="font-medium">{sponsorship.challenge_title}</TableCell>
                            <TableCell>{sponsorship.package_type}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  sponsorship.status === 'active' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : sponsorship.status === 'cancelled'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }
                                variant="outline"
                              >
                                {sponsorship.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(sponsorship.start_date).toLocaleDateString('hu-HU')}</TableCell>
                            <TableCell>
                              {sponsorship.end_date ? new Date(sponsorship.end_date).toLocaleDateString('hu-HU') : '-'}
                            </TableCell>
                            <TableCell>{sponsorship.credit_cost?.toLocaleString() || '-'} kredit</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6" onFocus={loadActivities}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Aktivitási napló</h3>

                {activities.length === 0 ? (
                  <div className="border rounded-lg p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Még nincs aktivitás</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.icon);
                      return (
                        <Card key={activity.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.description}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
        </Tabs>
      </div>

      {/* Create Subscription Dialog */}
      <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Új előfizetés létrehozása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Csomag típus</Label>
              <Select value={subForm.plan_type} onValueChange={(v) => setSubForm({ ...subForm, plan_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz csomagot" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.plan_key}>
                      {plan.name} ({plan.price_huf.toLocaleString()} HUF)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ár</Label>
              <Input
                type="number"
                value={subForm.price_paid}
                onChange={(e) => setSubForm({ ...subForm, price_paid: e.target.value })}
                placeholder="Összeg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kezdés dátuma</Label>
                <Input
                  type="date"
                  value={subForm.start_date}
                  onChange={(e) => setSubForm({ ...subForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Lejárat dátuma</Label>
                <Input
                  type="date"
                  value={subForm.end_date}
                  onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Státusz</Label>
              <Select value={subForm.status} onValueChange={(v) => setSubForm({ ...subForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktív</SelectItem>
                  <SelectItem value="pending">Függőben</SelectItem>
                  <SelectItem value="cancelled">Törölve</SelectItem>
                  <SelectItem value="expired">Lejárt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSubDialogOpen(false)}>Mégse</Button>
            <Button onClick={handleCreateSubscription}>Létrehozás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDetailView;

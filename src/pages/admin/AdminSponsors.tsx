import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Building2,
  Search,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Sponsor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  company_name?: string | null;
  user_role: string;
  sponsor_status?: string;
  credit_balance?: number;
  created_at: string;
}

const MOCK_SPONSORS: Sponsor[] = [
  {
    id: 'sponsor-1',
    first_name: 'Magyar',
    last_name: 'Telekom',
    email: 'partner@telekom.hu',
    avatar_url: null,
    company_name: 'Magyar Telekom Nyrt.',
    user_role: 'business',
    sponsor_status: 'active',
    credit_balance: 5000,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'sponsor-2',
    first_name: 'Balaton',
    last_name: 'Önkormányzat',
    email: 'info@balaton.hu',
    avatar_url: null,
    company_name: 'Balatonfüred Önkormányzat',
    user_role: 'government',
    sponsor_status: 'active',
    credit_balance: 2500,
    created_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'sponsor-3',
    first_name: 'Zöld',
    last_name: 'Alapítvány',
    email: 'hello@zoldalap.hu',
    avatar_url: null,
    company_name: 'Zöld Jövő Alapítvány',
    user_role: 'ngo',
    sponsor_status: 'pending_payment',
    credit_balance: 0,
    created_at: '2024-06-01T10:00:00Z'
  },
];

const AdminSponsors = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setSponsors(MOCK_SPONSORS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_role', ['business', 'government', 'ngo'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error(t('admin.sponsors.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [isDemoMode]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />{t('admin.sponsors.status_active')}</Badge>;
      case 'pending_payment':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />{t('admin.sponsors.status_pending')}</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertTriangle className="h-3 w-3 mr-1" />{t('admin.sponsors.status_suspended')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'business':
        return <Badge variant="outline">{t('admin.sponsors.role_business')}</Badge>;
      case 'government':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">{t('admin.sponsors.role_government')}</Badge>;
      case 'ngo':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">{t('admin.sponsors.role_ngo')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredSponsors = sponsors.filter(s => {
    const matchesSearch = 
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.sponsor_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: sponsors.length,
    active: sponsors.filter(s => s.sponsor_status === 'active').length,
    pending_payment: sponsors.filter(s => s.sponsor_status === 'pending_payment').length,
    suspended: sponsors.filter(s => s.sponsor_status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-600" />
            {t('admin.sponsors.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.sponsors.subtitle')}
          </p>
        </div>
        <Button onClick={fetchSponsors} variant="outline" size="icon">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.sponsors.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">
              {t('admin.sponsors.filter_all')} ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              {t('admin.sponsors.filter_active')} ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="pending_payment">
              {t('admin.sponsors.filter_pending')} ({counts.pending_payment})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sponsors List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredSponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('admin.sponsors.no_sponsors')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSponsors.map((sponsor) => (
            <Card 
              key={sponsor.id}
              className={cn(
                "hover:shadow-md transition-shadow",
                sponsor.sponsor_status === 'pending_payment' && "ring-2 ring-amber-400"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sponsor.avatar_url || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700">
                      {sponsor.first_name[0]}{sponsor.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sponsor.company_name || `${sponsor.first_name} ${sponsor.last_name}`}</h3>
                      {getRoleBadge(sponsor.user_role)}
                      {getStatusBadge(sponsor.sponsor_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {sponsor.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {sponsor.credit_balance?.toLocaleString() || 0} {t('admin.sponsors.credits')}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('admin.sponsors.view_profile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t('admin.sponsors.manage_credits')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        {t('admin.sponsors.send_email')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSponsors;
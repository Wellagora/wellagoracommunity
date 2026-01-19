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
  name: string;
  email: string;
  avatar_url: string | null;
  description?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  credit_balance?: number;
  created_at: string;
  source: 'sponsors_table' | 'profiles_table';
}

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
    console.log('[AdminSponsors] Fetching sponsors from both tables...');
    try {
      // Query sponsors table (primary source)
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (sponsorsError) {
        console.error('[AdminSponsors] sponsors table error:', sponsorsError);
      }

      // Query profiles with sponsor roles (secondary source)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_role', ['sponsor', 'business', 'government', 'ngo'])
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('[AdminSponsors] profiles table error:', profilesError);
      }

      // Combine results from both sources
      const combinedSponsors: Sponsor[] = [];

      // Add sponsors from sponsors table
      if (sponsorsData) {
        sponsorsData.forEach(s => {
          combinedSponsors.push({
            id: s.id,
            name: s.name,
            email: '', // sponsors table doesn't have email
            avatar_url: s.logo_url,
            description: s.description,
            logo_url: s.logo_url,
            is_active: s.is_active ?? true,
            credit_balance: 0, // Will need separate query for credits
            created_at: s.created_at || new Date().toISOString(),
            source: 'sponsors_table'
          });
        });
      }

      // Add sponsor users from profiles table
      if (profilesData) {
        profilesData.forEach(p => {
          combinedSponsors.push({
            id: p.id,
            name: p.organization_name || `${p.first_name} ${p.last_name}`,
            email: p.email,
            avatar_url: p.avatar_url,
            description: p.bio,
            logo_url: p.organization_logo_url,
            is_active: p.sponsor_status === 'active' || !p.sponsor_status,
            credit_balance: p.credit_balance || 0,
            created_at: p.created_at,
            source: 'profiles_table'
          });
        });
      }

      console.log('[AdminSponsors] Combined sponsors:', combinedSponsors.length);
      setSponsors(combinedSponsors);
    } catch (error) {
      console.error('[AdminSponsors] Error fetching sponsors:', error);
      toast.error('Hiba a szponzorok betöltésekor');
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

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Aktív</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Inaktív</Badge>;
  };

  const getSourceBadge = (source: 'sponsors_table' | 'profiles_table') => {
    if (source === 'profiles_table') {
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Felhasználó</Badge>;
    }
    return <Badge variant="outline" className="border-purple-500 text-purple-600">Partner</Badge>;
  };

  const filteredSponsors = sponsors.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: sponsors.length,
    active: sponsors.filter(s => s.is_active).length,
    inactive: sponsors.filter(s => !s.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-600" />
            Szponzorok
          </h1>
          <p className="text-muted-foreground">
            Szponzorok és partnerek kezelése
          </p>
        </div>
        <Button onClick={fetchSponsors} variant="outline" size="icon" title="Frissítés">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Keresés cégnév vagy email alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">
              Összes ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Aktív ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inaktív ({counts.inactive})
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
            <p className="text-muted-foreground">Nincs megjeleníthető szponzor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSponsors.map((sponsor) => (
            <Card 
              key={sponsor.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                !sponsor.is_active && "opacity-60"
              )}
              onClick={() => {
                console.log('[AdminSponsors] Card clicked:', sponsor.id, sponsor.name);
                toast.info(`${sponsor.name} kiválasztva`);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sponsor.logo_url || sponsor.avatar_url || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                      {sponsor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sponsor.name}</h3>
                      {getSourceBadge(sponsor.source)}
                      {getStatusBadge(sponsor.is_active)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {sponsor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {sponsor.email}
                        </span>
                      )}
                      {sponsor.credit_balance !== undefined && sponsor.credit_balance > 0 && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {sponsor.credit_balance.toLocaleString()} kredit
                        </span>
                      )}
                      {sponsor.description && (
                        <span className="truncate max-w-xs text-xs">
                          {sponsor.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        console.log('[AdminSponsors] View profile:', sponsor.id);
                        toast.info('Profil megtekintése...');
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Profil megtekintése
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('[AdminSponsors] Manage credits:', sponsor.id);
                        toast.info('Kredit kezelés...');
                      }}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Kredit kezelés
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('[AdminSponsors] Send email:', sponsor.email);
                        if (sponsor.email) {
                          window.location.href = `mailto:${sponsor.email}`;
                        }
                      }}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email küldése
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
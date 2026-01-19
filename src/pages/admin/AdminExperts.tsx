import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Award,
  Mail,
  Calendar,
  Briefcase
} from 'lucide-react';
import { ExpertDetailModal } from '@/components/admin/modals/ExpertDetailModal';

interface Expert {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  specialization: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  programs_count: number;
  created_at: string;
  expert_title?: string | null;
}

// Mock experts for demo mode
const MOCK_EXPERTS: Expert[] = [
  {
    id: 'exp-1',
    full_name: 'Dr. Kovács István',
    email: 'kovacs@example.com',
    avatar_url: null,
    specialization: 'Gasztronómia',
    verification_status: 'pending',
    programs_count: 3,
    created_at: '2025-12-15T10:00:00Z',
    expert_title: 'Mesterszakács'
  },
  {
    id: 'exp-2',
    full_name: 'Nagy Eszter',
    email: 'nagy@example.com',
    avatar_url: null,
    specialization: 'Fenntarthatóság',
    verification_status: 'pending',
    programs_count: 2,
    created_at: '2025-12-20T14:00:00Z',
    expert_title: 'Öko tanácsadó'
  },
  {
    id: 'exp-3',
    full_name: 'Szabó Péter',
    email: 'szabo@example.com',
    avatar_url: null,
    specialization: 'Outdoor',
    verification_status: 'verified',
    programs_count: 5,
    created_at: '2025-10-01T09:00:00Z',
    expert_title: 'Túravezető'
  },
  {
    id: 'exp-4',
    full_name: 'Tóth Anna',
    email: 'toth@example.com',
    avatar_url: null,
    specialization: 'Jóllét',
    verification_status: 'verified',
    programs_count: 4,
    created_at: '2025-09-15T11:00:00Z',
    expert_title: 'Jóga oktató'
  },
  {
    id: 'exp-5',
    full_name: 'Kiss Gábor',
    email: 'kiss@example.com',
    avatar_url: null,
    specialization: 'Mezőgazdaság',
    verification_status: 'rejected',
    programs_count: 0,
    created_at: '2025-11-01T08:00:00Z',
    expert_title: 'Biogazda'
  },
];

const AdminExperts = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  
  // Modal state
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch experts
  const fetchExperts = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setExperts(MOCK_EXPERTS);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, expert_title, verification_status, created_at')
          .in('user_role', ['expert', 'creator'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        const expertsWithCounts = await Promise.all(
          (data || []).map(async (profile) => {
            const { count } = await supabase
              .from('expert_contents')
              .select('*', { count: 'exact', head: true })
              .eq('creator_id', profile.id);

            return {
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`,
              email: profile.email,
              avatar_url: profile.avatar_url,
              specialization: profile.expert_title,
              verification_status: (profile.verification_status || 'unverified') as Expert['verification_status'],
              programs_count: count || 0,
              created_at: profile.created_at,
              expert_title: profile.expert_title
            };
          })
        );

        setExperts(expertsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast.error('Hiba a szakértők betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [isDemoMode]);

  // Handle card click - open modal
  const handleCardClick = (expertId: string) => {
    
    setSelectedExpertId(expertId);
    setModalOpen(true);
  };

  // Filter experts
  const getFilteredExperts = () => {
    let filtered = experts;

    if (activeTab !== 'all') {
      filtered = filtered.filter(e => e.verification_status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.full_name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.specialization?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredExperts = getFilteredExperts();

  const counts = {
    all: experts.length,
    pending: experts.filter(e => e.verification_status === 'pending').length,
    verified: experts.filter(e => e.verification_status === 'verified').length,
    rejected: experts.filter(e => e.verification_status === 'rejected').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Függőben</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Hitelesített</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Elutasított</Badge>;
      default:
        return <Badge variant="secondary">Nem hitelesített</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Szakértők</h1>
          <p className="text-muted-foreground">Szakértők és alkotók kezelése</p>
        </div>
        <Button variant="outline" onClick={fetchExperts} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Frissítés
        </Button>
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            {counts.pending} jóváhagyásra vár
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Kattints a kártyára a részletek megtekintéséhez és jóváhagyáshoz.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              Összes
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Függőben
              <Badge variant={counts.pending > 0 ? 'destructive' : 'secondary'} className="ml-1">
                {counts.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              Hitelesített
              <Badge variant="secondary" className="ml-1">{counts.verified}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              Elutasított
              <Badge variant="secondary" className="ml-1">{counts.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExperts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'Nincs jóváhagyásra váró szakértő' 
                    : 'Nincs szakértő'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperts.map((expert) => (
                <Card 
                  key={expert.id} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleCardClick(expert.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={expert.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(expert.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold truncate">{expert.full_name}</h3>
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {expert.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {expert.specialization && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              {expert.specialization}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Award className="h-3 w-3" />
                            {expert.programs_count} program
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(expert.created_at).toLocaleDateString('hu-HU')}
                          </div>
                        </div>

                        <div className="mt-3">
                          {getStatusBadge(expert.verification_status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Expert Detail Modal */}
      <ExpertDetailModal
        expertId={selectedExpertId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerifiedOrRejected={fetchExperts}
      />
    </div>
  );
};

export default AdminExperts;

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  User,
  Tag,
  Plus,
  Building2,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  publication_status: string;
  created_at: string;
  image_url: string | null;
  project_id: string | null;
  expert_id: string | null;
  expert_name?: string;
  sponsor_name?: string;
  seats_used?: number;
  seats_max?: number;
}

// New mock programs with different statuses for workflow testing
const MOCK_PROGRAMS: Program[] = [
  { 
    id: 'p1', 
    title: 'Gyógynövénytúra a Káli-medencében', 
    description: 'Fedezd fel a helyi gyógynövényeket szakértő vezetésével.', 
    expert_name: 'Nagy Eszter', 
    category: 'Természet', 
    publication_status: 'pending_review', 
    price: 8000,
    created_at: '2026-01-10T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    expert_id: 'expert-2'
  },
  { 
    id: 'p2', 
    title: 'Kovászolás Alapjai Workshop', 
    description: 'Tanuld meg a tökéletes kovászkenyér titkait.', 
    expert_name: 'Kovács István', 
    category: 'Gasztronómia', 
    publication_status: 'pending_review', 
    price: 12000,
    created_at: '2026-01-08T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    expert_id: 'expert-1'
  },
  { 
    id: 'p3', 
    title: 'Fenntartható Gazdálkodás', 
    description: 'Permakultúra és ökogazdálkodás a gyakorlatban.', 
    expert_name: 'Szabó Péter', 
    category: 'Mezőgazdaság', 
    publication_status: 'published', 
    price: 15000,
    created_at: '2026-01-05T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    expert_id: 'expert-3'
  },
  { 
    id: 'p4', 
    title: 'Méhészkedés Kezdőknek', 
    description: 'Ismerd meg a méhészet alapjait.', 
    expert_name: 'Kiss Gábor', 
    category: 'Mezőgazdaság', 
    publication_status: 'draft', 
    price: 10000,
    created_at: '2026-01-02T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    expert_id: 'expert-4'
  },
  { 
    id: 'p5', 
    title: 'Jóga a Természetben', 
    description: 'Relaxáció és mozgás a szabadban.', 
    expert_name: 'Tóth Anna', 
    category: 'Jóllét', 
    publication_status: 'published', 
    price: 5000,
    created_at: '2025-12-20T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    expert_id: 'expert-5'
  },
];

const formatPrice = (price: number): string => {
  return price.toLocaleString('hu-HU') + ' Ft';
};

const AdminPrograms = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setPrograms(MOCK_PROGRAMS);
        setLoading(false);
        return;
      }

      // Fetch programs from expert_contents table (the actual programs table)
      const { data, error } = await supabase
        .from('expert_contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch expert names (creator_id is the expert)
      const creatorIds = data?.filter(d => d.creator_id).map(d => d.creator_id) || [];
      let expertsMap: Record<string, string> = {};
      
      if (creatorIds.length > 0) {
        const { data: expertsData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', creatorIds);
        
        expertsData?.forEach((e: { id: string; first_name: string; last_name: string }) => {
          expertsMap[e.id] = [e.first_name, e.last_name].filter(Boolean).join(' ');
        });
      }
      
      // Fetch sponsor information for each program from content_sponsorships
      const programIds = data?.map(d => d.id) || [];
      let sponsorshipsMap: Record<string, { sponsor_name: string; seats_used: number; seats_max: number }> = {};
      
      if (programIds.length > 0) {
        const { data: sponsorshipsData } = await supabase
          .from('content_sponsorships')
          .select('content_id, max_sponsored_seats, sponsored_seats_used, sponsors(name)')
          .in('content_id', programIds)
          .eq('is_active', true);
        
        sponsorshipsData?.forEach((s: any) => {
          sponsorshipsMap[s.content_id] = {
            sponsor_name: s.sponsors?.name || 'Támogatott',
            seats_used: s.sponsored_seats_used || 0,
            seats_max: s.max_sponsored_seats || 0
          };
        });
      }
      
      // Map expert_contents to our Program interface
      // is_published: true = published, false + reviewed_at = rejected, else draft/pending
      setPrograms(data?.map(d => {
        let publication_status = 'draft';
        if (d.is_published) {
          publication_status = 'published';
        } else if (d.rejected_at) {
          publication_status = 'rejected';
        } else if (d.reviewed_at === null && d.is_published === false) {
          // Could be pending or draft based on context
          publication_status = 'pending_review';
        }
        
        const sponsorInfo = sponsorshipsMap[d.id];
        
        return {
          id: d.id,
          title: d.title,
          description: d.description || '',
          category: d.category || '',
          price: d.price_huf || 0,
          publication_status,
          created_at: d.created_at || '',
          image_url: d.image_url,
          project_id: d.region_id,
          expert_id: d.creator_id,
          expert_name: d.creator_id ? expertsMap[d.creator_id] : undefined,
          sponsor_name: sponsorInfo?.sponsor_name,
          seats_used: sponsorInfo?.seats_used,
          seats_max: sponsorInfo?.seats_max
        };
      }) || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error(t('admin.programs.fetch_error') || 'Error fetching programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
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

  const approveProgram = async (programId: string) => {
    if (isDemoMode) {
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'published' } : p
      ));
      toast.success(t('admin.programs.approved') || 'Program approved');
      return;
    }

    try {
      const { error } = await supabase
        .from('expert_contents')
        .update({ is_published: true, reviewed_at: new Date().toISOString() })
        .eq('id', programId);

      if (error) throw error;
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'published' } : p
      ));
      toast.success(t('admin.programs.approved') || 'Program approved');
    } catch (error) {
      console.error('Error approving program:', error);
      toast.error(t('admin.programs.approve_error') || 'Error approving program');
    }
  };

  const rejectProgram = async (programId: string) => {
    if (isDemoMode) {
      setPrograms(prev => prev.map(p =>
        p.id === programId ? { ...p, publication_status: 'rejected' } : p
      ));
      toast.success(t('admin.programs.rejected') || 'Program rejected');
      return;
    }

    try {
      const { error } = await supabase
        .from('expert_contents')
        .update({ is_published: false, rejected_at: new Date().toISOString() })
        .eq('id', programId);

      if (error) throw error;
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'rejected' } : p
      ));
      toast.success(t('admin.programs.rejected') || 'Program rejected');
    } catch (error) {
      console.error('Error rejecting program:', error);
      toast.error(t('admin.programs.reject_error') || 'Error rejecting program');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />{t('admin.programs.status_published')}</Badge>;
      case 'pending_review':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />{t('admin.programs.status_pending')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />{t('admin.programs.status_rejected')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('admin.programs.status_draft')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Gasztronómia': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
      'Természet': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
      'Mezőgazdaság': 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-200',
      'Jóllét': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
      'Kézművesség': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    };
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-700'}>
        <Tag className="h-3 w-3 mr-1" />
        {category}
      </Badge>
    );
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.expert_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && p.publication_status === 'pending_review') ||
      (statusFilter === 'published' && p.publication_status === 'published') ||
      (statusFilter === 'draft' && p.publication_status === 'draft') ||
      (statusFilter === 'rejected' && p.publication_status === 'rejected');
    
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: programs.length,
    pending: programs.filter(p => p.publication_status === 'pending_review').length,
    published: programs.filter(p => p.publication_status === 'published').length,
    draft: programs.filter(p => p.publication_status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-purple-600" />
            {t('admin.programs.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.programs.subtitle')}
          </p>
        </div>
        <Button onClick={fetchPrograms} variant="outline" size="icon">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.programs.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">
              {t('admin.programs.filter_all')} ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className={cn(counts.pending > 0 && "text-amber-600")}>
              {t('admin.programs.filter_pending')} ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="published">
              {t('admin.programs.filter_published')} ({counts.published})
            </TabsTrigger>
            <TabsTrigger value="draft">
              {t('admin.programs.filter_draft')} ({counts.draft})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('admin.programs.no_programs')}</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.programs.create_first') || 'Első program létrehozása'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrograms.map((program) => (
            <Card 
              key={program.id}
              className={cn(
                "hover:shadow-md transition-shadow",
                program.publication_status === 'pending_review' && "ring-2 ring-amber-400"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-8 w-8 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{program.title}</h3>
                      {getStatusBadge(program.publication_status)}
                      {program.category && getCategoryBadge(program.category)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                      {program.expert_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {program.expert_name}
                        </span>
                      )}
                      {program.sponsor_name && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Building2 className="h-4 w-4" />
                          {program.sponsor_name}
                        </span>
                      )}
                      {program.seats_max !== undefined && program.seats_max > 0 && (
                        <span className={cn(
                          "flex items-center gap-1",
                          program.seats_used === program.seats_max ? "text-red-600 font-medium" : ""
                        )}>
                          <Users className="h-4 w-4" />
                          {program.seats_used}/{program.seats_max}
                          {program.seats_used === program.seats_max && " (TELT)"}
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {formatPrice(program.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {program.publication_status === 'pending_review' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => approveProgram(program.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {t('admin.programs.approve')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectProgram(program.id)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {t('admin.programs.reject')}
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('admin.programs.view')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPrograms;

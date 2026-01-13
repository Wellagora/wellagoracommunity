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
  Plus
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
  points_base: number;
  publication_status: string;
  is_active: boolean;
  created_at: string;
  image_url: string | null;
  project_id: string | null;
  sponsor_id: string | null;
  expert_name?: string;
}

// New realistic mock programs linked to experts and Káli-medence project
const MOCK_PROGRAMS: Program[] = [
  {
    id: 'prog-kovasz',
    title: 'Kovászkenyér mesterkurzus',
    description: 'Tanuld meg a hagyományos kovászkenyér készítését kemencében sütéssel',
    category: 'Gasztronómia',
    points_base: 120,
    publication_status: 'pending_review',
    is_active: false,
    created_at: '2026-01-10T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    sponsor_id: 'expert-1',
    expert_name: 'Dr. Kovács István'
  },
  {
    id: 'prog-gyogynoveny',
    title: 'Gyógynövénygyűjtés túra',
    description: 'Ismerd meg a Káli-medence gyógynövényeit és felhasználásukat',
    category: 'Természet',
    points_base: 80,
    publication_status: 'pending_review',
    is_active: false,
    created_at: '2026-01-08T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    sponsor_id: 'expert-2',
    expert_name: 'Nagy Eszter'
  },
  {
    id: 'prog-meheszet',
    title: 'Méhészkedés kezdőknek',
    description: 'Alapozó tanfolyam házi méhészet indításához',
    category: 'Mezőgazdaság',
    points_base: 150,
    publication_status: 'published',
    is_active: true,
    created_at: '2026-01-05T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    sponsor_id: 'expert-3',
    expert_name: 'Szabó Péter'
  },
  {
    id: 'prog-joga',
    title: 'Reggeli jóga a szőlőhegyen',
    description: 'Napfelkeltés jóga a Szent György-hegyen',
    category: 'Jóllét',
    points_base: 60,
    publication_status: 'published',
    is_active: true,
    created_at: '2026-01-02T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    sponsor_id: 'expert-4',
    expert_name: 'Tóth Anna'
  },
  {
    id: 'prog-kosar',
    title: 'Kosárfonás workshop',
    description: 'Hagyományos fűzfa kosárfonás mesterrel',
    category: 'Kézművesség',
    points_base: 100,
    publication_status: 'draft',
    is_active: false,
    created_at: '2025-12-20T10:00:00Z',
    image_url: null,
    project_id: 'kali-medence',
    sponsor_id: 'expert-5',
    expert_name: 'Kiss Gábor'
  },
];

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

      // Fetch programs with expert info
      const { data, error } = await supabase
        .from('challenge_definitions')
        .select('*')
        .not('project_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch expert names for sponsors
      const sponsorIds = data?.filter(d => d.sponsor_id).map(d => d.sponsor_id) || [];
      let expertsMap: Record<string, string> = {};
      
      if (sponsorIds.length > 0) {
        const { data: expertsData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', sponsorIds);
        
        expertsData?.forEach((e: { id: string; first_name: string | null; last_name: string | null }) => {
          expertsMap[e.id] = [e.first_name, e.last_name].filter(Boolean).join(' ');
        });
      }
      
      setPrograms(data?.map(d => ({
        ...d,
        publication_status: d.publication_status || (d.is_active ? 'published' : 'draft'),
        expert_name: d.sponsor_id ? expertsMap[d.sponsor_id] : undefined
      })) || []);
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
        p.id === programId ? { ...p, publication_status: 'published', is_active: true } : p
      ));
      toast.success(t('admin.programs.approved') || 'Program approved');
      return;
    }

    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ publication_status: 'published', is_active: true })
        .eq('id', programId);

      if (error) throw error;
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'published', is_active: true } : p
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
        p.id === programId ? { ...p, publication_status: 'rejected', is_active: false } : p
      ));
      toast.success(t('admin.programs.rejected') || 'Program rejected');
      return;
    }

    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ publication_status: 'rejected', is_active: false })
        .eq('id', programId);

      if (error) throw error;
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'rejected', is_active: false } : p
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
                      {getCategoryBadge(program.category)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      {program.expert_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {program.expert_name}
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {program.points_base} {t('admin.programs.points')}
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

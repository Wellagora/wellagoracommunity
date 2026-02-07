import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { writeAuditLog } from '@/lib/auditLog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  User,
  Tag,
  Plus,
  Building2,
  Users,
  Star,
  StarOff,
  Award
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ProgramDetailModal } from '@/components/admin/modals/ProgramDetailModal';

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
  is_featured?: boolean;
  expert_green_pass?: boolean;
}

// Mock programs for demo mode
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
];

const formatPrice = (price: number): string => {
  return price.toLocaleString('hu-HU') + ' Ft';
};

const AdminPrograms = () => {
  const { isDemoMode, user: adminUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  
  // Modal state
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Rejection reason dialog state
  const [rejectDialogProgramId, setRejectDialogProgramId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setPrograms(MOCK_PROGRAMS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('expert_contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch expert names and green_pass status
      const creatorIds = data?.filter(d => d.creator_id).map(d => d.creator_id) || [];
      let expertsMap: Record<string, string> = {};
      let greenPassMap: Record<string, boolean> = {};
      
      if (creatorIds.length > 0) {
        const { data: expertsData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, green_pass')
          .in('id', creatorIds);
        
        expertsData?.forEach((e: any) => {
          expertsMap[e.id] = [e.first_name, e.last_name].filter(Boolean).join(' ');
          greenPassMap[e.id] = e.green_pass === true;
        });
      }
      
      // Fetch sponsor information
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
      
      setPrograms(data?.map(d => {
        let publication_status = 'draft';
        if (d.is_published) {
          publication_status = 'published';
        } else if (d.rejected_at) {
          publication_status = 'rejected';
        } else if (d.reviewed_at === null && d.is_published === false) {
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
          seats_max: sponsorInfo?.seats_max,
          is_featured: d.is_featured || false,
          expert_green_pass: d.creator_id ? greenPassMap[d.creator_id] : false
        };
      }) || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Hiba a programok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [isDemoMode]);

  // Handle card click - open modal
  const handleCardClick = (programId: string) => {
    setSelectedProgramId(programId);
    setModalOpen(true);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const approveProgram = async (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDemoMode) {
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'published' } : p
      ));
      toast.success('Program jóváhagyva!');
      return;
    }

    try {
      const { error } = await supabase
        .from('expert_contents')
        .update({
          is_published: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUser?.id || null,
        })
        .eq('id', programId);

      if (error) throw error;

      if (adminUser) {
        await writeAuditLog({
          action: 'admin_approve_program',
          tableName: 'expert_contents',
          recordId: programId,
          userId: adminUser.id,
          userEmail: adminUser.email,
          newValues: { is_published: true },
        });
      }
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'published' } : p
      ));
      toast.success('Program jóváhagyva!');
    } catch (error) {
      console.error('Error approving program:', error);
      toast.error('Hiba a jóváhagyás során');
    }
  };

  const openRejectDialog = (programId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRejectDialogProgramId(programId);
    setRejectionReason('');
  };

  const confirmRejectProgram = async () => {
    const programId = rejectDialogProgramId;
    if (!programId) return;
    
    if (isDemoMode) {
      setPrograms(prev => prev.map(p =>
        p.id === programId ? { ...p, publication_status: 'rejected' } : p
      ));
      toast.success('Program elutasítva');
      setRejectDialogProgramId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('expert_contents')
        .update({
          is_published: false,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim() || null,
          reviewed_by: adminUser?.id || null,
        })
        .eq('id', programId);

      if (error) throw error;

      if (adminUser) {
        await writeAuditLog({
          action: 'admin_reject_program',
          tableName: 'expert_contents',
          recordId: programId,
          userId: adminUser.id,
          userEmail: adminUser.email,
          newValues: { rejection_reason: rejectionReason.trim() },
        });
      }
      
      setPrograms(prev => prev.map(p => 
        p.id === programId ? { ...p, publication_status: 'rejected' } : p
      ));
      toast.success('Program elutasítva');
      setRejectDialogProgramId(null);
    } catch (error) {
      console.error('Error rejecting program:', error);
      toast.error('Hiba az elutasítás során');
    }
  };

  const toggleFeatured = async (programId: string, currentState: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('expert_contents')
        .update({ is_featured: !currentState })
        .eq('id', programId);

      if (error) throw error;

      if (adminUser) {
        await writeAuditLog({
          action: currentState ? 'admin_unfeature_program' : 'admin_feature_program',
          tableName: 'expert_contents',
          recordId: programId,
          userId: adminUser.id,
          userEmail: adminUser.email,
          newValues: { is_featured: !currentState },
        });
      }

      setPrograms(prev => prev.map(p =>
        p.id === programId ? { ...p, is_featured: !currentState } : p
      ));
      toast.success(!currentState ? 'Kiemelt program' : 'Kiemelés visszavonva');
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Hiba a kiemelés során');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Publikált</Badge>;
      case 'pending_review':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />Függőben</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Elutasított</Badge>;
      case 'draft':
        return <Badge variant="secondary">Piszkozat</Badge>;
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
            Programok
          </h1>
          <p className="text-muted-foreground">
            Programok és workshopok kezelése
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchPrograms} variant="outline" size="icon">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Új program
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Keresés program vagy szakértő alapján..."
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
            <TabsTrigger value="pending" className={cn(counts.pending > 0 && "text-amber-600")}>
              Függőben ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="published">
              Publikált ({counts.published})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Piszkozat ({counts.draft})
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
            <p className="text-muted-foreground mb-4">Nincs program</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Első program létrehozása
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrograms.map((program) => (
            <Card 
              key={program.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                program.publication_status === 'pending_review' && "ring-2 ring-amber-400"
              )}
              onClick={() => handleCardClick(program.id)}
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
                    {/* Green Pass indicator */}
                    {program.expert_green_pass && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300" title="Green Pass — auto-publish">
                        <Award className="h-3 w-3 mr-1" />
                        GP
                      </Badge>
                    )}
                    {/* Featured toggle */}
                    <Button
                      size="sm"
                      variant={program.is_featured ? "default" : "outline"}
                      className={cn(program.is_featured && "bg-amber-500 hover:bg-amber-600")}
                      onClick={(e) => toggleFeatured(program.id, !!program.is_featured, e)}
                      title={program.is_featured ? "Kiemelés visszavonása" : "Kiemelt program"}
                    >
                      {program.is_featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                    {program.publication_status === 'pending_review' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={(e) => approveProgram(program.id, e)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Jóváhagyás
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => openRejectDialog(program.id, e)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Elutasítás
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Reason Dialog */}
      {rejectDialogProgramId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setRejectDialogProgramId(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-red-700">Program elutasítása</h3>
            <div className="space-y-2">
              <Label className="text-red-700">Elutasítás indoka</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Írd le az elutasítás okát (opcionális)..."
                className="border-red-200"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectDialogProgramId(null)}>Mégse</Button>
              <Button variant="destructive" onClick={confirmRejectProgram}>
                <ThumbsDown className="h-4 w-4 mr-1" />
                Elutasítás
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Program Detail Modal */}
      <ProgramDetailModal
        programId={selectedProgramId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={fetchPrograms}
      />
    </div>
  );
};

export default AdminPrograms;

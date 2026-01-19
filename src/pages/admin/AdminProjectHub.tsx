import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Icons
import {
  ChevronLeft,
  MapPin,
  Users,
  Calendar,
  TrendingUp,
  Building2,
  BookOpen,
  Ticket,
  Edit,
  Plus,
  Download,
  RefreshCw,
  Wallet,
  Target,
  Award,
  UserCheck,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region_name: string;
  is_active: boolean;
  created_at: string;
}

interface ProjectStats {
  totalParticipants: number;
  totalExperts: number;
  totalPrograms: number;
  totalEvents: number;
  totalBudgetUsed: number;
  activeSponsorships: number;
}

interface Expert {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  user_role: string;
  green_pass: boolean;
}

interface Program {
  id: string;
  title: string;
  category: string | null;
  price_huf: number | null;
  is_published: boolean;
  used_licenses: number;
  max_capacity: number | null;
  creator_id: string;
  expert_name?: string;
}

interface Event {
  id: string;
  title: string;
  start_date: string;
  location_name: string | null;
  status: string | null;
  current_participants: number;
  max_participants: number | null;
}

interface Participant {
  id: string;
  user_name: string;
  email: string;
  program_title: string;
  claimed_at: string;
}

interface Sponsor {
  id: string;
  company_name: string;
  logo_url: string | null;
  sponsor_credits: number;
  is_active: boolean;
}

const AdminProjectHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats>({
    totalParticipants: 0,
    totalExperts: 0,
    totalPrograms: 0,
    totalEvents: 0,
    totalBudgetUsed: 0,
    activeSponsorships: 0,
  });
  const [experts, setExperts] = useState<Expert[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    region_name: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Fetch project data
  useEffect(() => {
    if (!id) return;
    fetchProjectData();
  }, [id, isDemoMode]);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      if (isDemoMode) {
        // Demo data
        setProject({
          id: 'proj-1',
          name: 'Káli-medence Közösség',
          slug: 'kali-medence',
          description: 'A Balaton-felvidék szívében működő fenntartható közösség.',
          region_name: 'Balaton-felvidék',
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
        });
        setStats({
          totalParticipants: 156,
          totalExperts: 12,
          totalPrograms: 24,
          totalEvents: 8,
          totalBudgetUsed: 450000,
          activeSponsorships: 3,
        });
        setExperts([
          { id: '1', first_name: 'Kovács', last_name: 'Anna', email: 'anna@example.com', avatar_url: null, user_role: 'expert', green_pass: true },
          { id: '2', first_name: 'Nagy', last_name: 'Péter', email: 'peter@example.com', avatar_url: null, user_role: 'expert', green_pass: false },
        ]);
        setPrograms([
          { id: '1', title: 'Reggeli jóga', category: 'wellness', price_huf: 3500, is_published: true, used_licenses: 8, max_capacity: 15, creator_id: '1', expert_name: 'Kovács Anna' },
          { id: '2', title: 'Fűszernövények', category: 'gardening', price_huf: 2500, is_published: true, used_licenses: 12, max_capacity: 20, creator_id: '2', expert_name: 'Nagy Péter' },
        ]);
        setEvents([
          { id: '1', title: 'Közösségi piknik', start_date: '2025-02-15T10:00:00Z', location_name: 'Káli-völgy', status: 'upcoming', current_participants: 25, max_participants: 50 },
        ]);
        setSponsors([
          { id: '1', company_name: 'DM', logo_url: null, sponsor_credits: 50000, is_active: true },
          { id: '2', company_name: 'OBI', logo_url: null, sponsor_credits: 30000, is_active: true },
        ]);
        setLoading(false);
        return;
      }

      // Fetch real project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch experts in this project
      const { data: expertsData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url, user_role, green_pass')
        .eq('project_id', id)
        .eq('user_role', 'expert');
      setExperts(expertsData || []);

      // Fetch programs in this project
      const { data: programsData } = await supabase
        .from('expert_contents')
        .select('id, title, category, price_huf, is_published, used_licenses, max_capacity, creator_id')
        .or(`region_id.eq.${id}`);
      
      const formattedPrograms = (programsData || []).map(p => ({
        ...p,
        expert_name: '-',
      }));
      setPrograms(formattedPrograms as Program[]);

      // Fetch events in this project
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, start_date, location_name, status, current_participants, max_participants')
        .eq('project_id', id);
      setEvents(eventsData || []);

      // Fetch sponsors from profiles with sponsor role
      const { data: sponsorsData } = await supabase
        .from('profiles')
        .select('id, organization_name, organization_logo_url, credit_balance, user_role')
        .eq('user_role', 'sponsor');
      
      const mappedSponsors = (sponsorsData || []).map(s => ({
        id: s.id,
        company_name: s.organization_name || 'Unknown',
        logo_url: s.organization_logo_url,
        sponsor_credits: s.credit_balance || 0,
        is_active: true,
      }));
      setSponsors(mappedSponsors);

      // Calculate stats
      const { count: participantCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      const { count: expertCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id)
        .eq('user_role', 'expert');

      const { count: programCount } = await supabase
        .from('expert_contents')
        .select('*', { count: 'exact', head: true })
        .or(`region_id.eq.${id}`);

      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      setStats({
        totalParticipants: participantCount || 0,
        totalExperts: expertCount || 0,
        totalPrograms: programCount || 0,
        totalEvents: eventCount || 0,
        totalBudgetUsed: 0,
        activeSponsorships: sponsorsData?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Hiba a projekt betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = () => {
    if (!project) return;
    setEditForm({
      name: project.name,
      description: project.description || '',
      region_name: project.region_name,
      is_active: project.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    setSaving(true);

    try {
      if (isDemoMode) {
        setProject({ ...project, ...editForm });
        toast.success('Projekt frissítve!');
        setIsEditModalOpen(false);
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          name: editForm.name,
          description: editForm.description,
          region_name: editForm.region_name,
          is_active: editForm.is_active,
        })
        .eq('id', project.id);

      if (error) throw error;
      
      setProject({ ...project, ...editForm });
      toast.success('Projekt frissítve!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Hiba a mentéskor');
    } finally {
      setSaving(false);
    }
  };

  const exportParticipants = () => {
    const csv = [
      ['Név', 'Email', 'Program', 'Dátum'].join(','),
      ...participants.map(p => [p.user_name, p.email, p.program_title, p.claimed_at].join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.slug || 'project'}-participants.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projekt nem található</p>
        <Button onClick={() => navigate('/admin-panel/projects')} className="mt-4">
          Vissza a projektekhez
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin-panel/projects')}
          className="gap-1 -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Admin
        </Button>
        <span>/</span>
        <span>Projektek</span>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.is_active ? 'default' : 'secondary'}>
              {project.is_active ? 'Aktív' : 'Inaktív'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.region_name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(project.created_at).toLocaleDateString('hu-HU')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProjectData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Frissítés
          </Button>
          <Button size="sm" onClick={handleEditProject}>
            <Edit className="h-4 w-4 mr-2" />
            Szerkesztés
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Áttekintés</span>
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Szponzorok</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Programok</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Események</span>
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Résztvevők</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                    <p className="text-xs text-muted-foreground">Résztvevő</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalExperts}</p>
                    <p className="text-xs text-muted-foreground">Szakértő</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPrograms}</p>
                    <p className="text-xs text-muted-foreground">Program</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalBudgetUsed.toLocaleString('hu-HU')}</p>
                    <p className="text-xs text-muted-foreground">HUF költség</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional ROI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Regionális ROI
              </CardTitle>
              <CardDescription>
                Költség per elért állampolgár ebben a régióban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats.totalParticipants > 0 
                      ? Math.round(stats.totalBudgetUsed / stats.totalParticipants).toLocaleString('hu-HU')
                      : 0
                    } Ft
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Költség / résztvevő
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalPrograms > 0 
                      ? Math.round(stats.totalParticipants / stats.totalPrograms)
                      : 0
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Átlag résztvevő / program
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.activeSponsorships}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aktív szponzor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Leírás</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sponsors Tab */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Projekt szponzorok</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Szponzor hozzárendelése
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map(sponsor => (
              <Card key={sponsor.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.company_name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{sponsor.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sponsor.sponsor_credits.toLocaleString('hu-HU')} kredit
                      </p>
                    </div>
                    <Badge variant={sponsor.is_active ? 'default' : 'secondary'}>
                      {sponsor.is_active ? 'Aktív' : 'Inaktív'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sponsors.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nincs szponzor hozzárendelve</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Programok & Szakértők</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Új program
            </Button>
          </div>

          {/* Experts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Szakértők ({experts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {experts.map(expert => (
                  <div
                    key={expert.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {expert.first_name?.[0]}{expert.last_name?.[0]}
                    </div>
                    <span className="font-medium">{expert.first_name} {expert.last_name}</span>
                    {expert.green_pass && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        🟢 Auto
                      </Badge>
                    )}
                  </div>
                ))}
                {experts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nincs szakértő ebben a projektben</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Programs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Programok ({programs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Szakértő</TableHead>
                    <TableHead>Kategória</TableHead>
                    <TableHead>Ár</TableHead>
                    <TableHead>Helyek</TableHead>
                    <TableHead>Státusz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map(program => (
                    <TableRow key={program.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{program.expert_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{program.category || '-'}</Badge>
                      </TableCell>
                      <TableCell>{program.price_huf?.toLocaleString('hu-HU')} Ft</TableCell>
                      <TableCell>{program.used_licenses || 0}/{program.max_capacity || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={program.is_published ? 'default' : 'secondary'}>
                          {program.is_published ? 'Publikált' : 'Piszkozat'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {programs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nincs program ebben a projektben
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Események</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Új esemény
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="outline">{event.status || 'draft'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleDateString('hu-HU')}
                    </div>
                    {event.location_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location_name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.current_participants || 0}
                        {event.max_participants && ` / ${event.max_participants}`} résztvevő
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {events.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nincs esemény ebben a projektben</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Résztvevők</h3>
            <Button variant="outline" size="sm" onClick={exportParticipants} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Név</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Igénylés dátuma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.length > 0 ? (
                    participants.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.user_name}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.program_title}</TableCell>
                        <TableCell>{new Date(p.claimed_at).toLocaleDateString('hu-HU')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Még nincs regisztrált résztvevő
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Projekt szerkesztése</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Név</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Régió</Label>
              <Input
                value={editForm.region_name}
                onChange={(e) => setEditForm({ ...editForm, region_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editForm.is_active}
                onCheckedChange={(v) => setEditForm({ ...editForm, is_active: v })}
              />
              <Label>Aktív projekt</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveProject} disabled={saving}>
              {saving ? 'Mentés...' : 'Mentés'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectHub;

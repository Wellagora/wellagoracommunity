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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  Trash2,
  Check,
  X,
  UserPlus,
  Link2,
} from 'lucide-react';

// Currency utilities
import { formatCurrency, CURRENCY_SYMBOLS } from '@/lib/currency';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region_name: string;
  is_active: boolean;
  created_at: string;
  currency_code?: string | null;
  country_code?: string | null;
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
  description?: string | null;
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
  description?: string | null;
  start_date: string;
  end_date?: string | null;
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

interface AvailableExpert {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AvailableSponsor {
  id: string;
  organization_name: string;
  email: string;
  credit_balance: number;
}

const PROGRAM_CATEGORIES = [
  { value: 'wellness', label: 'Wellness' },
  { value: 'gardening', label: 'Kertészet' },
  { value: 'cooking', label: 'Főzés' },
  { value: 'crafts', label: 'Kézművesség' },
  { value: 'education', label: 'Oktatás' },
  { value: 'community', label: 'Közösség' },
  { value: 'sustainability', label: 'Fenntarthatóság' },
  { value: 'other', label: 'Egyéb' },
];

const AdminProjectHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

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

  // Program modal state
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    category: 'other',
    price_huf: 0,
    max_capacity: 20,
    is_published: false,
  });

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location_name: '',
    max_participants: 50,
    status: 'upcoming',
  });

  // Expert linking modal
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [availableExperts, setAvailableExperts] = useState<AvailableExpert[]>([]);
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');

  // Sponsor linking modal
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [availableSponsors, setAvailableSponsors] = useState<AvailableSponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');
  const [sponsorCredits, setSponsorCredits] = useState(10000);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'program' | 'event'; id: string; name: string } | null>(null);


  // Fetch project data
  useEffect(() => {
    if (!id) return;
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);

    try {

      // Fetch real project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);
      console.log('[AdminProjectHub] Project loaded:', projectData);

      // Fetch experts in this project (user_role = 'expert' OR is_verified_expert = true)
      const { data: expertsData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url, user_role, green_pass')
        .eq('project_id', id)
        .eq('is_verified_expert', true);
      setExperts(expertsData || []);
      console.log('[AdminProjectHub] Experts loaded:', expertsData?.length || 0);

      // Fetch programs in this project
      const { data: programsData } = await supabase
        .from('expert_contents')
        .select('id, title, description, category, price_huf, is_published, used_licenses, max_capacity, creator_id')
        .eq('region_id', id);
      
      const formattedPrograms = (programsData || []).map(p => ({
        ...p,
        used_licenses: p.used_licenses || 0,
        expert_name: '-',
      }));
      setPrograms(formattedPrograms as Program[]);
      console.log('[AdminProjectHub] Programs loaded:', programsData?.length || 0);

      // Fetch events in this project
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, description, start_date, end_date, location_name, status, current_participants, max_participants')
        .eq('project_id', id);
      setEvents((eventsData || []).map(e => ({
        ...e,
        current_participants: e.current_participants || 0,
      })) as Event[]);
      console.log('[AdminProjectHub] Events loaded:', eventsData?.length || 0);

      // Fetch sponsors linked to this project via challenge_sponsorships
      const { data: sponsorshipsData } = await supabase
        .from('challenge_sponsorships')
        .select(`
          id,
          credit_cost,
          status,
          sponsor_user_id
        `)
        .eq('project_id', id)
        .eq('status', 'active');

      // Get sponsor profiles
      const sponsorIds = sponsorshipsData?.map(s => s.sponsor_user_id) || [];
      if (sponsorIds.length > 0) {
        const { data: sponsorProfiles } = await supabase
          .from('profiles')
          .select('id, organization_name, organization_logo_url, credit_balance')
          .in('id', sponsorIds);
        
        const mappedSponsors = (sponsorProfiles || []).map(s => ({
          id: s.id,
          company_name: s.organization_name || 'Unknown',
          logo_url: s.organization_logo_url,
          sponsor_credits: s.credit_balance || 0,
          is_active: true,
        }));
        setSponsors(mappedSponsors);
      } else {
        setSponsors([]);
      }

      // Calculate total budget from sponsorships
      const totalBudget = sponsorshipsData?.reduce((sum, s) => sum + (s.credit_cost || 0), 0) || 0;

      // Calculate stats
      const { count: participantCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      const { count: expertCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id)
        .eq('is_verified_expert', true);

      const { count: programCount } = await supabase
        .from('expert_contents')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', id);

      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      setStats({
        totalParticipants: participantCount || 0,
        totalExperts: expertCount || 0,
        totalPrograms: programCount || 0,
        totalEvents: eventCount || 0,
        totalBudgetUsed: totalBudget,
        activeSponsorships: sponsorshipsData?.length || 0,
      });
      console.log('[AdminProjectHub] Stats calculated:', { participantCount, expertCount, programCount, eventCount, totalBudget });

    } catch (error: any) {
      console.error('[AdminProjectHub] Error fetching project:', error);
      toast.error(error?.message || 'Hiba a projekt betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  // ===== PROJECT EDITING =====
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
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: editForm.name,
          description: editForm.description,
          region_name: editForm.region_name,
          is_active: editForm.is_active,
        })
        .eq('id', project.id)
        .select('*')
        .single();

      if (error) throw error;

      console.log('DB SUCCESS:', data);
      setProject({ ...project, ...editForm });
      toast.success('Projekt frissítve!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a mentéskor');
    } finally {
      setSaving(false);
    }
  };

  // ===== PROGRAM CRUD =====
  const openProgramModal = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({
        title: program.title,
        description: program.description || '',
        category: program.category || 'other',
        price_huf: program.price_huf || 0,
        max_capacity: program.max_capacity || 20,
        is_published: program.is_published,
      });
    } else {
      setEditingProgram(null);
      setProgramForm({
        title: '',
        description: '',
        category: 'other',
        price_huf: 0,
        max_capacity: 20,
        is_published: false,
      });
    }
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async () => {

    if (!project || !id) {
      console.error('DB ERROR:', { message: 'Missing project/id', project: !!project, id });
      toast.error('Hiányzó projekt azonosító');
      return;
    }

    if (!user?.id) {
      console.error('DB ERROR:', { message: 'Missing user.id (not authenticated?)', user });
      toast.error('Nincs bejelentkezett felhasználó (auth)');
      return;
    }

    setSaving(true);

    try {
      if (editingProgram) {
        const payload = {
          title: programForm.title,
          description: programForm.description,
          category: programForm.category,
          price_huf: programForm.price_huf,
          max_capacity: programForm.max_capacity,
          is_published: programForm.is_published,
        };

        console.log('[handleSaveProgram] UPDATE payload:', payload);

        // UPDATE existing program
        const { data, error } = await supabase
          .from('expert_contents')
          .update(payload)
          .eq('id', editingProgram.id)
          .select('*')
          .single();

        if (error) throw error;
        if (!data) throw new Error('No row returned from update');

        console.log('DB SUCCESS:', data);
        toast.success('Program frissítve!');
      } else {
        const payload = {
          title: programForm.title,
          description: programForm.description,
          category: programForm.category,
          price_huf: programForm.price_huf,
          max_capacity: programForm.max_capacity,
          is_published: programForm.is_published,
          region_id: id, // Link to project (expert_contents uses region_id)
          creator_id: user.id,
        };

        console.log('[handleSaveProgram] INSERT payload:', payload);

        // INSERT new program
        const { data, error } = await supabase
          .from('expert_contents')
          .insert(payload)
          .select('*')
          .single();

        if (error) throw error;
        if (!data) throw new Error('No row returned from insert');

        console.log('DB SUCCESS:', data);
        toast.success('Program létrehozva!');
      }

      setIsProgramModalOpen(false);
      await fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || error?.error_description || JSON.stringify(error) || 'Hiba a mentéskor');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveProgram = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('expert_contents')
        .update({ is_published: true })
        .eq('id', programId)
        .select('*')
        .single();

      if (error) throw error;
      console.log('DB SUCCESS:', data);
      toast.success('Program jóváhagyva!');
      fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a jóváhagyáskor');
    }
  };

  const handleRejectProgram = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('expert_contents')
        .update({ is_published: false })
        .eq('id', programId)
        .select('*')
        .single();

      if (error) throw error;
      console.log('DB SUCCESS:', data);
      toast.success('Program elutasítva!');
      fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba az elutasításkor');
    }
  };

  // ===== EVENT CRUD =====
  const openEventModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || '',
        start_date: event.start_date?.slice(0, 16) || '',
        end_date: event.end_date?.slice(0, 16) || '',
        location_name: event.location_name || '',
        max_participants: event.max_participants || 50,
        status: event.status || 'upcoming',
      });
    } else {
      setEditingEvent(null);
      const now = new Date();
      now.setHours(now.getHours() + 24);
      setEventForm({
        title: '',
        description: '',
        start_date: now.toISOString().slice(0, 16),
        end_date: '',
        location_name: project?.region_name || '',
        max_participants: 50,
        status: 'upcoming',
      });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {

    if (!project || !id) {
      console.error('DB ERROR:', { message: 'Missing project/id', project: !!project, id });
      toast.error('Hiányzó projekt azonosító');
      return;
    }

    if (!user?.id) {
      console.error('DB ERROR:', { message: 'Missing user.id (not authenticated?)', user });
      toast.error('Nincs bejelentkezett felhasználó (auth)');
      return;
    }

    setSaving(true);

    try {
      if (editingEvent) {
        const payload = {
          title: eventForm.title,
          description: eventForm.description,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date || null,
          location_name: eventForm.location_name,
          max_participants: eventForm.max_participants,
          status: eventForm.status,
        };

        console.log('[handleSaveEvent] UPDATE payload:', payload);

        // UPDATE existing event
        const { data, error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEvent.id)
          .select('*')
          .single();

        if (error) throw error;
        if (!data) throw new Error('No row returned from update');

        console.log('DB SUCCESS:', data);
        toast.success('Esemény frissítve!');
      } else {
        const payload = {
          title: eventForm.title,
          description: eventForm.description,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date || null,
          location_name: eventForm.location_name,
          max_participants: eventForm.max_participants,
          status: eventForm.status,
          project_id: id, // Link to project (events uses project_id)
          created_by: user.id,
          village: project?.region_name,
        };

        console.log('[handleSaveEvent] INSERT payload:', payload);

        // INSERT new event
        const { data, error } = await supabase
          .from('events')
          .insert(payload)
          .select('*')
          .single();

        if (error) throw error;
        if (!data) throw new Error('No row returned from insert');

        console.log('DB SUCCESS:', data);
        toast.success('Esemény létrehozva!');
      }

      setIsEventModalOpen(false);
      await fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || error?.error_description || JSON.stringify(error) || 'Hiba a mentéskor');
    } finally {
      setSaving(false);
    }
  };


  // ===== DELETE OPERATIONS =====
  const confirmDelete = (type: 'program' | 'event', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'program') {
        const { data, error } = await supabase
          .from('expert_contents')
          .delete()
          .eq('id', deleteTarget.id)
          .select('*')
          .maybeSingle();

        if (error) throw error;
        console.log('DB SUCCESS:', data);
      } else {
        const { data, error } = await supabase
          .from('events')
          .delete()
          .eq('id', deleteTarget.id)
          .select('*')
          .maybeSingle();

        if (error) throw error;
        console.log('DB SUCCESS:', data);
      }

      toast.success(`${deleteTarget.type === 'program' ? 'Program' : 'Esemény'} törölve!`);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a törléskor');
    }
  };

  // ===== EXPERT LINKING =====
  const openExpertModal = async () => {
    try {
      // Fetch verified experts not already in this project
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('is_verified_expert', true)
        .or(`project_id.is.null,project_id.neq.${id}`);

      if (error) throw error;

      setAvailableExperts(data || []);
      console.log('DB SUCCESS:', data);
      setIsExpertModalOpen(true);
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a szakértők betöltésekor');
    }
  };

  const handleLinkExpert = async () => {
    if (!selectedExpertId || !id) return;
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ project_id: id })
        .eq('id', selectedExpertId)
        .select('*')
        .single();

      if (error) throw error;
      console.log('DB SUCCESS:', data);
      toast.success('Szakértő hozzáadva a projekthez!');
      setIsExpertModalOpen(false);
      setSelectedExpertId('');
      fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a szakértő hozzáadásakor');
    } finally {
      setSaving(false);
    }
  };

  // ===== SPONSOR LINKING =====
  const openSponsorModal = async () => {
    try {
      // Fetch sponsors
      const { data, error } = await supabase
        .from('profiles')
        .select('id, organization_name, email, credit_balance')
        .eq('user_role', 'sponsor');

      if (error) throw error;

      setAvailableSponsors(data || []);
      console.log('DB SUCCESS:', data);
      setIsSponsorModalOpen(true);
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a szponzorok betöltésekor');
    }
  };

  const handleLinkSponsor = async () => {
    if (!selectedSponsorId || !id) return;
    setSaving(true);

    try {
      // Create a challenge sponsorship to link sponsor to project
      const { data, error } = await supabase
        .from('challenge_sponsorships')
        .insert({
          sponsor_user_id: selectedSponsorId,
          project_id: id,
          challenge_id: 'project-sponsorship', // Generic sponsorship
          region: project?.region_name || 'default',
          package_type: 'project',
          credit_cost: sponsorCredits,
          status: 'active',
          start_date: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      console.log('DB SUCCESS:', data);
      toast.success('Szponzor csatolva a projekthez!');
      setIsSponsorModalOpen(false);
      setSelectedSponsorId('');
      setSponsorCredits(10000);
      fetchProjectData();
    } catch (error: any) {
      console.error('DB ERROR:', error);
      toast.error(error?.message || 'Hiba a szponzor csatolásakor');
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

  // Get currency symbol for display
  const getCurrencySymbol = () => {
    return CURRENCY_SYMBOLS[project?.currency_code || 'HUF'] || 'Ft';
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
        {project.country_code && (
          <>
            <span>/</span>
            <span>{project.country_code}</span>
          </>
        )}
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
            {project.currency_code && (
              <Badge variant="outline">{project.currency_code}</Badge>
            )}
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
                    <p className="text-xs text-muted-foreground">{getCurrencySymbol()} költség</p>
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
                    } {getCurrencySymbol()}
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
            <Button size="sm" className="gap-2" onClick={openSponsorModal}>
              <Link2 className="h-4 w-4" />
              Szponzor csatolása
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
                        {sponsor.sponsor_credits.toLocaleString('hu-HU')} {getCurrencySymbol()}
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
                  <Button className="mt-4" onClick={openSponsorModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Szponzor hozzáadása
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Programok & Szakértők</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={openExpertModal}>
                <UserPlus className="h-4 w-4" />
                Szakértő hozzáadása
              </Button>
              <Button size="sm" className="gap-2" onClick={() => openProgramModal()}>
                <Plus className="h-4 w-4" />
                Új program
              </Button>
            </div>
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
                    <TableHead>Kategória</TableHead>
                    <TableHead>Ár</TableHead>
                    <TableHead>Helyek</TableHead>
                    <TableHead>Státusz</TableHead>
                    <TableHead className="text-right">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map(program => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{program.category || '-'}</Badge>
                      </TableCell>
                      <TableCell>{program.price_huf?.toLocaleString('hu-HU')} {getCurrencySymbol()}</TableCell>
                      <TableCell>{program.used_licenses || 0}/{program.max_capacity || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={program.is_published ? 'default' : 'secondary'}>
                          {program.is_published ? 'Publikált' : 'Piszkozat'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!program.is_published && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproveProgram(program.id)}
                              title="Jóváhagyás"
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          {program.is_published && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRejectProgram(program.id)}
                              title="Elutasítás"
                            >
                              <X className="h-4 w-4 text-orange-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openProgramModal(program)}
                            title="Szerkesztés"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete('program', program.id, program.title)}
                            title="Törlés"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
            <Button size="sm" className="gap-2" onClick={() => openEventModal()}>
              <Plus className="h-4 w-4" />
              Új esemény
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
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
                    <div className="flex justify-end gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEventModal(event)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Szerkesztés
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete('event', event.id, event.title)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                  <Button className="mt-4" onClick={() => openEventModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Esemény létrehozása
                  </Button>
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

      {/* Edit Project Modal */}
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

      {/* Program Modal */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Program szerkesztése' : 'Új program létrehozása'}</DialogTitle>
            <DialogDescription>
              Projekt: {project.name} ({project.region_name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cím *</Label>
              <Input
                value={programForm.title}
                onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                placeholder="Program neve"
              />
            </div>
            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                rows={3}
                placeholder="Program részletes leírása"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategória</Label>
                <Select
                  value={programForm.category}
                  onValueChange={(v) => setProgramForm({ ...programForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ár ({getCurrencySymbol()})</Label>
                <Input
                  type="number"
                  value={programForm.price_huf}
                  onChange={(e) => setProgramForm({ ...programForm, price_huf: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max résztvevők</Label>
              <Input
                type="number"
                value={programForm.max_capacity}
                onChange={(e) => setProgramForm({ ...programForm, max_capacity: parseInt(e.target.value) || 20 })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={programForm.is_published}
                onCheckedChange={(v) => setProgramForm({ ...programForm, is_published: v })}
              />
              <Label>Publikálva</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramModalOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveProgram} disabled={saving || !programForm.title}>
              {saving ? 'Mentés...' : 'Mentés'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Esemény szerkesztése' : 'Új esemény létrehozása'}</DialogTitle>
            <DialogDescription>
              Projekt: {project.name} ({project.region_name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cím *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Esemény neve"
              />
            </div>
            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={3}
                placeholder="Esemény részletes leírása"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kezdés *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.start_date}
                  onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Befejezés</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.end_date}
                  onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Helyszín</Label>
              <Input
                value={eventForm.location_name}
                onChange={(e) => setEventForm({ ...eventForm, location_name: e.target.value })}
                placeholder="Esemény helyszíne"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max résztvevők</Label>
                <Input
                  type="number"
                  value={eventForm.max_participants}
                  onChange={(e) => setEventForm({ ...eventForm, max_participants: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Státusz</Label>
                <Select
                  value={eventForm.status}
                  onValueChange={(v) => setEventForm({ ...eventForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Közelgő</SelectItem>
                    <SelectItem value="ongoing">Folyamatban</SelectItem>
                    <SelectItem value="completed">Befejezett</SelectItem>
                    <SelectItem value="cancelled">Lemondva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveEvent} disabled={saving || !eventForm.title || !eventForm.start_date}>
              {saving ? 'Mentés...' : 'Mentés'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expert Linking Modal */}
      <Dialog open={isExpertModalOpen} onOpenChange={setIsExpertModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Szakértő hozzáadása a projekthez</DialogTitle>
            <DialogDescription>
              Válassz egy szakértőt, akit ehhez a projekthez szeretnél rendelni.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Szakértő</Label>
              <Select value={selectedExpertId} onValueChange={setSelectedExpertId}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz szakértőt..." />
                </SelectTrigger>
                <SelectContent>
                  {availableExperts.map(expert => (
                    <SelectItem key={expert.id} value={expert.id}>
                      {expert.first_name} {expert.last_name} ({expert.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpertModalOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleLinkExpert} disabled={saving || !selectedExpertId}>
              {saving ? 'Hozzáadás...' : 'Hozzáadás'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor Linking Modal */}
      <Dialog open={isSponsorModalOpen} onOpenChange={setIsSponsorModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Szponzor csatolása a projekthez</DialogTitle>
            <DialogDescription>
              Válassz egy szponzort és add meg a hozzájárulás összegét.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Szponzor</Label>
              <Select value={selectedSponsorId} onValueChange={setSelectedSponsorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz szponzort..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSponsors.map(sponsor => (
                    <SelectItem key={sponsor.id} value={sponsor.id}>
                      {sponsor.organization_name} ({sponsor.credit_balance.toLocaleString('hu-HU')} {getCurrencySymbol()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hozzájárulás ({getCurrencySymbol()})</Label>
              <Input
                type="number"
                value={sponsorCredits}
                onChange={(e) => setSponsorCredits(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSponsorModalOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleLinkSponsor} disabled={saving || !selectedSponsorId}>
              {saving ? 'Csatolás...' : 'Csatolás'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. A(z) "{deleteTarget?.name}" {deleteTarget?.type === 'program' ? 'program' : 'esemény'} véglegesen törlődik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjectHub;

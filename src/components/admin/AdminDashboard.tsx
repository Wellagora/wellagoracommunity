import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Sparkles, TrendingUp, Users, ArrowLeft, Plus, Building2, X, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import UserRoleManager from './UserRoleManager';
import { ProgramCreator } from './ProgramCreator';
import ProjectDetailView from './ProjectDetailView';
import MessagesManager from './MessagesManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PendingChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_base: number;
  base_impact: {
    co2_saved: number;
    description: string;
  };
  validation_requirements: {
    type: string;
    description: string;
    steps: string[];
    tips: string[];
  };
  created_at: string;
  location?: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface NewChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_base: number;
  co2_saved: number;
  impact_description: string;
  validation_type: string;
  validation_description: string;
  steps: string[];
  tips: string[];
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [draftChallenges, setDraftChallenges] = useState<PendingChallenge[]>([]);
  const [activePrograms, setActivePrograms] = useState<PendingChallenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'users'>('projects');
  const [newProject, setNewProject] = useState({
    name: '',
    slug: '',
    region_name: '',
    villages: '',
    description: ''
  });
  const [newChallenge, setNewChallenge] = useState<NewChallenge>({
    id: '',
    title: '',
    description: '',
    category: 'community',
    difficulty: 'beginner',
    duration_days: 7,
    points_base: 100,
    co2_saved: 0,
    impact_description: '',
    validation_type: 'manual',
    validation_description: '',
    steps: [''],
    tips: ['']
  });
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    pendingReview: 0,
    totalParticipants: 0
  });

  // Check admin access - SECURITY: Server-side verification via edge function
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Server-side admin verification - cannot be bypassed by client
        const { data, error } = await supabase.functions.invoke('verify-admin-access');

        if (error || !data?.hasAccess) {
          toast({
            title: 'Hozzáférés megtagadva',
            description: 'Csak adminisztrátorok érhetik el ezt az oldalt.',
            variant: 'destructive'
          });
          navigate('/dashboard');
        } else {
          setHasAdminAccess(true);
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        toast({
          title: 'Hiba',
          description: 'Hiba történt az adminisztrátori jogosultságok ellenőrzése során.',
          variant: 'destructive'
        });
        navigate('/dashboard');
      }
    };

    checkAccess();
  }, [user, navigate, toast]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reload data when a project is selected
    if (selectedProject) {
      loadData(selectedProject.id);
    }
  }, [selectedProject]);

  const loadData = async (forceProjectId?: string) => {
    try {
      setLoading(true);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, slug, region_name, villages, description, is_active, created_at')
        .order('created_at', { ascending: false });

      if (projectsData) {
        setProjects(projectsData as any[]);
      }

      // Load default project setting
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_project')
        .maybeSingle() as { data: any | null };

      if (settingsData && settingsData.value) {
        const valueData = settingsData.value as { project_id: string };
        setDefaultProjectId(valueData.project_id);
      }

      // Load draft challenges (project-specific)
      let draftsCount = 0;
      let pendingCount = 0;
      if (settingsData && settingsData.value) {
        const valueData = settingsData.value as { project_id: string };
        try {
          // @ts-ignore - Complex type inference issue with Supabase
          const draftResult = await supabase
            .from('challenge_definitions')
            .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at')
            .eq('is_active', false)
            .eq('project_id', valueData.project_id)
            .order('created_at', { ascending: false });

          if (draftResult.data) {
            setDraftChallenges(draftResult.data as any);
            draftsCount = draftResult.data.length;
          }
        } catch (e) {
          console.error('Error loading drafts:', e);
        }
      }

      // Load pending challenges
      try {
        // @ts-ignore - Complex type inference issue with Supabase
        const pendingResult = await supabase
          .from('challenge_definitions')
          .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at')
          .eq('is_active', false)
          .is('project_id', null)
          .order('created_at', { ascending: false });

        if (pendingResult.data) {
          setPendingChallenges(pendingResult.data as any);
          pendingCount = pendingResult.data.length;
        }
      } catch (e) {
        console.error('Error loading pending:', e);
      }

      // Load stats
      const { count: totalCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count total participants from profiles
      const { count: participantsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Load active programs (challenge_definitions) filtered by selected project
      try {
        const projectToLoad = forceProjectId || selectedProject?.id || defaultProjectId;
        if (projectToLoad) {
          // @ts-ignore - Complex type inference issue with Supabase
          const activeProgramsResult = await supabase
            .from('challenge_definitions')
            .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at, location, project_id')
            .eq('is_active', true)
            .eq('project_id', projectToLoad)
            .order('created_at', { ascending: false });

          if (activeProgramsResult.data) {
            setActivePrograms(activeProgramsResult.data as any);
          }
        }
      } catch (e) {
        console.error('Error loading active programs:', e);
      }
      
      // Load draft challenges filtered by selected project
      try {
        const projectToLoad = forceProjectId || selectedProject?.id || defaultProjectId;
        if (projectToLoad) {
          // @ts-ignore - Complex type inference issue with Supabase
          const draftsResult = await supabase
            .from('challenge_definitions')
            .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at')
            .eq('is_active', false)
            .eq('project_id', projectToLoad)
            .order('created_at', { ascending: false });

          if (draftsResult.data) {
            setDraftChallenges(draftsResult.data as any);
            draftsCount = draftsResult.data.length;
          }
        }
      } catch (e) {
        console.error('Error loading drafts:', e);
      }

      setStats({
        totalChallenges: totalCount || 0,
        activeChallenges: activeCount || 0,
        pendingReview: pendingCount + draftsCount,
        totalParticipants: participantsCount || 0
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni az adatokat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ is_active: true })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás jóváhagyva',
        description: 'A kihívás mostantól elérhető a felhasználók számára',
      });

      loadData();
    } catch (error) {
      console.error('Error approving challenge:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a kihívást',
        variant: 'destructive'
      });
    }
  };

  const rejectChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás elutasítva',
        description: 'A kihívás törölve lett',
      });

      loadData();
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a kihívást',
        variant: 'destructive'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      energy: 'bg-yellow-500',
      transport: 'bg-blue-500',
      food: 'bg-green-500',
      waste: 'bg-orange-500',
      community: 'bg-purple-500',
      innovation: 'bg-pink-500',
      water: 'bg-cyan-500',
      biodiversity: 'bg-emerald-500',
      'circular-economy': 'bg-indigo-500',
      'green-finance': 'bg-teal-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const createProject = async () => {
    try {
      if (!newProject.name || !newProject.slug || !newProject.region_name) {
        toast({
          title: 'Hiányzó mezők',
          description: 'Kérlek töltsd ki az összes kötelező mezőt',
          variant: 'destructive'
        });
        return;
      }

      const villagesArray = newProject.villages
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          slug: newProject.slug,
          region_name: newProject.region_name,
          villages: villagesArray,
          description: newProject.description || null,
          is_active: true,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Projekt létrehozva',
        description: `A "${newProject.name}" projekt sikeresen létrejött`,
      });

      setNewProject({
        name: '',
        slug: '',
        region_name: '',
        villages: '',
        description: ''
      });
      setShowCreateProject(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Hiba',
        description: error.message || 'Nem sikerült létrehozni a projektet',
        variant: 'destructive'
      });
    }
  };

  const toggleProjectStatus = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: !currentStatus })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Projekt frissítve',
        description: `A projekt státusza megváltozott`,
      });

      loadData();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült frissíteni a projektet',
        variant: 'destructive'
      });
    }
  };

  const setDefaultProject = async (projectId: string) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'default_project')
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('system_settings')
          .update({ value: { project_id: projectId } })
          .eq('key', 'default_project');

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key: 'default_project',
            value: { project_id: projectId }
          });

        if (error) throw error;
      }

      setDefaultProjectId(projectId);
      toast({
        title: 'Alapértelmezett projekt beállítva',
        description: 'Az új felhasználók automatikusan ehhez a projekthez kerülnek',
      });
    } catch (error: any) {
      console.error('Error setting default project:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült beállítani az alapértelmezett projektet',
        variant: 'destructive'
      });
    }
  };

  const createChallenge = async (publish: boolean = false) => {
    try {
      // Validation
      if (!newChallenge.id || !newChallenge.title || !newChallenge.description) {
        toast({
          title: 'Hiányzó mezők',
          description: 'Kérlek töltsd ki az ID, cím és leírás mezőket',
          variant: 'destructive'
        });
        return;
      }

      if (!defaultProjectId) {
        toast({
          title: 'Nincs alapértelmezett projekt',
          description: 'Először állíts be egy alapértelmezett projektet',
          variant: 'destructive'
        });
        return;
      }

      // Filter out empty steps and tips
      const filteredSteps = newChallenge.steps.filter(s => s.trim().length > 0);
      const filteredTips = newChallenge.tips.filter(t => t.trim().length > 0);

      const { error } = await supabase
        .from('challenge_definitions')
        .insert({
          id: newChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          category: newChallenge.category,
          difficulty: newChallenge.difficulty,
          duration_days: newChallenge.duration_days,
          points_base: newChallenge.points_base,
          base_impact: {
            co2_saved: newChallenge.co2_saved,
            description: newChallenge.impact_description
          },
          validation_requirements: {
            type: newChallenge.validation_type,
            description: newChallenge.validation_description,
            steps: filteredSteps,
            tips: filteredTips
          },
          is_active: publish,
          project_id: defaultProjectId
        });

      if (error) throw error;

      toast({
        title: publish ? 'Kihívás közzétéve' : 'Kihívás létrehozva',
        description: publish 
          ? 'A kihívás aktív és elérhető a felhasználók számára' 
          : 'A kihívás draft módban van, később teheted közzé',
      });

      // Reset form
      setNewChallenge({
        id: '',
        title: '',
        description: '',
        category: 'community',
        difficulty: 'beginner',
        duration_days: 7,
        points_base: 100,
        co2_saved: 0,
        impact_description: '',
        validation_type: 'manual',
        validation_description: '',
        steps: [''],
        tips: ['']
      });
      setShowCreateChallenge(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Hiba',
        description: error.message || 'Nem sikerült létrehozni a kihívást',
        variant: 'destructive'
      });
    }
  };

  const publishChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ is_active: true })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás közzétéve',
        description: 'A kihívás mostantól elérhető a felhasználók számára',
      });

      loadData();
    } catch (error: any) {
      console.error('Error publishing challenge:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült közzétenni a kihívást',
        variant: 'destructive'
      });
    }
  };


  const addStep = () => {
    setNewChallenge({
      ...newChallenge,
      steps: [...newChallenge.steps, '']
    });
  };

  const updateStep = (index: number, value: string) => {
    const updatedSteps = [...newChallenge.steps];
    updatedSteps[index] = value;
    setNewChallenge({ ...newChallenge, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      steps: newChallenge.steps.filter((_, i) => i !== index)
    });
  };

  const addTip = () => {
    setNewChallenge({
      ...newChallenge,
      tips: [...newChallenge.tips, '']
    });
  };

  const updateTip = (index: number, value: string) => {
    const updatedTips = [...newChallenge.tips];
    updatedTips[index] = value;
    setNewChallenge({ ...newChallenge, tips: updatedTips });
  };

  const removeTip = (index: number) => {
    setNewChallenge({
      ...newChallenge,
      tips: newChallenge.tips.filter((_, i) => i !== index)
    });
  };

  if (!hasAdminAccess || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a Platformra
        </Button>
        <Badge variant="outline" className="text-lg">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-powered
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedProject 
              ? `${selectedProject.name} - Programok kezelése`
              : 'Projektek és platform statisztikák'
            }
          </p>
        </div>
      </div>

      {/* Show Project Detail View if a project is selected */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          draftChallenges={draftChallenges}
          activePrograms={activePrograms}
          onRefresh={() => loadData(selectedProject.id)}
        />
      ) : (
        <>
          {/* Main tabs for different sections */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="projects">
                <Building2 className="w-4 h-4 mr-2" />
                Projektek
              </TabsTrigger>
              <TabsTrigger value="messages">
                <Mail className="w-4 h-4 mr-2" />
                Üzenetek
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Felhasználók
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Összes Kihívás</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalChallenges}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Aktív Kihívások</CardTitle>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.activeChallenges}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Jóváhagyásra Vár</CardTitle>
                    <Clock className="w-4 h-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingReview}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Résztvevők</CardTitle>
                    <Users className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Projektek</h3>
                    <p className="text-sm text-muted-foreground">Platformon lévő projektek listája</p>
                  </div>
                  <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Új projekt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Új projekt létrehozása</DialogTitle>
                  <DialogDescription>
                    Töltsd ki a projekt alapvető adatait
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Projekt név *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Káli medence"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL-barát azonosító (slug) *</Label>
                    <Input
                      id="slug"
                      value={newProject.slug}
                      onChange={(e) => setNewProject({ ...newProject, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="kali-medence"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Régió név *</Label>
                    <Input
                      id="region"
                      value={newProject.region_name}
                      onChange={(e) => setNewProject({ ...newProject, region_name: e.target.value })}
                      placeholder="Káli medence"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="villages">Falvak (vesszővel elválasztva)</Label>
                    <Input
                      id="villages"
                      value={newProject.villages}
                      onChange={(e) => setNewProject({ ...newProject, villages: e.target.value })}
                      placeholder="Köveskál, Szentbékkálla, Mindszentkálla"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Leírás</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="A projekt részletes leírása..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                    Mégse
                  </Button>
                  <Button onClick={createProject}>
                    Létrehozás
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Még nincsenek projektek</h3>
                  <p className="text-muted-foreground mb-4">Hozd létre az első projektet a platform használatához</p>
                  <Button onClick={() => setShowCreateProject(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Új projekt létrehozása
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Building2 className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                              <Badge variant={project.is_active ? "default" : "secondary"} className="shrink-0">
                                {project.is_active ? "Aktív" : "Inaktív"}
                              </Badge>
                              {defaultProjectId === project.id && (
                                <Badge variant="outline" className="bg-primary/10 shrink-0">
                                  Alapértelmezett
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{project.region_name}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectStatus(project.id, project.is_active);
                          }}
                        >
                          {project.is_active ? "Deaktiválás" : "Aktiválás"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
            </TabsContent>

            <TabsContent value="messages">
              <MessagesManager />
            </TabsContent>

            <TabsContent value="users">
              <UserRoleManager />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

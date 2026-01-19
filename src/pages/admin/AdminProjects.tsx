import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { HungaryMap } from '@/components/admin/HungaryMap';
import { 
  FolderOpen,
  Plus,
  Search,
  MapPin,
  Users,
  Calendar,
  MoreHorizontal,
  Settings,
  Eye,
  Pause,
  Play,
  RefreshCw,
  Edit,
  Trash2,
  Map,
  List
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ProjectDetailModal } from '@/components/admin/modals/ProjectDetailModal';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region_name: string | null;
  is_active: boolean;
  created_at: string;
  user_count?: number;
}

type ProjectStatus = 'active' | 'suspended' | 'archived';

const MOCK_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Káli-medence Közösség', 
    slug: 'kali-medence',
    description: 'A Balaton-felvidék szívében működő fenntartható közösség. Helyi termelők, szakértők és támogatók hálózata.',
    region_name: 'Balaton-felvidék',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    user_count: 156
  },
  { 
    id: 'proj-2', 
    name: 'Zöld Városi Program', 
    slug: 'green-city',
    description: 'Városi fenntarthatósági kezdeményezés Budapest belvárosában.',
    region_name: 'Budapest',
    is_active: true,
    created_at: '2024-03-01T10:00:00Z',
    user_count: 89
  },
  { 
    id: 'proj-3', 
    name: 'Őrségi Hagyományok', 
    slug: 'orseg',
    description: 'Hagyományőrző és természetvédelmi program az Őrség régióban.',
    region_name: 'Őrség',
    is_active: false,
    created_at: '2024-02-20T10:00:00Z',
    user_count: 42
  },
];

const AdminProjects = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleProjectClick = (projectId: string) => {
    navigate(`/admin-panel/projects/${projectId}`);
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    region_name: '',
    is_active: true
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setProjects(MOCK_PROJECTS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Get member counts for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
          return { ...project, user_count: count || 0 };
        })
      );
      
      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(t('admin.projects.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isDemoMode]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Open modal for create/edit
  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        slug: project.slug,
        description: project.description || '',
        region_name: project.region_name || '',
        is_active: project.is_active
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        region_name: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Név és URL azonosító kötelező!');
      return;
    }

    setIsSaving(true);
    try {
      if (isDemoMode) {
        if (editingProject) {
          setProjects(prev => prev.map(p =>
            p.id === editingProject.id
              ? { ...p, ...formData }
              : p
          ));
          toast.success(t('admin.projects.update_success'));
        } else {
          const newProject: Project = {
            id: `mock-${Date.now()}`,
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            region_name: formData.region_name,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
            user_count: 0
          };
          setProjects(prev => [newProject, ...prev]);
          toast.success(t('admin.projects.create_success'));
        }
      } else {
        if (editingProject) {
          const { error } = await supabase
            .from('projects')
            .update({
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
              region_name: formData.region_name,
              is_active: formData.is_active
            })
            .eq('id', editingProject.id);
          if (error) throw error;
          toast.success(t('admin.projects.update_success'));
        } else {
          const { error } = await supabase
            .from('projects')
            .insert({
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
              region_name: formData.region_name,
              is_active: formData.is_active
            });
          if (error) throw error;
          toast.success(t('admin.projects.create_success'));
        }
        fetchProjects();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(t('admin.projects.error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      if (isDemoMode) {
        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        toast.success(t('admin.projects.delete_success'));
      } else {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectToDelete.id);
        if (error) throw error;
        toast.success(t('admin.projects.delete_success'));
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(t('admin.projects.error'));
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const toggleProjectStatus = async (project: Project) => {
    if (isDemoMode) {
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success(project.is_active ? t('admin.projects.suspended') : t('admin.projects.activated'));
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: !project.is_active })
        .eq('id', project.id);

      if (error) throw error;
      
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, is_active: !p.is_active } : p
      ));
      toast.success(project.is_active ? t('admin.projects.suspended') : t('admin.projects.activated'));
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(t('admin.projects.update_error'));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.region_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-emerald-600" />
            {t('admin.projects.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.projects.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchProjects} variant="outline" size="icon">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.projects.add_new')}
          </Button>
        </div>
      </div>

      {/* View Toggle + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Térkép
          </Button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.projects.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <HungaryMap projects={filteredProjects} onProjectClick={handleProjectClick} />
      )}

      {/* Projects Grid */}
      {viewMode === 'list' && (loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('admin.projects.no_projects')}</p>
            <Button onClick={() => openModal()} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.projects.add_new')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                !project.is_active && "opacity-60"
              )}
              onClick={() => { setSelectedProjectId(project.id); setIsDetailModalOpen(true); }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {project.name}
                      <Badge variant={project.is_active ? "default" : "secondary"}>
                        {project.is_active ? t('admin.projects.active') : t('admin.projects.inactive')}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description || t('admin.projects.no_description')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal(project)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('admin.projects.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('admin.projects.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        {t('admin.projects.settings')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleProjectStatus(project)}>
                        {project.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            {t('admin.projects.suspend')}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {t('admin.projects.activate')}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setProjectToDelete(project);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('admin.projects.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {project.region_name && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.region_name}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project.user_count || 0} {t('admin.projects.users')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? t('admin.projects.edit') : t('admin.projects.add_new')}
            </DialogTitle>
            <DialogDescription>
              {editingProject 
                ? 'Módosítsd a projekt adatait az alábbi űrlapon.'
                : 'Hozz létre egy új közösségi projektet.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin.projects.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: editingProject ? formData.slug : generateSlug(e.target.value)
                  });
                }}
                placeholder="pl. Káli-medence Közösség"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('admin.projects.slug')} *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="pl. kali-medence"
              />
              <p className="text-xs text-muted-foreground">
                URL: wellagora.com/{formData.slug || 'projekt-neve'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">{t('admin.projects.region')}</Label>
              <Input
                id="region"
                value={formData.region_name}
                onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                placeholder="pl. Balaton-felvidék"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.projects.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A projekt rövid leírása..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.projects.status')}</Label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(v) => setFormData({ ...formData, is_active: v === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('admin.projects.status_active')}</SelectItem>
                  <SelectItem value="inactive">{t('admin.projects.status_suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('admin.projects.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? '...' : t('admin.projects.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.projects.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.projects.delete_confirm')}
              <br />
              <strong className="text-foreground">{projectToDelete?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.projects.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('admin.projects.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        projectId={selectedProjectId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onSaved={fetchProjects}
      />
    </div>
  );
};

export default AdminProjects;

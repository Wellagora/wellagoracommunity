import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getCountryFlag, getCountryByCode } from '@/lib/countries';
import {
  FolderOpen,
  Plus,
  Search,
  RefreshCw,
  Edit,
  CheckCircle2,
} from 'lucide-react';
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
import { useNavigate, useSearchParams as useRouterSearchParams, useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminOutletContext {
  selectedProjectId: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  user_count?: number;
  country_code?: string | null;
  currency_code?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

type ProjectStatus = 'active' | 'suspended' | 'archived';

type ProjectStatusFilter = 'active' | 'draft' | 'archived';

const AdminProjects = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useRouterSearchParams();
  const { selectedProjectId } = useOutletContext<AdminOutletContext>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('active');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [modalStatus, setModalStatus] = useState<'active' | 'draft' | 'archived'>('active');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    region_name: '',
    is_active: true,
    country_code: 'HU',
    currency_code: 'HUF',
    city: '',
    timezone: 'Europe/Budapest',
  });

  // Handle country change - auto-set currency and timezone
  const handleCountryChange = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    setFormData(prev => ({
      ...prev,
      country_code: countryCode,
      currency_code: country?.defaultCurrency || prev.currency_code,
      timezone: country?.defaultTimezone || prev.timezone,
    }));
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
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

    // Extra refresh to pick up newly created "Teszt Projekt" without reload
    const t = window.setTimeout(() => fetchProjects(), 600);

    const onFocus = () => fetchProjects();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        is_active: project.is_active,
        country_code: project.country_code || 'HU',
        currency_code: project.currency_code || 'HUF',
        city: project.city || '',
        timezone: project.timezone || 'Europe/Budapest',
      });
      setModalStatus(project.is_active ? 'active' : (isDraftProject(project) ? 'draft' : 'archived'));
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        region_name: '',
        is_active: true,
        country_code: 'HU',
        currency_code: 'HUF',
        city: '',
        timezone: 'Europe/Budapest',
      });
      setModalStatus('active');
    }
    setIsModalOpen(true);
  };

  const isDraftProject = (project: Project) => {
    return !project.is_active && (project.region_name || '').startsWith('__draft__:');
  };

  const getProjectStatusLabel = (project: Project) => {
    if (project.is_active) return { label: languageLabel('active'), variant: 'default' as const };
    if (isDraftProject(project)) return { label: languageLabel('draft'), variant: 'outline' as const };
    return { label: languageLabel('archived'), variant: 'secondary' as const };
  };

  const languageLabel = (kind: 'active' | 'archived' | 'draft') => {
    if (kind === 'active') return t('admin.projects.active') || 'Aktív';
    if (kind === 'draft') return t('admin.projects.draft') || 'Piszkozat';
    return t('admin.projects.archived') || 'Archivált';
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Név és URL azonosító kötelező!');
      return;
    }

    const statusIsActive = modalStatus === 'active';
    const baseRegionNameToSave = (formData.region_name || formData.name || '').trim();
    const regionNameToSave = modalStatus === 'draft' ? `__draft__:${baseRegionNameToSave}` : baseRegionNameToSave;

    setIsSaving(true);
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            region_name: regionNameToSave,
            is_active: statusIsActive,
            country_code: formData.country_code,
            currency_code: formData.currency_code,
            city: formData.city,
            timezone: formData.timezone,
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
            region_name: regionNameToSave,
            is_active: statusIsActive,
            country_code: formData.country_code,
            currency_code: formData.currency_code,
            city: formData.city,
            timezone: formData.timezone,
          });
        if (error) throw error;
        toast.success(t('admin.projects.create_success'));
      }

      await fetchProjects();
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);
      if (error) throw error;
      toast.success(t('admin.projects.delete_success'));
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(t('admin.projects.error'));
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const toggleProjectStatus = async (project: Project) => {
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

  const filteredProjects = projects.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'draft' && isDraftProject(p)) ||
      (statusFilter === 'archived' && !p.is_active && !isDraftProject(p));

    return matchesQuery && matchesStatus;
  });

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

      {/* Search + Status */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatusFilter)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Státusz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{languageLabel('active')}</SelectItem>
            <SelectItem value="draft">{languageLabel('draft')}</SelectItem>
            <SelectItem value="archived">{languageLabel('archived')}</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Projects Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-14" />
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Név</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead>Ország</TableHead>
                  <TableHead>Frissítve</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const status = getProjectStatusLabel(project);
                  const countryName = project.country_code ? getCountryByCode(project.country_code)?.name : null;
                  const updated = project.updated_at || project.created_at;

                  return (
                    <TableRow
                      key={project.id}
                      className={cn(
                        "cursor-pointer",
                        selectedProjectId === project.id && "bg-emerald-50 dark:bg-emerald-950"
                      )}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('project', project.id);
                        setSearchParams(newParams);
                        navigate(`/admin?project=${project.id}`);
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 truncate">
                          {selectedProjectId === project.id && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          )}
                          {project.name || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {project.country_code ? (
                          <span>
                            {getCountryFlag(project.country_code)} {countryName || project.country_code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {updated ? new Date(updated).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(project);
                          }}
                          title={t('admin.projects.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t('admin.projects.slug')} *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="project-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.projects.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A projekt rövid leírása..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('admin.projects.status')}</Label>
              <Select
                value={modalStatus}
                onValueChange={(v) => setModalStatus(v as 'active' | 'draft' | 'archived')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{languageLabel('draft')}</SelectItem>
                  <SelectItem value="active">{languageLabel('active')}</SelectItem>
                  <SelectItem value="archived">{languageLabel('archived')}</SelectItem>
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
    </div>
  );
};

export default AdminProjects;

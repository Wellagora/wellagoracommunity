import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

const MOCK_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Káli-medence Közösség', 
    slug: 'kali-medence',
    description: 'A Balaton-felvidék szívében működő fenntartható közösség',
    region_name: 'Balaton-felvidék',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    user_count: 156
  },
  { 
    id: 'proj-2', 
    name: 'Zöld Városi Program', 
    slug: 'green-city',
    description: 'Városi fenntarthatósági kezdeményezés',
    region_name: 'Budapest',
    is_active: true,
    created_at: '2024-03-01T10:00:00Z',
    user_count: 89
  },
  { 
    id: 'proj-3', 
    name: 'Őrségi Hagyományok', 
    slug: 'orseg',
    description: 'Hagyományőrző és természetvédelmi program',
    region_name: 'Őrség',
    is_active: false,
    created_at: '2024-02-20T10:00:00Z',
    user_count: 42
  },
];

const AdminProjects = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      setProjects(data || []);
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.projects.create')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.projects.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className={cn(
                "hover:shadow-md transition-shadow",
                !project.is_active && "opacity-60"
              )}
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
                    <CardDescription className="mt-1">
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
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('admin.projects.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        {t('admin.projects.settings')}
                      </DropdownMenuItem>
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
    </div>
  );
};

export default AdminProjects;
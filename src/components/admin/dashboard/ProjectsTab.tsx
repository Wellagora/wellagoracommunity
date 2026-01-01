import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Lightbulb } from 'lucide-react';
import { AdminStatsCards } from './AdminStatsCards';
import { CreateProjectDialog } from './CreateProjectDialog';
import type { Project, AdminStats } from '@/hooks/useAdminDashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface WaitlistContent {
  id: string;
  title: string;
  count: number;
}

interface ProjectsTabProps {
  projects: Project[];
  stats: AdminStats;
  defaultProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onToggleProjectStatus: (projectId: string, currentStatus: boolean) => void;
  onRefresh: () => void;
}

export const ProjectsTab = ({
  projects,
  stats,
  defaultProjectId,
  onSelectProject,
  onToggleProjectStatus,
  onRefresh,
}: ProjectsTabProps) => {
  const { t } = useLanguage();
  const [totalWaitlist, setTotalWaitlist] = useState(0);
  const [topWaitlistContents, setTopWaitlistContents] = useState<WaitlistContent[]>([]);

  useEffect(() => {
    const loadWaitlistData = async () => {
      // Total waitlist count
      const { count } = await supabase
        .from('content_waitlist')
        .select('*', { count: 'exact', head: true });
      setTotalWaitlist(count || 0);

      // Top contents with waitlist
      const { data } = await supabase
        .from('content_waitlist')
        .select('content_id');
      
      if (data && data.length > 0) {
        // Group by content_id
        const counts = data.reduce((acc: Record<string, number>, item) => {
          acc[item.content_id] = (acc[item.content_id] || 0) + 1;
          return acc;
        }, {});

        // Sort and get top 5
        const topIds = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, count]) => ({ id, count }));

        if (topIds.length > 0) {
          // Fetch titles
          const { data: contents } = await supabase
            .from('expert_contents')
            .select('id, title')
            .in('id', topIds.map(t => t.id));

          const result = topIds.map(t => ({
            id: t.id,
            count: t.count,
            title: contents?.find(c => c.id === t.id)?.title || 'Ismeretlen'
          }));

          setTopWaitlistContents(result);
        }
      }
    };

    loadWaitlistData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AdminStatsCards stats={stats} />
        </div>
        
        {/* Waitlist Stats Card */}
        <Card className="p-5 border-amber-500/50 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWaitlist}</p>
              <p className="text-sm text-muted-foreground">{t('admin.total_waitlist')}</p>
            </div>
          </div>
          
          {topWaitlistContents.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-amber-600">{t('admin.top_waitlist')}</p>
              {topWaitlistContents.map(c => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">{c.title}</span>
                  <Badge variant="outline" className="text-amber-600">{c.count}</Badge>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-amber-600 mt-4 flex items-center">
            <Lightbulb className="h-3 w-3 inline mr-1" />
            {t('admin.waitlist_sponsor_hint')}
          </p>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Projektek</h3>
            <p className="text-sm text-muted-foreground">Platformon lévő projektek listája</p>
          </div>
          <CreateProjectDialog onSuccess={onRefresh} />
        </div>

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Még nincsenek projektek</h3>
                <p className="text-muted-foreground mb-4">Hozd létre az első projektet a platform használatához</p>
                <CreateProjectDialog onSuccess={onRefresh} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onSelectProject(project)}
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
                          onToggleProjectStatus(project.id, project.is_active);
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
    </div>
  );
};
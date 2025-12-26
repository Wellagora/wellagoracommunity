import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';
import { AdminStatsCards } from './AdminStatsCards';
import { CreateProjectDialog } from './CreateProjectDialog';
import type { Project, AdminStats } from '@/hooks/useAdminDashboard';

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
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <AdminStatsCards stats={stats} />

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

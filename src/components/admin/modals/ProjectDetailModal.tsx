import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, MapPin, Users, FolderOpen, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region_name: string | null;
  is_active: boolean;
  created_at: string | null;
}

interface ProjectStats {
  program_count: number;
  event_count: number;
  sponsor_count: number;
}

export function ProjectDetailModal(props: {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { projectId, open, onOpenChange, onSaved } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [stats, setStats] = useState<ProjectStats>({ program_count: 0, event_count: 0, sponsor_count: 0 });
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const safeCount = async (table: string, column: string, value: string) => {
    const res = await supabase.from(table).select("*", { count: "exact", head: true }).eq(column, value);
    if (res.error) throw res.error;
    return res.count || 0;
  };

  const safeSelect = async <T,>(table: string, columns: string, filters: (q: any) => any) => {
    const q = supabase.from(table).select(columns);
    const res = await filters(q);
    if (res.error) throw res.error;
    return (res.data as T[]) || [];
  };

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setIsEditing(false);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      setProject((data as ProjectRow) || null);

      // Load overview stats (read-only)
      setStatsUnavailable(false);
      try {
        // Programs: expert_contents.region_id is the project link in this schema
        let programCount = 0;
        let programIds: string[] = [];
        try {
          programCount = await safeCount("expert_contents", "region_id", projectId);
          const programRows = await safeSelect<{ id: string }>("expert_contents", "id", (q) => q.eq("region_id", projectId).limit(500));
          programIds = programRows.map((r) => r.id).filter(Boolean);
        } catch (e: any) {
          throw e;
        }

        // Events: use events.project_id (confirmed in schema)
        let eventCount = 0;
        try {
          eventCount = await safeCount("events", "project_id", projectId);
        } catch (e: any) {
          throw e;
        }

        // Sponsors: content_sponsorships where content_id in project programs -> unique sponsor_id
        let sponsorCount = 0;
        try {
          if (programIds.length > 0) {
            const sponsorshipRows = await safeSelect<{ sponsor_id: string }>(
              "content_sponsorships",
              "sponsor_id",
              (q) => q.in("content_id", programIds).not("sponsor_id", "is", null)
            );
            sponsorCount = new Set(sponsorshipRows.map((r) => r.sponsor_id).filter(Boolean)).size;
          }
        } catch {
          sponsorCount = 0;
        }

        setStats({ program_count: programCount, event_count: eventCount, sponsor_count: sponsorCount });
      } catch {
        setStatsUnavailable(true);
        setStats({ program_count: 0, event_count: 0, sponsor_count: 0 });
      }
    } catch (e: any) {
      console.error("[ProjectDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a projektet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const save = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          slug: project.slug,
          description: project.description,
          region_name: project.region_name,
          is_active: project.is_active,
        })
        .eq("id", project.id)
        .select("*")
        .single();
      if (error) throw error;
      toast.success("Mentve!");
      setIsEditing(false);
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)
        .select("*")
        .maybeSingle();
      if (error) throw error;

      toast.success("Projekt törölve!");
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Törlés sikertelen");
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const goToProjectHub = () => {
    onOpenChange(false);
    navigate(`/admin/projects/${projectId}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projekt részletek
            </DialogTitle>
          </DialogHeader>

          {!projectId ? (
            <div>Hiányzó azonosító</div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : !project ? (
            <div>Nincs találat</div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label>Projekt neve</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => setProject({ ...project, name: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="font-semibold text-lg">{project.name}</div>
                  )}
                </div>
                {!isEditing && (
                  <Badge variant={project.is_active ? "default" : "secondary"}>
                    {project.is_active ? "Aktív" : "Inaktív"}
                  </Badge>
                )}
              </div>

              <Separator />

              {isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>URL azonosító (slug)</Label>
                    <Input
                      value={project.slug}
                      onChange={(e) => setProject({ ...project, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Régió</Label>
                    <Input
                      value={project.region_name || ""}
                      onChange={(e) => setProject({ ...project, region_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-3 pt-6">
                    <Switch
                      checked={project.is_active}
                      onCheckedChange={(v) => setProject({ ...project, is_active: v })}
                    />
                    <Label>Aktív</Label>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Leírás</Label>
                    <Textarea
                      value={project.description || ""}
                      onChange={(e) => setProject({ ...project, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats cards */}
                  <div>
                    <div className="font-medium mb-2">Project overview</div>
                    {statsUnavailable ? (
                      <div className="text-sm text-muted-foreground">No data available</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <FolderOpen className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                          <div className="text-2xl font-bold">{stats.program_count}</div>
                          <div className="text-xs text-muted-foreground">Programs</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <Calendar className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                          <div className="text-2xl font-bold">{stats.event_count}</div>
                          <div className="text-xs text-muted-foreground">Events</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                          <div className="text-2xl font-bold">{stats.sponsor_count}</div>
                          <div className="text-xs text-muted-foreground">Sponsors</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info display */}
                  <div className="grid gap-2">
                    {project.region_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Régió:</span>
                        <span className="font-medium">{project.region_name}</span>
                      </div>
                    )}
                    {project.created_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Létrehozva:</span>
                        <span className="font-medium">{format(new Date(project.created_at), "yyyy.MM.dd", { locale: hu })}</span>
                      </div>
                    )}
                  </div>

                  {project.description && (
                    <>
                      <Separator />
                      <div>
                        <div className="font-medium mb-1">Leírás</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</div>
                      </div>
                    </>
                  )}

                  {/* Project Hub CTA - will be enabled in Phase 2 */}
                  {/* <Separator />
                  <Button onClick={goToProjectHub} className="w-full">
                    Projekt Hub megnyitása <ArrowRight className="h-4 w-4 ml-2" />
                  </Button> */}
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>Mégse</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Mentés..." : "Mentés"}</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Bezárás</Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>Szerkesztés</Button>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={saving}>
                  <Trash2 className="h-4 w-4 mr-1" /> Törlés
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a <strong>{project?.name}</strong> projektet? Ez a művelet nem visszavonható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  FolderKanban,
  Users,
  Target,
  Building2,
  MapPin,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

type ProjectWithStats = {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  user_count: number;
  program_count: number;
  organization_count: number;
  is_default: boolean;
};

const projectSchema = z.object({
  name: z.string().min(3, { message: "Név minimum 3 karakter" }).max(100),
  slug: z.string().min(3, { message: "Slug minimum 3 karakter" }).max(50),
  region_name: z.string().min(2, { message: "Régió név kötelező" }).max(100),
  villages: z.string(),
  description: z.string().max(500).optional(),
});

const ProjectsManager = () => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    region_name: "",
    villages: "",
    description: "",
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalPrograms: 0,
    totalParticipants: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch default project from system settings
      const { data: settingsData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "default_project")
        .maybeSingle();

      const defaultProjectId = settingsData?.value ? (settingsData.value as any).project_id : null;

      // Fetch counts for each project
      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const [usersRes, programsRes, orgsRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
            supabase
              .from("challenge_definitions")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
            supabase
              .from("organizations")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
          ]);

          return {
            id: project.id,
            name: project.name,
            slug: project.slug,
            region_name: project.region_name,
            villages: project.villages || [],
            description: project.description,
            is_active: project.is_active ?? true,
            created_at: project.created_at!,
            user_count: usersRes.count || 0,
            program_count: programsRes.count || 0,
            organization_count: orgsRes.count || 0,
            is_default: project.id === defaultProjectId,
          };
        })
      );

      setProjects(projectsWithStats);

      // Calculate overall stats
      const active = projectsWithStats.filter((p) => p.is_active);
      const totalPrograms = projectsWithStats.reduce((sum, p) => sum + p.program_count, 0);
      const totalParticipants = projectsWithStats.reduce((sum, p) => sum + p.user_count, 0);

      setStats({
        totalProjects: projectsWithStats.length,
        activeProjects: active.length,
        totalPrograms,
        totalParticipants,
      });
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Hiba a projektek betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áà]/g, "a")
      .replace(/[éè]/g, "e")
      .replace(/[íì]/g, "i")
      .replace(/[óòö]/g, "o")
      .replace(/[úùüű]/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleCreateProject = async () => {
    try {
      const villagesArray = formData.villages
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const validated = projectSchema.parse({
        name: formData.name,
        slug: formData.slug,
        region_name: formData.region_name,
        villages: formData.villages,
        description: formData.description,
      });

      const { error } = await supabase.from("projects").insert({
        name: validated.name,
        slug: validated.slug,
        region_name: validated.region_name,
        villages: villagesArray,
        description: validated.description || null,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Projekt létrehozva");
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        slug: "",
        region_name: "",
        villages: "",
        description: "",
      });
      loadData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Error creating project:", error);
        toast.error("Hiba a projekt létrehozásakor");
      }
    }
  };

  const handleToggleActive = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_active: !currentStatus })
        .eq("id", projectId);

      if (error) throw error;

      toast.success(currentStatus ? "Projekt deaktiválva" : "Projekt aktiválva");
      loadData();
    } catch (error) {
      console.error("Error toggling project status:", error);
      toast.error("Hiba a projekt státusz váltásakor");
    }
  };

  const handleSetDefault = async (projectId: string) => {
    try {
      // Check if default_project setting exists
      const { data: existing } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", "default_project")
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("system_settings")
          .update({ value: { project_id: projectId } })
          .eq("key", "default_project");

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from("system_settings").insert({
          key: "default_project",
          value: { project_id: projectId },
        });

        if (error) throw error;
      }

      toast.success("Alapértelmezett projekt beállítva");
      loadData();
    } catch (error) {
      console.error("Error setting default project:", error);
      toast.error("Hiba az alapértelmezett projekt beállításakor");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projektek</h2>
          <p className="text-muted-foreground">Összes projekt kezelése</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új projekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Új projekt létrehozása</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Projekt név *</Label>
                <Input
                  placeholder="Kali Medence"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  placeholder="kali-medence"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Régió név *</Label>
                <Input
                  placeholder="Kali-medence"
                  value={formData.region_name}
                  onChange={(e) =>
                    setFormData({ ...formData, region_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Települések (vesszővel elválasztva)</Label>
                <Input
                  placeholder="Köveskál, Mindszentkálla, Szentbékkálla, Monoszló"
                  value={formData.villages}
                  onChange={(e) => setFormData({ ...formData, villages: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Leírás</Label>
                <Textarea
                  placeholder="Projekt leírása..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={500}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Mégse
              </Button>
              <Button onClick={handleCreateProject}>Létrehozás</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes projekt</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív projektek</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes program</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes résztvevő</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nincs megjeleníthető projekt</p>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="bg-card/30 backdrop-blur border-border/50 hover:bg-card/40 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      {project.name}
                      {project.is_default && (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {project.region_name}
                    </div>
                  </div>
                  <Badge variant={project.is_active ? "default" : "outline"}>
                    {project.is_active ? "Aktív" : "Inaktív"}
                  </Badge>
                </div>
                
                {project.villages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.villages.map((village, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {village}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{project.user_count}</p>
                    <p className="text-xs text-muted-foreground">Felhasználó</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{project.program_count}</p>
                    <p className="text-xs text-muted-foreground">Program</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{project.organization_count}</p>
                    <p className="text-xs text-muted-foreground">Szervezet</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="h-3 w-3" />
                  Létrehozva: {format(new Date(project.created_at), "yyyy. MM. dd.")}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Kezelés
                  </Button>
                  <Button
                    variant={project.is_active ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(project.id, project.is_active)}
                  >
                    {project.is_active ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Deaktiválás
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aktiválás
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSetDefault(project.id)}
                  disabled={project.is_default}
                >
                  <Star className="h-4 w-4 mr-1" />
                  {project.is_default ? "Alapértelmezett" : "Beállítás alapértelmezettként"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Összesen: {projects.length} projekt
      </div>
    </div>
  );
};

export default ProjectsManager;

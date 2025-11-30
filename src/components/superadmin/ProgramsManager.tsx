import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Target,
  CheckCircle,
  Edit,
  Copy,
  Trash2,
  Award,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { ProgramCreator } from "@/components/admin/ProgramCreator";
import { ProgramEditor } from "@/components/admin/ProgramEditor";

type ProgramWithDetails = {
  id: string;
  title: string;
  image_url: string | null;
  project_id: string | null;
  project_name: string | null;
  category: string;
  difficulty: string;
  points_base: number;
  is_active: boolean;
  sponsor_name: string | null;
  created_at: string;
};

const ProgramsManager = () => {
  const [programs, setPrograms] = useState<ProgramWithDetails[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sponsorFilter, setSponsorFilter] = useState<string>("all");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    sponsoredPrograms: 0,
    completions: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from("challenge_definitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (programsError) throw programsError;

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name");

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch sponsorships
      const { data: sponsorshipsData, error: sponsorshipsError } = await supabase
        .from("challenge_sponsorships")
        .select("challenge_id, sponsor_user_id, status");

      if (sponsorshipsError) throw sponsorshipsError;

      // Fetch sponsor profiles
      const sponsorUserIds = [...new Set(sponsorshipsData?.map((s) => s.sponsor_user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, organization")
        .in("id", sponsorUserIds);

      // Merge data
      const mergedData: ProgramWithDetails[] = (programsData || []).map((program) => {
        const project = projectsData?.find((p) => p.id === program.project_id);
        const sponsorship = sponsorshipsData?.find(
          (s) => s.challenge_id === program.id && s.status === "active"
        );
        const sponsor = sponsorship
          ? profilesData?.find((p) => p.id === sponsorship.sponsor_user_id)
          : null;

        return {
          id: program.id,
          title: program.title,
          image_url: program.image_url,
          project_id: program.project_id,
          project_name: project?.name || null,
          category: program.category,
          difficulty: program.difficulty,
          points_base: program.points_base,
          is_active: program.is_active ?? true,
          sponsor_name: sponsor
            ? sponsor.organization || `${sponsor.first_name} ${sponsor.last_name}`
            : null,
          created_at: program.created_at,
        };
      });

      setPrograms(mergedData);

      // Calculate stats
      const active = mergedData.filter((p) => p.is_active);
      const sponsored = mergedData.filter((p) => p.sponsor_name);

      const { count: completionsCount } = await supabase
        .from("challenge_completions")
        .select("*", { count: "exact", head: true });

      setStats({
        totalPrograms: mergedData.length,
        activePrograms: active.length,
        sponsoredPrograms: sponsored.length,
        completions: completionsCount || 0,
      });
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Hiba a programok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Kezdő</Badge>;
      case "intermediate":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Haladó</Badge>;
      case "advanced":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Profi</Badge>;
      case "expert":
        return <Badge variant="destructive">Szakértő</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      transport: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      energy: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      waste: "bg-green-500/10 text-green-600 border-green-500/20",
      water: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      food: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      community: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const handleToggleActive = async (programId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("challenge_definitions")
        .update({ is_active: !currentStatus })
        .eq("id", programId);

      if (error) throw error;

      toast.success(currentStatus ? "Program deaktiválva" : "Program aktiválva");
      loadData();
    } catch (error) {
      console.error("Error toggling program status:", error);
      toast.error("Hiba a program státusz váltásakor");
    }
  };

  const handleDuplicate = async (programId: string) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from("challenge_definitions")
        .select("*")
        .eq("id", programId)
        .single();

      if (fetchError) throw fetchError;

      const { error: insertError } = await supabase.from("challenge_definitions").insert({
        id: `${original.id}-copy-${Date.now()}`,
        title: `${original.title} (Másolat)`,
        description: original.description,
        category: original.category,
        difficulty: original.difficulty,
        points_base: original.points_base,
        base_impact: original.base_impact,
        duration_days: original.duration_days,
        image_url: original.image_url,
        location: original.location,
        project_id: original.project_id,
        translations: original.translations,
        validation_requirements: original.validation_requirements,
        is_continuous: original.is_continuous,
        is_team_challenge: original.is_team_challenge,
        min_team_size: original.min_team_size,
        max_team_size: original.max_team_size,
        is_active: false,
      });

      if (insertError) throw insertError;

      toast.success("Program másolva");
      loadData();
    } catch (error) {
      console.error("Error duplicating program:", error);
      toast.error("Hiba a program másolásakor");
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a programot?")) return;

    try {
      const { error } = await supabase
        .from("challenge_definitions")
        .delete()
        .eq("id", programId);

      if (error) throw error;

      toast.success("Program törölve");
      loadData();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Hiba a program törlésekor");
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject =
      projectFilter === "all" || program.project_id === projectFilter;
    const matchesCategory =
      categoryFilter === "all" || program.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && program.is_active) ||
      (statusFilter === "inactive" && !program.is_active);
    const matchesSponsor =
      sponsorFilter === "all" ||
      (sponsorFilter === "sponsored" && program.sponsor_name) ||
      (sponsorFilter === "not_sponsored" && !program.sponsor_name);

    return (
      matchesSearch &&
      matchesProject &&
      matchesCategory &&
      matchesStatus &&
      matchesSponsor
    );
  });

  // Get unique categories
  const uniqueCategories = Array.from(new Set(programs.map((p) => p.category)));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programok</h2>
          <p className="text-muted-foreground">Összes program kezelése</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Új program létrehozása</DialogTitle>
            </DialogHeader>
            <ProgramCreator 
              defaultProjectId={projectFilter !== "all" ? projectFilter : projects[0]?.id || ""}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadData();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes program</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív programok</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePrograms}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Szponzorált</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sponsoredPrograms}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teljesítések</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Keresés cím szerint..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Projekt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes projekt</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes kategória</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Státusz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes</SelectItem>
            <SelectItem value="active">Aktív</SelectItem>
            <SelectItem value="inactive">Inaktív</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Szponzorálás" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes</SelectItem>
            <SelectItem value="sponsored">Szponzorált</SelectItem>
            <SelectItem value="not_sponsored">Nem szponzorált</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card/30 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kép</TableHead>
              <TableHead>Cím</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead>Nehézség</TableHead>
              <TableHead>Pontok</TableHead>
              <TableHead>Státusz</TableHead>
              <TableHead>Szponzor</TableHead>
              <TableHead>Létrehozva</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nincs megjeleníthető program
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage src={program.image_url || undefined} />
                      <AvatarFallback className="rounded-md">
                        <Target className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell>{program.project_name || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(program.category)}>
                      {program.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(program.difficulty)}</TableCell>
                  <TableCell>{program.points_base}</TableCell>
                  <TableCell>
                    {program.is_active ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        Aktív
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inaktív</Badge>
                    )}
                  </TableCell>
                  <TableCell>{program.sponsor_name || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(program.created_at), "yyyy. MM. dd.")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProgramId(program.id);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(program.id, program.is_active)}
                      >
                        {program.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(program.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Összesen: {filteredPrograms.length} program
      </div>

      {/* Edit Dialog */}
      {selectedProgramId && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Program szerkesztése</DialogTitle>
            </DialogHeader>
            <ProgramEditor
              programId={selectedProgramId}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedProgramId(null);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProgramsManager;

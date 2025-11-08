import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Users, Building2, Settings, Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function ProjectAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setProjects(data || []);
      
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        loadMembers(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (projectId: string) => {
    try {
      const { data: membersData, error } = await supabase
        .from("project_members")
        .select("id, user_id, role")
        .eq("project_id", projectId);

      if (error) throw error;

      if (!membersData) {
        setMembers([]);
        return;
      }

      // Fetch profiles separately
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combined = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          ...member,
          profiles: profile || { email: "", first_name: "", last_name: "" }
        };
      });

      setMembers(combined as any);
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinAsAdmin = async () => {
    if (!selectedProject || !user) return;

    try {
      const { error } = await supabase
        .from("project_members")
        .insert({
          project_id: selectedProject.id,
          user_id: user.id,
          role: "admin",
        });

      if (error) throw error;

      toast({
        title: "Sikeres",
        description: "Sikeresen csatlakoztál projekt adminként!",
      });

      loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMember = async () => {
    if (!selectedProject || !newMemberEmail) return;

    try {
      // Find user by email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newMemberEmail)
        .maybeSingle();

      if (profileError || !profileData) throw new Error("Felhasználó nem található ezzel az email címmel");

      // Add as member
      const { error } = await supabase
        .from("project_members")
        .insert({
          project_id: selectedProject.id,
          user_id: profileData.id,
          role: "member",
        });

      if (error) throw error;

      toast({
        title: "Sikeres",
        description: "Tag sikeresen hozzáadva!",
      });

      setNewMemberEmail("");
      loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Sikeres",
        description: "Tag eltávolítva!",
      });

      loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isCurrentUserAdmin = members.some(
    (m) => m.user_id === user?.id && m.role === "admin"
  );

  const isCurrentUserMember = members.some((m) => m.user_id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-14 sm:mt-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Projekt Adminisztráció</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kezeld a projekteket és a tagokat
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nincs elérhető projekt</CardTitle>
              <CardDescription>
                Jelenleg nincsenek aktív projektek a rendszerben.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {/* Project Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Projektek
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedProject(project);
                      loadMembers(project.id);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg">{project.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {project.region_name}
                        </p>
                        {project.villages && project.villages.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.villages.map((village, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {village}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant={project.is_active ? "default" : "secondary"} className="text-xs">
                        {project.is_active ? "Aktív" : "Inaktív"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Project Details */}
            {selectedProject && (
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="members" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Tagok</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Beállítások</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-3 sm:space-y-4">
                  {!isCurrentUserMember && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Csatlakozás a projekthez</CardTitle>
                        <CardDescription>
                          Csatlakozz a projekthez projekt adminként
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={joinAsAdmin}>
                          <Plus className="h-4 w-4 mr-2" />
                          Csatlakozás adminként
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Projekt tagok</CardTitle>
                      <CardDescription>
                        A projekthez tartozó felhasználók
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {members.length === 0 ? (
                        <p className="text-sm sm:text-base text-muted-foreground">Még nincsenek tagok</p>
                      ) : (
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm sm:text-base">
                                  {member.profiles.first_name} {member.profiles.last_name}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground break-all">
                                  {member.profiles.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                                  {member.role === "admin" ? "Admin" : "Tag"}
                                </Badge>
                                {isCurrentUserAdmin && member.user_id !== user?.id && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeMember(member.id)}
                                    className="text-xs"
                                  >
                                    Eltávolítás
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isCurrentUserAdmin && (
                        <div className="pt-4 border-t space-y-3 sm:space-y-4">
                          <Label className="text-sm sm:text-base">Új tag hozzáadása</Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder="Email cím"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              className="text-sm sm:text-base"
                            />
                            <Button onClick={addMember} className="w-full sm:w-auto text-sm">
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Hozzáadás
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Projekt beállítások</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        A projekt alapvető információi
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-sm sm:text-base">Projekt név</Label>
                        <p className="text-base sm:text-lg font-semibold">{selectedProject.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm sm:text-base">Régió</Label>
                        <p className="text-sm sm:text-base">{selectedProject.region_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm sm:text-base">Leírás</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedProject.description || "Nincs leírás"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

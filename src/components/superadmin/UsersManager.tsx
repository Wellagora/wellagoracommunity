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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Eye,
  Building2,
  Users as UsersIcon,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

type UserWithDetails = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  user_role: string;
  app_role: string | null;
  organization_id: string | null;
  organization_name: string | null;
  project_id: string | null;
  project_name: string | null;
  created_at: string;
};

const UsersManager = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [appRoleFilter, setAppRoleFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  
  const [roleFormData, setRoleFormData] = useState({
    app_role: "",
    project_id: "",
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    adminCount: 0,
    orgUsers: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("id, name");

      if (orgsError) throw orgsError;
      setOrganizations(orgsData || []);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name");

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Merge data
      const mergedData: UserWithDetails[] = (profilesData || []).map((profile) => {
        const userRole = rolesData?.find((r) => r.user_id === profile.id);
        const org = orgsData?.find((o) => o.id === profile.organization_id);
        const project = projectsData?.find((p) => p.id === profile.project_id);

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          user_role: profile.user_role,
          app_role: userRole?.role || null,
          organization_id: profile.organization_id,
          organization_name: org?.name || null,
          project_id: profile.project_id,
          project_name: project?.name || null,
          created_at: profile.created_at,
        };
      });

      setUsers(mergedData);

      // Calculate stats
      const thirtyDaysAgo = subDays(new Date(), 30);
      const newUsers = mergedData.filter(
        (u) => new Date(u.created_at) > thirtyDaysAgo
      );
      const admins = mergedData.filter(
        (u) => u.app_role === "super_admin" || u.app_role === "admin"
      );
      const orgUsers = mergedData.filter((u) => u.organization_id !== null);

      setStats({
        totalUsers: mergedData.length,
        newUsers: newUsers.length,
        adminCount: admins.length,
        orgUsers: orgUsers.length,
      });
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Hiba a felhasználók betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case "citizen":
        return <Badge variant="outline">Állampolgár</Badge>;
      case "business":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Vállalkozás</Badge>;
      case "government":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Önkormányzat</Badge>;
      case "ngo":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Civil</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getAppRoleBadge = (role: string | null) => {
    if (!role) return null;
    switch (role) {
      case "super_admin":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "project_admin":
        return <Badge variant="secondary">Projekt Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleOpenRoleDialog = (user: UserWithDetails) => {
    setSelectedUser(user);
    setRoleFormData({
      app_role: user.app_role || "",
      project_id: user.project_id || "",
    });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    try {
      // If no role selected, delete existing role
      if (!roleFormData.app_role) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedUser.id);

        if (error) throw error;
        toast.success("Szerepkör törölve");
      } else {
        // Check if user already has a role
        const { data: existing } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", selectedUser.id)
          .maybeSingle();

        if (existing) {
          // Update existing role
          const { error } = await supabase
            .from("user_roles")
            .update({ role: roleFormData.app_role as any })
            .eq("user_id", selectedUser.id);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase.from("user_roles").insert({
            user_id: selectedUser.id,
            role: roleFormData.app_role as any,
            assigned_by: (await supabase.auth.getUser()).data.user?.id || null,
          });

          if (error) throw error;
        }

        toast.success("Szerepkör mentve");
      }

      setIsRoleDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Hiba a szerepkör mentésekor");
    }
  };

  const handleAssignOrganization = async (organizationId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ organization_id: organizationId })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Felhasználó szervezethez rendelve");
      setIsOrgDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error assigning organization:", error);
      toast.error("Hiba a szervezethez rendelésnél");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUserRole = userRoleFilter === "all" || user.user_role === userRoleFilter;
    const matchesAppRole =
      appRoleFilter === "all" ||
      (appRoleFilter === "none" && !user.app_role) ||
      user.app_role === appRoleFilter;
    const matchesProject =
      projectFilter === "all" || user.project_id === projectFilter;

    return matchesSearch && matchesUserRole && matchesAppRole && matchesProject;
  });

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
          <h2 className="text-3xl font-bold tracking-tight">Felhasználók</h2>
          <p className="text-muted-foreground">
            Összes felhasználó és szerepkör kezelése
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes felhasználó</CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Új felhasználók (30 nap)</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adminok</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Szervezeti felhasználók</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Keresés név vagy email szerint..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Szerepkör" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes szerepkör</SelectItem>
            <SelectItem value="citizen">Állampolgár</SelectItem>
            <SelectItem value="business">Vállalkozás</SelectItem>
            <SelectItem value="government">Önkormányzat</SelectItem>
            <SelectItem value="ngo">Civil</SelectItem>
          </SelectContent>
        </Select>
        <Select value={appRoleFilter} onValueChange={setAppRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="App szerepkör" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="project_admin">Projekt Admin</SelectItem>
            <SelectItem value="none">Nincs app szerepkör</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card/30 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Szerepkör</TableHead>
              <TableHead>App szerepkör</TableHead>
              <TableHead>Szervezet</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Regisztráció</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nincs megjeleníthető felhasználó
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getUserRoleBadge(user.user_role)}</TableCell>
                  <TableCell>{getAppRoleBadge(user.app_role)}</TableCell>
                  <TableCell>{user.organization_name || "-"}</TableCell>
                  <TableCell>{user.project_name || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "yyyy. MM. dd.")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Szerepkör
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsProfileDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsOrgDialogOpen(true);
                        }}
                      >
                        <Building2 className="h-4 w-4" />
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
        Összesen: {filteredUsers.length} felhasználó
      </div>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Szerepkör kezelése</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Felhasználó: {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>
              <div className="space-y-2">
                <Label>App szerepkör</Label>
                <Select
                  value={roleFormData.app_role}
                  onValueChange={(value) =>
                    setRoleFormData({ ...roleFormData, app_role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz szerepkört" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nincs (töröl)</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="project_admin">Projekt Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {roleFormData.app_role === "project_admin" && (
                <div className="space-y-2">
                  <Label>Projekt</Label>
                  <Select
                    value={roleFormData.project_id}
                    onValueChange={(value) =>
                      setRoleFormData({ ...roleFormData, project_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz projektet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={handleSaveRole}>Mentés</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Felhasználói profil</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.first_name[0]}
                    {selectedUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Szerepkör</p>
                <div className="mt-1">{getUserRoleBadge(selectedUser.user_role)}</div>
              </div>
              {selectedUser.app_role && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    App szerepkör
                  </p>
                  <div className="mt-1">{getAppRoleBadge(selectedUser.app_role)}</div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Szervezet</p>
                <p>{selectedUser.organization_name || "Nincs"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projekt</p>
                <p>{selectedUser.project_name || "Nincs"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Regisztráció dátuma
                </p>
                <p>{format(new Date(selectedUser.created_at), "yyyy. MM. dd. HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Organization Assignment Dialog */}
      <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Szervezethez rendelés</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Felhasználó: {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Szervezet</Label>
                <Select onValueChange={handleAssignOrganization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz szervezetet" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;

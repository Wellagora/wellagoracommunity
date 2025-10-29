import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
}

export default function JoinProjectPage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Registration form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState<"citizen" | "business" | "ngo" | "government">("citizen");

  useEffect(() => {
    loadProject();
  }, [projectSlug]);

  useEffect(() => {
    // If already logged in, check if already member
    if (user && project) {
      checkMembership();
    }
  }, [user, project]);

  const loadProject = async () => {
    if (!projectSlug) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", projectSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Projekt nem található",
          description: "Ez a projekt nem létezik vagy nem aktív.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProject(data);
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user || !project) return;

    try {
      const { data } = await supabase
        .from("project_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", project.id)
        .maybeSingle();

      if (data) {
        // Already a member, redirect to dashboard
        toast({
          title: "Már tag vagy!",
          description: `Már csatlakoztál a(z) ${project.name} projekthez.`,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error checking membership:", error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setJoining(true);
    try {
      // Sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
            user_role: userRole,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Regisztráció sikertelen");
      }

      // Add to project
      const { error: memberError } = await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: authData.user.id,
        role: "member",
      });

      if (memberError) throw memberError;

      // Update profile with project_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ project_id: project.id })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Sikeres regisztráció!",
        description: `Csatlakoztál a(z) ${project.name} projekthez!`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleJoinExisting = async () => {
    if (!user || !project) return;

    setJoining(true);
    try {
      // Add to project
      const { error: memberError } = await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: user.id,
        role: "member",
      });

      if (memberError) throw memberError;

      // Update profile with project_id if not set
      const { data: profile } = await supabase
        .from("profiles")
        .select("project_id")
        .eq("id", user.id)
        .single();

      if (!profile?.project_id) {
        await supabase
          .from("profiles")
          .update({ project_id: project.id })
          .eq("id", user.id);
      }

      toast({
        title: "Sikeres csatlakozás!",
        description: `Csatlakoztál a(z) ${project.name} projekthez!`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Project Info */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4" />
                    {project.region_name}
                  </CardDescription>
                </div>
                <Badge variant="default" className="text-sm">
                  Aktív projekt
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-muted-foreground mb-4">{project.description}</p>
              )}
              {project.villages && project.villages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Részt vevő települések:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.villages.map((village, index) => (
                      <Badge key={index} variant="secondary">
                        {village}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Join Section */}
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Csatlakozás a projekthez</CardTitle>
                <CardDescription>
                  Már be vagy jelentkezve. Csatlakozz a projekthez!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleJoinExisting} disabled={joining} size="lg" className="w-full">
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Csatlakozás...
                    </>
                  ) : (
                    "Csatlakozás most"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Regisztráció a projekthez</CardTitle>
                <CardDescription>
                  Hozz létre egy fiókot és csatlakozz a közösséghez!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Keresztnév</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Vezetéknév</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Jelszó</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="userRole">Kategória</Label>
                    <select
                      id="userRole"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="citizen">Lakos</option>
                      <option value="business">Vállalkozás</option>
                      <option value="ngo">Civil szervezet</option>
                      <option value="government">Önkormányzat/Intézmény</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={joining} size="lg" className="w-full">
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regisztráció...
                      </>
                    ) : (
                      "Regisztráció és csatlakozás"
                    )}
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Már van fiókod?{" "}
                    <Button variant="link" className="p-0" onClick={() => navigate("/auth")}>
                      Jelentkezz be
                    </Button>
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

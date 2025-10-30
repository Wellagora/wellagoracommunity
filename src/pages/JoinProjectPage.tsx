import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
          title: t('join.project_not_found'),
          description: t('join.project_not_exist'),
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProject(data);
    } catch (error: any) {
      toast({
        title: t('join.error'),
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
          title: t('join.already_member'),
          description: t('join.already_joined').replace('{projectName}', project.name),
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
        throw new Error(t('join.registration_failed'));
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
        title: t('join.success'),
        description: t('join.success_desc').replace('{projectName}', project.name),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t('join.error'),
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
        title: t('join.join_success'),
        description: t('join.join_success_desc').replace('{projectName}', project.name),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t('join.error'),
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
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 mt-14 sm:mt-0">
        <div className="max-w-4xl mx-auto">
          {/* Project Info */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl sm:text-3xl mb-2">{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base sm:text-lg">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {project.region_name}
                  </CardDescription>
                </div>
                <Badge variant="default" className="text-xs sm:text-sm">
                  {t('join.active_project')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{project.description}</p>
              )}
              {project.villages && project.villages.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    {t('join.participating_villages')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {project.villages.map((village, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
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
                <CardTitle className="text-lg sm:text-xl">{t('join.join_project')}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t('join.already_logged_in')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleJoinExisting} disabled={joining} size="lg" className="w-full text-sm sm:text-base">
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('join.joining')}
                    </>
                  ) : (
                    t('join.join_now')
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('join.register_title')}</CardTitle>
                <CardDescription>
                  {t('join.register_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('join.first_name')}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('join.last_name')}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t('join.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">{t('join.password')}</Label>
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
                    <Label htmlFor="userRole">{t('join.user_role')}</Label>
                    <select
                      id="userRole"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="citizen">{t('join.role.citizen')}</option>
                      <option value="business">{t('join.role.business')}</option>
                      <option value="ngo">{t('join.role.ngo')}</option>
                      <option value="government">{t('join.role.government')}</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={joining} size="lg" className="w-full">
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('join.registering')}
                      </>
                    ) : (
                      t('join.register_button')
                    )}
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    {t('join.already_have_account')}{" "}
                    <Button variant="link" className="p-0" onClick={() => navigate("/auth")}>
                      {t('join.login')}
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

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";

interface OrganizationInvite {
  id: string;
  organization_id: string;
  invite_code: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
}

interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  type: string;
}

const registerSchema = z.object({
  firstName: z.string().min(1, "Keresztnév kötelező").max(50),
  lastName: z.string().min(1, "Vezetéknév kötelező").max(50),
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(6, "A jelszó legalább 6 karakter legyen"),
});

const JoinOrganizationPage = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<OrganizationInvite | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch invite and organization details
  useEffect(() => {
    const fetchInvite = async () => {
      if (!inviteCode) {
        setError("Érvénytelen meghívó link");
        setLoading(false);
        return;
      }

      try {
        // Fetch invite
        const { data: inviteData, error: inviteError } = await supabase
          .from('organization_invites')
          .select('*')
          .eq('invite_code', inviteCode)
          .eq('is_active', true)
          .single();

        if (inviteError || !inviteData) {
          setError("A meghívó link érvénytelen vagy lejárt");
          setLoading(false);
          return;
        }

        // Check if expired
        if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
          setError("A meghívó link lejárt");
          setLoading(false);
          return;
        }

        // Check max uses
        if (inviteData.max_uses !== null && inviteData.use_count >= inviteData.max_uses) {
          setError("A meghívó link elérte a maximális felhasználási limitet");
          setLoading(false);
          return;
        }

        setInvite(inviteData);

        // Fetch organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, logo_url, description, type')
          .eq('id', inviteData.organization_id)
          .single();

        if (orgError || !orgData) {
          setError("A szervezet nem található");
          setLoading(false);
          return;
        }

        setOrganization(orgData);
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError("Hiba történt a meghívó betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteCode]);

  // If user is already logged in and has no organization, join directly
  const handleJoinAsExistingUser = async () => {
    if (!user || !invite || !organization) return;

    setSubmitting(true);
    try {
      // Update profile with organization_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          organization_id: organization.id,
          organization: organization.name
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Increment use_count
      await supabase
        .from('organization_invites')
        .update({ use_count: invite.use_count + 1 })
        .eq('id', invite.id);

      toast({
        title: "Sikeres csatlakozás!",
        description: `Mostantól ${organization.name} tagja vagy.`,
      });

      navigate('/organization');
    } catch (err) {
      console.error('Error joining organization:', err);
      toast({
        title: "Hiba",
        description: "Nem sikerült csatlakozni a szervezethez",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Register new user and join organization
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite || !organization) return;

    // Validate form
    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
    });

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/organization`,
          data: {
            first_name: firstName,
            last_name: lastName,
            user_role: organization.type, // Inherit organization type
            organization: organization.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update profile with organization_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            organization_id: organization.id,
            organization: organization.name
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Increment use_count
        await supabase
          .from('organization_invites')
          .update({ use_count: invite.use_count + 1 })
          .eq('id', invite.id);

        toast({
          title: "Sikeres regisztráció!",
          description: "Kérjük, erősítsd meg az email címedet, majd jelentkezz be.",
        });

        navigate('/auth');
      }
    } catch (err: any) {
      console.error('Error registering:', err);
      toast({
        title: "Hiba",
        description: err.message || "Nem sikerült a regisztráció",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-foreground">Betöltés...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Hiba</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>Vissza a főoldalra</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in and already belongs to this organization
  if (user && profile?.organization_id === organization?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
            <h2 className="text-xl font-bold mb-2">Már tag vagy!</h2>
            <p className="text-muted-foreground mb-6">
              Már a {organization?.name} szervezet tagja vagy.
            </p>
            <Link to="/organization">
              <Button>Ugrás az irányítópultra</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in but belongs to another organization
  if (user && profile?.organization_id && profile.organization_id !== organization?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-warning" />
            <h2 className="text-xl font-bold mb-2">Már van szervezeted</h2>
            <p className="text-muted-foreground mb-6">
              Már egy másik szervezet tagja vagy. Előbb ki kell lépned a jelenlegi szervezetből.
            </p>
            <Link to="/organization">
              <Button>Ugrás az irányítópultra</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          {/* Organization Logo/Avatar */}
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              {organization?.logo_url ? (
                <AvatarImage src={organization.logo_url} alt={organization.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                  <Building2 className="w-10 h-10" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          <CardTitle className="text-2xl">Csatlakozás: {organization?.name}</CardTitle>
          <CardDescription>
            {organization?.description || "Regisztrálj és csatlakozz a szervezethez!"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* If logged in without organization, show join button */}
          {user && !profile?.organization_id ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground mb-4">
                  Bejelentkezve mint <strong>{profile?.first_name} {profile?.last_name}</strong>
                </p>
              </div>
              
              <Button 
                onClick={handleJoinAsExistingUser} 
                className="w-full bg-gradient-to-r from-primary to-secondary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Csatlakozás...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Csatlakozom a szervezethez
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Registration form for new users */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Keresztnév *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="János"
                    className={formErrors.firstName ? "border-destructive" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-destructive">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Vezetéknév *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kovács"
                    className={formErrors.lastName ? "border-destructive" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-destructive">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email cím *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Jelszó *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Legalább 6 karakter"
                  className={formErrors.password ? "border-destructive" : ""}
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regisztráció...
                  </>
                ) : (
                  "Regisztráció és csatlakozás"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Már van fiókod?{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Jelentkezz be
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinOrganizationPage;

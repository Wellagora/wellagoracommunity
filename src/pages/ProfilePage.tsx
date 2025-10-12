import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  User, 
  Building2, 
  MapPin, 
  Mail, 
  Globe,
  Users,
  Save,
  Camera,
  Edit3,
  Upload
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    public_display_name: profile?.public_display_name || "",
    organization: profile?.organization || "",
    location: "",
    sustainability_goals: [] as string[],
    industry: "",
    company_size: "",
    website_url: "",
    is_public_profile: profile?.is_public_profile || false,
    bio: ""
  });

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      // Use type assertion for new fields until types are regenerated
      const extendedProfile = profile as any;
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        public_display_name: profile.public_display_name || "",
        organization: profile.organization || "",
        location: extendedProfile.location || "",
        sustainability_goals: extendedProfile.sustainability_goals || [],
        industry: extendedProfile.industry || "",
        company_size: extendedProfile.company_size || "",
        website_url: extendedProfile.website_url || "",
        is_public_profile: profile.is_public_profile || false,
        bio: extendedProfile.bio || ""
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if exists
      if (profile?.avatar_url) {
        const existingPath = profile.avatar_url.split('/avatars/')[1];
        if (existingPath) {
          await supabase.storage.from('avatars').remove([existingPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl } as any);
      
      toast({
        title: t('profile.success'),
        description: t('profile.avatar_success'),
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: t('common.error'),
        description: t('profile.avatar_error'),
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use type assertion for new fields until types are regenerated
      const { error } = await updateProfile({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        public_display_name: profileForm.public_display_name.trim() || null,
        organization: profileForm.organization.trim() || null,
        is_public_profile: profileForm.is_public_profile,
        // New fields (will be accepted by database even if not in types yet)
        ...(profileForm.location && { location: profileForm.location.trim() }),
        ...(profileForm.sustainability_goals.length > 0 && { sustainability_goals: profileForm.sustainability_goals }),
        ...(profileForm.industry && { industry: profileForm.industry.trim() }),
        ...(profileForm.company_size && { company_size: profileForm.company_size.trim() }),
        ...(profileForm.website_url && { website_url: profileForm.website_url.trim() }),
        ...(profileForm.bio && { bio: profileForm.bio.trim() })
      } as any);

      if (error) {
        setError(t('profile.error'));
        console.error("Profile update error:", error);
      } else {
        setSuccess(t('profile.success'));
      }
    } catch (err) {
      setError(t('profile.error'));
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (profile?.user_role) {
      case "citizen": return <User className="w-5 h-5" />;
      case "business": return <Building2 className="w-5 h-5" />;
      case "government": return <MapPin className="w-5 h-5" />;
      case "ngo": return <Users className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (profile?.user_role) {
      case "citizen": return t('profile.role_citizen');
      case "business": return t('profile.role_business');
      case "government": return t('profile.role_government');
      case "ngo": return t('profile.role_ngo');
      default: return t('profile.role_user');
    }
  };

  const getRoleGradient = () => {
    switch (profile?.user_role) {
      case "citizen": return "from-primary to-success";
      case "business": return "from-accent to-secondary";
      case "government": return "from-warning to-destructive";
      case "ngo": return "from-success to-primary";
      default: return "from-primary to-success";
    }
  };

  const isOrganization = profile?.user_role !== "citizen";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('profile.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-block mb-6">
            <Avatar className="w-24 h-24 shadow-premium">
              <AvatarImage src={profile?.avatar_url} alt="Profilkép" />
              <AvatarFallback className={`text-white text-2xl bg-gradient-to-r ${getRoleGradient()}`}>
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent hover:bg-accent/90 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer">
              <Camera className="w-4 h-4 text-accent-foreground" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {t('profile.edit_profile')}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-2">
            <Badge className={`bg-gradient-to-r ${getRoleGradient()} text-white`}>
              {getRoleIcon()}
              <span className="ml-2">{getRoleLabel()}</span>
            </Badge>
            {/* Super Admin Role Switcher */}
            {profile?.email === "attila.kelemen@proself.org" && (
              <Select
                value={profile.user_role}
                onValueChange={async (newRole) => {
                  const { error } = await updateProfile({ user_role: newRole as any });
                  if (error) {
                    setError("Hiba a szerepváltás során");
                  } else {
                    setSuccess("Szerepváltás sikeres! Újratöltjük az oldalt...");
                    setTimeout(() => window.location.reload(), 1000);
                  }
                }}
              >
                <SelectTrigger className="w-48 bg-gradient-to-r from-warning/20 to-destructive/20 border-warning text-sm">
                  <SelectValue placeholder="Super Admin: Szerepváltás" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">🏡 Állampolgár</SelectItem>
                  <SelectItem value="business">🏢 Vállalkozás</SelectItem>
                  <SelectItem value="government">🏛️ Önkormányzat</SelectItem>
                  <SelectItem value="ngo">❤️ Civil Szervezet</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/30">
            <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-success/10 border-success/30">
            <AlertDescription className="text-success-foreground">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <span>{t('profile.basic_info')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('profile.first_name')} *</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t('profile.last_name')} *</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      className="bg-background/50 pl-10"
                      disabled
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                <p className="text-xs text-muted-foreground">{t('profile.email_note')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="public_display_name">{t('profile.display_name')}</Label>
                <Input
                  id="public_display_name"
                  value={profileForm.public_display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, public_display_name: e.target.value })}
                  placeholder={t('profile.display_name_placeholder')}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.display_name_note')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organization">{t('profile.organization')}</Label>
                  <Input
                    id="organization"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    placeholder={t('profile.organization_placeholder')}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('profile.location')} *</Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder={t('profile.location_placeholder')}
                    className="bg-background/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('profile.location_note')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sustainability_goals">{t('profile.sustainability_goals')} *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Energia hatékonyság', 'Hulladék csökkentés', 'Közlekedés', 
                    'Biodiverzitás', 'Körforgásos gazdaság', 'Vízvédelem',
                    'Zöld finanszírozás', 'Innováció', 'Közösségépítés'
                  ].map((goal) => (
                    <label key={goal} className="flex items-center space-x-2 p-2 bg-background/30 rounded cursor-pointer hover:bg-background/50">
                      <input
                        type="checkbox"
                        checked={profileForm.sustainability_goals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileForm({
                              ...profileForm,
                              sustainability_goals: [...profileForm.sustainability_goals, goal]
                            });
                          } else {
                            setProfileForm({
                              ...profileForm,
                              sustainability_goals: profileForm.sustainability_goals.filter(g => g !== goal)
                            });
                          }
                        }}
                        className="text-primary"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('profile.sustainability_note')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder={t('profile.bio_placeholder')}
                  className="min-h-[100px] bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.bio_note')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information (for non-citizens) */}
          {isOrganization && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  <span>További szervezeti információk</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Iparág</Label>
                    <Select
                      value={profileForm.industry}
                      onValueChange={(value) => setProfileForm({ ...profileForm, industry: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Válassz iparágat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technológia</SelectItem>
                        <SelectItem value="energy">Energia</SelectItem>
                        <SelectItem value="manufacturing">Gyártás</SelectItem>
                        <SelectItem value="retail">Kiskereskedelem</SelectItem>
                        <SelectItem value="finance">Pénzügy</SelectItem>
                        <SelectItem value="healthcare">Egészségügy</SelectItem>
                        <SelectItem value="education">Oktatás</SelectItem>
                        <SelectItem value="other">Egyéb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Céges méret</Label>
                    <Select
                      value={profileForm.company_size}
                      onValueChange={(value) => setProfileForm({ ...profileForm, company_size: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Válassz méretet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 alkalmazott</SelectItem>
                        <SelectItem value="11-50">11-50 alkalmazott</SelectItem>
                        <SelectItem value="51-200">51-200 alkalmazott</SelectItem>
                        <SelectItem value="201-1000">201-1000 alkalmazott</SelectItem>
                        <SelectItem value="1000+">1000+ alkalmazott</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website_url">Weboldal URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={profileForm.website_url}
                    onChange={(e) => setProfileForm({ ...profileForm, website_url: e.target.value })}
                    placeholder="https://example.com"
                    className="bg-background/50"
                  />
                </div>

                <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                  <h4 className="font-semibold text-info mb-2">Szponzoráció és Üzleti Lehetőségek</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Vállalatok szponzorálhatnak kihívásokat és vásárolhatnak szponzorációs csomagokat:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Bronz csomag:</strong> 50.000 Ft - 1 havi kihívás szponzoráció</li>
                    <li>• <strong>Ezüst csomag:</strong> 150.000 Ft - 3 havi + brandelt challenges</li>
                    <li>• <strong>Arany csomag:</strong> 300.000 Ft - 6 havi + dedikált matching</li>
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Szponzorációs ajánlat kérése
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                      Szponzorációs Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-success" />
                <span>Adatvédelmi beállítások</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Nyilvános profil</div>
                  <div className="text-sm text-muted-foreground">
                    A profilja látható lesz más felhasználók számára
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.is_public_profile}
                    onChange={(e) => setProfileForm({ ...profileForm, is_public_profile: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold rounded-xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('profile.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.save')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
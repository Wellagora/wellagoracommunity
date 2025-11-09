import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CitizenProfileForm } from "@/components/profile/CitizenProfileForm";
import { OrganizationProfileForm } from "@/components/profile/OrganizationProfileForm";
import { 
  Loader2, 
  Building2, 
  MapPin, 
  Globe,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get('userId');
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const { toast } = useToast();

  // Fetch profile if viewing another user
  useEffect(() => {
    if (viewingUserId && viewingUserId !== user?.id) {
      const fetchProfile = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            organizations(*)
          `)
          .eq('id', viewingUserId)
          .eq('is_public_profile', true)
          .maybeSingle();
        
        if (error) {
          toast({
            title: t('common.error'),
            description: t('profile.not_found_or_private'),
            variant: 'destructive'
          });
          navigate('/');
        } else {
          setViewedProfile(data);
        }
        setIsLoading(false);
      };
      fetchProfile();
    }
  }, [viewingUserId, user, navigate, toast, t]);

  // Redirect if not authenticated and not viewing another profile
  useEffect(() => {
    if (!authLoading && !user && !viewingUserId) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate, viewingUserId]);

  // If viewing another user's profile, show public view
  if (viewingUserId && viewingUserId !== user?.id) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      );
    }

    if (!viewedProfile) {
      return null;
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-6 sm:pb-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage src={viewedProfile.avatar_url} />
                  <AvatarFallback>{viewedProfile.first_name?.[0]}{viewedProfile.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  {viewedProfile.organization && (
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span className="text-lg font-semibold text-foreground">{viewedProfile.organization}</span>
                    </div>
                  )}
                  <CardTitle className="text-xl sm:text-2xl">
                    {viewedProfile.public_display_name || `${viewedProfile.first_name} ${viewedProfile.last_name}`}
                  </CardTitle>
                  <Badge className="mt-2">{viewedProfile.user_role}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewedProfile.bio && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{t('profile.bio_section')}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{viewedProfile.bio}</p>
                </div>
              )}
              {viewedProfile.location && (
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span>{viewedProfile.location}</span>
                </div>
              )}
              {viewedProfile.website_url && (
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <a href={viewedProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {viewedProfile.website_url}
                  </a>
                </div>
              )}
              {viewedProfile.sustainability_goals && viewedProfile.sustainability_goals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{t('profile.sustainability_goals')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewedProfile.sustainability_goals.map((goal: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
    bio: "",
    org_description: "",
    org_logo_url: "",
    org_logo_file: undefined as File | undefined
  });

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
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
        bio: extendedProfile.bio || "",
        org_description: "",
        org_logo_url: "",
        org_logo_file: undefined
      });

      // Fetch organization data if user has organization_id
      if (extendedProfile.organization_id) {
        const fetchOrgData = async () => {
          const { data, error } = await supabase
            .from('organizations')
            .select('description, logo_url, website_url')
            .eq('id', extendedProfile.organization_id)
            .maybeSingle();
          
          if (!error && data) {
            setProfileForm(prev => ({
              ...prev,
              org_description: data.description || "",
              org_logo_url: data.logo_url || "",
              website_url: data.website_url || prev.website_url
            }));
          }
        };
        fetchOrgData();
      }
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl } as any);

      toast({
        title: "Siker!",
        description: "A profilkép sikeresen feltöltve",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Hiba",
        description: "A profilkép feltöltése sikertelen",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    
    // If logo file is uploaded, upload it immediately
    if (field === 'org_logo_file' && value instanceof File) {
      handleLogoUpload(value);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!user || !profile) return;

    setLogoUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      // Update form with new logo URL
      setProfileForm(prev => ({ ...prev, org_logo_url: publicUrl }));

      toast({
        title: "Siker!",
        description: "A logó sikeresen feltöltve",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Hiba",
        description: "A logó feltöltése sikertelen",
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Normalize website URL - add https:// if missing protocol
      let normalizedUrl = profileForm.website_url.trim();
      if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      // Update profile
      const { error } = await updateProfile({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        public_display_name: profileForm.public_display_name.trim() || null,
        organization: profileForm.organization.trim() || null,
        is_public_profile: profileForm.is_public_profile,
        ...(profileForm.location && { location: profileForm.location.trim() }),
        ...(profileForm.sustainability_goals.length > 0 && { sustainability_goals: profileForm.sustainability_goals }),
        ...(profileForm.industry && { industry: profileForm.industry.trim() }),
        ...(profileForm.company_size && { company_size: profileForm.company_size.trim() }),
        ...(normalizedUrl && { website_url: normalizedUrl }),
        ...(profileForm.bio && { bio: profileForm.bio.trim() })
      } as any);

      if (error) {
        setError("Hiba történt a profil mentése során: " + error.message);
        console.error("Profile update error:", error);
        return;
      }

      // Update organization if user has organization_id
      if ((profile as any)?.organization_id) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({
            description: profileForm.org_description.trim() || null,
            logo_url: profileForm.org_logo_url.trim() || null,
            website_url: normalizedUrl || null
          })
          .eq('id', (profile as any).organization_id);

        if (orgError) {
          console.error("Organization update error:", orgError);
          setError("A profil mentve, de a szervezeti adatok mentése sikertelen: " + orgError.message);
          return;
        }

        // Reload organization data after successful save
        const { data: orgData } = await supabase
          .from('organizations')
          .select('description, logo_url, website_url')
          .eq('id', (profile as any).organization_id)
          .maybeSingle();

        if (orgData) {
          setProfileForm(prev => ({
            ...prev,
            org_description: orgData.description || "",
            org_logo_url: orgData.logo_url || "",
            website_url: orgData.website_url || prev.website_url
          }));
        }
      }
      
      setSuccess("A profil és a szervezeti adatok sikeresen mentve!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Hiba történt a profil mentése során");
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isOrganization = profile?.user_role !== "citizen";

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader
            avatarUrl={profile.avatar_url}
            firstName={profile.first_name}
            lastName={profile.last_name}
            role={profile.user_role}
            organization={profile.organization || undefined}
            onAvatarUpload={handleAvatarUpload}
            avatarUploading={avatarUploading}
          />

          {/* Success/Error Messages */}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {isOrganization ? (
              <OrganizationProfileForm
                formData={profileForm}
                onChange={handleFormChange}
                logoUploading={logoUploading}
              />
            ) : (
              <CitizenProfileForm
                formData={profileForm}
                onChange={handleFormChange}
              />
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Mentés...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Változtatások Mentése
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

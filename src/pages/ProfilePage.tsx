import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import TeamMembersSection from "@/components/profile/TeamMembersSection";
import MembershipCard from "@/components/partners/MembershipCard";
import { 
  Loader2, 
  Building2, 
  MapPin, 
  Globe,
  Save,
  User,
  Mail,
  Bell,
  Sparkles,
  Wallet,
  CreditCard,
  Users,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { awardPoints } from "@/lib/wellpoints";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const viewingUserId = paramUserId || searchParams.get('userId');
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const { toast } = useToast();

  // Derive user role from profile
  const userRole = profile?.user_role || 'member';

  // Form state
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    public_display_name: "",
    bio: "",
    location: "",
    is_public_profile: false,
    // Expert fields
    expert_title: "",
    expertise_areas: [] as string[],
    payout_preference: "stripe",
    stripe_connected: false,
    wise_email: "",
    wise_iban: "",
    // Sponsor fields
    organization_name: "",
    organization_logo_url: "",
    organization_industry: "",
    organization_website: "",
    billing_company_name: "",
    billing_tax_number: "",
    billing_address: "",
    // Notification preferences (member only)
    notifications_email: true,
    notifications_push: true,
  });

  // Fetch profile if viewing another user
  useEffect(() => {
    if (viewingUserId && viewingUserId !== user?.id) {
      const fetchProfile = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewingUserId)
          .eq('is_public_profile', true)
          .maybeSingle();
        
        if (error || !data) {
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !viewingUserId) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate, viewingUserId]);

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      const extProfile = profile as any;
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        public_display_name: profile.public_display_name || "",
        bio: extProfile.bio || "",
        location: extProfile.location || "",
        is_public_profile: profile.is_public_profile || false,
        // Expert fields
        expert_title: extProfile.expert_title || "",
        expertise_areas: extProfile.expertise_areas || [],
        payout_preference: extProfile.payout_preference || "stripe",
        stripe_connected: extProfile.stripe_onboarding_complete || false,
        wise_email: extProfile.wise_email || "",
        wise_iban: extProfile.wise_iban || "",
        // Sponsor fields
        organization_name: extProfile.organization_name || profile.organization || "",
        organization_logo_url: extProfile.organization_logo_url || "",
        organization_industry: extProfile.industry || "",
        organization_website: extProfile.website_url || "",
        billing_company_name: extProfile.billing_company_name || "",
        billing_tax_number: extProfile.billing_tax_number || "",
        billing_address: extProfile.billing_address || "",
        // Notifications
        notifications_email: true,
        notifications_push: true,
      });
    }
  }, [profile]);

  // Public profile view
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

    if (!viewedProfile) return null;

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
                  <h3 className="font-semibold mb-2">{t('profile.bio')}</h3>
                  <p className="text-muted-foreground">{viewedProfile.bio}</p>
                </div>
              )}
              {viewedProfile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{viewedProfile.location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl } as any);
      toast({ title: t('profile.avatar_success'), description: t('profile.avatar_uploaded_desc') });
    } catch (error) {
      toast({ title: t('common.error'), description: t('profile.avatar_error'), variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLogoUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      setProfileForm(prev => ({ ...prev, organization_logo_url: publicUrl }));
      toast({ title: t('profile.logo_success'), description: t('profile.logo_uploaded_desc') });
    } catch (error) {
      toast({ title: t('common.error'), description: t('profile.logo_error'), variant: "destructive" });
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
      const updates: Record<string, any> = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        public_display_name: profileForm.public_display_name.trim() || null,
        bio: profileForm.bio.trim() || null,
        location: profileForm.location.trim() || null,
        is_public_profile: profileForm.is_public_profile,
      };

      // Role-specific fields
      if (userRole === 'expert') {
        updates.expert_title = profileForm.expert_title.trim() || null;
        updates.expertise_areas = profileForm.expertise_areas;
        updates.payout_preference = profileForm.payout_preference;
        updates.wise_email = profileForm.payout_preference === 'wise' ? profileForm.wise_email : null;
        updates.wise_iban = profileForm.payout_preference === 'wise' ? profileForm.wise_iban : null;
      }

      if (userRole === 'sponsor') {
        updates.organization_name = profileForm.organization_name.trim() || null;
        updates.organization_logo_url = profileForm.organization_logo_url || null;
        updates.industry = profileForm.organization_industry.trim() || null;
        updates.website_url = profileForm.organization_website.trim() || null;
        updates.billing_company_name = profileForm.billing_company_name.trim() || null;
        updates.billing_tax_number = profileForm.billing_tax_number.trim() || null;
        updates.billing_address = profileForm.billing_address.trim() || null;
      }

      const { error } = await updateProfile(updates as any);
      if (error) {
        setError(t('profile.error'));
        return;
      }

      // Award profile_completed points (one-time, duplicates handled by backend)
      if (user) {
        awardPoints(user.id, 'profile_completed', 'Profil kiegészítés').catch(() => {});
      }

      setSuccess(t('profile.success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('profile.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Membership Card - Digital QR Card for offline partner discounts */}
          <div className="mb-6">
            <MembershipCard variant="full" className="shadow-xl" />
          </div>

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
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/30">
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ===== SECTION: Personal Data (ALL USERS) ===== */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t('profile.personal_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t('profile.first_name')} *</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">{t('profile.last_name')} *</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="pl-10"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('profile.email_readonly')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public_display_name">{t('profile.display_name')}</Label>
                  <Input
                    id="public_display_name"
                    value={profileForm.public_display_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, public_display_name: e.target.value }))}
                    placeholder={t('profile.display_name_hint')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('profile.location')}</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={t('profile.location_placeholder')}
                      className="pl-10"
                    />
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('profile.bio_placeholder')}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ===== SECTION: Notification Preferences (ALL ROLES) ===== */}
            <NotificationPreferences />

            {/* ===== SECTION: Expert Profile (EXPERT ONLY) ===== */}
            {userRole === 'expert' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                      {t('profile.expert_profile')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="expert_title">{t('profile.professional_title')}</Label>
                      <Input
                        id="expert_title"
                        value={profileForm.expert_title}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, expert_title: e.target.value }))}
                        placeholder={t('profile.title_placeholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('profile.expertise_areas')}</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'sustainability', hu: 'Fenntarthatóság' },
                          { key: 'energy', hu: 'Energia' },
                          { key: 'gardening', hu: 'Kertészet' },
                          { key: 'diy', hu: 'DIY' },
                          { key: 'nutrition', hu: 'Táplálkozás' },
                          { key: 'wellness', hu: 'Wellness' }
                        ].map((area) => (
                          <Badge
                            key={area.key}
                            variant={profileForm.expertise_areas.includes(area.hu) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setProfileForm(prev => ({
                                ...prev,
                                expertise_areas: prev.expertise_areas.includes(area.hu)
                                  ? prev.expertise_areas.filter(a => a !== area.hu)
                                  : [...prev.expertise_areas, area.hu]
                              }));
                            }}
                          >
                            {t(`profile.expertise_${area.key}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payout Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-green-500" />
                      {t('profile.payment_settings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label>{t('profile.payment_method')}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { value: 'stripe', label: 'Stripe', icon: CreditCard },
                          { value: 'wise', label: 'Wise', icon: Globe },
                          { value: 'bank_transfer', label: t('profile.bank_transfer'), icon: Building2 }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              profileForm.payout_preference === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setProfileForm(prev => ({ ...prev, payout_preference: option.value }))}
                          >
                            <option.icon className="w-5 h-5 mb-2 text-primary" />
                            <div className="font-medium">{option.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {profileForm.payout_preference === 'wise' && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="wise_email">Wise Email</Label>
                          <Input
                            id="wise_email"
                            type="email"
                            value={profileForm.wise_email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, wise_email: e.target.value }))}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wise_iban">IBAN</Label>
                          <Input
                            id="wise_iban"
                            value={profileForm.wise_iban}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, wise_iban: e.target.value }))}
                            placeholder="HU42 1234 5678 9012 3456 7890 1234"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ===== SECTION: Organization (SPONSOR ONLY) ===== */}
            {userRole === 'sponsor' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-500" />
                      {t('profile.organization')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization_name">{t('profile.organization_name')} *</Label>
                        <Input
                          id="organization_name"
                          value={profileForm.organization_name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, organization_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization_industry">{t('profile.industry')}</Label>
                        <Input
                          id="organization_industry"
                          value={profileForm.organization_industry}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, organization_industry: e.target.value }))}
                          placeholder={t('profile.industry_placeholder')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization_website">{t('profile.website')}</Label>
                      <div className="relative">
                        <Input
                          id="organization_website"
                          value={profileForm.organization_website}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, organization_website: e.target.value }))}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('profile.organization_logo')}</Label>
                      <div className="flex items-center gap-4">
                        {profileForm.organization_logo_url ? (
                          <img
                            src={profileForm.organization_logo_url}
                            alt="Logo"
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <label>
                          <Button variant="outline" asChild>
                            <span>
                              {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.upload_logo')}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                            disabled={logoUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <TeamMembersSection />

                {/* Billing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      {t('profile.billing_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing_company_name">{t('profile.billing_company')}</Label>
                      <Input
                        id="billing_company_name"
                        value={profileForm.billing_company_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, billing_company_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing_tax_number">{t('profile.tax_number')}</Label>
                      <Input
                        id="billing_tax_number"
                        value={profileForm.billing_tax_number}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, billing_tax_number: e.target.value }))}
                        placeholder="12345678-1-23"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing_address">{t('profile.billing_address')}</Label>
                      <Textarea
                        id="billing_address"
                        value={profileForm.billing_address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, billing_address: e.target.value }))}
                        placeholder={t('profile.billing_address_placeholder')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {profileForm.is_public_profile ? (
                        <Eye className="w-5 h-5 text-primary" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      )}
                      {t('profile.visibility')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{t('profile.public_profile')}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('profile.public_note')}
                        </div>
                      </div>
                      <Switch
                        checked={profileForm.is_public_profile}
                        onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, is_public_profile: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg"
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {t('common.save_changes')}
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

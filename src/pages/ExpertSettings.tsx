import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ExpertStudioSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, User, CreditCard, Bell, Shield, CheckCircle2 } from "lucide-react";

const ExpertSettings = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    expert_title: "",
    bio: "",
    expertise_areas: [] as string[],
    wise_iban: "",
    wise_email: "",
    payout_preference: "wise",
    auto_create_drafts: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        expert_title: profile.expert_title || "",
        bio: profile.bio || "",
        expertise_areas: profile.expertise_areas || [],
        wise_iban: profile.wise_iban || "",
        wise_email: profile.wise_email || "",
        payout_preference: profile.payout_preference || "wise",
        auto_create_drafts: profile.auto_create_drafts ?? true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          expert_title: formData.expert_title,
          bio: formData.bio,
          expertise_areas: formData.expertise_areas,
          wise_iban: formData.wise_iban,
          wise_email: formData.wise_email,
          payout_preference: formData.payout_preference,
          auto_create_drafts: formData.auto_create_drafts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success(language === 'hu' ? 'Beállítások mentve!' : 'Settings saved!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(language === 'hu' ? 'Hiba a mentés során' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ExpertStudioSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isVerified = profile?.is_verified_expert;
  const hasGreenPass = profile?.green_pass;

  return (
    <DashboardLayout
      title={t("nav.settings") || "Beállítások"}
      subtitle={t("expert.settings_subtitle") || "Manage your expert profile and preferences"}
      icon={Settings}
      iconColor="text-amber-500"
    >
      <div className="space-y-6 max-w-3xl">
        {/* Verification Status */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {language === 'hu' ? 'Szakértői státusz' : 'Expert Status'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'hu' ? 'Ellenőrzési és jóváhagyási állapot' : 'Verification and approval status'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {isVerified && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {language === 'hu' ? 'Ellenőrzött' : 'Verified'}
                  </Badge>
                )}
                {hasGreenPass && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    {language === 'hu' ? 'Green Pass' : 'Green Pass'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {!isVerified && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {language === 'hu' 
                  ? 'A szakértői ellenőrzés folyamatban van. Az adminisztrátor hamarosan felülvizsgálja a profilodat.'
                  : 'Expert verification is in progress. An administrator will review your profile soon.'}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Profile Settings */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  {language === 'hu' ? 'Szakértői profil' : 'Expert Profile'}
                </CardTitle>
                <CardDescription>
                  {language === 'hu' ? 'Nyilvános megjelenésed a platformon' : 'Your public appearance on the platform'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expert_title">
                {language === 'hu' ? 'Szakértői cím' : 'Expert Title'}
              </Label>
              <Input
                id="expert_title"
                value={formData.expert_title}
                onChange={(e) => setFormData({ ...formData, expert_title: e.target.value })}
                placeholder={language === 'hu' ? 'pl. Fenntarthatósági tanácsadó' : 'e.g. Sustainability Consultant'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                {language === 'hu' ? 'Bemutatkozás' : 'Bio'}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={language === 'hu' ? 'Mutatkozz be a közösség számára...' : 'Introduce yourself to the community...'}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payout Settings */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  {language === 'hu' ? 'Kifizetési beállítások' : 'Payout Settings'}
                </CardTitle>
                <CardDescription>
                  {language === 'hu' ? 'Banki adatok a bevételek fogadásához' : 'Bank details to receive your earnings'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wise_iban">
                {language === 'hu' ? 'IBAN szám' : 'IBAN Number'}
              </Label>
              <Input
                id="wise_iban"
                value={formData.wise_iban}
                onChange={(e) => setFormData({ ...formData, wise_iban: e.target.value })}
                placeholder="HU..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wise_email">
                {language === 'hu' ? 'Wise e-mail (opcionális)' : 'Wise Email (optional)'}
              </Label>
              <Input
                id="wise_email"
                type="email"
                value={formData.wise_email}
                onChange={(e) => setFormData({ ...formData, wise_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {language === 'hu' 
                ? 'A kifizetések havonta egyszer történnek, a hónap elején az előző havi bevételek alapján.'
                : 'Payouts are processed monthly, at the beginning of each month for the previous month\'s earnings.'}
            </p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-white/80 backdrop-blur-md border-white/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  {language === 'hu' ? 'Preferenciák' : 'Preferences'}
                </CardTitle>
                <CardDescription>
                  {language === 'hu' ? 'Automatizálási és értesítési beállítások' : 'Automation and notification settings'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {language === 'hu' ? 'Automatikus vázlat létrehozás' : 'Auto-create drafts'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'hu' 
                    ? 'Új program vázlat létrehozása média feltöltésekor'
                    : 'Create new program drafts when uploading media'}
                </p>
              </div>
              <Switch
                checked={formData.auto_create_drafts}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_create_drafts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving 
              ? (language === 'hu' ? 'Mentés...' : 'Saving...') 
              : (language === 'hu' ? 'Beállítások mentése' : 'Save Settings')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExpertSettings;

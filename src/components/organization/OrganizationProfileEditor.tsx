import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building2, Upload, Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Technológia",
  "Oktatás",
  "Egészségügy",
  "Kereskedelem",
  "Szolgáltatás",
  "Gyártás",
  "Mezőgazdaság",
  "Építőipar",
  "Pénzügy",
  "Közszolgáltatás",
  "Nonprofit",
  "Egyéb"
];

const OrganizationProfileEditor = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [organizationData, setOrganizationData] = useState({
    id: "",
    name: "",
    type: "",
    industry: "",
    employee_count: 0,
    website_url: "",
    location: "",
    description: "",
    is_public: true,
    logo_url: ""
  });

  useEffect(() => {
    if (profile?.organization_id) {
      loadOrganization();
    }
  }, [profile?.organization_id]);

  const loadOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile?.organization_id)
        .single();

      if (error) throw error;

      if (data) {
        setOrganizationData({
          id: data.id,
          name: data.name || "",
          type: data.type || "",
          industry: data.industry || "",
          employee_count: data.employee_count || 0,
          website_url: data.website_url || "",
          location: data.location || "",
          description: data.description || "",
          is_public: data.is_public ?? true,
          logo_url: data.logo_url || ""
        });
      }
    } catch (error) {
      toast.error('Hiba történt a szervezet adatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Csak képfájlokat tölthetsz fel');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A fájl mérete maximum 2MB lehet');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationData.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      setOrganizationData(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      toast.success('Logó feltöltve');
    } catch (error) {
      toast.error('Hiba történt a logó feltöltésekor');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!organizationData.name.trim()) {
      toast.error('A szervezet neve kötelező');
      return;
    }

    if (organizationData.website_url && !organizationData.website_url.startsWith('http')) {
      toast.error('A weboldal címének http:// vagy https:// előtaggal kell kezdődnie');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organizationData.name.trim(),
          industry: organizationData.industry || null,
          employee_count: organizationData.employee_count || null,
          website_url: organizationData.website_url || null,
          location: organizationData.location || null,
          description: organizationData.description || null,
          is_public: organizationData.is_public,
          logo_url: organizationData.logo_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationData.id);

      if (error) throw error;

      toast.success('Szervezet profil mentve');
    } catch (error) {
      toast.error('Hiba történt a mentés során');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      business: 'Vállalkozás',
      government: 'Önkormányzat',
      ngo: 'Civil szervezet',
      citizen: 'Állampolgár'
    };
    return labels[type] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      business: 'default',
      government: 'secondary',
      ngo: 'outline'
    };
    return variants[type] || 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile?.organization_id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nincs szervezethez rendelve
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profil szerkesztése</h2>
        <p className="text-muted-foreground">
          Szervezeted adatainak kezelése és frissítése
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Logó</CardTitle>
          <CardDescription>
            Töltsd fel a szervezeted logóját (max 2MB, PNG, JPG, WEBP)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50">
              {organizationData.logo_url ? (
                <img 
                  src={organizationData.logo_url} 
                  alt="Organization logo" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="max-w-xs"
              />
              {uploading && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Feltöltés...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Alapadatok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Szervezet neve <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={organizationData.name}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Szervezet neve"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Típus</Label>
              <div className="flex items-center h-10">
                <Badge variant={getTypeBadgeVariant(organizationData.type)}>
                  {getTypeLabel(organizationData.type)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Iparág</Label>
              <Select
                value={organizationData.industry}
                onValueChange={(value) => setOrganizationData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Válassz iparágat" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_count">Alkalmazottak száma</Label>
              <Input
                id="employee_count"
                type="number"
                min="0"
                value={organizationData.employee_count || ''}
                onChange={(e) => setOrganizationData(prev => ({ 
                  ...prev, 
                  employee_count: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Weboldal</Label>
              <Input
                id="website_url"
                type="url"
                value={organizationData.website_url}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Település</Label>
              <Input
                id="location"
                value={organizationData.location}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Budapest"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Bemutatkozás</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Leírás</Label>
            <Textarea
              id="description"
              value={organizationData.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setOrganizationData(prev => ({ ...prev, description: e.target.value }));
                }
              }}
              placeholder="Rövid leírás a szervezetről..."
              rows={5}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground text-right">
              {organizationData.description.length} / 500 karakter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Beállítások</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Nyilvános profil</Label>
              <p className="text-sm text-muted-foreground">
                Ha bekapcsolod, a szervezeted megjelenik a közösségi térképen és keresésben
              </p>
            </div>
            <Switch
              id="is_public"
              checked={organizationData.is_public}
              onCheckedChange={(checked) => setOrganizationData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving || uploading}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mentés...
            </>
          ) : (
            'Változtatások mentése'
          )}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationProfileEditor;

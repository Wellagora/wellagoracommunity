import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Building2, Globe, MapPin, Mail, Users, Image, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrganizationProfileFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    organization: string;
    location: string;
    sustainability_goals: string[];
    industry: string;
    company_size: string;
    website_url: string;
    bio: string;
    org_description: string;
    org_logo_url: string;
    org_logo_file?: File;
    is_public_profile: boolean;
  };
  onChange: (field: string, value: any) => void;
  logoUploading?: boolean;
}

export const OrganizationProfileForm = ({ formData, onChange, logoUploading }: OrganizationProfileFormProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Contact Person */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Kapcsolattartó személy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">Keresztnév *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => onChange('first_name', e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Vezetéknév *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => onChange('last_name', e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail cím</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                className="bg-background/50 pl-10"
                disabled
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-accent" />
            <span>Szervezeti információk</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organization">Szervezet neve *</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onChange('organization', e.target.value)}
              placeholder="Cég, intézmény vagy szervezet neve"
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_logo">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Szervezet logója
              </div>
            </Label>
            {formData.org_logo_url && (
              <div className="mb-3 p-4 bg-background/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Jelenlegi logó:</p>
                <img 
                  src={formData.org_logo_url} 
                  alt="Szervezet logója" 
                  className="max-h-24 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="org_logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange('org_logo_file', file);
                  }
                }}
                className="bg-background/50"
                disabled={logoUploading}
              />
              {logoUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Feltöltés...
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Töltsön fel egy képet a szervezet logójának (JPG, PNG, max 2MB). Ez jelenik meg a nyilvános szervezet oldalon.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_description">Szervezet bemutatkozása</Label>
            <Textarea
              id="org_description"
              value={formData.org_description}
              onChange={(e) => onChange('org_description', e.target.value)}
              placeholder="Írja le a szervezet küldetését, céljait és fenntarthatósági elkötelezettségét..."
              className="min-h-[120px] bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Ez jelenik meg a nyilvános szervezet oldalon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Iparág</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => onChange('industry', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Válassz iparágat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technológia</SelectItem>
                  <SelectItem value="energy">Energia</SelectItem>
                  <SelectItem value="manufacturing">Gyártás</SelectItem>
                  <SelectItem value="retail">Kereskedelem</SelectItem>
                  <SelectItem value="finance">Pénzügy</SelectItem>
                  <SelectItem value="healthcare">Egészségügy</SelectItem>
                  <SelectItem value="education">Oktatás</SelectItem>
                  <SelectItem value="other">Egyéb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Vállalat mérete</Label>
              <Select
                value={formData.company_size}
                onValueChange={(value) => onChange('company_size', value)}
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
            <Label htmlFor="location">Helyszín *</Label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onChange('location', e.target.value)}
                placeholder="Város, Ország"
                className="bg-background/50 pl-10"
                required
              />
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Weboldal URL
              </div>
            </Label>
            <Input
              id="website_url"
              type="text"
              value={formData.website_url}
              onChange={(e) => onChange('website_url', e.target.value)}
              placeholder="www.example.com vagy https://example.com"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Adja meg a weboldal címét (automatikusan hozzáadjuk a https:// előtagot)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Goals */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-success" />
            <span>Fenntarthatósági célok *</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'Energia hatékonyság', 'Hulladékcsökkentés', 'Fenntartható közlekedés',
              'Biodiverzitás', 'Körforgásos gazdaság', 'Vízgazdálkodás',
              'Zöld finanszírozás', 'Innováció', 'Közösségépítés'
            ].map((goal) => (
              <label key={goal} className="flex items-center space-x-2 p-2 bg-background/30 rounded cursor-pointer hover:bg-background/50">
                <input
                  type="checkbox"
                  checked={formData.sustainability_goals.includes(goal)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange('sustainability_goals', [...formData.sustainability_goals, goal]);
                    } else {
                      onChange('sustainability_goals', formData.sustainability_goals.filter(g => g !== goal));
                    }
                  }}
                  className="text-primary"
                />
                <span className="text-sm">{goal}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Válassz legalább 3 területet a jobb matching-hez</p>
        </CardContent>
      </Card>

      {/* Sponsorship Information */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Szponzorációs és Üzleti Lehetőségek</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vállalatok szponzorálhatnak kihívásokat és vásárolhatnak szponzorációs csomagokat:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Bronz csomag:</strong> 50.000 Ft - 1 havi kihívás szponzorálás</li>
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
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-accent" />
            <span>Láthatósági beállítások</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
            <div className="space-y-1">
              <div className="font-medium text-foreground">Nyilvános szervezet profil</div>
              <div className="text-sm text-muted-foreground">
                A szervezet profilja megjelenik a nyilvános szervezetek között
              </div>
            </div>
            <Switch
              checked={formData.is_public_profile}
              onCheckedChange={(checked) => onChange('is_public_profile', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

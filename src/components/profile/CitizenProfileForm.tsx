import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Mail, Globe, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CitizenProfileFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    public_display_name: string;
    location: string;
    sustainability_goals: string[];
    bio: string;
    is_public_profile: boolean;
  };
  onChange: (field: string, value: any) => void;
}

export const CitizenProfileForm = ({ formData, onChange }: CitizenProfileFormProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Alapadatok</span>
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
            <p className="text-xs text-muted-foreground">Az e-mail cím nem módosítható</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_display_name">Megjelenítendő név (opcionális)</Label>
            <Input
              id="public_display_name"
              value={formData.public_display_name}
              onChange={(e) => onChange('public_display_name', e.target.value)}
              placeholder="Ha üres, a teljes név jelenik meg"
              className="bg-background/50"
            />
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
            <Label htmlFor="bio">Bemutatkozás</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onChange('bio', e.target.value)}
              placeholder="Írj magadról és a fenntarthatósági célokról..."
              className="min-h-[120px] bg-background/50"
            />
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
          <p className="text-xs text-muted-foreground">Válassz legalább 3 területet</p>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-accent" />
            <span>Adatvédelmi beállítások</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
            <div className="space-y-1">
              <div className="font-medium text-foreground">Nyilvános profil</div>
              <div className="text-sm text-muted-foreground">
                Mások megtekinthetik a profilodat és kapcsolatba léphetnek veled
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

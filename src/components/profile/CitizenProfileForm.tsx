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
            <span>{t('profile.basic_info') || 'Basic Information'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t('profile.first_name') || 'First Name'} *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => onChange('first_name', e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">{t('profile.last_name') || 'Last Name'} *</Label>
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
            <Label htmlFor="email">{t('profile.email') || 'Email'}</Label>
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
            <p className="text-xs text-muted-foreground">{t('profile.email_note') || 'Email cannot be changed'}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_display_name">{t('profile.display_name_optional') || 'Display Name (optional)'}</Label>
            <Input
              id="public_display_name"
              value={formData.public_display_name}
              onChange={(e) => onChange('public_display_name', e.target.value)}
              placeholder={t('profile.display_name_hint') || 'If empty, full name will be shown'}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('profile.location_required') || 'Location *'}</Label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onChange('location', e.target.value)}
                placeholder={t('profile.location_city_country') || 'City, Country'}
                className="bg-background/50 pl-10"
                required
              />
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('profile.bio') || 'Bio'}</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onChange('bio', e.target.value)}
              placeholder={t('profile.bio_placeholder_citizen') || 'Write about yourself...'}
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
            <span>{t('profile.sustainability_goals') || 'Sustainability Goals'} *</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { key: 'energy', label: t('profile.goal_energy') || 'Energy Efficiency' },
              { key: 'waste', label: t('profile.goal_waste') || 'Waste Reduction' },
              { key: 'transport', label: t('profile.goal_transport') || 'Sustainable Transport' },
              { key: 'biodiversity', label: t('profile.goal_biodiversity') || 'Biodiversity' },
              { key: 'circular', label: t('profile.goal_circular') || 'Circular Economy' },
              { key: 'water', label: t('profile.goal_water') || 'Water Management' },
              { key: 'finance', label: t('profile.goal_finance') || 'Green Finance' },
              { key: 'innovation', label: t('profile.goal_innovation') || 'Innovation' },
              { key: 'community', label: t('profile.goal_community') || 'Community Building' }
            ].map((goal) => (
              <label key={goal.key} className="flex items-center space-x-2 p-2 bg-background/30 rounded cursor-pointer hover:bg-background/50">
                <input
                  type="checkbox"
                  checked={formData.sustainability_goals.includes(goal.label)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange('sustainability_goals', [...formData.sustainability_goals, goal.label]);
                    } else {
                      onChange('sustainability_goals', formData.sustainability_goals.filter(g => g !== goal.label));
                    }
                  }}
                  className="text-primary"
                />
                <span className="text-sm">{goal.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t('profile.select_goal_hint') || 'Select at least 3 areas'}</p>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-accent" />
            <span>{t('profile.privacy_settings') || 'Privacy Settings'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
            <div className="space-y-1">
              <div className="font-medium text-foreground">{t('profile.public_citizen_profile') || 'Public Profile'}</div>
              <div className="text-sm text-muted-foreground">
                {t('profile.public_citizen_hint') || 'Others can view your profile and contact you'}
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

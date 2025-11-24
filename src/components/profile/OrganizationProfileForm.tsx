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
            <span>{t('profile.contact_person') || 'Contact Person'}</span>
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
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-accent" />
            <span>{t('profile.org_info') || 'Organization Information'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organization">{t('profile.organization') || 'Organization Name'} *</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => onChange('organization', e.target.value)}
              placeholder={t('profile.organization_placeholder') || 'Company, institution or organization name'}
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_logo">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t('profile.org_logo') || 'Organization Logo'}
              </div>
            </Label>
            {formData.org_logo_url && (
              <div className="mb-3 p-4 bg-background/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">{t('profile.current_logo') || 'Current logo:'}</p>
                <img
                  src={formData.org_logo_url} 
                  alt={t('profile.org_logo') || 'Organization logo'} 
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
                  {t('profile.uploading') || 'Uploading...'}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('profile.logo_upload_hint') || 'Upload an image for the organization logo (JPG, PNG, max 2MB).'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_description">{t('profile.org_description') || 'Organization Description'}</Label>
            <Textarea
              id="org_description"
              value={formData.org_description}
              onChange={(e) => onChange('org_description', e.target.value)}
              placeholder={t('profile.org_description_placeholder') || 'Describe your organization mission...'}
              className="min-h-[120px] bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              {t('profile.org_description_hint') || 'This will appear on your public organization page'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="industry">{t('profile.industry') || 'Industry'}</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => onChange('industry', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('profile.industry_placeholder') || 'Select industry'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">{t('profile.industry_tech') || 'Technology'}</SelectItem>
                  <SelectItem value="energy">{t('profile.industry_energy') || 'Energy'}</SelectItem>
                  <SelectItem value="manufacturing">{t('profile.industry_manufacturing') || 'Manufacturing'}</SelectItem>
                  <SelectItem value="retail">{t('profile.industry_retail') || 'Retail'}</SelectItem>
                  <SelectItem value="finance">{t('profile.industry_finance') || 'Finance'}</SelectItem>
                  <SelectItem value="healthcare">{t('profile.industry_healthcare') || 'Healthcare'}</SelectItem>
                  <SelectItem value="education">{t('profile.industry_education') || 'Education'}</SelectItem>
                  <SelectItem value="other">{t('profile.industry_other') || 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">{t('profile.company_size') || 'Company Size'}</Label>
              <Select
                value={formData.company_size}
                onValueChange={(value) => onChange('company_size', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('profile.company_size_placeholder') || 'Select size'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">{t('profile.size_1_10') || '1-10 employees'}</SelectItem>
                  <SelectItem value="11-50">{t('profile.size_11_50') || '11-50 employees'}</SelectItem>
                  <SelectItem value="51-200">{t('profile.size_51_200') || '51-200 employees'}</SelectItem>
                  <SelectItem value="201-1000">{t('profile.size_201_1000') || '201-1000 employees'}</SelectItem>
                  <SelectItem value="1000+">{t('profile.size_1000_plus') || '1000+ employees'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Label htmlFor="website_url">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('profile.website_url') || 'Website URL'}
              </div>
            </Label>
            <Input
              id="website_url"
              type="text"
              value={formData.website_url}
              onChange={(e) => onChange('website_url', e.target.value)}
              placeholder={t('profile.website_url_placeholder') || 'www.example.com or https://example.com'}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              {t('profile.website_url_hint') || 'Enter the website URL (we\'ll automatically add https://)'}
            </p>
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

      {/* Sponsorship Information */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>{t('profile.sponsorship_title') || 'Sponsorship Opportunities'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('profile.sponsorship_desc') || 'Companies can sponsor challenges:'}
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>{t('profile.bronze_package') || 'Bronze'}:</strong> {t('profile.bronze_desc') || '50,000 Ft - 1 month'}</li>
            <li>• <strong>{t('profile.silver_package') || 'Silver'}:</strong> {t('profile.silver_desc') || '150,000 Ft - 3 months'}</li>
            <li>• <strong>{t('profile.gold_package') || 'Gold'}:</strong> {t('profile.gold_desc') || '300,000 Ft - 6 months'}</li>
          </ul>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline">
              {t('profile.request_quote') || 'Request Quote'}
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
              {t('profile.sponsorship_dashboard') || 'Sponsorship Dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-accent" />
            <span>{t('profile.visibility_settings') || 'Visibility Settings'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
            <div className="space-y-1">
              <div className="font-medium text-foreground">{t('profile.public_org_profile') || 'Public Organization Profile'}</div>
              <div className="text-sm text-muted-foreground">
                {t('profile.public_org_hint') || 'Your organization profile will appear in the public directory'}
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

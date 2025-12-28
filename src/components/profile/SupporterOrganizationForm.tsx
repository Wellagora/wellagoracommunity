import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupporterOrganizationFormProps {
  formData: {
    organization_name: string;
    organization_logo_url: string;
  };
  onChange: (field: string, value: any) => void;
  logoUploading: boolean;
}

export const SupporterOrganizationForm = ({ 
  formData, 
  onChange, 
  logoUploading 
}: SupporterOrganizationFormProps) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-[#112240] border-[#FFD700]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-[#FFD700]/20">
            <Building2 className="h-5 w-5 text-[#FFD700]" />
          </div>
          <span>{t('profile.organization_info')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="organization_name">{t('profile.organization_name')}</Label>
          <Input
            id="organization_name"
            value={formData.organization_name}
            onChange={(e) => onChange('organization_name', e.target.value)}
            placeholder="pl. Káli-medence Önkormányzat"
            className="bg-background/50"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>{t('profile.organization_logo')}</Label>
          <div className="flex items-center gap-4">
            {formData.organization_logo_url ? (
              <img
                src={formData.organization_logo_url}
                alt="Logo"
                className="h-16 w-16 object-contain rounded-lg border border-[#FFD700]/30 bg-white p-1"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg border border-dashed border-[#FFD700]/30 flex items-center justify-center bg-background/30">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange('org_logo_file', file);
                  }
                }}
                disabled={logoUploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('profile.logo_hint')}
              </p>
            </div>
            {logoUploading && (
              <Loader2 className="h-5 w-5 animate-spin text-[#FFD700]" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

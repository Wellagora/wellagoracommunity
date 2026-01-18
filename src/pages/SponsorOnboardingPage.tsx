import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Mail,
  Globe,
  Upload,
  Check,
  Loader2,
  ArrowRight,
  Camera
} from 'lucide-react';

const SponsorOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(profile?.organization_logo_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    companyName: profile?.organization_name || '',
    contactEmail: profile?.email || '',
    description: profile?.bio || '',
    websiteUrl: profile?.website_url || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('sponsor.logo_too_large') || 'A logó maximum 5MB lehet');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return profile?.organization_logo_url || null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('sponsor-logos')
      .upload(fileName, logoFile, { upsert: true });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      throw new Error('Failed to upload logo');
    }

    const { data: urlData } = supabase.storage
      .from('sponsor-logos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Upload logo if selected
      const logoUrl = await uploadLogo();

      // Update profile with sponsor information
      const { error } = await supabase
        .from('profiles')
        .update({
          organization_name: formData.companyName,
          email: formData.contactEmail,
          bio: formData.description,
          website_url: formData.websiteUrl,
          organization_logo_url: logoUrl,
          sponsor_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t('sponsor.onboarding_complete') || 'Szponzor profil sikeresen létrehozva!');
      navigate('/sponsor-dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t('common.error') || 'Hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.companyName) {
      toast.error(t('sponsor.company_name_required') || 'A cég neve kötelező');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const progress = (step / 3) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">{t('auth.login_required')}</h2>
            <Button onClick={() => navigate('/auth')}>
              {t('auth.login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {t('sponsor.onboarding_title') || 'Szponzor beállítások'}
            </h1>
            <span className="text-sm text-muted-foreground">
              {step}/3 {t('common.step') || 'lépés'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                {t('sponsor.company_info') || 'Cég adatok'}
              </CardTitle>
              <CardDescription>
                {t('sponsor.company_info_desc') || 'Add meg a céged alapvető adatait'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t('sponsor.company_name') || 'Cég neve'} *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder={t('sponsor.company_name_placeholder') || 'pl. ABC Kft.'}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  {t('sponsor.contact_email') || 'Kapcsolattartó e-mail'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="info@company.hu"
                    className="h-12 pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">
                  {t('sponsor.website') || 'Weboldal'}
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://www.company.hu"
                    className="h-12 pl-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Logo Upload */}
        {step === 2 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                {t('sponsor.logo_upload') || 'Logó feltöltés'}
              </CardTitle>
              <CardDescription>
                {t('sponsor.logo_upload_desc') || 'Töltsd fel a céged logóját (max. 5MB)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer group"
                >
                  <Avatar className="w-40 h-40 border-4 border-dashed border-emerald-200 group-hover:border-emerald-400 transition-colors">
                    <AvatarImage src={logoPreview || ''} alt="Company logo" />
                    <AvatarFallback className="bg-emerald-50 text-emerald-600 text-4xl">
                      {formData.companyName?.substring(0, 2).toUpperCase() || 'CO'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('sponsor.select_logo') || 'Logó kiválasztása'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPG, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                {t('sponsor.about_company') || 'Bemutatkozás'}
              </CardTitle>
              <CardDescription>
                {t('sponsor.about_company_desc') || 'Írd le röviden, mit csinál a céged'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('sponsor.description') || 'Bemutatkozó szöveg'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('sponsor.description_placeholder') || 'Írd le néhány mondatban, mit csinál a céged és miért támogatod a fenntarthatósági kezdeményezéseket...'}
                  className="min-h-[150px] resize-none"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-sm font-medium text-emerald-800 mb-3">
                  {t('sponsor.preview') || 'Előnézet'}
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                    <AvatarImage src={logoPreview || ''} />
                    <AvatarFallback className="bg-white text-emerald-600">
                      {formData.companyName?.substring(0, 2).toUpperCase() || 'CO'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {formData.companyName || 'Cég neve'}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description || 'Bemutatkozó szöveg...'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
            >
              {t('common.back') || 'Vissza'}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate('/sponsor-dashboard')}
            >
              {t('common.skip') || 'Kihagyás'}
            </Button>
          )}

          <Button
            onClick={nextStep}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === 3 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('common.complete') || 'Befejezés'}
              </>
            ) : (
              <>
                {t('common.next') || 'Tovább'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorOnboardingPage;

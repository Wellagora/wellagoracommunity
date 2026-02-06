import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProjectVillages } from "@/hooks/useProjectVillages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Camera,
  FileText,
  Globe,
  Award,
  Save,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
  Eye,
  ExternalLink,
  Facebook,
  Instagram,
} from "lucide-react";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  website?: string;
}

interface ReferenceLink {
  title: string;
  url: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  expert_title: string;
  location_city: string;
  avatar_url: string;
  bio: string;
  expert_bio_long: string;
  social_links: SocialLinks;
  references_links: ReferenceLink[];
}

interface ExpertProfilePreviewProps {
  formData: FormData;
  isModal?: boolean;
  expertId?: string;
  contentCount?: number;
  onViewAllContents?: () => void;
}

// Reusable preview component
export const ExpertProfilePreview = ({ 
  formData, 
  isModal = false,
  expertId,
  contentCount = 0,
  onViewAllContents,
}: ExpertProfilePreviewProps & {
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {!isModal && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Eye className="h-4 w-4" />
          {t("expert_studio.preview_title")}
        </div>
      )}
      <Card className={`overflow-hidden ${isModal ? 'border-0 shadow-none' : 'bg-card border-border'}`}>
        {/* Header/Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        
        {/* Profil tartalom */}
        <div className="p-6 -mt-12">
          {/* Avatar + Név */}
          <div className="flex items-end gap-4 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {formData.first_name?.[0]}{formData.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="mb-2">
              <h2 className="text-xl font-bold text-foreground">
                {formData.first_name || 'Keresztnév'} {formData.last_name || 'Vezetéknév'}
              </h2>
              {formData.expert_title && (
                <p className="text-primary font-medium">{formData.expert_title}</p>
              )}
              {formData.location_city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formData.location_city}
                </p>
              )}
            </div>
          </div>

          {/* Badge */}
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            {t("expert_studio.verified_expert")}
          </Badge>

          {/* Rövid bio */}
          {formData.bio && (
            <p className="text-muted-foreground mb-4">{formData.bio}</p>
          )}

          {/* Részletes bemutatkozás */}
          {formData.expert_bio_long && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-foreground">{t("expert_studio.about_me")}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {formData.expert_bio_long}
              </p>
            </div>
          )}

          {/* Közösségi linkek */}
          {(formData.social_links?.facebook || formData.social_links?.instagram || formData.social_links?.website) && (
            <div className="flex gap-2 mb-4">
              {formData.social_links.facebook && (
                <a href={formData.social_links.facebook} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-blue-600/20 text-blue-600 hover:bg-blue-600/30 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {formData.social_links.instagram && (
                <a href={formData.social_links.instagram} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-pink-600/20 text-pink-600 hover:bg-pink-600/30 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {formData.social_links.website && (
                <a href={formData.social_links.website} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* Referenciák */}
          {formData.references_links?.length > 0 && formData.references_links.some(r => r.title) && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                {t("expert_studio.refs_label")}
              </h4>
              <ul className="space-y-1">
                {formData.references_links.filter(r => r.title).map((ref, index) => (
                  <li key={index}>
                    {ref.url ? (
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ref.title}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{ref.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View all Workshop Secrets link - only in modal with expertId */}
          {isModal && expertId && contentCount > 0 && onViewAllContents && (
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={onViewAllContents}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors group"
              >
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  📚 {t("expert_studio.view_all_contents").replace("{{count}}", String(contentCount))}
                </span>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      </Card>
      {!isModal && (
        <p className="text-xs text-center text-muted-foreground">
          {t("expert_studio.preview_hint")}
        </p>
      )}
    </div>
  );
};

const ExpertProfileEditor = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { villages } = useProjectVillages();
  const KALI_VILLAGES = [...villages, "Egyéb"];
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    expert_title: '',
    location_city: '',
    avatar_url: '',
    bio: '',
    expert_bio_long: '',
    social_links: {
      facebook: '',
      instagram: '',
      website: '',
    },
    references_links: [],
  });

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const socialLinks = (data.social_links as unknown as SocialLinks) || { facebook: '', instagram: '', website: '' };
        const referencesLinks = (data.references_links as unknown as ReferenceLink[]) || [];
        
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          expert_title: (data as any).expert_title || '',
          location_city: (data as any).location_city || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          expert_bio_long: (data as any).expert_bio_long || '',
          social_links: socialLinks,
          references_links: referencesLinks,
        });
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [user]);

  // Save profile
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          expert_title: formData.expert_title,
          location_city: formData.location_city,
          avatar_url: formData.avatar_url,
          bio: formData.bio,
          expert_bio_long: formData.expert_bio_long,
          social_links: formData.social_links,
          references_links: formData.references_links,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (error) throw error;
      toast.success(t('expert_studio.save_success'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('expert_studio.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('expert_studio.avatar_too_large'));
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData({ ...formData, avatar_url: urlData.publicUrl });
      toast.success(t('expert_studio.avatar_uploaded'));
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(t('expert_studio.avatar_error'));
    }
  };

  // Reference management
  const addReference = () => {
    setFormData({
      ...formData,
      references_links: [...formData.references_links, { title: '', url: '' }],
    });
  };

  const removeReference = (index: number) => {
    const newRefs = formData.references_links.filter((_, i) => i !== index);
    setFormData({ ...formData, references_links: newRefs });
  };

  const updateReference = (index: number, field: 'title' | 'url', value: string) => {
    const newRefs = [...formData.references_links];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setFormData({ ...formData, references_links: newRefs });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* LEFT SIDE: Editor Form */}
      <div className="space-y-8">
        {/* SECTION 1: Basic Info */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-foreground">
            <User className="h-5 w-5 text-primary" />
            {t('expert_studio.basic_info')}
          </h3>
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {formData.first_name?.[0]}{formData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('expert_studio.profile_photo')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('expert_studio.photo_hint')}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t('expert_studio.first_name')}</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="János"
                  className="bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('expert_studio.last_name')}</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Kovács"
                  className="bg-background border-input"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('expert_studio.title_label')}</Label>
              <Input
                value={formData.expert_title}
                onChange={(e) => setFormData({ ...formData, expert_title: e.target.value })}
                placeholder={t('expert_studio.title_placeholder')}
                className="bg-background border-input"
              />
              <p className="text-xs text-muted-foreground">
                {t('expert_studio.title_hint')}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('expert_studio.location_label')}</Label>
              <Select
                value={formData.location_city}
                onValueChange={(value) => setFormData({ ...formData, location_city: value })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={t('expert_studio.location_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {KALI_VILLAGES.map((village) => (
                    <SelectItem key={village} value={village}>{village}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* SECTION 2: Bio */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            {t('expert_studio.bio_section')}
          </h3>
          <div className="space-y-4">
            {/* Short bio */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('expert_studio.short_bio_label')}</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t('expert_studio.short_bio_placeholder')}
                className="min-h-[80px] bg-background border-input"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/200
              </p>
            </div>

            {/* Long bio */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('expert_studio.bio_label')}</Label>
              <Textarea
                value={formData.expert_bio_long}
                onChange={(e) => setFormData({ ...formData, expert_bio_long: e.target.value })}
                placeholder={t('expert_studio.bio_placeholder')}
                className="min-h-[200px] bg-background border-input"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {t('expert_studio.bio_hint')}
              </p>
            </div>
          </div>
        </Card>

        {/* SECTION 3: Social Media */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            {t('expert_studio.social_label')}
          </h3>
          <div className="space-y-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                value={formData.social_links.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/felhasznalonev"
                className="bg-background border-input"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Label>
              <Input
                value={formData.social_links.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/felhasznalonev"
                className="bg-background border-input"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                {t('expert_studio.website')}
              </Label>
              <Input
                value={formData.social_links.website || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, website: e.target.value }
                })}
                placeholder="https://sajatweboldalam.hu"
                className="bg-background border-input"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 4: References */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6 text-foreground">
            <Award className="h-5 w-5 text-primary" />
            {t('expert_studio.refs_label')}
          </h3>
          <div className="space-y-4">
            {formData.references_links.map((ref, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={ref.title}
                    onChange={(e) => updateReference(index, 'title', e.target.value)}
                    placeholder={t('expert_studio.ref_title_placeholder')}
                    className="bg-background border-input"
                  />
                  <Input
                    value={ref.url}
                    onChange={(e) => updateReference(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="bg-background border-input"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReference(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addReference}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('expert_studio.add_reference')}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('expert_studio.refs_hint')}
            </p>
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-primary to-primary/80 py-6"
          size="lg"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {t('expert_studio.save_profile')}
        </Button>
      </div>

      {/* RIGHT SIDE: Live Preview */}
      <div className="lg:sticky lg:top-24 h-fit">
        <ExpertProfilePreview formData={formData} />
      </div>
    </div>
  );
};

export default ExpertProfileEditor;

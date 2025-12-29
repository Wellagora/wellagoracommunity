import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, User } from "lucide-react";
import { ExpertProfilePreview } from "./ExpertProfileEditor";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  website?: string;
}

interface ReferenceLink {
  title: string;
  url: string;
}

interface ProfileData {
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

interface ExpertProfileModalProps {
  expertId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExpertProfileModal = ({ expertId, isOpen, onClose }: ExpertProfileModalProps) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpertProfile = async () => {
      if (!expertId || !isOpen) return;
      setIsLoading(true);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', expertId)
        .single();

      if (data) {
        const socialLinks = (data.social_links as unknown as SocialLinks) || {};
        const referencesLinks = (data.references_links as unknown as ReferenceLink[]) || [];
        
        setProfile({
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

    loadExpertProfile();
  }, [expertId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t('expert_studio.expert_profile')}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <ExpertProfilePreview formData={profile} isModal={true} />
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {t('expert_studio.profile_not_found')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpertProfileModal;

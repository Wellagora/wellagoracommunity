import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Upload, X, UserPlus, Users } from "lucide-react";

interface ChallengeTeamSectionProps {
  isParticipating: boolean;
  isCompleted: boolean;
  onInviteFriends: () => void;
}

const ChallengeTeamSection = ({
  isParticipating,
  isCompleted,
  onInviteFriends
}: ChallengeTeamSectionProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: t('challenges.photo_uploaded'),
        description: t('challenges.progress_photo_desc'),
      });
    }
  };

  if (!isParticipating || isCompleted) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Share Progress Photo */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-glow transition-smooth">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">{t('challenges.share_progress_photo')}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('challenges.inspire_community')}
          </p>
          {uploadedPhoto ? (
            <div className="relative">
              <img 
                src={uploadedPhoto} 
                alt="Progress" 
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setUploadedPhoto(null)}
              >
                <X className="w-4 h-4 mr-2" />
                {t('challenges.remove_photo')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('challenges.upload_photo')}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </CardContent>
      </Card>

      {/* Invite Friends */}
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-success/5 hover:shadow-glow transition-smooth">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-accent" />
            <h4 className="font-semibold text-foreground">{t('challenges.invite_friends_cta')}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('challenges.double_impact')}
          </p>
          <Button
            onClick={onInviteFriends}
            className="w-full bg-gradient-primary hover:shadow-glow"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('challenges.invite_now')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeTeamSection;

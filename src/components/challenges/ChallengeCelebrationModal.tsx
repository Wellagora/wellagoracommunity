import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Share2, ArrowRight, Sparkles, Target, CheckCircle, Camera, Users, Heart, Upload, X } from "lucide-react";

interface ChallengeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  pointsEarned: number;
  co2Saved: number;
  nextChallengeId?: string;
  onPhotoUpload?: (photo: File) => void;
  onInviteFriends?: () => void;
}

const ChallengeCelebrationModal = ({
  isOpen,
  onClose,
  challengeTitle,
  pointsEarned,
  co2Saved,
  nextChallengeId,
  onPhotoUpload,
  onInviteFriends,
}: ChallengeCelebrationModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoUpload?.(file);
      toast({
        title: t('challenges.photo_uploaded'),
        description: t('challenges.photo_uploaded_desc'),
      });
    }
  };

  const handleShare = async () => {
    const shareText = `${t('challenges.completed_challenge_share')} "${challengeTitle}"! 🌱\n\n🏆 ${pointsEarned} ${t('challenges.points')}\n🌍 ${co2Saved} kg CO₂ ${t('challenges.saved')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('challenges.share_achievement'),
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      toast({
        title: t('challenges.link_copied'),
        description: t('challenges.link_copied_desc'),
      });
    }
  };

  const handleInviteFriends = () => {
    setShowInvite(true);
    onInviteFriends?.();
  };

  const handleNextChallenge = () => {
    if (nextChallengeId) {
      navigate(`/challenges/${nextChallengeId}`);
      onClose();
    }
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <Sparkles
                  className="text-warning"
                  style={{
                    width: `${12 + Math.random() * 12}px`,
                    height: `${12 + Math.random() * 12}px`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-scale-in shadow-glow">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('challenges.celebration_title')}
          </DialogTitle>

          <DialogDescription className="text-center space-y-4">
            <p className="text-base text-muted-foreground">
              {t('challenges.celebration_message')} <span className="font-semibold text-foreground">"{challengeTitle}"</span>
            </p>

            <div className="grid grid-cols-2 gap-3 my-6">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <Trophy className="w-6 h-6 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{pointsEarned}</div>
                <div className="text-xs text-muted-foreground">{t('challenges.points')}</div>
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <Target className="w-6 h-6 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{co2Saved} kg</div>
                <div className="text-xs text-muted-foreground">CO₂ {t('challenges.saved')}</div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{t('challenges.share_your_moment')}</span>
              </div>
              
              {uploadedPhoto ? (
                <div className="relative">
                  <img 
                    src={uploadedPhoto} 
                    alt="Challenge completion" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setUploadedPhoto(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
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
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('challenges.photo_inspire_others')}
              </p>
            </div>

            {/* Social Proof */}
            <div className="bg-success/10 rounded-lg p-4 border border-success/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-success" />
                <span className="font-semibold text-foreground">{t('challenges.community_impact')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('challenges.join_others_completed')}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {nextChallengeId && (
            <Button
              onClick={handleNextChallenge}
              className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              {t('challenges.next_challenge')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Invite Friends CTA */}
          <Button
            onClick={handleInviteFriends}
            variant="outline"
            className="w-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50 hover:shadow-glow"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('challenges.invite_friends')}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('challenges.share')}
            </Button>

            <Button
              onClick={handleViewDashboard}
              variant="outline"
              className="w-full hover:bg-primary/10"
            >
              {t('challenges.view_dashboard')}
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeCelebrationModal;

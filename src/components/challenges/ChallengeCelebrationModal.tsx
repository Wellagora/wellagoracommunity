import { useEffect, useState } from "react";
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
import { Trophy, Share2, ArrowRight, Sparkles, Target, CheckCircle } from "lucide-react";

interface ChallengeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  pointsEarned: number;
  co2Saved: number;
  nextChallengeId?: string;
}

const ChallengeCelebrationModal = ({
  isOpen,
  onClose,
  challengeTitle,
  pointsEarned,
  co2Saved,
  nextChallengeId,
}: ChallengeCelebrationModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = () => {
    // TODO: Implement native share or social sharing
    if (navigator.share) {
      navigator.share({
        title: t('challenges.share_achievement'),
        text: `${t('challenges.completed_challenge_share')} "${challengeTitle}"! 🌱`,
        url: window.location.href,
      });
    }
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
      <DialogContent className="sm:max-w-md">
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
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-scale-in">
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

            <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t('challenges.achievement_unlocked')}
              </span>
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

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full hover:bg-primary/10"
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

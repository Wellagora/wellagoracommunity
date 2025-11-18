import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Sparkles, 
  Share2, 
  ArrowRight, 
  Heart,
  Users,
  Leaf,
  Star
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import celebrationImage from "@/assets/community-celebration.jpg";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    points: number;
    impact: string;
    level?: number;
  };
}

const CelebrationModal = ({ isOpen, onClose, achievement }: CelebrationModalProps) => {
  const { t } = useLanguage();
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfettiActive(true);
      const timer = setTimeout(() => setConfettiActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `🎉 I just ${achievement.title}!`,
        text: `${achievement.description} Join me on this sustainability journey!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `🎉 I just ${achievement.title}! ${achievement.description} Join me on Wellagora!`
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-background via-primary/5 to-success/10 border-2 border-primary/20">
        {/* Confetti Effect */}
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                <Sparkles className="w-6 h-6 text-warning" />
              </div>
            ))}
          </div>
        )}

        <DialogHeader>
          <div className="text-center space-y-6">
            {/* Hero Image */}
            <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-glow">
              <img 
                src={celebrationImage} 
                alt="Community celebration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              <div className="absolute top-2 right-2">
                <Trophy className="w-8 h-8 text-warning" />
              </div>
            </div>

            <div className="space-y-4">
              <Badge className="bg-gradient-primary text-white px-6 py-2 text-lg font-semibold">
                🎉 {t('celebration.achievement_unlocked')}
              </Badge>
              
              <DialogTitle className="text-3xl lg:text-4xl font-heading font-bold text-center">
                {achievement.title}
              </DialogTitle>
              
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                {achievement.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-glass backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
              <Star className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">+{achievement.points}</div>
              <div className="text-sm text-muted-foreground">{t('celebration.points_earned')}</div>
            </div>
            
            <div className="bg-glass backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
              <Leaf className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{achievement.impact}</div>
              <div className="text-sm text-muted-foreground">{t('celebration.co2_saved')}</div>
            </div>
            
            {achievement.level && (
              <div className="bg-glass backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{t('celebration.level')} {achievement.level}</div>
                <div className="text-sm text-muted-foreground">{t('celebration.reached')}</div>
              </div>
            )}
          </div>

          {/* Community Impact */}
          <div className="bg-gradient-primary/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">{t('celebration.community_impact')}</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              {t('celebration.your_actions')}
            </p>
            <Progress value={75} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{t('celebration.community_goal')}</span>
              <span>75% {t('celebration.complete')}</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-success/10 rounded-xl p-4 border border-success/20">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">{t('celebration.making_difference')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('celebration.regional_impact')
                .split(/(\{count\}|\{tons\})/)
                .map((part, index) => {
                  if (part === '{count}') {
                    return <strong key={index}>18</strong>;
                  }
                  if (part === '{tons}') {
                    return <strong key={index}>2.4</strong>;
                  }
                  return part;
                })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-spring group"
            >
              <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('celebration.share_achievement')}
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-spring group"
            >
              {t('celebration.continue_journey')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Next Challenge Preview */}
          <div className="text-center p-4 bg-accent/5 rounded-xl border border-accent/20">
            <p className="text-sm text-muted-foreground mb-2">{t('celebration.next_challenge_ready')}</p>
            <Badge className="bg-accent/10 text-accent border-accent/20">
              🚴‍♀️ {t('celebration.bike_week_coming')}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;
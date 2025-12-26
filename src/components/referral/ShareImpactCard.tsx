import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useReferral } from "@/hooks/useReferral";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, Trophy, Leaf, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ShareImpactCardProps {
  totalPoints?: number;
  challengesCompleted?: number;
  co2Saved?: number;
  className?: string;
}

export const ShareImpactCard = memo(({ 
  totalPoints = 0, 
  challengesCompleted = 0, 
  co2Saved = 0,
  className = ""
}: ShareImpactCardProps) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { generateShareLink, referralCode } = useReferral();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareLink = generateShareLink();
  const displayName = profile?.public_display_name || 
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
    t('share_impact.anonymous');

  const shareText = `${t('share_impact.my_impact')}\n\n` +
    `🏆 ${challengesCompleted} ${t('share_impact.challenges_completed')}\n` +
    `⭐ ${totalPoints} ${t('share_impact.points_earned')}\n` +
    `🌿 ${co2Saved.toFixed(1)}kg ${t('share_impact.co2_saved')}\n\n` +
    `${t('share_impact.join_me')}\n${shareLink}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share_impact.my_impact'),
          text: shareText,
          url: shareLink,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: t('referral.link_copied'),
        description: shareLink,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!user) return null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-accent p-4 sm:p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-white/30">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-white/20 text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm opacity-80">{t('share_impact.title')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
            <Trophy className="h-5 w-5 mx-auto mb-1 opacity-80" />
            <div className="text-xl sm:text-2xl font-bold">{challengesCompleted}</div>
            <div className="text-[10px] sm:text-xs opacity-80">{t('share_impact.challenges_completed')}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
            <Users className="h-5 w-5 mx-auto mb-1 opacity-80" />
            <div className="text-xl sm:text-2xl font-bold">{totalPoints}</div>
            <div className="text-[10px] sm:text-xs opacity-80">{t('share_impact.points_earned')}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center backdrop-blur-sm">
            <Leaf className="h-5 w-5 mx-auto mb-1 opacity-80" />
            <div className="text-xl sm:text-2xl font-bold">{co2Saved.toFixed(1)}</div>
            <div className="text-[10px] sm:text-xs opacity-80">kg CO₂</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <CardContent className="p-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleShare} 
            className="flex-1 gap-2"
            variant="default"
          >
            <Share2 className="h-4 w-4" />
            {t('share_impact.share_button')}
          </Button>
          <Button 
            onClick={handleCopy} 
            variant="outline"
            size="icon"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        {referralCode && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('referral.your_code')}: <span className="font-mono font-medium">{referralCode}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
});

ShareImpactCard.displayName = 'ShareImpactCard';

export default ShareImpactCard;

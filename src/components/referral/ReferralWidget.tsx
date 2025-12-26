import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReferral } from "@/hooks/useReferral";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Gift, Users, UserPlus, Trophy, MessageCircle, Mail, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ReferralWidget = memo(() => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { referralCode, stats, loading, generateShareLink } = useReferral();
  const [copied, setCopied] = useState(false);

  const shareLink = generateShareLink();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t('referral.link_copied'),
      description: shareLink,
    });
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: t('referral.link_copied'),
        description: referralCode,
      });
    }
  };

  const handleShareWhatsApp = () => {
    const text = `${t('referral.share_message') || 'Join me on this sustainability journey!'}\n\n${shareLink}`;
    navigator.clipboard.writeText(text);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    toast({
      title: t('challenges.link_copied'),
      description: t('challenges.whatsapp_blocked_hint'),
    });
  };

  const handleShareEmail = () => {
    const subject = t('referral.email_subject') || 'Join me on a sustainability journey!';
    const body = `${t('referral.share_message') || 'Join me!'}\n\n${shareLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-primary" />
          {t('referral.invite_friends') || 'Invite Friends'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('referral.your_code')}
          </label>
          <div className="flex gap-2">
            <Input
              value={referralCode || ''}
              readOnly
              className="font-mono text-center bg-background/50 border-primary/30"
            />
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="icon"
              className="flex-shrink-0 border-primary/30 hover:bg-primary/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="flex-col h-auto py-2 border-border/50 hover:bg-primary/10"
          >
            {copied ? (
              <Check className="w-4 h-4 mb-1 text-success" />
            ) : (
              <Share2 className="w-4 h-4 mb-1" />
            )}
            <span className="text-xs">{t('referral.copy_link')}</span>
          </Button>
          <Button
            onClick={handleShareWhatsApp}
            variant="outline"
            size="sm"
            className="flex-col h-auto py-2 border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366]"
          >
            <MessageCircle className="w-4 h-4 mb-1" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button
            onClick={handleShareEmail}
            variant="outline"
            size="sm"
            className="flex-col h-auto py-2 border-border/50 hover:bg-accent/10"
          >
            <Mail className="w-4 h-4 mb-1" />
            <span className="text-xs">Email</span>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold text-foreground">{stats.pending + stats.joined + stats.completed}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{t('referral.stats_invited')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">{stats.joined}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{t('referral.stats_joined')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Check className="w-3.5 h-3.5 text-success" />
            </div>
            <div className="text-lg font-bold text-success">{stats.completed}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{t('referral.stats_completed')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-lg font-bold text-accent">{stats.totalPoints}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{t('referral.stats_points')}</div>
          </div>
        </div>

        {/* Reward Hint */}
        <div className="bg-success/10 rounded-lg p-3 border border-success/20">
          <p className="text-xs text-center text-success-foreground">
            🎁 {t('referral.reward_hint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

ReferralWidget.displayName = "ReferralWidget";

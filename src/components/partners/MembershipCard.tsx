import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { QrCode, Download, CreditCard, Sparkles, Store, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MembershipCardProps {
  variant?: "compact" | "full";
  className?: string;
}

export const MembershipCard = memo(({ variant = "full", className = "" }: MembershipCardProps) => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  if (!user) return null;

  const memberNumber = (profile as any)?.referral_code || user.id.slice(0, 8).toUpperCase();
  const displayName = profile?.public_display_name || 
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
    (language === "hu" ? "Tag" : "Member");
  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).getFullYear() 
    : new Date().getFullYear();

  // Generate QR code URL using a free service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WELLAGORA-MEMBER-${memberNumber}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(memberNumber);
    setCopied(true);
    toast({
      title: t('membership.number_copied'),
      description: memberNumber,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "compact") {
    return (
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={`gap-2 ${className}`}>
            <CreditCard className="w-4 h-4" />
            {t('membership.button_label')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('membership.card_title')}
            </DialogTitle>
          </DialogHeader>
          <MembershipCardContent 
            displayName={displayName}
            memberNumber={memberNumber}
            memberSince={memberSince}
            avatarUrl={profile?.avatar_url}
            qrCodeUrl={qrCodeUrl}
            onCopyNumber={handleCopyNumber}
            copied={copied}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-2xl border-0 ${className}`}>
      <MembershipCardContent 
        displayName={displayName}
        memberNumber={memberNumber}
        memberSince={memberSince}
        avatarUrl={profile?.avatar_url}
        qrCodeUrl={qrCodeUrl}
        onCopyNumber={handleCopyNumber}
        copied={copied}
      />
    </Card>
  );
});

interface MembershipCardContentProps {
  displayName: string;
  memberNumber: string;
  memberSince: number;
  avatarUrl?: string | null;
  qrCodeUrl: string;
  onCopyNumber: () => void;
  copied: boolean;
}

const MembershipCardContent = memo(({
  displayName,
  memberNumber,
  memberSince,
  avatarUrl,
  qrCodeUrl,
  onCopyNumber,
  copied
}: MembershipCardContentProps) => {
  const { t } = useLanguage();

  return (
    <CardContent className="p-6">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl tracking-tight text-white drop-shadow-sm">WellAgora</h3>
            <p className="text-sm text-white/90 font-medium">
              {t('membership.digital_card')}
            </p>
          </div>
        </div>
        <Avatar className="h-14 w-14 border-3 border-white/40 shadow-lg">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Member Info */}
      <div className="mb-6">
        <p className="text-sm text-white/80 mb-1 font-medium">
          {t('membership.member_name')}
        </p>
        <p className="font-bold text-2xl text-white drop-shadow-sm">{displayName}</p>
      </div>

      {/* Member Number with QR */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-white/80 mb-1 font-medium">
            {t('membership.member_number')}
          </p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-lg tracking-widest font-bold text-white">{memberNumber}</p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={onCopyNumber}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-sm text-white/70 mt-2 font-medium">
            {t('membership.member_since').replace('{{year}}', String(memberSince))}
          </p>
        </div>

        {/* QR Code - Black on White for perfect scanability */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-xl ring-4 ring-white/30">
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Partner Discount Hint */}
      <div className="mt-6 pt-4 border-t border-white/30">
        <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
          <Store className="w-5 h-5" />
          <span>
            {t('membership.show_at_partners')}
          </span>
        </div>
      </div>
    </CardContent>
  );
});

MembershipCard.displayName = "MembershipCard";
MembershipCardContent.displayName = "MembershipCardContent";

export default MembershipCard;

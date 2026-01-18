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
      title: language === "hu" ? "Tagszám másolva!" : "Member number copied!",
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
            {language === "hu" ? "Tagsági Kártya" : "Membership Card"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {language === "hu" ? "WellAgora Tagsági Kártya" : "WellAgora Membership Card"}
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
    <Card className={`overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl ${className}`}>
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
  const { language } = useLanguage();

  return (
    <CardContent className="p-6">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">WellAgora</h3>
            <p className="text-xs text-white/60">
              {language === "hu" ? "Tagsági Kártya" : "Membership Card"}
            </p>
          </div>
        </div>
        <Avatar className="h-12 w-12 border-2 border-white/20">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-white/10 text-white">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Member Info */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-1">
          {language === "hu" ? "Tag neve" : "Member Name"}
        </p>
        <p className="font-semibold text-xl">{displayName}</p>
      </div>

      {/* Member Number with QR */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-1">
            {language === "hu" ? "Tagszám" : "Member Number"}
          </p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-lg tracking-wider">{memberNumber}</p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={onCopyNumber}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            {language === "hu" ? `Tag ${memberSince} óta` : `Member since ${memberSince}`}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-white rounded-lg p-1.5 shadow-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Partner Discount Hint */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Store className="w-4 h-4" />
          <span>
            {language === "hu" 
              ? "Mutasd fel partnereink üzleteiben a kedvezményekért!" 
              : "Show at partner stores for discounts!"}
          </span>
        </div>
      </div>
    </CardContent>
  );
});

MembershipCard.displayName = "MembershipCard";
MembershipCardContent.displayName = "MembershipCardContent";

export default MembershipCard;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Copy, Check, MessageCircle } from "lucide-react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  challengeId: string;
}

const InviteFriendsModal = ({
  isOpen,
  onClose,
  challengeTitle,
  challengeId,
}: InviteFriendsModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [emails, setEmails] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/challenges/${challengeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t('challenges.link_copied'),
      description: t('challenges.link_copied_desc'),
    });
  };

  const handleSendInvites = () => {
    // TODO: Implement email sending logic
    toast({
      title: t('challenges.invites_sent'),
      description: t('challenges.invites_sent_desc'),
    });
    onClose();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `${t('challenges.join_me_challenge')} "${challengeTitle}"!\n\n${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-foreground">
            {t('challenges.invite_friends_title')}
          </DialogTitle>
          
          <DialogDescription className="text-center">
            {t('challenges.invite_friends_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('challenges.share_link')}
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* WhatsApp Share */}
          <Button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('challenges.share_whatsapp')}
          </Button>

          {/* Email Invites */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('challenges.invite_by_email')}
            </label>
            <Input
              placeholder={t('challenges.enter_emails')}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('challenges.separate_emails')}
            </p>
          </div>

          <Button
            onClick={handleSendInvites}
            className="w-full bg-gradient-primary hover:shadow-glow"
            disabled={!emails}
          >
            <Mail className="w-4 h-4 mr-2" />
            {t('challenges.send_invites')}
          </Button>

          {/* Motivational Message */}
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              {t('challenges.invite_motivation')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;

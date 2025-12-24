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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Copy, Check, MessageCircle, Loader2 } from "lucide-react";

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
  const { user, profile } = useAuth();
  const [emails, setEmails] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSendInvites = async () => {
    // Parse and validate emails
    const emailList = emails
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emailList.length === 0) {
      toast({
        title: t('challenges.error'),
        description: t('challenges.enter_valid_emails'),
        variant: "destructive",
      });
      return;
    }

    // Validate all emails
    const invalidEmails = emailList.filter(e => !validateEmail(e));
    if (invalidEmails.length > 0) {
      toast({
        title: t('challenges.invalid_emails'),
        description: `${invalidEmails.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      // Fallback: show copyable link
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: t('challenges.link_copied'),
        description: t('challenges.share_link_manually'),
      });
      onClose();
      return;
    }

    setSending(true);

    try {
      // Prepare invitations
      const invitations = emailList.map(email => ({
        email,
        name: email.split('@')[0], // Use email prefix as name
      }));

      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          challengeId,
          challengeTitle,
          invitations,
          organizationId: profile?.organization_id || user.id, // Fallback to user id if no org
        },
      });

      if (error) {
        console.error('Error sending invitations:', error);
        throw new Error(error.message || 'Failed to send invitations');
      }

      if (data?.success) {
        toast({
          title: t('challenges.invites_sent'),
          description: t('challenges.invites_sent_desc').replace('{count}', String(data.sent || emailList.length)),
        });
        setEmails("");
        onClose();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Failed to send invitations:', error);
      // Fallback: copy link and show message
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: t('challenges.link_copied'),
        description: t('challenges.email_fallback_message'),
      });
      onClose();
    } finally {
      setSending(false);
    }
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
            disabled={!emails || sending}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {sending ? t('challenges.sending') : t('challenges.send_invites')}
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

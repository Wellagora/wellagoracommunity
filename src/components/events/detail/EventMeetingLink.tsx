import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface EventMeetingLinkProps {
  meetingUrl?: string | null;
  isRegistered: boolean;
}

const EventMeetingLink = ({ meetingUrl, isRegistered }: EventMeetingLinkProps) => {
  const { t } = useLanguage();

  if (!meetingUrl || !isRegistered) {
    return null;
  }

  const copyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    toast.success(t("common.linkCopied") || "Link copied!");
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-xl p-4">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {t("events.meetingLink") || "Meeting Link"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("events.meetingLinkDescription") || "Join the online event using this link"}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={() => window.open(meetingUrl, "_blank")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("events.joinMeeting") || "Join Meeting"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventMeetingLink;

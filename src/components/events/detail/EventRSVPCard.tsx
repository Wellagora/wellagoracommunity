import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Check, X, HelpCircle, Video, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventRSVPCardProps {
  user: { id: string } | null;
  rsvpStatus?: "going" | "maybe" | "not_going";
  currentParticipants: number;
  maxParticipants: number | null;
  isFull: boolean;
  spotsLeft: number | null;
  isOnline: boolean;
  onRsvp: (status: "going" | "maybe" | "not_going") => void;
  onLogin: () => void;
  isLoading: boolean;
}

const EventRSVPCard = ({
  user,
  rsvpStatus,
  currentParticipants,
  maxParticipants,
  isFull,
  spotsLeft,
  isOnline,
  onRsvp,
  onLogin,
  isLoading,
}: EventRSVPCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Online badge */}
        {isOnline && (
          <Badge variant="secondary" className="w-full justify-center gap-2 py-2">
            <Video className="w-4 h-4" />
            {t("events.onlineEvent") || "Online Event"}
          </Badge>
        )}

        {/* Participants info */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span>{t("events.participants") || "Participants"}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-lg">{currentParticipants}</span>
            {maxParticipants && (
              <span className="text-muted-foreground">/{maxParticipants}</span>
            )}
          </div>
        </div>

        {/* Capacity bar */}
        {maxParticipants && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                isFull ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${Math.min((currentParticipants / maxParticipants) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Spots warning */}
        {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-lg text-sm text-center font-medium">
            {spotsLeft} {t("events.spotsLeft") || "spots left"}!
          </div>
        )}

        {/* RSVP status indicator */}
        {rsvpStatus === "going" && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{t("events.youreGoing") || "You're going!"}</span>
          </div>
        )}

        {rsvpStatus === "maybe" && (
          <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">{t("events.youMaybeGoing") || "You might attend"}</span>
          </div>
        )}

        {/* RSVP Buttons */}
        {user ? (
          <div className="space-y-2">
            {/* Main action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={rsvpStatus === "going" ? "default" : "outline"}
                className={cn(
                  "flex-col h-auto py-3 gap-1",
                  rsvpStatus === "going" && "ring-2 ring-primary"
                )}
                disabled={(isFull && rsvpStatus !== "going") || isLoading}
                onClick={() => onRsvp("going")}
              >
                <Check className="w-5 h-5" />
                <span className="text-xs">{t("events.going") || "Going"}</span>
              </Button>
              <Button
                variant={rsvpStatus === "maybe" ? "secondary" : "outline"}
                className={cn(
                  "flex-col h-auto py-3 gap-1",
                  rsvpStatus === "maybe" && "ring-2 ring-secondary"
                )}
                disabled={isLoading}
                onClick={() => onRsvp("maybe")}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs">{t("events.maybe") || "Maybe"}</span>
              </Button>
              <Button
                variant={rsvpStatus === "not_going" ? "destructive" : "outline"}
                className="flex-col h-auto py-3 gap-1"
                disabled={isLoading}
                onClick={() => onRsvp("not_going")}
              >
                <X className="w-5 h-5" />
                <span className="text-xs">{t("events.notGoing") || "No"}</span>
              </Button>
            </div>

            {isFull && rsvpStatus !== "going" && (
              <p className="text-sm text-center text-muted-foreground">
                {t("events.eventFull") || "Event is full"}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              {t("events.loginToRsvp") || "Log in to RSVP to this event"}
            </p>
            <Button className="w-full" onClick={onLogin}>
              {t("common.login") || "Log in"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventRSVPCard;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface EventParticipantsProps {
  eventId: string;
  maxToShow?: number;
}

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

const EventParticipants = ({ eventId, maxToShow = 8 }: EventParticipantsProps) => {
  const { t } = useLanguage();

  const { data: participants, isLoading } = useQuery({
    queryKey: ["eventParticipants", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          id,
          user_id,
          status,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId)
        .eq("status", "going")
        .limit(maxToShow + 1);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !participants || participants.length === 0) {
    return null;
  }

  const displayParticipants = participants.slice(0, maxToShow);
  const remainingCount = participants.length > maxToShow ? participants.length - maxToShow : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t("events.attendees") || "Who's going"}
        </h2>
        <div className="flex flex-wrap gap-3">
          {displayParticipants.map((rsvp) => {
            const profile = rsvp.profiles as unknown as Participant | null;
            if (!profile) return null;
            
            return (
              <div key={rsvp.id} className="flex items-center gap-2 bg-muted/50 rounded-full pr-3 pl-1 py-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {profile.first_name} {profile.last_name?.[0]}.
                </span>
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
              <span className="text-sm text-muted-foreground">
                +{remainingCount} {t("events.more") || "more"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventParticipants;

import { memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GhostCard } from "@/components/ui/GhostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MapPin, Clock, X, Check, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  start_date: string;
  location_name: string | null;
  village: string | null;
}

interface EventRsvp {
  id: string;
  event_id: string;
  status: "going" | "maybe" | "not_going";
  events: Event;
}

export const MyEventsWidget = memo(() => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch user's RSVPs with event details
  const { data: myEvents, isLoading } = useQuery({
    queryKey: ["myEvents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          id,
          event_id,
          status,
          events (
            id,
            title,
            start_date,
            location_name,
            village
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["going", "maybe"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter for future events only
      const now = new Date().toISOString();
      return (data as unknown as EventRsvp[]).filter(
        (rsvp) => rsvp.events && rsvp.events.start_date >= now
      );
    },
    enabled: !!user?.id,
  });

  // Cancel RSVP mutation
  const cancelRsvpMutation = useMutation({
    mutationFn: async (rsvpId: string) => {
      const { error } = await supabase.from("event_rsvps").delete().eq("id", rsvpId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEvents"] });
      queryClient.invalidateQueries({ queryKey: ["userRsvps"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
      toast.success(t("events.rsvp_cancelled") || "RSVP cancelled");
    },
    onError: () => {
      toast.error(t("events.rsvp_error"));
    },
  });

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, "d", { locale: dateLocale }),
      month: format(date, "MMM", { locale: dateLocale }),
      time: format(date, "HH:mm", { locale: dateLocale }),
      weekday: format(date, "EEE", { locale: dateLocale }),
    };
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t("events.my_events")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-3/4" />
                  <div className="h-3 bg-muted/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!myEvents || myEvents.length === 0) {
    return (
      <GhostCard
        icon={Calendar}
        title={t("common.no_events_yet")}
        description={t("common.no_events_yet_desc")}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t("events.my_events")}
          </CardTitle>
          <Link to="/events">
            <Button variant="ghost" size="sm" className="text-xs">
              {t("events.view_all")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {myEvents.slice(0, 5).map((rsvp) => {
          const dateInfo = formatEventDate(rsvp.events.start_date);

          return (
            <div
              key={rsvp.id}
              className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
            >
              {/* Date badge */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-primary leading-none">{dateInfo.day}</span>
                <span className="text-[10px] text-primary/80 uppercase">{dateInfo.month}</span>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {rsvp.events.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={
                      rsvp.status === "going"
                        ? "bg-success/10 text-success border-success/30 shrink-0"
                        : "bg-warning/10 text-warning border-warning/30 shrink-0"
                    }
                  >
                    {rsvp.status === "going" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <HelpCircle className="w-3 h-3 mr-1" />
                    )}
                    {rsvp.status === "going" ? t("events.going") : t("events.maybe")}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateInfo.weekday} {dateInfo.time}
                  </span>
                  {rsvp.events.location_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {rsvp.events.location_name}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-destructive hover:text-destructive mt-1 -ml-2"
                  onClick={() => cancelRsvpMutation.mutate(rsvp.id)}
                  disabled={cancelRsvpMutation.isPending}
                >
                  <X className="w-3 h-3 mr-1" />
                  {t("events.cancel_rsvp")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

MyEventsWidget.displayName = "MyEventsWidget";

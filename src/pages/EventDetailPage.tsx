import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Share2,
  CalendarPlus,
  Building2
} from "lucide-react";

const villageColors: Record<string, string> = {
  "Kővágóörs": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Mindszentkálla": "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Kékkút": "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "Szentbékkálla": "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

const EVENT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
];

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  village: string | null;
  current_participants: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_public: boolean | null;
  organization_id: string | null;
  created_by: string | null;
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  // Fetch user's RSVP status
  const { data: userRsvp } = useQuery({
    queryKey: ["eventRsvp", id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  // Fetch organizer info
  const { data: organizer } = useQuery({
    queryKey: ["eventOrganizer", event?.organization_id],
    queryFn: async () => {
      if (!event?.organization_id) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("name, logo_url")
        .eq("id", event.organization_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!event?.organization_id,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: "going" | "maybe" | "not_going") => {
      if (!user?.id || !id) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("event_rsvps")
          .update({ status })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_rsvps")
          .insert({ event_id: id, user_id: user.id, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventRsvp", id] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success(t("events.rsvpSuccess") || "RSVP updated!");
    },
    onError: () => {
      toast.error(t("events.rsvpError") || "Failed to update RSVP");
    },
  });

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, "d", { locale: dateLocale }),
      month: format(date, "MMMM", { locale: dateLocale }),
      year: format(date, "yyyy", { locale: dateLocale }),
      weekday: format(date, "EEEE", { locale: dateLocale }),
      time: format(date, "HH:mm", { locale: dateLocale }),
      full: format(date, "yyyy. MMMM d., EEEE", { locale: dateLocale }),
    };
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("common.linkCopied") || "Link copied!");
    }
  };

  const addToCalendar = () => {
    if (!event) return;
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location_name || "")}`;
    
    window.open(calendarUrl, "_blank");
  };

  const getFallbackImage = () => {
    if (!event) return EVENT_FALLBACK_IMAGES[0];
    const index = event.id.charCodeAt(0) % EVENT_FALLBACK_IMAGES.length;
    return EVENT_FALLBACK_IMAGES[index];
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 md:h-96 w-full rounded-xl mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("events.notFound") || "Event not found"}</h1>
          <Button onClick={() => navigate("/esemenyek")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("events.backToEvents") || "Back to events"}
          </Button>
        </div>
      </div>
    );
  }

  const dateInfo = formatEventDate(event.start_date);
  const villageColor = event.village ? villageColors[event.village] : "bg-muted text-muted-foreground";
  const spotsLeft = event.max_participants ? event.max_participants - (event.current_participants || 0) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const rsvpStatus = userRsvp?.status as "going" | "maybe" | "not_going" | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <img
          src={event.image_url || getFallbackImage()}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getFallbackImage();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/esemenyek")}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back") || "Vissza"}
        </Button>

        {/* Share button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-foreground"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        {/* Event title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container max-w-4xl mx-auto">
            {event.village && (
              <Badge variant="outline" className={`mb-3 ${villageColor} bg-white/90`}>
                {event.village}
              </Badge>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Date & Time Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-xl p-4 text-center min-w-[80px]">
                    <div className="text-3xl font-bold text-primary">{dateInfo.day}</div>
                    <div className="text-sm text-muted-foreground uppercase">{dateInfo.month}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg capitalize">{dateInfo.weekday}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{dateInfo.time}</span>
                      {event.end_date && (
                        <span>- {format(new Date(event.end_date), "HH:mm", { locale: dateLocale })}</span>
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={addToCalendar}
                      className="p-0 h-auto mt-2 text-primary"
                    >
                      <CalendarPlus className="w-4 h-4 mr-1" />
                      {t("events.addToCalendar") || "Add to calendar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {(event.location_name || event.location_address) && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{event.location_name}</h3>
                      {event.location_address && (
                        <p className="text-muted-foreground mt-1">{event.location_address}</p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-2 text-primary"
                        onClick={() => {
                          const query = event.location_address || event.location_name;
                          window.open(`https://maps.google.com/?q=${encodeURIComponent(query || "")}`, "_blank");
                        }}
                      >
                        {t("events.openInMaps") || "Open in Maps"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {event.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">{t("events.about") || "About this event"}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            {organizer && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">{t("events.organizer") || "Organizer"}</h2>
                  <div className="flex items-center gap-4">
                    {organizer.logo_url ? (
                      <img
                        src={organizer.logo_url}
                        alt={organizer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{organizer.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - RSVP */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {/* Participants info */}
                  {event.max_participants && (
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5" />
                        <span>{t("events.participants") || "Participants"}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{event.current_participants || 0}</span>
                        <span className="text-muted-foreground">/{event.max_participants}</span>
                      </div>
                    </div>
                  )}

                  {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-lg text-sm text-center">
                      {t("events.spotsLeft") || `Only ${spotsLeft} spots left!`}
                    </div>
                  )}

                  {/* RSVP status indicator */}
                  {rsvpStatus === "going" && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">{t("events.youreGoing") || "You're going!"}</span>
                    </div>
                  )}

                  {/* RSVP Buttons */}
                  {user ? (
                    <div className="space-y-2">
                      <Button
                        variant={rsvpStatus === "going" ? "default" : "outline"}
                        className="w-full"
                        disabled={isFull && rsvpStatus !== "going"}
                        onClick={() => rsvpMutation.mutate("going")}
                      >
                        {rsvpStatus === "going" ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t("events.going") || "Going"}
                          </>
                        ) : isFull ? (
                          t("events.eventFull") || "Event is full"
                        ) : (
                          t("events.join") || "Join Event"
                        )}
                      </Button>
                      {!isFull && (
                        <Button
                          variant={rsvpStatus === "maybe" ? "secondary" : "ghost"}
                          className="w-full"
                          onClick={() => rsvpMutation.mutate("maybe")}
                        >
                          {t("events.maybe") || "Maybe"}
                        </Button>
                      )}
                      {rsvpStatus && rsvpStatus !== "not_going" && (
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground"
                          onClick={() => rsvpMutation.mutate("not_going")}
                        >
                          {t("events.cantGo") || "Can't go"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        {t("events.loginToRsvp") || "Log in to RSVP to this event"}
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => navigate("/auth", { state: { returnTo: `/esemenyek/${id}` } })}
                      >
                        {t("common.login") || "Log in"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

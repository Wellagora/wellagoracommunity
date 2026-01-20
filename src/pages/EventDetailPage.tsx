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
  Clock, 
  MapPin, 
  Share2,
  CalendarPlus,
  Navigation
} from "lucide-react";
import EventParticipants from "@/components/events/detail/EventParticipants";
import RelatedEvents from "@/components/events/detail/RelatedEvents";
import EventMeetingLink from "@/components/events/detail/EventMeetingLink";
import EventOrganizerCard from "@/components/events/detail/EventOrganizerCard";
import EventRSVPCard from "@/components/events/detail/EventRSVPCard";
import EventSponsorsSection from "@/components/events/detail/EventSponsorsSection";

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
  project_id: string | null;
  latitude: number | null;
  longitude: number | null;
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
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", id] });
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

  const openDirections = () => {
    if (!event) return;
    if (event.latitude && event.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, "_blank");
    } else {
      const query = event.location_address || event.location_name;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query || "")}`, "_blank");
    }
  };

  const getFallbackImage = () => {
    if (!event) return EVENT_FALLBACK_IMAGES[0];
    const index = event.id.charCodeAt(0) % EVENT_FALLBACK_IMAGES.length;
    return EVENT_FALLBACK_IMAGES[index];
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
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
  const currentParticipants = event.current_participants || 0;
  const spotsLeft = event.max_participants ? event.max_participants - currentParticipants : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const rsvpStatus = userRsvp?.status as "going" | "maybe" | "not_going" | undefined;
  const isOnline = event.location_name?.toLowerCase().includes("online") || false;
  const isRegistered = rsvpStatus === "going";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-72 md:h-[28rem] w-full overflow-hidden">
        <img
          src={event.image_url || getFallbackImage()}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = getFallbackImage();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
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
          <div className="container max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.village && (
                <Badge variant="outline" className={`${villageColor} bg-white/90`}>
                  {event.village}
                </Badge>
              )}
              {isOnline && (
                <Badge variant="secondary" className="bg-white/90">
                  Online
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
              {event.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{dateInfo.full}, {dateInfo.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-8">
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
            {(event.location_name || event.location_address) && !isOnline && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.location_name}</h3>
                      {event.location_address && (
                        <p className="text-muted-foreground mt-1">{event.location_address}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const query = event.location_address || event.location_name;
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(query || "")}`, "_blank");
                          }}
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          {t("events.openInMaps") || "Open in Maps"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openDirections}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          {t("events.getDirections") || "Get Directions"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meeting Link - only for registered participants */}
            {isOnline && (
              <EventMeetingLink 
                meetingUrl="https://meet.google.com/example" 
                isRegistered={isRegistered} 
              />
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

            {/* Sponsors Section */}
            <EventSponsorsSection eventId={event.id} />

            {/* Participants */}
            <EventParticipants eventId={event.id} />

            {/* Organizer */}
            <EventOrganizerCard 
              organizationId={event.organization_id}
              createdById={event.created_by}
            />
          </div>

          {/* Sidebar - RSVP */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <EventRSVPCard
                user={user}
                rsvpStatus={rsvpStatus}
                currentParticipants={currentParticipants}
                maxParticipants={event.max_participants}
                isFull={isFull}
                spotsLeft={spotsLeft}
                isOnline={isOnline}
                onRsvp={(status) => rsvpMutation.mutate(status)}
                onLogin={() => navigate("/auth", { state: { returnTo: `/esemenyek/${id}` } })}
                isLoading={rsvpMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Related Events */}
        <RelatedEvents 
          currentEventId={event.id}
          village={event.village}
          projectId={event.project_id}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;

import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Calendar, MapPin, Users, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { resolveImageUrl, resolveAvatarUrl } from "@/lib/imageResolver";

interface EventDetail {
  id: string;
  title: string;
  title_en: string | null;
  title_de: string | null;
  description: string | null;
  description_en: string | null;
  description_de: string | null;
  location_name: string | null;
  location_address: string | null;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  current_participants: number;
  image_url: string | null;
  category: string | null;
  is_free: boolean;
  status: string;
  created_by: string | null;
  creator: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  event_sponsors: Array<{
    id: string;
    sponsor_id: string;
    sponsors: {
      name: string;
    } | null;
  }>;
  user_rsvp: Array<{
    id: string;
    status: string;
  }>;
}

const EventDetailPageNew = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id, user?.id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");

      let query = supabase
        .from("events")
        .select(`
          id,
          title,
          title_en,
          title_de,
          description,
          description_en,
          description_de,
          location_name,
          location_address,
          start_date,
          end_date,
          max_participants,
          current_participants,
          image_url,
          category,
          is_free,
          status,
          created_by,
          creator:profiles!events_created_by_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          event_sponsors (
            id,
            sponsor_id,
            sponsors (name)
          )
        `)
        .eq("id", id)
        .single();

      // Add user RSVP status if logged in
      if (user?.id) {
        query = query.select(`
          *,
          user_rsvp:event_rsvps!event_rsvps_event_id_fkey (id, status)
        `).eq("user_rsvp.user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      return data as EventDetail;
    },
    enabled: !!id,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ action }: { action: "create" | "cancel" }) => {
      if (!user?.id || !id) throw new Error("Not authenticated");

      if (action === "create") {
        // Check if event is full
        if (event?.max_participants && event.current_participants >= event.max_participants) {
          throw new Error(t("events.max_participants_reached"));
        }

        // Create RSVP
        const { error: rsvpError } = await supabase
          .from("event_rsvps")
          .insert({
            event_id: id,
            user_id: user.id,
            status: "going",
          });

        if (rsvpError) throw rsvpError;

        // Increment current_participants
        await supabase
          .from("events")
          .update({ current_participants: (event?.current_participants || 0) + 1 })
          .eq("id", id);
      } else {
        // Cancel RSVP
        const { error: deleteError } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Decrement current_participants
        await supabase
          .from("events")
          .update({ current_participants: Math.max(0, (event?.current_participants || 1) - 1) })
          .eq("id", id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(
        variables.action === "create" ? t("events.rsvp_success") : t("events.cancel_success")
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Format date range in Hungarian
  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    let formatted = start.toLocaleDateString("hu-HU", options);
    
    if (endDate) {
      const end = new Date(endDate);
      const endTime = end.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
      formatted += ` – ${endTime}`;
    }
    
    return formatted;
  };

  // Get localized content
  const getLocalizedTitle = () => {
    if (!event) return "";
    if (language === "en" && event.title_en) return event.title_en;
    if (language === "de" && event.title_de) return event.title_de;
    return event.title;
  };

  const getLocalizedDescription = () => {
    if (!event) return "";
    if (language === "en" && event.description_en) return event.description_en;
    if (language === "de" && event.description_de) return event.description_de;
    return event.description;
  };

  // Check if user has RSVPd
  const hasRSVPd = event?.user_rsvp && event.user_rsvp.length > 0;

  // Check if event is full
  const isFull = event?.max_participants !== null && 
                 event?.max_participants !== undefined &&
                 event?.current_participants >= event.max_participants;

  // Calculate fill percentage for progress bar
  const fillPercentage = event?.max_participants 
    ? (event.current_participants / event.max_participants) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Esemény nem található</h2>
          <Button onClick={() => navigate("/esemenyek")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza az eseményekhez
          </Button>
        </div>
      </div>
    );
  }

  const isSponsored = event.event_sponsors && event.event_sponsors.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          to="/esemenyek"
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("events.back_to_list")}
        </Link>

        {/* Hero Image */}
        {event.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <img
              src={resolveImageUrl(event.image_url)}
              alt={getLocalizedTitle()}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-black mb-6"
        >
          {getLocalizedTitle()}
        </motion.h1>

        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-black/60 mt-0.5" />
                <div>
                  <p className="font-medium text-black">{t("events.date_time")}</p>
                  <p className="text-black/60">{formatDateRange(event.start_date, event.end_date)}</p>
                </div>
              </div>

              {/* Location */}
              {event.location_name && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-black/60 mt-0.5" />
                  <div>
                    <p className="font-medium text-black">{t("events.location")}</p>
                    <p className="text-black/60">{event.location_name}</p>
                    {event.location_address && (
                      <p className="text-sm text-black/50">{event.location_address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-black/60 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-black mb-2">
                    {event.max_participants ? (
                      <>
                        {event.current_participants}/{event.max_participants} {t("events.participants")}
                      </>
                    ) : (
                      <>{event.current_participants} {t("events.participants")}</>
                    )}
                  </p>
                  {event.max_participants && (
                    <Progress value={fillPercentage} className="h-2" />
                  )}
                </div>
              </div>

              {/* Category */}
              {event.category && (
                <div>
                  <Badge className="bg-black/5 text-black border-0">
                    {t(`categories.${event.category}`)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Description */}
        {getLocalizedDescription() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-black mb-4">{t("events.description")}</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-black/80 whitespace-pre-wrap">{getLocalizedDescription()}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Organizer */}
        {event.creator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-black mb-4">{t("events.organizer")}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={resolveAvatarUrl(event.creator.avatar_url)} />
                    <AvatarFallback>
                      {event.creator.first_name?.[0]}{event.creator.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-black">
                      {event.creator.first_name} {event.creator.last_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sponsor */}
        {isSponsored && event.event_sponsors[0]?.sponsors && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-black mb-4">Szponzor</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-blue-600" />
                  <div>
                    <Badge className="bg-blue-600 text-white border-0 mb-2">
                      {t("events.sponsored")}
                    </Badge>
                    <p className="font-semibold text-black">
                      {event.event_sponsors[0].sponsors.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* RSVP Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-black/10"
        >
          {!user ? (
            <Button variant="outline" size="lg" className="w-full" disabled>
              {t("events.login_to_rsvp")}
            </Button>
          ) : hasRSVPd ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => rsvpMutation.mutate({ action: "cancel" })}
              disabled={rsvpMutation.isPending}
            >
              {t("events.cancel_rsvp")}
            </Button>
          ) : isFull ? (
            <Button variant="outline" size="lg" className="w-full" disabled>
              {t("events.full")}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-black hover:bg-black/90 text-white"
              onClick={() => rsvpMutation.mutate({ action: "create" })}
              disabled={rsvpMutation.isPending}
            >
              {t("events.rsvp")}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetailPageNew;

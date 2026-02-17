import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Search, Calendar, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { resolveImageUrl } from "@/lib/imageResolver";
import { CATEGORIES as CATEGORY_LIST } from "@/constants/categories";
import SEOHead from "@/components/SEOHead";

interface Event {
  id: string;
  title: string;
  title_en: string | null;
  title_de: string | null;
  description: string | null;
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

const CATEGORY_FILTERS = [
  { id: "all", labelKey: "events.all_categories" },
  ...CATEGORY_LIST.map(cat => ({ id: cat, labelKey: `categories.${cat}` })),
];

const EventsPageNew = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          id,
          title,
          title_en,
          title_de,
          description,
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
          event_sponsors (
            id,
            sponsor_id,
            sponsors (name)
          )
        `)
        .eq("status", "published")
        .eq("is_public", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      // Add user RSVP status if logged in
      if (user?.id) {
        query = query.select(`
          *,
          user_rsvp:event_rsvps!event_rsvps_event_id_fkey (id, status)
        `).eq("user_rsvp.user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      return (data || []) as Event[];
    },
    staleTime: 2 * 60 * 1000,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: "create" | "cancel" }) => {
      if (!user?.id) throw new Error("Not authenticated");

      if (action === "create") {
        // Check if event is full
        const event = events.find((e) => e.id === eventId);
        if (event?.max_participants && event.current_participants >= event.max_participants) {
          throw new Error(t("events.max_participants_reached"));
        }

        // Create RSVP
        const { error: rsvpError } = await supabase
          .from("event_rsvps")
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: "going",
          });

        if (rsvpError) throw rsvpError;

        // Increment current_participants
        const { error: updateError } = await supabase.rpc("increment_event_participants", {
          event_id: eventId,
        });

        if (updateError) {
          // Fallback to manual update if RPC doesn't exist
          await supabase
            .from("events")
            .update({ current_participants: (event?.current_participants || 0) + 1 })
            .eq("id", eventId);
        }
      } else {
        // Cancel RSVP
        const { error: deleteError } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Decrement current_participants
        const event = events.find((e) => e.id === eventId);
        const { error: updateError } = await supabase
          .from("events")
          .update({ current_participants: Math.max(0, (event?.current_participants || 1) - 1) })
          .eq("id", eventId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(
        variables.action === "create" ? t("events.rsvp_success") : t("events.cancel_success")
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Format date in Hungarian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return date.toLocaleDateString("hu-HU", options);
  };

  // Get localized title
  const getLocalizedTitle = (event: Event) => {
    if (language === "en" && event.title_en) return event.title_en;
    if (language === "de" && event.title_de) return event.title_de;
    return event.title;
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        getLocalizedTitle(event).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery, language]);

  // Check if user has RSVPd
  const hasRSVPd = (event: Event) => {
    return event.user_rsvp && event.user_rsvp.length > 0;
  };

  // Check if event is full
  const isFull = (event: Event) => {
    return event.max_participants !== null && event.current_participants >= event.max_participants;
  };

  return (
    <>
      <SEOHead
        title={t('seo.events.title')}
        description={t('seo.events.description')}
      />
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black/[0.02] to-white py-12 border-b border-black/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              {t("events.title")}
            </h1>
            <p className="text-lg text-black/60">
              {t("events.subtitle")}
            </p>
            <p className="text-sm text-black/40 mt-3 max-w-2xl mx-auto">
              {t("seo.events.intro")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <Input
              type="text"
              placeholder={t("events.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-teal-700 text-white hover:bg-teal-600"
                    : ""
                }
              >
                {t(category.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("community_building.events_title")}
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              {t("community_building.events_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {!user ? (
                <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white transition-all duration-200 hover:scale-[1.02]">
                  <Link to="/register">{t("community_building.join_community")}</Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white transition-all duration-200 hover:scale-[1.02]">
                    <Link to="/contact">{t("community_building.events_notify")}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">{t("community_building.events_organize")}</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const isEventFull = isFull(event);
              const userHasRSVPd = hasRSVPd(event);
              const isSponsored = event.event_sponsors && event.event_sponsors.length > 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer">
                    {/* Event Image */}
                    <Link to={`/events/${event.id}`} className="block">
                      <div className="relative aspect-[16/9] bg-black/5 overflow-hidden">
                        {event.image_url ? (
                          <img
                            src={resolveImageUrl(event.image_url)}
                            alt={getLocalizedTitle(event)}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-black/20" />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {event.category && (
                            <Badge className="bg-white/90 text-black border-0 backdrop-blur-sm">
                              {t(`categories.${event.category}`)}
                            </Badge>
                          )}
                          {isSponsored && (
                            <Badge className="bg-blue-600 text-white border-0 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              {t("events.sponsored")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>

                    <Link to={`/events/${event.id}`} className="block flex-1">
                      <CardContent className="p-5 flex-1 flex flex-col">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-black/60 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-black mb-3 hover:text-black/70 transition-colors line-clamp-2">
                        {getLocalizedTitle(event)}
                      </h3>

                      {/* Location */}
                      {event.location_name && (
                        <div className="flex items-center gap-2 text-sm text-black/60 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location_name}</span>
                        </div>
                      )}

                      {/* Participant Count */}
                      <div className="flex items-center gap-2 text-sm text-black/60 mb-4">
                        <Users className="w-4 h-4" />
                        {event.max_participants ? (
                          <span>
                            {event.current_participants}/{event.max_participants}{" "}
                            {t("events.participants")}
                          </span>
                        ) : (
                          <span>{t("events.spots_available")}</span>
                        )}
                      </div>

                      {/* Sponsor Info */}
                      {isSponsored && event.event_sponsors[0]?.sponsors && (
                        <p className="text-xs text-blue-600 mb-3">
                          {t("events.sponsored_by")} {event.event_sponsors[0].sponsors.name}
                        </p>
                      )}

                      </CardContent>
                    </Link>

                    {/* RSVP Button */}
                    <div className="px-5 pb-5">
                        {!user ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            {t("events.login_to_rsvp")}
                          </Button>
                        ) : userHasRSVPd ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              rsvpMutation.mutate({ eventId: event.id, action: "cancel" })
                            }
                            disabled={rsvpMutation.isPending}
                          >
                            {t("events.cancel_rsvp")}
                          </Button>
                        ) : isEventFull ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            {t("events.full")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white"
                            onClick={() =>
                              rsvpMutation.mutate({ eventId: event.id, action: "create" })
                            }
                            disabled={rsvpMutation.isPending}
                          >
                            {t("events.rsvp")}
                          </Button>
                        )}
                      </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default EventsPageNew;

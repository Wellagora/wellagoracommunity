import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MapPin, Users, Clock, Search, Filter, Check } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { toast } from "sonner";
import EventCard from "@/components/events/EventCard";
import { useProjectVillages } from "@/hooks/useProjectVillages";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  village: string | null;
  current_participants: number | null;
  max_participants: number | null;
  created_by: string | null;
  image_url: string | null;
}

interface EventRsvp {
  id: string;
  event_id: string;
  status: "going" | "maybe" | "not_going";
}

const EventsPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { villages: VILLAGES } = useProjectVillages();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<string>("all");

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch all upcoming events
  const { data: events, isLoading } = useQuery({
    queryKey: ["allEvents", selectedVillage],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, title_en, title_de, description_en, description_de, image_url")
        .gte("start_date", new Date().toISOString())
        .eq("is_public", true)
        .order("start_date", { ascending: true });

      if (selectedVillage && selectedVillage !== "all") {
        query = query.eq("village", selectedVillage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Event & { title_en?: string | null; title_de?: string | null; description_en?: string | null; description_de?: string | null })[];
    },
  });

  // Fetch user RSVPs
  const { data: userRsvps, refetch: refetchRsvps } = useQuery({
    queryKey: ["userRsvps", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("id, event_id, status")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as EventRsvp[];
    },
    enabled: !!user?.id,
  });

  const handleRsvp = async (eventId: string, status: "going" | "maybe" | "not_going") => {
    if (!user?.id) {
      toast.error(t("auth.login_required"));
      return;
    }

    const existing = userRsvps?.find((r) => r.event_id === eventId);

    try {
      if (existing) {
        await supabase.from("event_rsvps").update({ status }).eq("id", existing.id);
      } else {
        await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id, status });
      }
      refetchRsvps();
      toast.success(t("events.rsvp_success"));
    } catch {
      toast.error(t("events.rsvp_error"));
    }
  };

  const getUserRsvpStatus = (eventId: string): string | null => {
    return userRsvps?.find((r) => r.event_id === eventId)?.status || null;
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, "d", { locale: dateLocale }),
      month: format(date, "MMM", { locale: dateLocale }),
      weekday: format(date, "EEEE", { locale: dateLocale }),
      time: format(date, "HH:mm", { locale: dateLocale }),
      full: format(date, "yyyy. MMMM d., EEEE HH:mm", { locale: dateLocale }),
    };
  };

  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 pt-0 pb-8">
          {/* Sticky Header Section - Title, Subtitle, Search and Filters */}
          <div className="sticky top-16 z-30 -mx-4 px-4 pt-6 pb-5 mb-6 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
            <h1 className="text-3xl font-bold mb-1">{t("events.upcoming")}</h1>
            <p className="text-muted-foreground mb-5">{t("events.discover_subtitle")}</p>

            {/* Filters - Inside sticky header */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("common.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t("events.select_village")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {VILLAGES.map((village) => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const rsvpStatus = getUserRsvpStatus(event.id) as "going" | "maybe" | "not_going" | null;

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    rsvpStatus={rsvpStatus}
                    onRsvp={user ? handleRsvp : undefined}
                    showRsvpButtons={!!user}
                  />
                );
              })}
            </div>
          ) : (
            /* High-fidelity "Coming Soon" placeholder cards */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Helyi Termelői Piac",
                  titleKey: "events.coming_soon_market",
                  desc: "Friss helyi termékek a régióból",
                  descKey: "events.coming_soon_market_desc",
                  image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
                  icon: "🥕",
                  color: "from-emerald-500/20 to-green-500/20",
                },
                {
                  title: "Közösségi Reggeli",
                  titleKey: "events.coming_soon_breakfast",
                  desc: "Kötetlen beszélgetés és ismerkedés",
                  descKey: "events.coming_soon_breakfast_desc",
                  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
                  icon: "☕",
                  color: "from-amber-500/20 to-orange-500/20",
                },
                {
                  title: "Mesterkurzus",
                  titleKey: "events.coming_soon_masterclass",
                  desc: "Tanulj a régió legjobb szakértőitől",
                  descKey: "events.coming_soon_masterclass_desc",
                  image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
                  icon: "🎓",
                  color: "from-purple-500/20 to-indigo-500/20",
                },
              ].map((event, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] opacity-90"
                >
                  {/* Event Image with gradient overlay */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover filter grayscale-[30%]"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${event.color}`} />
                    {/* Coming Soon badge */}
                    <Badge className="absolute top-3 right-3 bg-slate-900/80 text-white backdrop-blur-sm border-0">
                      {t("events.coming_soon")}
                    </Badge>
                    {/* Icon */}
                    <div className="absolute bottom-3 left-3 text-4xl drop-shadow-lg">
                      {event.icon}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 text-slate-700">
                      {t(event.titleKey) || event.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t(event.descKey) || event.desc}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{t("events.date_tba")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;

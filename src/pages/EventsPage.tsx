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

const VILLAGES = [
  "Kővágóörs",
  "Mindszentkálla",
  "Kékkút",
  "Szentbékkálla",
  "Balatonhenye",
  "Köveskál",
  "Salföld",
  "Ábrahámhegy",
];

const villageColors: Record<string, string> = {
  "Kővágóörs": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Mindszentkálla": "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Kékkút": "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "Szentbékkálla": "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<string>("all");

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch all upcoming events
  const { data: events, isLoading } = useQuery({
    queryKey: ["allEvents", selectedVillage],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, image_url")
        .gte("start_date", new Date().toISOString())
        .eq("is_public", true)
        .order("start_date", { ascending: true });

      if (selectedVillage && selectedVillage !== "all") {
        query = query.eq("village", selectedVillage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("events.title")}</h1>
            <p className="text-muted-foreground">{t("events.subtitle")}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const dateInfo = formatEventDate(event.start_date);
                const rsvpStatus = getUserRsvpStatus(event.id);
                const villageColor = event.village ? villageColors[event.village] : "bg-muted text-muted-foreground";

                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    {/* Event Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80';
                        }}
                      />
                      {/* Date badge overlay */}
                      <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-2xl font-bold text-primary leading-none">{dateInfo.day}</div>
                        <div className="text-xs text-muted-foreground uppercase">{dateInfo.month}</div>
                      </div>
                      {/* RSVP indicator */}
                      {rsvpStatus === "going" && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-success/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div>
                        <CardTitle className="text-lg leading-tight mb-2">{event.title}</CardTitle>
                        {event.village && (
                          <Badge variant="outline" className={`text-xs ${villageColor}`}>
                            {event.village}
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {dateInfo.weekday}, {dateInfo.time}
                        </span>
                        {event.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location_name}
                          </span>
                        )}
                        {event.max_participants && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.current_participants || 0}/{event.max_participants}
                          </span>
                        )}
                      </div>

                      {user && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant={rsvpStatus === "going" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRsvp(event.id, "going")}
                          >
                            {t("events.going")}
                          </Button>
                          <Button
                            variant={rsvpStatus === "maybe" ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRsvp(event.id, "maybe")}
                          >
                            {t("events.maybe")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("events.no_events")}</h3>
                <p className="text-muted-foreground">{t("dashboard.activity_hint")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;

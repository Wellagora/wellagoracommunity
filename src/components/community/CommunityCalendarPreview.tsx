import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

interface UpcomingEvent {
  id: string;
  title: string;
  start_date: string;
  location_name: string | null;
  current_participants: number | null;
  max_participants: number | null;
}

// Demo events
const DEMO_EVENTS: UpcomingEvent[] = [
  {
    id: "demo-event-1",
    title: "Közösségi kemencés nap",
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location_name: "Őriszentpéter, Közösségi Ház",
    current_participants: 12,
    max_participants: 20,
  },
  {
    id: "demo-event-2",
    title: "Gyógynövénygyűjtő túra",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location_name: "Szalafő, Pityerszer",
    current_participants: 8,
    max_participants: 15,
  },
  {
    id: "demo-event-3",
    title: "Hagyományos mesterségek napja",
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location_name: "Velemér, Faluház",
    current_participants: 25,
    max_participants: 50,
  },
];

const CommunityCalendarPreview = () => {
  const { t, language } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateLocale = () => {
    switch (language) {
      case "de":
        return de;
      case "en":
        return enUS;
      default:
        return hu;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (isDemoMode) {
        setEvents(DEMO_EVENTS);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("events")
          .select("id, title, start_date, location_name, current_participants, max_participants")
          .eq("is_public", true)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(3);

        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(DEMO_EVENTS);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents(DEMO_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isDemoMode]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("community.upcoming_events") || "Közelgő események"}
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/esemenyek")}
          className="text-indigo-600 hover:text-indigo-700"
        >
          {t("community.see_all_events") || "Összes esemény"}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/esemenyek/${event.id}`)}
            >
              <CardContent className="p-4">
                {/* Date Badge */}
                <Badge className="bg-indigo-100 text-indigo-700 mb-3">
                  {format(new Date(event.start_date), "MMM d, EEEE", {
                    locale: getDateLocale(),
                  })}
                </Badge>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {event.title}
                </h3>

                {/* Location */}
                {event.location_name && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{event.location_name}</span>
                  </div>
                )}

                {/* Participants */}
                {event.max_participants && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {event.current_participants || 0} / {event.max_participants}{" "}
                      {t("community.participants") || "résztvevő"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CommunityCalendarPreview;

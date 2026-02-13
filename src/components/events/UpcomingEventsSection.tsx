import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedEvent } from "@/hooks/useLocalizedEvent";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjectVillages } from "@/hooks/useProjectVillages";

interface Event {
  id: string;
  title: string;
  title_en?: string | null;
  title_de?: string | null;
  start_date: string;
  location_name: string | null;
  village: string | null;
}

export function UpcomingEventsSection() {
  const { t, language } = useLanguage();
  const { getLocalizedTitle } = useLocalizedEvent();
  const { getVillageColor } = useProjectVillages();
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  const { data: events, isLoading } = useQuery({
    queryKey: ["upcomingEventsHome"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, title_en, title_de, start_date, location_name, village")
        .gte("start_date", new Date().toISOString())
        .eq("is_public", true)
        .order("start_date", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Event[];
    },
  });

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, "d", { locale: dateLocale }),
      month: format(date, "MMM", { locale: dateLocale }),
      weekday: format(date, "EEEE", { locale: dateLocale }),
      time: format(date, "HH:mm", { locale: dateLocale }),
    };
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t("events.upcoming")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{t("events.upcoming")}</h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                {t("events.view_all")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {events.map((event, index) => {
              const dateInfo = formatEventDate(event.start_date);
              const villageColor = getVillageColor(event.village);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-center group-hover:bg-primary/20 transition-colors">
                          <span className="text-2xl font-bold text-primary leading-none">
                            {dateInfo.day}
                          </span>
                          <span className="text-xs text-primary/80 uppercase">{dateInfo.month}</span>
                        </div>

                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {getLocalizedTitle(event)}
                          </h3>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {dateInfo.weekday}, {dateInfo.time}
                              </span>
                            </div>
                            {event.location_name && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{event.location_name}</span>
                              </div>
                            )}
                          </div>

                          {event.village && (
                            <Badge variant="outline" className={`mt-2 text-xs ${villageColor}`}>
                              {event.village}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Link to={`/events/${event.id}`} className="block mt-4">
                        <Button variant="secondary" size="sm" className="w-full">
                          {t("common.details")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

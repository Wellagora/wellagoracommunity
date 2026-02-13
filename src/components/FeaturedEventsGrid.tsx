import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  location_name: string | null;
  village: string | null;
  image_url: string | null;
}

// Hardcoded translations for seed events (until DB has title_en/title_de columns)
const EVENT_TITLE_TRANSLATIONS: Record<string, { en: string; de: string }> = {
  "Wellness Hétvége": { en: "Wellness Weekend", de: "Wellness-Wochenende" },
  "Közösségi Főzés": { en: "Community Cooking", de: "Gemeinschaftskochen" },
  "Tavaszi Kertészkedés": { en: "Spring Gardening", de: "Frühlingsgärtnerei" },
};

const FeaturedEventsGrid = () => {
  const { t, language } = useLanguage();
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  const { data: events, isLoading } = useQuery({
    queryKey: ["featuredEventsGrid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, start_date, location_name, village, image_url")
        .gte("start_date", new Date().toISOString())
        .eq("is_public", true)
        .order("start_date", { ascending: true })
        .limit(8);

      if (error) throw error;
      return data as Event[];
    },
  });

  const getLocalizedEventTitle = (event: Event): string => {
    if (language === "hu") return event.title;
    const translations = EVENT_TITLE_TRANSLATIONS[event.title];
    if (translations) {
      return language === "en" ? translations.en : translations.de;
    }
    return event.title; // Fallback to Hungarian
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, "d", { locale: dateLocale }),
      month: format(date, "MMM", { locale: dateLocale }),
      weekday: format(date, "EEEE", { locale: dateLocale }),
      time: format(date, "HH:mm", { locale: dateLocale }),
      full: format(date, "yyyy. MMMM d.", { locale: dateLocale }),
    };
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <h2 className="text-2xl font-bold">{t("index.featured_events_title")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
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
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("index.featured_events_title")}</h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                {t("events.view_all")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Fixed 3-column grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => {
              const dateInfo = formatEventDate(event.start_date);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group overflow-hidden">
                    {/* Event Image */}
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'}
                        alt={getLocalizedEventTitle(event)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80';
                        }}
                      />
                      {/* Date overlay */}
                      <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-2xl font-bold text-primary leading-none">{dateInfo.day}</div>
                        <div className="text-xs text-muted-foreground uppercase">{dateInfo.month}</div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {getLocalizedEventTitle(event)}
                      </h3>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{dateInfo.weekday}, {dateInfo.time}</span>
                        </div>
                        {event.location_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.location_name}</span>
                          </div>
                        )}
                      </div>

                      {event.village && (
                        <Badge variant="secondary" className="mb-4">
                          {event.village}
                        </Badge>
                      )}

                      <Link to={`/events/${event.id}`}>
                        <Button className="w-full" variant="outline">
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
};

export default FeaturedEventsGrid;

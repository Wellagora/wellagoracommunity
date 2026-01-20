import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

interface RelatedEventsProps {
  currentEventId: string;
  village?: string | null;
  projectId?: string | null;
}

const RelatedEvents = ({ currentEventId, village, projectId }: RelatedEventsProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  const { data: relatedEvents } = useQuery({
    queryKey: ["relatedEvents", currentEventId, village, projectId],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("id, title, image_url, start_date, location_name, village")
        .eq("status", "published")
        .neq("id", currentEventId)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(3);

      if (village) {
        query = query.eq("village", village);
      } else if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (!relatedEvents || relatedEvents.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-xl mb-4">
        {t("events.relatedEvents") || "Related Events"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedEvents.map((event) => (
          <Card 
            key={event.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => navigate(`/esemenyek/${event.id}`)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.start_date), "MMM d", { locale: dateLocale })}</span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{event.location_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedEvents;

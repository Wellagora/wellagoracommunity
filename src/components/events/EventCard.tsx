import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedEvent } from "@/hooks/useLocalizedEvent";
import { Calendar, MapPin, Users, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    title_en?: string | null;
    title_de?: string | null;
    description: string | null;
    description_en?: string | null;
    description_de?: string | null;
    start_date: string;
    end_date?: string | null;
    location_name: string | null;
    village: string | null;
    current_participants?: number | null;
    max_participants?: number | null;
    image_url: string | null;
  };
  rsvpStatus?: "going" | "maybe" | "not_going" | null;
  onRsvp?: (eventId: string, status: "going" | "maybe" | "not_going") => void;
  showRsvpButtons?: boolean;
  variant?: "default" | "featured" | "compact";
}

const villageColors: Record<string, string> = {
  "Kővágóörs": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Mindszentkálla": "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Kékkút": "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "Szentbékkálla": "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

// High-quality fallback images for events
const EVENT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", // Conference/gathering
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", // Community event
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80", // Workshop
];

const EventCard = ({ 
  event, 
  rsvpStatus, 
  onRsvp, 
  showRsvpButtons = true,
  variant = "default" 
}: EventCardProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { getLocalizedTitle, getLocalizedDescription } = useLocalizedEvent();
  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

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

  const dateInfo = formatEventDate(event.start_date);
  const villageColor = event.village ? villageColors[event.village] : "bg-muted text-muted-foreground";
  
  // Get consistent fallback based on event id
  const getFallbackImage = () => {
    const index = event.id.charCodeAt(0) % EVENT_FALLBACK_IMAGES.length;
    return EVENT_FALLBACK_IMAGES[index];
  };

  const imageHeight = variant === "compact" ? "h-32" : "h-44";

  const handleCardClick = () => {
    navigate(`/esemenyek/${event.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow group bg-white border-border/40 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Image - VIBRANT, no dark filters */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <img
          src={event.image_url || getFallbackImage()}
          alt={getLocalizedTitle(event)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = getFallbackImage();
          }}
        />
        
        {/* Bottom gradient ONLY for text readability - vibrant image visible */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Date badge - top left, glassmorphism */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
          <div className="text-2xl font-bold text-foreground leading-none">{dateInfo.day}</div>
          <div className="text-xs text-muted-foreground uppercase font-medium">{dateInfo.month}</div>
        </div>
        
        {/* RSVP indicator - top right */}
        {rsvpStatus === "going" && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-lg text-white leading-tight line-clamp-2 drop-shadow-sm">
            {getLocalizedTitle(event)}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Village Badge */}
        {event.village && (
          <Badge variant="outline" className={`text-xs ${villageColor}`}>
            {event.village}
          </Badge>
        )}

        {/* Event Details */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {dateInfo.weekday}, {dateInfo.time}
          </span>
          {event.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {event.location_name}
            </span>
          )}
          {event.max_participants && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {event.current_participants || 0}/{event.max_participants}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && variant !== "compact" && (
          <p className="text-sm text-muted-foreground line-clamp-2">{getLocalizedDescription(event)}</p>
        )}

        {/* RSVP Buttons */}
        {showRsvpButtons && onRsvp && (
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={rsvpStatus === "going" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => onRsvp(event.id, "going")}
            >
              {t("events.going")}
            </Button>
            <Button
              variant={rsvpStatus === "maybe" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => onRsvp(event.id, "maybe")}
            >
              {t("events.maybe")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;

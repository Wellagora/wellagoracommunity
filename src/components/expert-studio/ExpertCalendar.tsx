import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Ticket,
  Eye,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  type: "event" | "program";
  participants: number;
  maxParticipants: number;
  image_url?: string | null;
  category?: string | null;
}

interface ExpertCalendarProps {
  userId: string;
}

const ExpertCalendar = ({ userId }: ExpertCalendarProps) => {
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  // Fetch expert's events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["expert-events", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_date, end_date, location_name, current_participants, max_participants, image_url, village, created_by")
        .eq("created_by", userId)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data || []).map((e) => ({
        id: e.id,
        title: e.title || "",
        date: e.start_date,
        end_date: e.end_date,
        location: e.location_name,
        type: "event" as const,
        participants: e.current_participants || 0,
        maxParticipants: e.max_participants || 0,
        image_url: e.image_url,
        category: e.village,
      }));
    },
    enabled: !!userId,
  });

  // Fetch expert's programs with voucher dates
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["expert-programs-calendar", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id, title, image_url, used_licenses, max_capacity, total_licenses, category, content_type")
        .eq("creator_id", userId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // For each program, get upcoming voucher event_dates
      const result: CalendarEvent[] = [];
      for (const p of data || []) {
        const { data: vouchers } = await supabase
          .from("vouchers")
          .select("event_date")
          .eq("content_id", p.id)
          .not("event_date", "is", null)
          .gte("event_date", new Date().toISOString());

        const uniqueDates = new Set(vouchers?.map((v) => v.event_date).filter(Boolean));
        uniqueDates.forEach((date) => {
          if (date) {
            const participantsOnDate = vouchers?.filter((v) => v.event_date === date).length || 0;
            result.push({
              id: `${p.id}-${date}`,
              title: p.title || "",
              date: date,
              type: "program",
              participants: participantsOnDate,
              maxParticipants: p.max_capacity || p.total_licenses || 0,
              image_url: p.image_url,
              category: p.category,
            });
          }
        });

        // If no event dates, add program itself as a general item
        if (uniqueDates.size === 0) {
          result.push({
            id: p.id,
            title: p.title || "",
            date: new Date().toISOString(),
            type: "program",
            participants: p.used_licenses || 0,
            maxParticipants: p.max_capacity || p.total_licenses || 0,
            image_url: p.image_url,
            category: p.category,
          });
        }
      }
      return result;
    },
    enabled: !!userId,
  });

  const allItems = useMemo(() => {
    return [...(events || []), ...(programs || [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [events, programs]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return allItems.filter((item) => isSameDay(new Date(item.date), day));
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Upcoming items (next 7 days)
  const upcomingItems = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return allItems.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= now && itemDate <= weekFromNow;
    });
  }, [allItems]);

  const isLoading = eventsLoading || programsLoading;

  const weekDays = language === "hu"
    ? ["H", "K", "Sze", "Cs", "P", "Szo", "V"]
    : language === "de"
    ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* Upcoming This Week */}
      {upcomingItems.length > 0 && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              {t("calendar.upcoming_week") || "Következő 7 nap"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-center">
                    <div>
                      <p className="text-xs font-bold text-indigo-600">
                        {format(new Date(item.date), "MMM", { locale: dateLocale })}
                      </p>
                      <p className="text-lg font-bold text-indigo-700 leading-none">
                        {format(new Date(item.date), "d")}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(item.date), "HH:mm")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.participants}
                        {item.maxParticipants > 0 && `/${item.maxParticipants}`}
                      </span>
                    </div>
                  </div>
                  <Badge variant={item.type === "event" ? "default" : "secondary"} className="text-xs">
                    {item.type === "event"
                      ? t("calendar.event") || "Esemény"
                      : t("calendar.program") || "Program"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar + Day Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t("calendar.title") || "Naptár"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-[140px] text-center">
                  {format(currentMonth, "yyyy MMMM", { locale: dateLocale })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative p-2 min-h-[60px] rounded-lg text-sm transition-all
                          ${!isCurrentMonth ? "opacity-30" : ""}
                          ${isSelected ? "bg-indigo-500 text-white shadow-md" : "hover:bg-muted/50"}
                          ${isTodayDate && !isSelected ? "ring-2 ring-indigo-500/30" : ""}
                        `}
                      >
                        <span className={`text-xs ${isTodayDate && !isSelected ? "font-bold text-indigo-600" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-1 flex-wrap">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? "bg-white"
                                    : e.type === "event"
                                    ? "bg-indigo-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    {t("calendar.event") || "Esemény"}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t("calendar.program") || "Program"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? format(selectedDate, "MMMM d, EEEE", { locale: dateLocale })
                : t("calendar.select_day") || "Válassz egy napot"}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? `${selectedDayEvents.length} ${t("calendar.items") || "elem"}`
                : t("calendar.select_day_hint") || "Kattints egy napra a részletekért"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {selectedDayEvents.length > 0 ? (
                <motion.div
                  key={selectedDate?.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {selectedDayEvents.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                      )}
                      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(item.date), "HH:mm")}
                          {item.end_date && ` - ${format(new Date(item.end_date), "HH:mm")}`}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.participants}
                          {item.maxParticipants > 0 && ` / ${item.maxParticipants}`}
                          {" "}{t("calendar.participants_label") || "résztvevő"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={item.type === "event" ? "default" : "secondary"} className="text-xs">
                          {item.type === "event"
                            ? t("calendar.event") || "Esemény"
                            : t("calendar.program") || "Program"}
                        </Badge>
                        {item.type === "program" && (
                          <Link to={`/expert-studio/${item.id.split("-")[0]}/participants`}>
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                              <Eye className="w-3 h-3" />
                              {t("calendar.view_participants") || "Résztvevők"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : selectedDate ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {t("calendar.no_items") || "Nincs esemény ezen a napon"}
                  </p>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {t("calendar.select_day_hint") || "Kattints egy napra a részletekért"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertCalendar;

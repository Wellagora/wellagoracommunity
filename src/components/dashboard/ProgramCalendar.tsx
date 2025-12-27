import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

interface Challenge {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  project_id: string;
  projects: {
    name: string;
    region_name: string;
  };
}

export function ProgramCalendar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadChallenges();
  }, [currentMonth]);

  const loadChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's projects
      const { data: memberData } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      if (!memberData || memberData.length === 0) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      const projectIds = memberData.map((m) => m.project_id);

      // Get challenges for user's projects in current month
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from("challenge_definitions")
        .select(`
          id,
          title,
          start_date,
          end_date,
          location,
          project_id,
          projects:project_id (
            name,
            region_name
          )
        `)
        .in("project_id", projectIds)
        .gte("start_date", monthStart.toISOString())
        .lte("start_date", monthEnd.toISOString())
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (error) throw error;

      setChallenges(data || []);
    } catch (error) {
      // Silent fail - challenges load failed
    } finally {
      setLoading(false);
    }
  };

  const getDatesWithEvents = () => {
    return challenges
      .filter(c => c.start_date)
      .map(c => new Date(c.start_date!));
  };

  const getChallengesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return challenges.filter(c => {
      if (!c.start_date) return false;
      const challengeDateStr = format(parseISO(c.start_date), 'yyyy-MM-dd');
      return challengeDateStr === dateStr;
    });
  };

  const selectedChallenges = selectedDate ? getChallengesForDate(selectedDate) : [];

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(currentMonth, 'MMMM yyyy', { locale: hu })}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={hu}
            modifiers={{
              hasEvent: getDatesWithEvents()
            }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: 'hsl(var(--primary) / 0.2)',
                fontWeight: 'bold'
              }
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {selectedDate ? format(selectedDate, 'yyyy. MMMM d.', { locale: hu }) : t('dashboard.select_date')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedChallenges.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {t('dashboard.no_events_this_day')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedChallenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/piacer/${challenge.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {challenge.projects?.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {challenge.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {challenge.location}
                      </div>
                    )}
                    {challenge.start_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(parseISO(challenge.start_date), 'HH:mm')}
                        {challenge.end_date && ` - ${format(parseISO(challenge.end_date), 'HH:mm')}`}
                      </div>
                    )}
                    {challenge.projects?.region_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {challenge.projects.region_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

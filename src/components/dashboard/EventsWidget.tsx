import { memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { hu, de, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
  program_id: string | null;
  program_title?: string | null;
  status?: string;
}

interface EventRsvp {
  id: string;
  event_id: string;
  status: 'going' | 'maybe' | 'not_going';
}

const villageColors: Record<string, string> = {
  'Kővágóörs': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  'Mindszentkálla': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'Kékkút': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  'Szentbékkálla': 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

export const EventsWidget = memo(() => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  // Fetch upcoming events
  const { data: events, isLoading } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .eq('is_public', true)
        .eq('status', 'published')
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      // Fetch program titles for events with program_id
      const eventsWithPrograms = await Promise.all((data || []).map(async (event: any) => {
        if (event.program_id) {
          const { data: programData } = await supabase
            .from('challenge_definitions')
            .select('title')
            .eq('id', event.program_id)
            .maybeSingle();
          return { ...event, program_title: programData?.title };
        }
        return event;
      }));
      
      return eventsWithPrograms as Event[];
    },
  });

  // Fetch user RSVPs
  const { data: userRsvps } = useQuery({
    queryKey: ['userRsvps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('id, event_id, status')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as EventRsvp[];
    },
    enabled: !!user?.id,
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const existing = userRsvps?.find(r => r.event_id === eventId);

      if (existing) {
        const { error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_rsvps')
          .insert({ event_id: eventId, user_id: user.id, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRsvps'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      toast.success(t('events.rsvp_success') || 'RSVP updated!');
    },
    onError: () => {
      toast.error(t('events.rsvp_error') || 'Failed to update RSVP');
    },
  });

  const getUserRsvpStatus = (eventId: string): string | null => {
    return userRsvps?.find(r => r.event_id === eventId)?.status || null;
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: format(date, 'd', { locale: dateLocale }),
      month: format(date, 'MMM', { locale: dateLocale }),
      time: format(date, 'HH:mm', { locale: dateLocale }),
      full: format(date, 'EEEE, d MMMM', { locale: dateLocale }),
    };
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('events.upcoming')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-14 h-14 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('events.upcoming')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">
              {t('dashboard.no_activity')}
            </p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              {t('dashboard.activity_hint')}
            </p>
            <Link to="/piacer">
              <Button variant="outline" size="sm">
                {t('nav.programs')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t('events.upcoming')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map(event => {
          const dateInfo = formatEventDate(event.start_date);
          const rsvpStatus = getUserRsvpStatus(event.id);
          const villageColor = event.village ? villageColors[event.village] : 'bg-muted text-muted-foreground';

          return (
            <div
              key={event.id}
              className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
            >
              {/* Date badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-primary leading-none">
                  {dateInfo.day}
                </span>
                <span className="text-xs text-primary/80 uppercase">
                  {dateInfo.month}
                </span>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {event.title}
                </h4>
                
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateInfo.time}
                  </span>
                  
                  {event.location_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location_name}
                    </span>
                  )}
                  
                  {event.max_participants && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.current_participants || 0}/{event.max_participants}
                    </span>
                  )}
                </div>

                {/* Program badge */}
                {event.program_id && event.program_title && (
                  <Link to={`/challenges/${event.program_id}`} className="block mt-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors"
                    >
                      {t('events.part_of_program') || 'Része a'}: {event.program_title}
                    </Badge>
                  </Link>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {event.village && (
                    <Badge variant="outline" className={`text-xs ${villageColor}`}>
                      {event.village}
                    </Badge>
                  )}

                  {user && (
                    <div className="flex gap-1 ml-auto">
                      {rsvpStatus === 'going' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'not_going' })}
                          disabled={rsvpMutation.isPending}
                        >
                          {t('events.cancel_rsvp') || 'Mégsem megyek'}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 text-xs px-2 bg-gradient-to-r from-[#0066FF] to-[#00CCFF]"
                          onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
                          disabled={rsvpMutation.isPending}
                        >
                          {t('events.going') || 'Ott leszek'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

EventsWidget.displayName = 'EventsWidget';

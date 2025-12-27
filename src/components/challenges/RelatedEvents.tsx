import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { hu, de, enUS } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RelatedEventsProps {
  programId: string;
}

interface Event {
  id: string;
  title: string;
  start_date: string;
  location_name: string | null;
  current_participants: number | null;
  max_participants: number | null;
}

export const RelatedEvents = ({ programId }: RelatedEventsProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  const { data: events, isLoading } = useQuery({
    queryKey: ['relatedEvents', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, location_name, current_participants, max_participants')
        .eq('program_id', programId)
        .gte('start_date', new Date().toISOString())
        .eq('is_public', true)
        .eq('status', 'published')
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!programId,
  });

  const { data: userRsvps } = useQuery({
    queryKey: ['userRsvps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('event_id, status')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'not_going' }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const existing = userRsvps?.find(r => r.event_id === eventId);
      
      if (existing) {
        const { error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('event_id', eventId)
          .eq('user_id', user.id);
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
      toast.success(t('events.rsvp_success'));
    },
    onError: () => {
      toast.error(t('events.rsvp_error'));
    },
  });

  const getRsvpStatus = (eventId: string) => {
    return userRsvps?.find(r => r.event_id === eventId)?.status || null;
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            {t('events.related_events')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return null; // Don't show if no events
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          {t('events.related_events')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map(event => {
          const eventDate = new Date(event.start_date);
          const rsvpStatus = getRsvpStatus(event.id);

          return (
            <div
              key={event.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/30 hover:border-accent/30 transition-colors"
            >
              {/* Date display */}
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-accent leading-none">
                  {format(eventDate, 'd', { locale: dateLocale })}
                </span>
                <span className="text-xs text-accent/80 uppercase">
                  {format(eventDate, 'MMM', { locale: dateLocale })}
                </span>
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(eventDate, 'HH:mm', { locale: dateLocale })}
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
              </div>

              {/* RSVP button */}
              {user && (
                <div className="flex-shrink-0">
                  {rsvpStatus === 'going' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'not_going' })}
                      disabled={rsvpMutation.isPending}
                    >
                      {t('events.cancel_rsvp')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-gradient-to-r from-[#0066FF] to-[#00CCFF]"
                      onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
                      disabled={rsvpMutation.isPending}
                    >
                      {t('events.going')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RelatedEvents;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Event {
  id: string;
  title: string;
  start_date: string;
  location_name: string;
  image_url: string | null;
}

const CommunityEvents = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date, location_name, image_url')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('hu-HU', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-80 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('community.upcoming_events')}</h2>
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="gap-2"
        >
          {t('community.view_all_events')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t('community.events_coming_soon')}</p>
          <Button
            variant="link"
            onClick={() => navigate('/events')}
            className="mt-2"
          >
            {t('community.view_all_events')}
          </Button>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {events.map((event) => {
            const { month, day } = formatEventDate(event.start_date);
            return (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-80"
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{month}</span>
                        <span className="text-2xl font-bold text-primary">{day}</span>
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {event.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location_name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Search,
  RefreshCw,
  MapPin,
  Users,
  Clock,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { EventDetailModal } from '@/components/admin/modals/EventDetailModal';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  status: string;
  current_participants: number;
  max_participants: number | null;
  is_public: boolean;
}


const AdminEvents = () => {
  const { isDemoMode } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Hiba az események betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isDemoMode]);

  // Handle card click - open modal
  const handleCardClick = (eventId: string) => {
    // Card clicked
    setSelectedEventId(eventId);
    setModalOpen(true);
  };

  const getStatusBadge = (status: string, isPublic: boolean) => {
    if (status === 'published' && isPublic) {
      return <Badge className="bg-emerald-100 text-emerald-800">Nyilvános</Badge>;
    }
    if (status === 'published' && !isPublic) {
      return <Badge className="bg-blue-100 text-blue-800">Privát</Badge>;
    }
    if (status === 'draft') {
      return <Badge variant="secondary">Piszkozat</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Események
          </h1>
          <p className="text-muted-foreground">
            Közösségi események kezelése
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchEvents} variant="outline" size="icon">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Új esemény
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Keresés esemény vagy helyszín alapján..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nincs esemény</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleCardClick(event.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600 uppercase">
                      {format(new Date(event.start_date), 'MMM', { locale: hu })}
                    </span>
                    <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {format(new Date(event.start_date), 'd')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{event.title}</h3>
                      {getStatusBadge(event.status, event.is_public)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(event.start_date), 'HH:mm', { locale: hu })}
                      </span>
                      {event.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.current_participants}
                        {event.max_participants && ` / ${event.max_participants}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        eventId={selectedEventId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={fetchEvents}
      />
    </div>
  );
};

export default AdminEvents;

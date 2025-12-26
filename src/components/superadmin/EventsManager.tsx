import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Trash2, Edit, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const VILLAGES = [
  'Kővágóörs',
  'Mindszentkálla', 
  'Kékkút',
  'Szentbékkálla',
  'Balatonhenye',
  'Köveskál',
  'Salföld',
  'Ábrahámhegy',
];

const EventsManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: events, isLoading } = useQuery({
    queryKey: ['superadmin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_rsvps(id, status)')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      toast.success('Esemény sikeresen törölve');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error('Hiba történt az esemény törlésekor');
    },
  });

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVillage = villageFilter === 'all' || event.village === villageFilter;
    
    const now = new Date();
    const eventDate = new Date(event.start_date);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'upcoming' && eventDate >= now) ||
                          (statusFilter === 'past' && eventDate < now);

    return matchesSearch && matchesVillage && matchesStatus;
  });

  const getParticipantCount = (event: any) => {
    const going = event.event_rsvps?.filter((r: any) => r.status === 'going').length || 0;
    return going;
  };

  const isUpcoming = (startDate: string) => new Date(startDate) >= new Date();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Események kezelése</h2>
          <p className="text-muted-foreground">
            Összes esemény: {events?.length || 0}
          </p>
        </div>
        <CreateEventDialog />
      </div>

      {/* Filters */}
      <Card className="bg-card/30 backdrop-blur border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Keresés cím vagy leírás alapján..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={villageFilter} onValueChange={setVillageFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Település" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Minden település</SelectItem>
                {VILLAGES.map((village) => (
                  <SelectItem key={village} value={village}>{village}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Státusz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="upcoming">Közelgő</SelectItem>
                <SelectItem value="past">Múltbeli</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="bg-card/30 backdrop-blur border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Esemény</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead>Település</TableHead>
                <TableHead>Résztvevők</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nincs találat a szűrési feltételeknek megfelelően
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        {event.location_name && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.start_date), 'yyyy. MMM d. HH:mm', { locale: hu })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.village ? (
                        <Badge variant="outline">{event.village}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {getParticipantCount(event)}
                          {event.max_participants && `/${event.max_participants}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isUpcoming(event.start_date) ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Közelgő
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Lezárult</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Esemény törlése</AlertDialogTitle>
                              <AlertDialogDescription>
                                Biztosan törölni szeretnéd az "{event.title}" eseményt? 
                                Ez a művelet nem vonható vissza.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Mégse</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Törlés
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsManager;
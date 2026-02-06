import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  Calendar,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { CATEGORIES } from '@/constants/categories';

interface Event {
  id: string;
  title: string;
  title_en: string | null;
  title_de: string | null;
  description: string | null;
  description_en: string | null;
  description_de: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  image_url: string | null;
  category: string | null;
  max_participants: number | null;
  current_participants: number;
  is_free: boolean;
  status: string;
  created_by: string | null;
  created_at: string;
}

interface EventRSVP {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

type EventFormData = {
  title: string;
  title_en: string;
  title_de: string;
  description: string;
  description_en: string;
  description_de: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  image_url: string;
  category: string;
  max_participants: string;
  is_free: boolean;
  status: string;
};

const AdminEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    title_en: '',
    title_de: '',
    description: '',
    description_en: '',
    description_de: '',
    start_date: '',
    end_date: '',
    location_name: '',
    location_address: '',
    image_url: '',
    category: '',
    max_participants: '',
    is_free: true,
    status: 'draft',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // RSVP viewer state
  const [rsvpViewerOpen, setRsvpViewerOpen] = useState(false);
  const [selectedEventRSVPs, setSelectedEventRSVPs] = useState<EventRSVP[]>([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [loadingRSVPs, setLoadingRSVPs] = useState(false);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents((data || []) as Event[]);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Hiba történt az események betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events by status
  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return events;
    return events.filter(event => event.status === activeTab);
  }, [events, activeTab]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 text-white">Publikált</Badge>;
      case 'draft':
        return <Badge variant="secondary">Vázlat</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Törölve</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get category label
  const getCategoryLabel = (category: string | null) => {
    if (!category) return '-';
    const categoryMap: Record<string, string> = {
      lifestyle: 'Életmód',
      craft: 'Kézműves',
      gastronomy: 'Gasztronómia',
      wellness: 'Wellness',
      hiking: 'Túrázás',
      gardening: 'Kertészet',
      heritage: 'Hagyományőrzés',
      volunteering: 'Önkéntesség',
      market: 'Piac',
      community: 'Közösségi',
      sport: 'Sport',
      culture: 'Kultúra',
      family: 'Család',
    };
    return categoryMap[category] || category;
  };

  // Open create form
  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      title_en: '',
      title_de: '',
      description: '',
      description_en: '',
      description_de: '',
      start_date: '',
      end_date: '',
      location_name: '',
      location_address: '',
      image_url: '',
      category: '',
      max_participants: '',
      is_free: true,
      status: 'draft',
    });
    setFormOpen(true);
  };

  // Open edit form
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      title_en: event.title_en || '',
      title_de: event.title_de || '',
      description: event.description || '',
      description_en: event.description_en || '',
      description_de: event.description_de || '',
      start_date: event.start_date,
      end_date: event.end_date || '',
      location_name: event.location_name || '',
      location_address: event.location_address || '',
      image_url: event.image_url || '',
      category: event.category || '',
      max_participants: event.max_participants?.toString() || '',
      is_free: event.is_free,
      status: event.status,
    });
    setFormOpen(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.start_date || !formData.location_name) {
      toast.error('Kérjük töltse ki a kötelező mezőket');
      return;
    }

    setFormSubmitting(true);
    try {
      const eventData = {
        title: formData.title,
        title_en: formData.title_en || null,
        title_de: formData.title_de || null,
        description: formData.description,
        description_en: formData.description_en || null,
        description_de: formData.description_de || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        location_name: formData.location_name,
        location_address: formData.location_address || null,
        image_url: formData.image_url || null,
        category: formData.category || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_free: formData.is_free,
        status: formData.status,
        is_public: formData.status === 'published',
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Esemény sikeresen frissítve');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Esemény sikeresen létrehozva');
      }

      setFormOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error('Hiba történt az esemény mentésekor');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete event
  const handleDelete = async (eventId: string) => {
    if (!confirm('Biztosan törölni szeretné ezt az eseményt?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Esemény sikeresen törölve');
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Hiba történt az esemény törlésekor');
    }
  };

  // View RSVPs
  const handleViewRSVPs = async (event: Event) => {
    setSelectedEventTitle(event.title);
    setRsvpViewerOpen(true);
    setLoadingRSVPs(true);

    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          id,
          user_id,
          status,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSelectedEventRSVPs(data || []);
    } catch (error: any) {
      console.error('Error fetching RSVPs:', error);
      toast.error('Hiba történt a jelentkezések betöltésekor');
    } finally {
      setLoadingRSVPs(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Események kezelése</h1>
          <p className="text-gray-500 mt-1">Közösségi események létrehozása és kezelése</p>
        </div>
        <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Új esemény
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Összes ({events.length})</TabsTrigger>
          <TabsTrigger value="published">
            Publikált ({events.filter(e => e.status === 'published').length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Vázlat ({events.filter(e => e.status === 'draft').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Törölve ({events.filter(e => e.status === 'cancelled').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nincs megjeleníthető esemény</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Név</TableHead>
                  <TableHead>Dátum</TableHead>
                  <TableHead>Helyszín</TableHead>
                  <TableHead>Kategória</TableHead>
                  <TableHead>Résztvevők</TableHead>
                  <TableHead>Státusz</TableHead>
                  <TableHead className="text-right">Műveletek</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(event.start_date), 'yyyy.MM.dd HH:mm', { locale: hu })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {event.location_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.category && (
                        <Badge variant="outline">{getCategoryLabel(event.category)}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.max_participants ? (
                        <span className="text-sm">
                          {event.current_participants}/{event.max_participants}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Korlátlan</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRSVPs(event)}
                          title="Résztvevők megtekintése"
                        >
                          <UsersIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          title="Szerkesztés"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Törlés"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Event Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Esemény szerkesztése' : 'Új esemény létrehozása'}
            </DialogTitle>
            <DialogDescription>
              Töltse ki az esemény adatait. A csillaggal jelölt mezők kötelezők.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Cím *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Esemény címe magyarul"
              />
            </div>

            {/* Title EN */}
            <div className="space-y-2">
              <Label htmlFor="title_en">Cím (angol)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Event title in English"
              />
            </div>

            {/* Title DE */}
            <div className="space-y-2">
              <Label htmlFor="title_de">Cím (német)</Label>
              <Input
                id="title_de"
                value={formData.title_de}
                onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                placeholder="Veranstaltungstitel auf Deutsch"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Leírás *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Esemény leírása magyarul"
                rows={4}
              />
            </div>

            {/* Description EN */}
            <div className="space-y-2">
              <Label htmlFor="description_en">Leírás (angol)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Event description in English"
                rows={3}
              />
            </div>

            {/* Description DE */}
            <div className="space-y-2">
              <Label htmlFor="description_de">Leírás (német)</Label>
              <Textarea
                id="description_de"
                value={formData.description_de}
                onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                placeholder="Veranstaltungsbeschreibung auf Deutsch"
                rows={3}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Kezdés dátuma és ideje *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Befejezés dátuma és ideje</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location_name">Helyszín neve *</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="pl. Káli Panzió"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Helyszín címe</Label>
              <Input
                id="location_address"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                placeholder="pl. 8242 Kővágóörs, Fő utca 1."
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Kép URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Category and Max Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategória</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon kategóriát" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max. résztvevők</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  placeholder="Hagyja üresen korlátlan esetén"
                />
              </div>
            </div>

            {/* Status and Is Free */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Státusz</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Vázlat</SelectItem>
                    <SelectItem value="published">Publikált</SelectItem>
                    <SelectItem value="cancelled">Törölve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ingyenes</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked as boolean })}
                  />
                  <label htmlFor="is_free" className="text-sm text-gray-600">
                    Az esemény ingyenes
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={formSubmitting}>
              Mégse
            </Button>
            <Button onClick={handleSubmit} disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Mentés...
                </>
              ) : (
                'Mentés'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RSVP Viewer Dialog */}
      <Dialog open={rsvpViewerOpen} onOpenChange={setRsvpViewerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Résztvevők - {selectedEventTitle}</DialogTitle>
            <DialogDescription>
              Az eseményre jelentkezett felhasználók listája
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingRSVPs ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : selectedEventRSVPs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Még nincs jelentkező erre az eseményre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEventRSVPs.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {rsvp.profiles?.first_name} {rsvp.profiles?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{rsvp.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(rsvp.created_at), 'yyyy.MM.dd HH:mm', { locale: hu })}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {rsvp.status === 'going' ? 'Részt vesz' : rsvp.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRsvpViewerOpen(false)}>
              Bezárás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventsPage;

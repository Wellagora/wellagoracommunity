import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  village: string | null;
  current_participants: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_public: boolean | null;
  project_id: string | null;
  challenge_id: string | null;
  organization_id: string | null;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getUpcomingEvents = (limit: number = 5) => {
    return useQuery({
      queryKey: ['upcomingEvents', limit],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .eq('is_public', true)
          .order('start_date', { ascending: true })
          .limit(limit);

        if (error) throw error;
        return data as Event[];
      },
    });
  };

  const getUserRsvps = () => {
    return useQuery({
      queryKey: ['userRsvps', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const { data, error } = await supabase
          .from('event_rsvps')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        return data as EventRsvp[];
      },
      enabled: !!user?.id,
    });
  };

  const rsvpToEvent = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First check if RSVP exists
      const { data: existing } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .insert({ event_id: eventId, user_id: user.id, status })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRsvps'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
    },
  });

  const getEventsByVillage = (village: string) => {
    return useQuery({
      queryKey: ['eventsByVillage', village],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('village', village)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (error) throw error;
        return data as Event[];
      },
      enabled: !!village,
    });
  };

  return {
    getUpcomingEvents,
    getUserRsvps,
    rsvpToEvent,
    getEventsByVillage,
  };
}

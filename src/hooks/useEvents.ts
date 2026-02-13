import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { awardPoints } from '@/lib/wellpoints';

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
  program_id: string | null;
  organization_id: string | null;
  created_by: string | null;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  location_name?: string | null;
  village?: string | null;
  max_participants?: number | null;
  is_public?: boolean;
  organization_id?: string | null;
  project_id?: string | null;
}

export function useEvents() {
  const { user, profile } = useAuth();
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userRsvps'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });

      // Award points when RSVP is 'going'
      if (variables.status === 'going' && user?.id) {
        awardPoints(user.id, 'event_attended', 'Esemény részvétel', variables.eventId, 'event').catch(() => {});
      }
    },
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
          organization_id: eventData.organization_id || profile?.organization_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      queryClient.invalidateQueries({ queryKey: ['organizationEvents'] });
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

  const getOrganizationEvents = (organizationId: string | null) => {
    return useQuery({
      queryKey: ['organizationEvents', organizationId],
      queryFn: async () => {
        if (!organizationId) return [];
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', organizationId)
          .order('start_date', { ascending: true });

        if (error) throw error;
        return data as Event[];
      },
      enabled: !!organizationId,
    });
  };

  return {
    getUpcomingEvents,
    getUserRsvps,
    rsvpToEvent,
    createEvent,
    getEventsByVillage,
    getOrganizationEvents,
  };
}

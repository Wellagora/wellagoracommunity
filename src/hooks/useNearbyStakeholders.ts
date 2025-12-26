import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/database';

export interface NearbyStakeholder {
  id: string;
  name: string;
  user_role: UserRole;
  organization: string | null;
  distance_meters: number;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  industry: string | null;
}

interface UseNearbyStakeholdersOptions {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  projectId?: string;
  limit?: number;
  enabled?: boolean;
}

export const useNearbyStakeholders = ({
  latitude,
  longitude,
  radiusMeters = 10000,
  projectId,
  limit = 50,
  enabled = true
}: UseNearbyStakeholdersOptions = {}) => {
  const [stakeholders, setStakeholders] = useState<NearbyStakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!latitude || !longitude || !enabled) {
      setStakeholders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: rpcError } = await supabase.rpc('find_nearby_stakeholders', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_meters: radiusMeters,
        p_project_id: projectId || null,
        p_limit: limit
      });
      
      if (rpcError) throw rpcError;
      
      // Transform the data to match our interface
      const transformedData: NearbyStakeholder[] = (data || []).map((item: {
        id: string;
        name: string;
        user_role: UserRole;
        organization: string | null;
        distance_meters: number;
        avatar_url: string | null;
        bio: string | null;
        location: string | null;
        industry: string | null;
      }) => ({
        id: item.id,
        name: item.name,
        user_role: item.user_role,
        organization: item.organization,
        distance_meters: item.distance_meters,
        avatar_url: item.avatar_url,
        bio: item.bio,
        location: item.location,
        industry: item.industry
      }));
      
      setStakeholders(transformedData);
    } catch (e) {
      console.error('Error fetching nearby stakeholders:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusMeters, projectId, limit, enabled]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const refetch = useCallback(() => {
    fetchNearby();
  }, [fetchNearby]);

  // Helper to format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return { 
    stakeholders, 
    loading, 
    error, 
    refetch,
    formatDistance 
  };
};

// Hook to get user's current location
export const useUserLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  }, []);

  return { location, loading, error };
};

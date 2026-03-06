import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityStats {
  members: number;
  experts: number;
  sponsors: number;
  programs: number;
  events: number;
  // Legacy fields for backward compatibility
  sharedIdeas: number;
  collaborations: number;
  eventsCount: number;
}

interface UseCommunityStatsResult {
  stats: CommunityStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const EMPTY_STATS: CommunityStats = {
  members: 0,
  experts: 0,
  sponsors: 0,
  programs: 0,
  events: 0,
  sharedIdeas: 0,
  collaborations: 0,
  eventsCount: 0,
};

// Keep export for backward compatibility but no longer use mock data
export const DEMO_STATS = EMPTY_STATS;
export const DEMO_SPONSORS_COUNT = 0;

/**
 * Hook to fetch community impact statistics from Supabase
 * Returns real data from database, zeros if empty
 * @param projectId - Optional project ID to filter stats
 */
export const useCommunityStats = (projectId?: string): UseCommunityStatsResult => {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState<CommunityStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all counts in parallel from real database
      const [profilesResult, expertsResult, sponsorsResult, programsResult, vouchersResult, eventsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'creator'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('user_role', ['sponsor', 'business', 'government', 'ngo']),
        supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('content_access').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ]);

      const membersCount = profilesResult.count ?? 0;
      const expertsCount = expertsResult.count ?? 0;
      const sponsorsCount = sponsorsResult.count ?? 0;
      const programsCount = programsResult.count ?? 0;
      const collaborationsCount = vouchersResult.count ?? 0;
      const eventsCount = eventsResult.count ?? 0;

      setStats({
        members: membersCount,
        experts: expertsCount,
        sponsors: sponsorsCount,
        programs: programsCount,
        events: eventsCount,
        sharedIdeas: programsCount,
        collaborations: collaborationsCount,
        eventsCount: eventsCount,
      });
    } catch (e) {
      setError(e as Error);
      // On error, show zeros instead of fake data
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

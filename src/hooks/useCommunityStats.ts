import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_STATS as GLOBAL_DEMO_STATS } from '@/data/mockData';

interface CommunityStats {
  members: number;
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

// Demo stats with realistic fallback numbers
export const DEMO_STATS: CommunityStats = {
  members: GLOBAL_DEMO_STATS.members,
  sharedIdeas: GLOBAL_DEMO_STATS.programs,
  collaborations: 89,
  eventsCount: GLOBAL_DEMO_STATS.events,
};

// Demo sponsors count from central source
export const DEMO_SPONSORS_COUNT = GLOBAL_DEMO_STATS.sponsors;

/**
 * Hook to fetch community impact statistics from Supabase
 * Returns mock data when in demo mode or database is empty
 * @param projectId - Optional project ID to filter stats
 */
export const useCommunityStats = (projectId?: string): UseCommunityStatsResult => {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState<CommunityStats>({
    members: 0,
    sharedIdeas: 0,
    collaborations: 0,
    eventsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    // In demo mode, use mock stats immediately
    if (isDemoMode) {
      setStats(DEMO_STATS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all counts in parallel
      const [profilesResult, programsResult, vouchersResult, eventsResult] = await Promise.all([
        // Active members count from profiles
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // Shared ideas from expert_contents (programs)
        supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        // Collaborations from content_access (voucher redemptions)
        supabase.from('content_access').select('id', { count: 'exact', head: true }),
        // Events count
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ]);

      const membersCount = profilesResult.count ?? 0;
      const programsCount = programsResult.count ?? 0;
      const collaborationsCount = vouchersResult.count ?? 0;
      const eventsCount = eventsResult.count ?? 0;

      // If database is empty, use demo data
      if (membersCount === 0 && programsCount === 0 && eventsCount === 0) {
        setStats(DEMO_STATS);
      } else {
        setStats({
          members: membersCount,
          sharedIdeas: programsCount,
          collaborations: collaborationsCount,
          eventsCount: eventsCount,
        });
      }
    } catch (e) {
      console.error('Failed to fetch community stats:', e);
      setError(e as Error);
      // Fallback to demo stats on error
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
    }
  }, [projectId, isDemoMode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

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

const ZERO_STATS: CommunityStats = {
  members: 0,
  experts: 0,
  sponsors: 0,
  programs: 0,
  events: 0,
  sharedIdeas: 0,
  collaborations: 0,
  eventsCount: 0,
};

/**
 * Hook to fetch community impact statistics from Supabase
 * Returns mock data when in demo mode or database is empty
 * @param projectId - Optional project ID to filter stats
 */
export const useCommunityStats = (projectId?: string): UseCommunityStatsResult => {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState<CommunityStats>({
    members: 0,
    experts: 0,
    sponsors: 0,
    programs: 0,
    events: 0,
    sharedIdeas: 0,
    collaborations: 0,
    eventsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (isDemoMode) {
      setStats(ZERO_STATS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all counts in parallel
      const [profilesResult, expertsResult, sponsorsResult, programsResult, vouchersResult, eventsResult] = await Promise.all([
        // Total members count from profiles
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // Experts count (stored as 'creator' in database)
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'creator'),
        // Sponsors count (business, government, ngo, sponsor roles)
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('user_role', ['sponsor', 'business', 'government', 'ngo']),
        // Programs from expert_contents
        supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        // Collaborations from content_access (voucher redemptions)
        supabase.from('content_access').select('id', { count: 'exact', head: true }),
        // Events count
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
      console.error('Failed to fetch community stats:', e);
      setError(e as Error);
      setStats(ZERO_STATS);
    } finally {
      setLoading(false);
    }
  }, [projectId, isDemoMode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

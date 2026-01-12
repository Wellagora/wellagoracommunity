import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityStats {
  members: number;
  completions: number;
  points: number;
  activeChallenges: number;
}

interface UseCommunityStatsResult {
  stats: CommunityStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Demo mode stats - Single source of truth for demo stats
export const DEMO_STATS: CommunityStats = {
  members: 127,
  completions: 312,
  points: 15420,
  activeChallenges: 8,
};

// Demo sponsors count
export const DEMO_SPONSORS_COUNT = 5;

/**
 * Hook to fetch community impact statistics using server-side RPC
 * Returns mock data when in demo mode
 * @param projectId - Optional project ID to filter stats
 */
export const useCommunityStats = (projectId?: string): UseCommunityStatsResult => {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState<CommunityStats>({
    members: 0,
    completions: 0,
    points: 0,
    activeChallenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    // In demo mode, use mock stats immediately
    if (isDemoMode) {
      setStats(DEMO_STATS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: rpcError } = await supabase.rpc('get_community_impact_stats', {
        p_project_id: projectId || null,
      });

      if (rpcError) throw rpcError;

      if (data) {
        const statsData = data as {
          total_members: number;
          total_completions: number;
          total_points: number;
          active_challenges: number;
        };
        
        setStats({
          members: statsData.total_members || 0,
          completions: statsData.total_completions || 0,
          points: statsData.total_points || 0,
          activeChallenges: statsData.active_challenges || 0,
        });
      }
    } catch (e) {
      console.error('Failed to fetch community stats:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId, isDemoMode]);

  return { stats, loading, error, refetch: fetchStats };
};

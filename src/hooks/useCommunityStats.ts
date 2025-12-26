import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Hook to fetch community impact statistics using server-side RPC
 * @param projectId - Optional project ID to filter stats
 */
export const useCommunityStats = (projectId?: string): UseCommunityStatsResult => {
  const [stats, setStats] = useState<CommunityStats>({
    members: 0,
    completions: 0,
    points: 0,
    activeChallenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
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
  }, [projectId]);

  return { stats, loading, error, refetch: fetchStats };
};

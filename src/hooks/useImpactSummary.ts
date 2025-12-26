import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImpactSummary {
  total_co2_kg: number;
  total_entries: number;
  categories: Record<string, number>;
  recent_entries: Array<{
    id: string;
    category: string;
    action_type: string;
    impact_kg_co2: number;
    title: string;
    created_at: string;
  }>;
}

interface CommunityImpact {
  total_co2_kg: number;
  total_participants: number;
  total_entries: number;
  top_categories: Array<{
    category: string;
    total_impact: number;
    entry_count: number;
  }>;
}

export const useImpactSummary = (userId?: string) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const targetUserId = userId || user?.id || null;
      
      if (!targetUserId) {
        setSummary({
          total_co2_kg: 0,
          total_entries: 0,
          categories: {},
          recent_entries: []
        });
        setLoading(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_user_impact_summary', {
        p_user_id: targetUserId
      });
      
      if (rpcError) throw rpcError;
      setSummary(data as unknown as ImpactSummary);
    } catch (e) {
      console.error('Error fetching impact summary:', e);
      setError(e as Error);
      setSummary({
        total_co2_kg: 0,
        total_entries: 0,
        categories: {},
        recent_entries: []
      });
    } finally {
      setLoading(false);
    }
  }, [userId, user?.id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};

export const useCommunityImpact = (projectId?: string) => {
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data, error: rpcError } = await supabase.rpc('get_community_impact_summary', {
          p_project_id: projectId || null
        });
        
        if (rpcError) throw rpcError;
        setImpact(data as unknown as CommunityImpact);
      } catch (e) {
        console.error('Error fetching community impact:', e);
        setError(e as Error);
        setImpact({
          total_co2_kg: 0,
          total_participants: 0,
          total_entries: 0,
          top_categories: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  return { impact, loading, error };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserChallenges = () => {
  const { user } = useAuth();
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedChallenges = async () => {
      if (!user) {
        setJoinedChallengeIds(new Set());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('challenge_completions')
          .select('challenge_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching joined challenges:', error);
          setJoinedChallengeIds(new Set());
        } else if (data) {
          setJoinedChallengeIds(new Set(data.map(d => d.challenge_id)));
        }
      } catch (err) {
        console.error('Error fetching joined challenges:', err);
        setJoinedChallengeIds(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedChallenges();
  }, [user]);

  const isJoined = (challengeId: string) => joinedChallengeIds.has(challengeId);

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('challenge_completions')
      .select('challenge_id')
      .eq('user_id', user.id);

    if (data) {
      setJoinedChallengeIds(new Set(data.map(d => d.challenge_id)));
    }
    setLoading(false);
  };

  return { joinedChallengeIds, isJoined, loading, refetch };
};

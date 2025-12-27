import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChallengeProgress {
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  validationStatus: string;
}

export const useUserChallenges = () => {
  const { user } = useAuth();
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<string>>(new Set());
  const [challengeProgress, setChallengeProgress] = useState<Map<string, ChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedChallenges = async () => {
      if (!user) {
        setJoinedChallengeIds(new Set());
        setChallengeProgress(new Map());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('challenge_completions')
          .select('challenge_id, validation_status, evidence_data')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching joined challenges:', error);
          setJoinedChallengeIds(new Set());
          setChallengeProgress(new Map());
        } else if (data) {
          setJoinedChallengeIds(new Set(data.map(d => d.challenge_id)));
          
          const progressMap = new Map<string, ChallengeProgress>();
          data.forEach(d => {
            const evidenceData = d.evidence_data as { progress?: number } | null;
            const progress = evidenceData?.progress || (d.validation_status === 'approved' ? 100 : 0);
            progressMap.set(d.challenge_id, {
              challengeId: d.challenge_id,
              progress,
              isCompleted: d.validation_status === 'approved' || progress === 100,
              validationStatus: d.validation_status
            });
          });
          setChallengeProgress(progressMap);
        }
      } catch (err) {
        console.error('Error fetching joined challenges:', err);
        setJoinedChallengeIds(new Set());
        setChallengeProgress(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedChallenges();
  }, [user]);

  const isJoined = (challengeId: string) => joinedChallengeIds.has(challengeId);
  
  const getProgress = (challengeId: string): ChallengeProgress | undefined => {
    return challengeProgress.get(challengeId);
  };

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('challenge_completions')
      .select('challenge_id, validation_status, evidence_data')
      .eq('user_id', user.id);

    if (data) {
      setJoinedChallengeIds(new Set(data.map(d => d.challenge_id)));
      
      const progressMap = new Map<string, ChallengeProgress>();
      data.forEach(d => {
        const evidenceData = d.evidence_data as { progress?: number } | null;
        const progress = evidenceData?.progress || (d.validation_status === 'approved' ? 100 : 0);
        progressMap.set(d.challenge_id, {
          challengeId: d.challenge_id,
          progress,
          isCompleted: d.validation_status === 'approved' || progress === 100,
          validationStatus: d.validation_status
        });
      });
      setChallengeProgress(progressMap);
    }
    setLoading(false);
  };

  return { joinedChallengeIds, isJoined, getProgress, loading, refetch };
};

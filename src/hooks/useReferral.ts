import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralStats {
  pending: number;
  joined: number;
  completed: number;
  totalPoints: number;
}

interface Referral {
  id: string;
  invitee_email: string | null;
  status: string;
  reward_points: number;
  created_at: string;
  joined_at: string | null;
  completed_at: string | null;
}

export const useReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ pending: 0, joined: 0, completed: 0, totalPoints: 0 });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Get referral code from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      
      if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code);
      }

      // Get referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsData) {
        setReferrals(referralsData as Referral[]);
        
        // Calculate stats
        const pending = referralsData.filter(r => r.status === 'pending').length;
        const joined = referralsData.filter(r => r.status === 'joined').length;
        const completed = referralsData.filter(r => ['completed', 'rewarded'].includes(r.status)).length;
        const totalPoints = referralsData
          .filter(r => r.reward_claimed)
          .reduce((sum, r) => sum + (r.reward_points || 0), 0);
        
        setStats({ pending, joined, completed, totalPoints });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const generateShareLink = useCallback((challengeId?: string) => {
    const baseUrl = window.location.origin;
    const refParam = referralCode ? `?ref=${referralCode}` : '';
    
    if (challengeId) {
      return `${baseUrl}/challenges/${challengeId}${refParam}`;
    }
    return `${baseUrl}${refParam}`;
  }, [referralCode]);

  const createReferral = async (email: string, source: string, challengeId?: string) => {
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: user.id,
        invitee_email: email.toLowerCase(),
        source,
        challenge_id: challengeId || null,
        status: 'pending'
      })
      .select()
      .single();

    if (!error) {
      fetchReferralData();
    }

    return { data, error };
  };

  return {
    referralCode,
    stats,
    referrals,
    loading,
    generateShareLink,
    createReferral,
    refetch: fetchReferralData
  };
};

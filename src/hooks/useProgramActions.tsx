import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';
import { supabase } from '@/integrations/supabase/client';
import type { SponsorshipRecord } from '@/types/database';

interface SponsorshipStatus {
  isActiveSponsorship: boolean;
  isExpiredSponsorship: boolean;
  sponsorship: SponsorshipRecord | null;
  loading: boolean;
}

interface ProgramActionsResult {
  isOrganization: boolean;
  sponsorshipStatus: SponsorshipStatus;
  participationStatus: {
    isParticipating: boolean;
    loading: boolean;
  };
  getButtonType: () => 'sponsor' | 'sponsored' | 'extend' | 'join' | 'open' | 'view';
}

export const useProgramActions = (programId: string): ProgramActionsResult => {
  const { profile, user } = useAuth();
  const { getEffectiveRole, isSuperAdmin } = useViewMode();
  
  const [sponsorshipStatus, setSponsorshipStatus] = useState<SponsorshipStatus>({
    isActiveSponsorship: false,
    isExpiredSponsorship: false,
    sponsorship: null,
    loading: true,
  });
  
  const [participationStatus, setParticipationStatus] = useState({
    isParticipating: false,
    loading: true,
  });

  // Use effective role for super admin view mode simulation
  const effectiveRole = getEffectiveRole();
  const isOrganization = ['business', 'government', 'ngo'].includes(effectiveRole);

  // Check sponsorship status for organization users
  useEffect(() => {
    const checkSponsorship = async () => {
      if (!profile?.organization_id || !programId) {
        setSponsorshipStatus({
          isActiveSponsorship: false,
          isExpiredSponsorship: false,
          sponsorship: null,
          loading: false,
        });
        return;
      }

      try {
        const { data: sponsorship, error } = await supabase
          .from('challenge_sponsorships')
          .select('*')
          .eq('challenge_id', programId)
          .eq('sponsor_organization_id', profile.organization_id)
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          setSponsorshipStatus({
            isActiveSponsorship: false,
            isExpiredSponsorship: false,
            sponsorship: null,
            loading: false,
          });
          return;
        }

        if (sponsorship) {
          const isActive = sponsorship.status === 'active' && 
            new Date(sponsorship.end_date) > new Date();
          const isExpired = sponsorship.status !== 'active' || 
            new Date(sponsorship.end_date) <= new Date();

          setSponsorshipStatus({
            isActiveSponsorship: isActive,
            isExpiredSponsorship: isExpired && !isActive,
            sponsorship,
            loading: false,
          });
        } else {
          setSponsorshipStatus({
            isActiveSponsorship: false,
            isExpiredSponsorship: false,
            sponsorship: null,
            loading: false,
          });
        }
      } catch (error) {
        setSponsorshipStatus({
          isActiveSponsorship: false,
          isExpiredSponsorship: false,
          sponsorship: null,
          loading: false,
        });
      }
    };

    checkSponsorship();
  }, [profile?.organization_id, programId]);

  // Check participation status for individual users
  useEffect(() => {
    const checkParticipation = async () => {
      if (!user?.id || !programId || isOrganization) {
        setParticipationStatus({
          isParticipating: false,
          loading: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('challenge_completions')
          .select('id')
          .eq('user_id', user.id)
          .eq('challenge_id', programId)
          .maybeSingle();

        setParticipationStatus({
          isParticipating: !!data,
          loading: false,
        });
      } catch (error) {
        setParticipationStatus({
          isParticipating: false,
          loading: false,
        });
      }
    };

    checkParticipation();
  }, [user?.id, programId, isOrganization]);

  const getButtonType = (): 'sponsor' | 'sponsored' | 'extend' | 'join' | 'open' | 'view' => {
    // Not logged in
    if (!profile) {
      return 'view';
    }

    // Organization user
    if (isOrganization) {
      if (sponsorshipStatus.isActiveSponsorship) {
        return 'sponsored';
      }
      if (sponsorshipStatus.isExpiredSponsorship) {
        return 'extend';
      }
      return 'sponsor';
    }

    // Individual user
    if (participationStatus.isParticipating) {
      return 'open';
    }
    return 'join';
  };

  return {
    isOrganization: !!isOrganization,
    sponsorshipStatus,
    participationStatus,
    getButtonType,
  };
};

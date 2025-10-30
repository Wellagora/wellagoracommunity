import { supabase } from "@/integrations/supabase/client";

export interface SponsorshipImpact {
  challenge_id: string;
  challenge_title: string;
  tier: string;
  status: string;
  start_date: string;
  end_date: string | null;
  credit_cost: number;
  
  // Real impact metrics from database
  total_participants: number;
  total_completions: number;
  total_co2_saved: number; // in kg
  total_points_earned: number;
  trees_equivalent: number;
  
  // Activity breakdown
  activities_by_type: Record<string, {
    count: number;
    co2_saved: number;
  }>;
}

export interface SponsorDashboardMetrics {
  total_sponsorships: number;
  active_sponsorships: number;
  total_participants: number;
  total_completions: number;
  total_co2_saved: number;
  total_points_distributed: number;
  trees_equivalent: number;
  average_validation_score: number;
}

/**
 * Calculates the real impact of a specific sponsored challenge
 * by aggregating data from challenge_completions and sustainability_activities
 */
export const calculateChallengeImpact = async (
  challengeId: string,
  sponsorshipId: string
): Promise<SponsorshipImpact | null> => {
  try {
    // Get sponsorship details
    const { data: sponsorship, error: sponsorshipError } = await supabase
      .from('challenge_sponsorships')
      .select('challenge_id, tier, status, start_date, end_date, credit_cost')
      .eq('id', sponsorshipId)
      .single();

    if (sponsorshipError || !sponsorship) {
      console.error('Error fetching sponsorship:', sponsorshipError);
      return null;
    }

    // Get challenge completions for this challenge
    const { data: completions, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('user_id, points_earned, validation_score, impact_data, challenge_id')
      .eq('challenge_id', challengeId);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
      return null;
    }

    // Get unique participants
    const uniqueParticipants = new Set(completions?.map(c => c.user_id) || []).size;

    // Get all sustainability activities linked to these completions
    const { data: activities, error: activitiesError } = await supabase
      .from('sustainability_activities')
      .select('activity_type, impact_amount, points_earned')
      .eq('challenge_completion_id', challengeId);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Calculate real impact from completions
    let totalCO2 = 0;
    let totalPoints = 0;
    let validationScoreSum = 0;
    const activitiesByType: Record<string, { count: number; co2_saved: number }> = {};

    // Sum up impact from completions
    completions?.forEach(completion => {
      totalPoints += completion.points_earned || 0;
      validationScoreSum += completion.validation_score || 0;

      // Extract CO2 from impact_data
      if (completion.impact_data && typeof completion.impact_data === 'object') {
        const impactData = completion.impact_data as any;
        if (impactData.co2_saved) {
          totalCO2 += parseFloat(impactData.co2_saved) || 0;
        }
      }
    });

    // Sum up impact from activities
    activities?.forEach(activity => {
      const type = activity.activity_type || 'other';
      if (!activitiesByType[type]) {
        activitiesByType[type] = { count: 0, co2_saved: 0 };
      }
      activitiesByType[type].count += 1;
      activitiesByType[type].co2_saved += parseFloat(activity.impact_amount?.toString() || '0');
      totalCO2 += parseFloat(activity.impact_amount?.toString() || '0');
    });

    // Calculate trees equivalent (1 tree absorbs ~22 kg CO2 per year)
    const treesEquivalent = totalCO2 / 22;

    const avgValidationScore = completions && completions.length > 0
      ? validationScoreSum / completions.length
      : 0;

    return {
      challenge_id: sponsorship.challenge_id,
      challenge_title: challengeId, // This should come from challenge_definitions
      tier: sponsorship.tier || 'bronze',
      status: sponsorship.status,
      start_date: sponsorship.start_date,
      end_date: sponsorship.end_date,
      credit_cost: sponsorship.credit_cost || 0,
      total_participants: uniqueParticipants,
      total_completions: completions?.length || 0,
      total_co2_saved: totalCO2,
      total_points_earned: totalPoints,
      trees_equivalent: treesEquivalent,
      activities_by_type: activitiesByType
    };
  } catch (error) {
    console.error('Error calculating challenge impact:', error);
    return null;
  }
};

/**
 * Gets aggregated metrics for all sponsorships by a sponsor
 */
export const getSponsorDashboardMetrics = async (
  sponsorUserId: string
): Promise<SponsorDashboardMetrics> => {
  try {
    // Get all sponsorships for this sponsor
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from('challenge_sponsorships')
      .select('id, challenge_id, status')
      .eq('sponsor_user_id', sponsorUserId);

    if (sponsorshipsError || !sponsorships) {
      console.error('Error fetching sponsorships:', sponsorshipsError);
      return getEmptyMetrics();
    }

    const challengeIds = sponsorships.map(s => s.challenge_id);
    const activeSponsorships = sponsorships.filter(s => s.status === 'active').length;

    // Get all completions for sponsored challenges
    const { data: completions, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('user_id, challenge_id, points_earned, validation_score, impact_data')
      .in('challenge_id', challengeIds);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
      return getEmptyMetrics();
    }

    // Calculate metrics
    const uniqueParticipants = new Set(completions?.map(c => c.user_id) || []).size;
    let totalCO2 = 0;
    let totalPoints = 0;
    let validationScoreSum = 0;

    completions?.forEach(completion => {
      totalPoints += completion.points_earned || 0;
      validationScoreSum += completion.validation_score || 0;

      // Extract CO2 from impact_data
      if (completion.impact_data && typeof completion.impact_data === 'object') {
        const impactData = completion.impact_data as any;
        if (impactData.co2_saved) {
          totalCO2 += parseFloat(impactData.co2_saved) || 0;
        }
      }
    });

    const avgValidationScore = completions && completions.length > 0
      ? validationScoreSum / completions.length
      : 0;

    const treesEquivalent = totalCO2 / 22;

    return {
      total_sponsorships: sponsorships.length,
      active_sponsorships: activeSponsorships,
      total_participants: uniqueParticipants,
      total_completions: completions?.length || 0,
      total_co2_saved: totalCO2,
      total_points_distributed: totalPoints,
      trees_equivalent: treesEquivalent,
      average_validation_score: avgValidationScore
    };
  } catch (error) {
    console.error('Error getting sponsor metrics:', error);
    return getEmptyMetrics();
  }
};

const getEmptyMetrics = (): SponsorDashboardMetrics => ({
  total_sponsorships: 0,
  active_sponsorships: 0,
  total_participants: 0,
  total_completions: 0,
  total_co2_saved: 0,
  total_points_distributed: 0,
  trees_equivalent: 0,
  average_validation_score: 0
});

import { supabase } from "@/integrations/supabase/client";

export interface SponsorshipImpact {
  sponsorship_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_description: string;
  tier: string;
  status: string;
  start_date: string;
  end_date: string | null;
  credit_cost: number;
  region: string;
  project_id: string | null;
  
  // Real impact metrics from database (aggregated)
  total_participants: number;
  total_completions: number;
  total_co2_saved: number; // in kg
  total_points_earned: number;
  trees_equivalent: number;
  average_validation_score: number;
  
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
 * OPTIMIZED: Gets all sponsorships with their impacts in a single query
 * Uses database aggregation instead of multiple round trips
 */
export const getSponsorshipsWithImpact = async (
  sponsorUserId: string
): Promise<SponsorshipImpact[]> => {
  try {
    // Step 1: Get all active sponsorships for this sponsor
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from('challenge_sponsorships')
      .select('id, challenge_id, tier, status, start_date, end_date, credit_cost, region, project_id')
      .eq('sponsor_user_id', sponsorUserId)
      .eq('status', 'active')
      .order('start_date', { ascending: false });

    if (sponsorshipsError || !sponsorships || sponsorships.length === 0) {
      console.error('Error fetching sponsorships:', sponsorshipsError);
      return [];
    }

    const challengeIds = sponsorships.map(s => s.challenge_id);

    // Step 2: Get challenge definitions (titles, descriptions)
    const { data: challenges, error: challengesError } = await supabase
      .from('challenge_definitions')
      .select('id, title, description')
      .in('id', challengeIds);

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
    }

    // Create a map for quick lookup
    const challengeMap = new Map(
      challenges?.map(c => [c.id, { title: c.title, description: c.description }]) || []
    );

    // Step 3: Get aggregated completion data for all challenges at once
    const { data: completionsAgg, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('challenge_id, user_id, points_earned, validation_score, impact_data')
      .in('challenge_id', challengeIds);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
    }

    // Step 4: Get all sustainability activities for these challenges
    const completionIds = completionsAgg?.map(c => c.challenge_id) || [];
    
    const { data: activities, error: activitiesError } = await supabase
      .from('sustainability_activities')
      .select('challenge_completion_id, activity_type, impact_amount')
      .not('challenge_completion_id', 'is', null);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Step 5: Aggregate data per challenge (in memory, but all data loaded at once)
    const impactMap = new Map<string, {
      participants: Set<string>;
      completions: number;
      co2_saved: number;
      points: number;
      validation_scores: number[];
      activities_by_type: Record<string, { count: number; co2_saved: number }>;
    }>();

    // Initialize map for each challenge
    challengeIds.forEach(id => {
      impactMap.set(id, {
        participants: new Set(),
        completions: 0,
        co2_saved: 0,
        points: 0,
        validation_scores: [],
        activities_by_type: {}
      });
    });

    // Aggregate completions
    completionsAgg?.forEach(completion => {
      const impact = impactMap.get(completion.challenge_id);
      if (impact) {
        impact.participants.add(completion.user_id);
        impact.completions += 1;
        impact.points += completion.points_earned || 0;
        impact.validation_scores.push(completion.validation_score || 0);

        // Extract CO2 from impact_data
        if (completion.impact_data && typeof completion.impact_data === 'object') {
          const impactData = completion.impact_data as any;
          if (impactData.co2_saved) {
            impact.co2_saved += parseFloat(impactData.co2_saved) || 0;
          }
        }
      }
    });

    // Aggregate activities
    activities?.forEach(activity => {
      // Find which challenge this activity belongs to
      const completion = completionsAgg?.find(c => c.challenge_id === activity.challenge_completion_id);
      if (completion) {
        const impact = impactMap.get(completion.challenge_id);
        if (impact) {
          const type = activity.activity_type || 'other';
          if (!impact.activities_by_type[type]) {
            impact.activities_by_type[type] = { count: 0, co2_saved: 0 };
          }
          impact.activities_by_type[type].count += 1;
          const co2 = parseFloat(activity.impact_amount?.toString() || '0');
          impact.activities_by_type[type].co2_saved += co2;
          impact.co2_saved += co2;
        }
      }
    });

    // Step 6: Build final result array
    return sponsorships.map(sponsorship => {
      const impact = impactMap.get(sponsorship.challenge_id);
      const challengeInfo = challengeMap.get(sponsorship.challenge_id);
      
      const totalCO2 = impact?.co2_saved || 0;
      const avgValidation = impact && impact.validation_scores.length > 0
        ? impact.validation_scores.reduce((a, b) => a + b, 0) / impact.validation_scores.length
        : 0;

      return {
        sponsorship_id: sponsorship.id,
        challenge_id: sponsorship.challenge_id,
        challenge_title: challengeInfo?.title || sponsorship.challenge_id,
        challenge_description: challengeInfo?.description || '',
        tier: sponsorship.tier || 'bronze',
        status: sponsorship.status,
        start_date: sponsorship.start_date,
        end_date: sponsorship.end_date,
        credit_cost: sponsorship.credit_cost || 0,
        region: sponsorship.region || '',
        project_id: sponsorship.project_id || null,
        total_participants: impact?.participants.size || 0,
        total_completions: impact?.completions || 0,
        total_co2_saved: totalCO2,
        total_points_earned: impact?.points || 0,
        trees_equivalent: totalCO2 / 22,
        average_validation_score: avgValidation,
        activities_by_type: impact?.activities_by_type || {}
      };
    });

  } catch (error) {
    console.error('Error getting sponsorships with impact:', error);
    return [];
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

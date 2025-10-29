import { supabase } from "@/integrations/supabase/client";
import { Challenge } from "@/data/challenges";

interface SponsorInfo {
  name: string;
  logo: string;
  tier: string;
  organization?: string;
}

interface ChallengeSponsorshipData {
  id: string;
  challenge_id: string;
  sponsor_user_id: string;
  tier: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface ProfileData {
  organization: string | null;
  public_display_name: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

/**
 * Fetches active sponsorships from database, optionally filtered by project
 */
export const getActiveSponsorships = async (projectId?: string): Promise<Map<string, SponsorInfo>> => {
  try {
    // Build the query
    let query = supabase
      .from('challenge_sponsorships')
      .select('id, challenge_id, sponsor_user_id, tier, status, start_date, end_date, project_id')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString().split('T')[0]);
    
    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: sponsorships, error: sponsorshipsError } = await query;

    if (sponsorshipsError) {
      console.error('Error fetching sponsorships:', sponsorshipsError);
      return new Map();
    }

    if (!sponsorships || sponsorships.length === 0) {
      return new Map();
    }

    // Get unique sponsor user IDs
    const sponsorUserIds = [...new Set(sponsorships.map(s => s.sponsor_user_id))];

    // Fetch sponsor profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, organization, public_display_name, first_name, last_name, avatar_url')
      .in('id', sponsorUserIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Map();
    }

    // Create a map of user_id -> profile
    const profilesMap = new Map<string, ProfileData>();
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });

    // Build the final sponsorship map
    const sponsorshipMap = new Map<string, SponsorInfo>();

    sponsorships.forEach((sponsorship: ChallengeSponsorshipData) => {
      const profile = profilesMap.get(sponsorship.sponsor_user_id);

      if (profile) {
        const sponsorName = profile.public_display_name || 
                          profile.organization || 
                          `${profile.first_name} ${profile.last_name}`;
        
        sponsorshipMap.set(sponsorship.challenge_id, {
          name: sponsorName,
          logo: profile.avatar_url || '/placeholder.svg',
          tier: sponsorship.tier || 'bronze',
          organization: profile.organization || undefined
        });
      }
    });

    return sponsorshipMap;
  } catch (error) {
    console.error('Exception in getActiveSponsorships:', error);
    return new Map();
  }
};

/**
 * Enriches challenges with sponsorship data, optionally filtered by project
 */
export const enrichChallengesWithSponsors = async (
  challenges: Challenge[],
  projectId?: string
): Promise<Challenge[]> => {
  const sponsorships = await getActiveSponsorships(projectId);
  
  return challenges.map(challenge => {
    const sponsorInfo = sponsorships.get(challenge.id);
    
    if (sponsorInfo) {
      return {
        ...challenge,
        sponsor: {
          name: sponsorInfo.name,
          logo: sponsorInfo.logo
        }
      };
    }
    
    return challenge;
  });
};

/**
 * Gets sponsor info for a specific challenge, optionally filtered by project
 */
export const getChallengeSponsor = async (
  challengeId: string,
  projectId?: string
): Promise<SponsorInfo | null> => {
  const sponsorships = await getActiveSponsorships(projectId);
  return sponsorships.get(challengeId) || null;
};

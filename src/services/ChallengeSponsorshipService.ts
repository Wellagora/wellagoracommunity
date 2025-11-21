import { supabase } from "@/integrations/supabase/client";
import { Challenge } from "@/data/challenges";

interface SponsorInfo {
  name: string;
  logo: string;
  tier: string;
  organization?: string;
  sponsorUserId?: string;
  organizationId?: string;
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
  id: string;
  organization: string | null;
  organization_id: string | null;
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
      .select('id, organization, organization_id, public_display_name, first_name, last_name, avatar_url')
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
        // Prefer organization name for sponsors, then display name, then full name
        const sponsorName = profile.organization ||
                          profile.public_display_name || 
                          `${profile.first_name} ${profile.last_name}`;
        
        sponsorshipMap.set(sponsorship.challenge_id, {
          name: sponsorName,
          logo: profile.avatar_url || '/placeholder.svg',
          tier: sponsorship.tier || 'bronze',
          organization: profile.organization || undefined,
          sponsorUserId: sponsorship.sponsor_user_id,
          organizationId: profile.organization_id || undefined
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
          logo: sponsorInfo.logo,
          sponsorUserId: sponsorInfo.sponsorUserId,
          organizationId: sponsorInfo.organizationId
        }
      };
    }
    
    return challenge;
  });
};

/**
 * Loads challenges from database and enriches with sponsorship data
 * @param projectId - Optional project ID to filter challenges
 * @param language - Language code for translations (e.g., 'en', 'de', 'hu')
 */
export const loadChallengesFromDatabase = async (
  projectId?: string,
  language: string = 'hu'
): Promise<Challenge[]> => {
  try {
    // Build the query - always load challenges, optionally filter by project
    let query = supabase
      .from('challenge_definitions')
      .select('*')
      .eq('is_active', true);
    
    // Filter by project if provided, otherwise load all challenges
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: dbChallenges, error } = await query;

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    if (!dbChallenges || dbChallenges.length === 0) {
      console.log('No challenges found in database');
      return [];
    }
    
    console.log(`Loaded ${dbChallenges.length} challenges from database`);

    // Get sponsorships
    const sponsorships = await getActiveSponsorships(projectId);

    // Transform database challenges to Challenge format
    const challenges: Challenge[] = dbChallenges.map((dbChallenge) => {
      const sponsorInfo = sponsorships.get(dbChallenge.id);
      
      // Get translated content if available
      const translations = (dbChallenge.translations as any) || {};
      const currentLangTranslation = translations[language] || {};
      
      // Use translated title/description or fall back to original
      const title = currentLangTranslation.title || dbChallenge.title || 'Untitled Challenge';
      const description = currentLangTranslation.description || dbChallenge.description || '';
      
      // Translate duration text based on language
      let durationText = '';
      if (dbChallenge.is_continuous) {
        durationText = language === 'de' ? 'Laufend' : 
                       language === 'en' ? 'Ongoing' :
                       language === 'cs' ? 'Průběžně' :
                       language === 'sk' ? 'Priebežne' :
                       language === 'hr' ? 'Trajno' :
                       language === 'ro' ? 'Continuu' :
                       language === 'pl' ? 'Ciągły' :
                       'Folyamatos'; // Hungarian default
      } else {
        const dayWord = language === 'de' ? 'Tage' :
                        language === 'en' ? 'days' :
                        language === 'cs' ? 'dní' :
                        language === 'sk' ? 'dní' :
                        language === 'hr' ? 'dana' :
                        language === 'ro' ? 'zile' :
                        language === 'pl' ? 'dni' :
                        'nap'; // Hungarian default
        durationText = `${dbChallenge.duration_days} ${dayWord}`;
      }
      
      return {
        id: dbChallenge.id,
        titleKey: title,
        descriptionKey: description,
        longDescriptionKey: description,
        category: dbChallenge.category as Challenge['category'],
        difficulty: dbChallenge.difficulty as Challenge['difficulty'],
        durationKey: durationText,
        pointsReward: dbChallenge.points_base,
        participants: 0, // Default value
        completionRate: 0, // Default value
        stepsKeys: [],
        tipsKeys: [],
        participants_preview: [],
        isContinuous: dbChallenge.is_continuous,
        startDate: dbChallenge.start_date,
        endDate: dbChallenge.end_date,
        location: dbChallenge.location,
        imageUrl: dbChallenge.image_url,
        sponsor: sponsorInfo ? {
          name: sponsorInfo.name,
          logo: sponsorInfo.logo,
          sponsorUserId: sponsorInfo.sponsorUserId,
          organizationId: sponsorInfo.organizationId
        } : undefined
      };
    });

    return challenges;
  } catch (error) {
    console.error('Exception in loadChallengesFromDatabase:', error);
    return [];
  }
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

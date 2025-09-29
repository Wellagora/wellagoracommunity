import { supabase } from '@/integrations/supabase/client';

/**
 * Safely fetch public profile data without exposing sensitive information like email addresses
 * This function uses the secure get_public_profile database function that excludes sensitive data
 */
export const getPublicProfile = async (profileId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_public_profile', {
      _profile_id: profileId
    });

    if (error) {
      console.error('Error fetching public profile:', error);
      return { data: null, error };
    }

    // Return the first result (should be single profile or null)
    return { data: data?.[0] || null, error: null };
  } catch (err) {
    console.error('Public profile fetch error:', err);
    return { data: null, error: err };
  }
};

/**
 * Get multiple public profiles safely
 */
export const getPublicProfiles = async (profileIds: string[]) => {
  try {
    const profiles = await Promise.all(
      profileIds.map(id => getPublicProfile(id))
    );
    
    return {
      data: profiles.map(p => p.data).filter(Boolean),
      error: null
    };
  } catch (err) {
    console.error('Multiple public profiles fetch error:', err);
    return { data: [], error: err };
  }
};

/**
 * Type definition for public profile data (excludes sensitive fields)
 */
export interface PublicProfile {
  id: string;
  public_display_name?: string;
  first_name: string;
  last_name: string;
  user_role: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  organization_id?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  industry?: string;
  website_url?: string;
  sustainability_goals?: string[];
  created_at: string;
  is_public_profile: boolean;
}
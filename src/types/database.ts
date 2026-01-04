/**
 * Centralized database types for the application
 * Re-exports Supabase types and defines common interfaces
 */

// Re-export Supabase types
export type { Database } from '@/integrations/supabase/types';
export type { Json } from '@/integrations/supabase/types';

// User roles - must match the user_role enum in the database
export type UserRole = 'member' | 'expert' | 'sponsor' | 'citizen' | 'creator' | 'business' | 'government' | 'ngo' | 'user';

// App roles - must match the app_role enum in the database
export type AppRole = 'super_admin' | 'admin' | 'business' | 'government' | 'ngo' | 'citizen' | 'project_admin';

// Community stats from RPC function
export interface CommunityStats {
  members: number;
  completions: number;
  points: number;
  activeChallenges: number;
}

// Sponsorship status interface
export interface SponsorshipRecord {
  id: string;
  challenge_id: string;
  sponsor_user_id: string;
  sponsor_organization_id: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  package_type: string;
  region: string;
  tier: string | null;
  credit_cost: number | null;
  amount_paid: number | null;
  project_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Project branding configuration
export interface ProjectBranding {
  logo: string | null;
  primaryColor: string;
}

// Project settings configuration
export interface ProjectSettings {
  allowPublicView: boolean;
  requireApproval: boolean;
}

// Profile interface matching the database
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: UserRole;
  organization?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  public_display_name?: string;
  is_public_profile?: boolean;
  bio?: string;
  location?: string;
  industry?: string;
  website_url?: string;
  sustainability_goals?: string[];
  preferred_language?: string;
  company_size?: string;
  employee_count?: number;
  project_id?: string;
  region?: string;
  city?: string;
  district?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Challenge/Program interface
export interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pointsReward: number;
  durationKey: string;
  imageUrl?: string;
  participants: number;
  participants_preview: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  isContinuous?: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  sponsor?: {
    name: string;
    logo?: string;
    organizationId?: string;
    sponsorUserId?: string;
  };
}

// Stakeholder profile for regional hub
export interface StakeholderProfile {
  id: string;
  name: string;
  type: UserRole;
  organization?: string;
  location?: string;
  region?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  avatar: string;
  sustainabilityGoals: string[];
  impactScore: number;
  isRegistered: boolean;
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Challenge } from '@/data/challenges';
import { useUserLocation, useNearbyStakeholders, NearbyStakeholder } from './useNearbyStakeholders';

export interface StakeholderProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  latitude: number;
  longitude: number;
  description: string;
  sustainabilityGoals: string[];
  avatar: string;
  verified: boolean;
  impactScore: number;
  isRegistered: boolean;
  distanceMeters?: number; // PostGIS calculated distance
}

export interface SponsorInfo {
  id: string;
  userId: string;
  name: string;
  logo: string;
  package: string;
  organizationId?: string;
}

export interface RegionalChallenge extends Omit<Challenge, 'sponsor'> {
  region: string;
  sponsor?: SponsorInfo;
}

export const useRegionalHub = (options?: { usePostGIS?: boolean; radiusMeters?: number }) => {
  const { usePostGIS = false, radiusMeters = 25000 } = options || {};
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentProject, isLoading: projectLoading } = useProject();

  // Get user's location for PostGIS queries
  const { location: userLocation, loading: locationLoading } = useUserLocation();

  // PostGIS-based nearby stakeholders (used when usePostGIS is true and location is available)
  const {
    stakeholders: nearbyStakeholders,
    loading: nearbyLoading,
    formatDistance
  } = useNearbyStakeholders({
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radiusMeters,
    projectId: currentProject?.id,
    enabled: usePostGIS && !!userLocation
  });

  const [viewMode, setViewMode] = useState<'stakeholders' | 'challenges' | 'sponsorship'>('stakeholders');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['citizen', 'business', 'government', 'ngo']);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<StakeholderProfile[]>([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeForSponsorship, setSelectedChallengeForSponsorship] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    userId: string;
  } | null>(null);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Fetch stakeholders
  useEffect(() => {
    if (!currentProject) {
      setStakeholders([]);
      setLoadingStakeholders(false);
      return;
    }

    const fetchStakeholders = async () => {
      setLoadingStakeholders(true);
      try {
        const { data: members, error: membersError } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', currentProject.id);

        if (membersError) throw membersError;

        if (!members || members.length === 0) {
          setStakeholders([]);
          setLoadingStakeholders(false);
          return;
        }

        const memberIds = members.map(m => m.user_id);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds)
          .eq('is_public_profile', true);

        if (profilesError) throw profilesError;

        const { data: activities } = await supabase
          .from('sustainability_activities')
          .select('user_id, points_earned')
          .in('user_id', memberIds)
          .eq('project_id', currentProject.id);

        const impactScores: Record<string, number> = {};
        activities?.forEach(activity => {
          impactScores[activity.user_id] = (impactScores[activity.user_id] || 0) + (activity.points_earned || 0);
        });

        const baseCoords = { lat: 46.9, lng: 17.6 };

        const transformedStakeholders: StakeholderProfile[] = (profiles || []).map((profile, index) => {
          const typeMap: Record<string, StakeholderProfile['type']> = {
            'business': 'business',
            'government': 'government',
            'ngo': 'ngo',
            'citizen': 'citizen'
          };

          const lat = profile.latitude ? Number(profile.latitude) : baseCoords.lat + (index * 0.01);
          const lng = profile.longitude ? Number(profile.longitude) : baseCoords.lng + (index * 0.01);

          return {
            id: profile.id,
            name: profile.public_display_name || `${profile.first_name} ${profile.last_name}`,
            type: typeMap[profile.user_role] || 'citizen',
            organization: profile.organization || undefined,
            location: profile.location || currentProject.region_name,
            region: currentProject.region_name,
            city: profile.city || profile.location || currentProject.region_name,
            latitude: lat,
            longitude: lng,
            description: profile.bio || t('regional.no_description'),
            sustainabilityGoals: profile.sustainability_goals || [],
            avatar: profile.avatar_url || "👤",
            verified: profile.is_public_profile || false,
            impactScore: impactScores[profile.id] || 0,
            isRegistered: true,
          };
        });

        setStakeholders(transformedStakeholders);
      } catch (error) {
        logger.error('Error fetching stakeholders', error, 'RegionalHub');
        toast({
          title: t('common.error'),
          description: t('regional.error_loading_stakeholders'),
          variant: 'destructive',
        });
        setStakeholders([]);
      } finally {
        setLoadingStakeholders(false);
      }
    };

    fetchStakeholders();
  }, [currentProject, t, toast]);

  // Fetch challenges
  useEffect(() => {
    if (!currentProject) {
      setChallenges([]);
      return;
    }

    const fetchChallenges = async () => {
      const { data, error } = await supabase
        .from('challenge_definitions')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        const transformedChallenges: Challenge[] = data.map(ch => ({
          id: ch.id,
          titleKey: ch.title,
          descriptionKey: ch.description,
          longDescriptionKey: ch.description,
          category: (ch.category || 'community') as Challenge['category'],
          difficulty: (ch.difficulty || 'beginner') as Challenge['difficulty'],
          durationKey: ch.duration_days ? `${ch.duration_days} days` : 'ongoing',
          pointsReward: ch.points_base || 0,
          participants: 0,
          completionRate: 0,
          stepsKeys: [],
          tipsKeys: [],
          participants_preview: [],
          isContinuous: ch.is_continuous,
          startDate: ch.start_date || undefined,
          endDate: ch.end_date || undefined,
          location: ch.location || undefined,
          imageUrl: ch.image_url || undefined,
        }));
        setChallenges(transformedChallenges);
      }
    };

    fetchChallenges();
  }, [currentProject]);

  // Fetch sponsorships
  useEffect(() => {
    if (!currentProject) return;

    const fetchSponsorships = async () => {
      const { data, error } = await supabase
        .from('challenge_sponsorships')
        .select(`
          *,
          profiles!challenge_sponsorships_sponsor_user_id_fkey(
            first_name,
            last_name,
            public_display_name,
            avatar_url,
            organization
          ),
          organizations(
            name,
            logo_url
          )
        `)
        .eq('region', currentProject.region_name)
        .eq('project_id', currentProject.id)
        .eq('status', 'active');

      if (!error && data) {
        setSponsorships(data);
      }
    };

    fetchSponsorships();
  }, [currentProject]);

  // Generate regional challenges with sponsorship data
  const getRegionalChallenges = (): RegionalChallenge[] => {
    if (!currentProject) return [];
    
    return challenges.slice(0, 6).map(challenge => {
      const sponsorship = sponsorships.find(s => s.challenge_id === challenge.id);

      let sponsor: SponsorInfo | undefined;
      
      if (sponsorship) {
        const profile = sponsorship.profiles;
        const org = sponsorship.organizations;
        
        sponsor = {
          id: sponsorship.id,
          userId: sponsorship.sponsor_user_id,
          name: org?.name || profile?.organization || profile?.public_display_name || 
                `${profile?.first_name} ${profile?.last_name}`,
          logo: org?.logo_url || profile?.avatar_url || "🏢",
          package: sponsorship.package_type,
          organizationId: sponsorship.sponsor_organization_id
        };
      }

      return {
        ...challenge,
        sponsor,
        region: currentProject.region_name,
      };
    });
  };

  // Convert PostGIS nearby results to StakeholderProfile format
  const convertNearbyToProfiles = useCallback((nearby: NearbyStakeholder[]): StakeholderProfile[] => {
    return nearby.map((s, index) => ({
      id: s.id,
      name: s.name,
      type: s.user_role as StakeholderProfile['type'],
      organization: s.organization || undefined,
      location: s.location || currentProject?.region_name || '',
      region: currentProject?.region_name || '',
      city: s.location || currentProject?.region_name || '',
      latitude: 0, // Not needed when using PostGIS - distance is pre-calculated
      longitude: 0,
      description: s.bio || t('regional.no_description'),
      sustainabilityGoals: [],
      avatar: s.avatar_url || "👤",
      verified: true,
      impactScore: 0,
      isRegistered: true,
      distanceMeters: s.distance_meters // Extra field for display
    }));
  }, [currentProject, t]);

  // Use PostGIS results when available, otherwise fall back to regular stakeholders
  const effectiveStakeholders = usePostGIS && userLocation && nearbyStakeholders.length > 0
    ? convertNearbyToProfiles(nearbyStakeholders)
    : stakeholders;

  // Filter profiles
  let filteredProfiles = effectiveStakeholders.filter(p => selectedTypes.includes(p.type));
  
  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return {
    // State
    viewMode,
    selectedTypes,
    searchQuery,
    stakeholders: effectiveStakeholders,
    loadingStakeholders: usePostGIS ? (locationLoading || nearbyLoading) : loadingStakeholders,
    challenges,
    sponsorships,
    selectedChallengeForSponsorship,
    contactModalOpen,
    selectedContact,
    currentProject,
    projectLoading,
    user,
    filteredProfiles,
    regionalChallenges: getRegionalChallenges(),

    // PostGIS specific
    userLocation,
    isUsingPostGIS: usePostGIS && !!userLocation,
    formatDistance,

    // Setters
    setViewMode,
    setSearchQuery,
    setSelectedChallengeForSponsorship,
    setContactModalOpen,
    setSelectedContact,

    // Actions
    handleTypeToggle,
    navigate,
    toast,
  };
};

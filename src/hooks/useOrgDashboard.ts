import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface Challenge {
  id: string;
  title: string;
  type: 'sponsored' | 'created' | 'team_joined';
  participants: number;
  co2_saved: number;
  status: 'active' | 'completed';
  progress: number;
}

export interface Partnership {
  id: string;
  name: string;
  type: 'ngo' | 'government' | 'business';
  projects: number;
  impact_score: number;
}

export interface ImpactStory {
  id: string;
  type: 'participant' | 'milestone' | 'partnership';
  userName?: string;
  userAvatar?: string;
  challengeTitle: string;
  story: string;
  impact: {
    co2_saved?: number;
    participants?: number;
    achievement?: string;
  };
  date: string;
}

export interface OrgMetrics {
  totalParticipants: number;
  activeSponsorships: number;
  totalCompletions: number;
  loading: boolean;
}

export interface RoleInfo {
  title: string;
  subtitle: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const useOrgDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [mobilizeModalOpen, setMobilizeModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [sponsorshipRefreshKey, setSponsorshipRefreshKey] = useState(0);

  const [challenges] = useState<Challenge[]>([]);
  const [partnerships] = useState<Partnership[]>([]);
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  
  const [metrics, setMetrics] = useState<OrgMetrics>({
    totalParticipants: 0,
    activeSponsorships: 0,
    totalCompletions: 0,
    loading: true
  });

  const handleSponsorshipSuccess = useCallback(() => {
    setSponsorshipRefreshKey(prev => prev + 1);
    setMetrics(prev => ({ ...prev, loading: true }));
  }, []);

  // Load real impact stories from sponsored challenges
  useEffect(() => {
    const loadImpactStories = async () => {
      if (!user || !profile?.organization_id) {
        setLoadingStories(false);
        return;
      }

      try {
        setLoadingStories(true);

        const { data: sponsorships, error: sponsorshipsError } = await supabase
          .from('challenge_sponsorships')
          .select('challenge_id, created_at')
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        if (sponsorshipsError) throw sponsorshipsError;

        if (!sponsorships || sponsorships.length === 0) {
          setImpactStories([]);
          setLoadingStories(false);
          return;
        }

        const challengeIds = sponsorships.map(s => s.challenge_id);

        const { data: completions, error: completionsError } = await supabase
          .from('challenge_completions')
          .select('id, challenge_id, user_id, completion_date, notes, impact_data')
          .in('challenge_id', challengeIds)
          .eq('validation_status', 'approved')
          .order('completion_date', { ascending: false })
          .limit(10);

        if (completionsError) throw completionsError;

        const userIds = [...new Set(completions?.map(c => c.user_id) || [])];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const stories: ImpactStory[] = (completions || []).map(completion => {
          const userProfile = profileMap.get(completion.user_id);
          
          const impactData = completion.impact_data as Record<string, unknown> || {};
          const userName = userProfile 
            ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
            : 'Névtelen Felhasználó';

          const challenge = challenges.find(c => c.id === completion.challenge_id);
          const challengeTitle = challenge?.title || completion.challenge_id;

          return {
            id: completion.id,
            type: 'participant' as const,
            userName,
            userAvatar: userProfile?.avatar_url || undefined,
            challengeTitle,
            story: completion.notes || `Sikeresen teljesítette a(z) ${challengeTitle} kihívást!`,
            impact: {
              co2_saved: (impactData.co2_saved as number) || 0,
              participants: 1
            },
            date: completion.completion_date
          };
        });

        setImpactStories(stories);
      } catch (error) {
        logger.error('Error loading impact stories', error, 'OrgDashboard');
        setImpactStories([]);
      } finally {
        setLoadingStories(false);
      }
    };

    loadImpactStories();
  }, [user, profile?.organization_id, challenges]);
  
  // Load real metrics from database
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user || !profile?.organization_id) {
        setMetrics(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { count: sponsorshipsCount, error: sponsorshipsError } = await supabase
          .from('challenge_sponsorships')
          .select('*', { count: 'exact', head: true })
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        if (sponsorshipsError) throw sponsorshipsError;

        const { data: sponsorships } = await supabase
          .from('challenge_sponsorships')
          .select('challenge_id')
          .eq('sponsor_organization_id', profile.organization_id)
          .eq('status', 'active');

        const challengeIds = sponsorships?.map(s => s.challenge_id) || [];

        let totalParticipants = 0;
        let totalCompletions = 0;

        if (challengeIds.length > 0) {
          const { data: participants, error: participantsError } = await supabase
            .from('challenge_completions')
            .select('user_id')
            .in('challenge_id', challengeIds)
            .eq('validation_status', 'approved');

          if (!participantsError && participants) {
            const uniqueParticipants = new Set(participants.map(p => p.user_id));
            totalParticipants = uniqueParticipants.size;
          }

          const { count: completionsCount, error: completionsError } = await supabase
            .from('challenge_completions')
            .select('*', { count: 'exact', head: true })
            .in('challenge_id', challengeIds)
            .eq('validation_status', 'approved');

          if (!completionsError) {
            totalCompletions = completionsCount || 0;
          }
        }

        setMetrics({
          totalParticipants,
          activeSponsorships: sponsorshipsCount || 0,
          totalCompletions,
          loading: false
        });
      } catch (error) {
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    loadMetrics();
  }, [user, profile?.organization_id]);

  // Redirect if not authenticated or not an organization
  useEffect(() => {
    if (!authLoading && (!user || profile?.user_role === "citizen")) {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading, navigate]);

  // Auto-create organization if user has org name but no org ID
  useEffect(() => {
    const createOrganization = async () => {
      if (!profile || profile.user_role === "citizen" || creatingOrg) return;
      if (profile.organization_id || !profile.organization) return;

      try {
        setCreatingOrg(true);

        // Map user_role to organization type
        const orgType = ['sponsor', 'business'].includes(profile.user_role) ? 'business' as const :
                        profile.user_role === 'government' ? 'government' as const :
                        profile.user_role === 'ngo' ? 'ngo' as const : 'business' as const;

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: profile.organization!,
            type: orgType,
            is_public: true,
          })
          .select()
          .single();

        if (orgError) return;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: orgData.id })
          .eq('id', profile.id);

        if (profileError) return;

        window.location.reload();
      } catch (error) {
        // Silent fail
      } finally {
        setCreatingOrg(false);
      }
    };

    createOrganization();
  }, [profile, creatingOrg]);

  return {
    // Auth
    user,
    profile,
    authLoading,
    t,
    
    // State
    selectedTab,
    setSelectedTab,
    mobilizeModalOpen,
    setMobilizeModalOpen,
    sponsorModalOpen,
    setSponsorModalOpen,
    sponsorshipRefreshKey,
    
    // Data
    challenges,
    partnerships,
    impactStories,
    loadingStories,
    metrics,
    
    // Handlers
    handleSponsorshipSuccess,
  };
};

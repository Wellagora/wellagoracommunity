import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";

export interface StakeholderProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  bio: string;
  sustainability_goals: string[];
  avatar: string;
  impactScore: number;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  category: string;
  posts: number;
  members: number;
  color: string;
  recentPosts: never[];
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  organizer: string;
}

export const useCommunityHub = () => {
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const [stakeholders, setStakeholders] = useState<StakeholderProfile[]>([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setStakeholders([]);
      setLoadingStakeholders(false);
      return;
    }

    const fetchStakeholders = async () => {
      setLoadingStakeholders(true);
      try {
        const { data: members } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', currentProject.id);

        if (!members || members.length === 0) {
          setStakeholders([]);
          setLoadingStakeholders(false);
          return;
        }

        const memberIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds)
          .eq('is_public_profile', true);

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
            district: profile.district || profile.city,
            latitude: lat,
            longitude: lng,
            bio: profile.bio || t('regional.no_description'),
            sustainability_goals: profile.sustainability_goals || [],
            avatar: profile.avatar_url || "👤",
            impactScore: impactScores[profile.id] || 0,
          };
        });

        setStakeholders(transformedStakeholders);
      } catch (error) {
        setStakeholders([]);
      } finally {
        setLoadingStakeholders(false);
      }
    };

    fetchStakeholders();
  }, [currentProject, t]);

  const forums: Forum[] = [
    {
      id: "general",
      name: t('community.forums.general.name'),
      description: t('community.forums.general.description'),
      category: "General",
      posts: 1247,
      members: 856,
      color: "bg-primary",
      recentPosts: []
    }
  ];

  const upcomingEvents: CommunityEvent[] = [
    {
      id: "1",
      title: t('community.events.tree_planting.title'),
      date: "March 15, 2024",
      time: "9:00 AM",
      location: t('community.events.tree_planting.location'),
      attendees: 67,
      organizer: t('community.events.tree_planting.organizer')
    }
  ];

  return {
    stakeholders,
    loadingStakeholders,
    forums,
    upcomingEvents,
    currentProject
  };
};

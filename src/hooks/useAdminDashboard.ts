import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PendingChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_base: number;
  base_impact: {
    co2_saved: number;
    description: string;
  };
  validation_requirements: {
    type: string;
    description: string;
    steps: string[];
    tips: string[];
  };
  created_at: string;
  location?: string;
  translations?: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  region_name: string;
  villages: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminStats {
  totalChallenges: number;
  activeChallenges: number;
  pendingReview: number;
  totalParticipants: number;
}

export const useAdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [draftChallenges, setDraftChallenges] = useState<PendingChallenge[]>([]);
  const [activePrograms, setActivePrograms] = useState<PendingChallenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalChallenges: 0,
    activeChallenges: 0,
    pendingReview: 0,
    totalParticipants: 0
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-admin-access');

        if (error || !data?.hasAccess) {
          toast({
            title: 'Hozzáférés megtagadva',
            description: 'Csak adminisztrátorok érhetik el ezt az oldalt.',
            variant: 'destructive'
          });
          navigate('/dashboard');
        } else {
          setHasAdminAccess(true);
        }
      } catch {
        toast({
          title: 'Hiba',
          description: 'Hiba történt az adminisztrátori jogosultságok ellenőrzése során.',
          variant: 'destructive'
        });
        navigate('/dashboard');
      }
    };

    checkAccess();
  }, [user, navigate, toast]);

  const loadData = useCallback(async (forceProjectId?: string) => {
    try {
      setLoading(true);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, slug, region_name, villages, description, is_active, created_at')
        .order('created_at', { ascending: false });

      if (projectsData) {
        setProjects(projectsData as Project[]);
      }

      // Load default project setting
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_project')
        .maybeSingle();

      let currentDefaultProjectId: string | null = null;
      if (settingsData && settingsData.value) {
        const valueData = settingsData.value as { project_id: string };
        currentDefaultProjectId = valueData.project_id;
        setDefaultProjectId(currentDefaultProjectId);
      }

      // Load draft challenges
      let draftsCount = 0;
      let pendingCount = 0;
      
      if (currentDefaultProjectId) {
        const draftResult = await supabase
          .from('challenge_definitions')
          .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at, translations')
          .eq('is_active', false)
          .eq('project_id', currentDefaultProjectId)
          .order('created_at', { ascending: false });

        if (draftResult.data) {
          setDraftChallenges(draftResult.data as unknown as PendingChallenge[]);
          draftsCount = draftResult.data.length;
        }
      }

      // Load pending challenges (no project)
      const pendingResult = await supabase
        .from('challenge_definitions')
        .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at, translations')
        .eq('is_active', false)
        .is('project_id', null)
        .order('created_at', { ascending: false });

      if (pendingResult.data) {
        setPendingChallenges(pendingResult.data as unknown as PendingChallenge[]);
        pendingCount = pendingResult.data.length;
      }

      // Load stats
      const { count: totalCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('challenge_definitions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: participantsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Load active programs
      const projectToLoad = forceProjectId || selectedProject?.id || currentDefaultProjectId;
      if (projectToLoad) {
        const activeProgramsResult = await supabase
          .from('challenge_definitions')
          .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at, location, project_id, translations')
          .eq('is_active', true)
          .eq('project_id', projectToLoad)
          .order('created_at', { ascending: false });

        if (activeProgramsResult.data) {
          setActivePrograms(activeProgramsResult.data as unknown as PendingChallenge[]);
        }

        // Reload drafts for selected project
        const draftsResult = await supabase
          .from('challenge_definitions')
          .select('id, title, description, category, difficulty, duration_days, points_base, base_impact, validation_requirements, created_at, translations')
          .eq('is_active', false)
          .eq('project_id', projectToLoad)
          .order('created_at', { ascending: false });

        if (draftsResult.data) {
          setDraftChallenges(draftsResult.data as unknown as PendingChallenge[]);
          draftsCount = draftsResult.data.length;
        }
      }

      setStats({
        totalChallenges: totalCount || 0,
        activeChallenges: activeCount || 0,
        pendingReview: pendingCount + draftsCount,
        totalParticipants: participantsCount || 0
      });

    } catch {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni az adatokat',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedProject?.id, toast]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadData(selectedProject.id);
    }
  }, [selectedProject]);

  const approveChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .update({ is_active: true })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás jóváhagyva',
        description: 'A kihívás mostantól elérhető a felhasználók számára',
      });

      loadData();
    } catch {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a kihívást',
        variant: 'destructive'
      });
    }
  };

  const rejectChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_definitions')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: 'Kihívás elutasítva',
        description: 'A kihívás törölve lett',
      });

      loadData();
    } catch {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a kihívást',
        variant: 'destructive'
      });
    }
  };

  const toggleProjectStatus = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: !currentStatus })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Projekt frissítve',
        description: 'A projekt státusza megváltozott',
      });

      loadData();
    } catch {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült frissíteni a projektet',
        variant: 'destructive'
      });
    }
  };

  const setDefaultProjectHandler = async (projectId: string) => {
    try {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'default_project')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: { project_id: projectId } })
          .eq('key', 'default_project');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key: 'default_project',
            value: { project_id: projectId }
          });

        if (error) throw error;
      }

      setDefaultProjectId(projectId);
      toast({
        title: 'Alapértelmezett projekt beállítva',
        description: 'Az új felhasználók automatikusan ehhez a projekthez kerülnek',
      });
    } catch {
      toast({
        title: 'Hiba',
        description: 'Nem sikerült beállítani az alapértelmezett projektet',
        variant: 'destructive'
      });
    }
  };

  const translateAllPrograms = async () => {
    setIsTranslating(true);
    try {
      const { data: programs, error: fetchError } = await supabase
        .from('challenge_definitions')
        .select('*')
        .or('translations.is.null,translations.eq.{}');

      if (fetchError) throw fetchError;

      if (!programs || programs.length === 0) {
        toast({
          title: "Nincs fordítandó program",
          description: "Minden program már le van fordítva.",
        });
        setIsTranslating(false);
        return;
      }

      toast({
        title: "Fordítás elkezdve",
        description: `${programs.length} program fordítása folyamatban...`,
      });

      let successCount = 0;
      let errorCount = 0;

      for (const program of programs) {
        try {
          const { data: translationData, error: translationError } = await supabase.functions
            .invoke('translate-challenge', {
              body: { 
                title: program.title,
                description: program.description
              }
            });

          if (translationError) {
            errorCount++;
            continue;
          }

          const translations = translationData?.translations || {};

          const { error: updateError } = await supabase
            .from('challenge_definitions')
            .update({ translations })
            .eq('id', program.id);

          if (updateError) {
            errorCount++;
          } else {
            successCount++;
          }
        } catch {
          errorCount++;
        }
      }

      toast({
        title: "Fordítás befejezve",
        description: `${successCount} program sikeresen lefordítva${errorCount > 0 ? `, ${errorCount} hiba történt` : ''}.`,
      });

      loadData();
    } catch {
      toast({
        title: "Hiba",
        description: "A fordítás során hiba történt.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    // State
    pendingChallenges,
    draftChallenges,
    activePrograms,
    projects,
    loading,
    hasAdminAccess,
    defaultProjectId,
    selectedProject,
    stats,
    isTranslating,
    
    // Setters
    setSelectedProject,
    
    // Actions
    loadData,
    approveChallenge,
    rejectChallenge,
    toggleProjectStatus,
    setDefaultProject: setDefaultProjectHandler,
    translateAllPrograms,
  };
};

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ChallengeDetail from "@/components/challenges/ChallengeDetail";
import RelatedEvents from "@/components/challenges/RelatedEvents";
import Navigation from "@/components/Navigation";
import { Challenge } from "@/data/challenges";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [userProgress, setUserProgress] = useState({
    isParticipating: false,
    isCompleted: false,
    progress: 0,
    completedSteps: [] as number[]
  });

  // Fetch challenge from database
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('challenge_definitions')
        .select('*')
        .eq('id', challengeId)
        .maybeSingle();

      if (!error && data) {
        // Transform database record to Challenge format
        const transformedChallenge: Challenge = {
          id: data.id,
          titleKey: data.title, // Use title directly as titleKey since ChallengeDetail translates it
          descriptionKey: data.description,
          longDescriptionKey: data.description,
          category: (data.category || 'community') as Challenge['category'],
          difficulty: (data.difficulty || 'beginner') as Challenge['difficulty'],
          durationKey: data.duration_days 
            ? `${data.duration_days} ${data.duration_days === 1 ? t('challenges.day') : t('challenges.days')}` 
            : t('challenges.duration.ongoing'),
          pointsReward: data.points_base || 0,
          participants: 0,
          completionRate: 0,
          stepsKeys: [],
          tipsKeys: [],
          participants_preview: [],
          isContinuous: data.is_continuous ?? true,
          startDate: data.start_date || undefined,
          endDate: data.end_date || undefined,
          location: data.location || undefined,
          imageUrl: data.image_url || undefined,
        };
        setChallenge(transformedChallenge);
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [challengeId, t]);

  // Load user progress
  useEffect(() => {
    if (user && challengeId) {
      loadUserProgress();
    }
  }, [user, challengeId]);

  const loadUserProgress = async () => {
    if (!user || !challengeId) return;

    try {
      const { data, error } = await supabase
        .from("challenge_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const evidenceData = data.evidence_data as { completed_steps?: number[]; progress?: number } | null;
        const completedSteps = evidenceData?.completed_steps || [];
        const progress = evidenceData?.progress || (data.validation_status === "approved" ? 100 : 0);
        
        setUserProgress({
          isParticipating: true,
          isCompleted: data.validation_status === "approved",
          progress,
          completedSteps
        });
      }
    } catch (error) {
      // Silent fail - UI handles no progress state
    }
  };

  const handleStepComplete = (stepIndex: number, completedSteps: number[]) => {
    const totalSteps = challenge?.stepsKeys?.length || 1;
    const newProgress = Math.round((completedSteps.length / totalSteps) * 100);
    const allCompleted = completedSteps.length === totalSteps;
    
    setUserProgress(prev => ({
      ...prev,
      completedSteps,
      progress: newProgress,
      isCompleted: allCompleted
    }));
  };

  const handleGoBack = () => {
    navigate('/challenges');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('challenges.not_found')}</h1>
            <p className="text-muted-foreground mb-4">{t('challenges.not_found_desc')}</p>
            <Button onClick={() => navigate("/challenges")}>{t('challenges.back_to_challenges')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: t('challenges.login_required'),
        description: t('challenges.login_required_desc'),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      // Check if already participating
      const { data: existingRecord } = await supabase
        .from("challenge_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (existingRecord) {
        // Already participating, just update local state
        setUserProgress(prev => ({ ...prev, isParticipating: true }));
        toast({
          title: t('challenges.already_joined'),
          description: t('challenges.already_joined_desc'),
        });
        return;
      }

      // Get user's profile data for organization_id
      const { data: profileData } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      // Insert participation record into challenge_completions
      const { error } = await supabase.from("challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        project_id: currentProject?.id || null,
        organization_id: profileData?.organization_id || null,
        completion_type: "manual",
        validation_status: "pending",
        impact_data: {},
        evidence_data: { completed_steps: [], progress: 0 },
        points_earned: 0,
      });

      if (error) {
        console.error('Failed to join challenge:', error);
        throw error;
      }

      // Update local state on success
      setUserProgress(prev => ({ ...prev, isParticipating: true }));
      
      toast({
        title: t('challenges.joined_success'),
        description: t('challenges.joined_success_desc'),
      });
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('challenges.join_failed'),
        variant: "destructive",
      });
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: t('challenges.login_required'),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        project_id: currentProject?.id || null,
        organization_id: profileData?.organization_id || null,
        completion_type: "manual",
        validation_status: "pending",
        impact_data: {},
        points_earned: challenge?.pointsReward || 0,
      });

      if (error) throw error;

      toast({
        title: t('challenges.congratulations'),
        description: t('challenges.completed_pending'),
      });

      loadUserProgress();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 xl:py-12">
        <div className="mb-4 sm:mb-6 xl:mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="hover:bg-muted text-sm sm:text-base xl:text-lg"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 mr-2" />
            {t('challenges.back_to_challenges')}
          </Button>
        </div>

        <ChallengeDetail
          challenge={challenge}
          userProgress={userProgress}
          onJoin={handleJoinChallenge}
          onComplete={handleCompleteChallenge}
          onStepComplete={handleStepComplete}
        />

        {/* Related Events Section */}
        {challengeId && (
          <div className="mt-8">
            <RelatedEvents programId={challengeId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
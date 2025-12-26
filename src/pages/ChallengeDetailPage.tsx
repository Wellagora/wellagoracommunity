import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChallengeDetail from "@/components/challenges/ChallengeDetail";
import Navigation from "@/components/Navigation";
import { getChallengeById, challenges } from "@/data/challenges";
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
  
  // Get challenge data by ID
  const challenge = challengeId ? getChallengeById(challengeId) : null;
  
  // Mock user progress - will be fetched from Supabase
  const [userProgress, setUserProgress] = useState({
    isParticipating: false,
    isCompleted: false,
    progress: 0,
    completedSteps: [] as number[]
  });

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
        // Parse completed steps from evidence_data
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
      console.error("Error loading progress:", error);
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

    setUserProgress(prev => ({ ...prev, isParticipating: true }));
    
    toast({
      title: t('challenges.joined_success'),
      description: t('challenges.joined_success_desc'),
    });
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
      // Get user's profile to link to organization
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

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 xl:py-12">
        {/* Back Button */}
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
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
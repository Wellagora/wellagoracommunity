import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChallengeDetail from "@/components/challenges/ChallengeDetail";
import Navigation from "@/components/Navigation";
import { getChallengeById, challenges } from "@/data/challenges";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
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
        setUserProgress({
          isParticipating: true,
          isCompleted: data.validation_status === "approved",
          progress: 100,
          completedSteps: []
        });
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
            <p className="text-muted-foreground mb-4">This challenge does not exist</p>
            <Button onClick={() => navigate("/challenges")}>Back to Challenges</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Bejelentkezés szükséges",
        description: "Jelentkezz be a challenge-hez való csatlakozáshoz!",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUserProgress(prev => ({ ...prev, isParticipating: true }));
    
    toast({
      title: "Csatlakoztál!",
      description: "Sikeresen csatlakoztál a challenge-hez!",
    });
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Bejelentkezés szükséges",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase.from("challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        project_id: currentProject?.id || null,
        completion_type: "manual",
        validation_status: "pending",
        impact_data: challenge?.impact || {},
        points_earned: challenge?.pointsReward || 0,
      });

      if (error) throw error;

      toast({
        title: "Gratulálunk!",
        description: "Challenge teljesítve! Jóváhagyásra vár.",
      });

      loadUserProgress();
    } catch (error: any) {
      toast({
        title: "Hiba",
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
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="hover:bg-muted text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>

        <ChallengeDetail
          challenge={challenge}
          userProgress={userProgress}
          onJoin={handleJoinChallenge}
          onComplete={handleCompleteChallenge}
        />
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
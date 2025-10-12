import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChallengeDetail from "@/components/challenges/ChallengeDetail";
import Navigation from "@/components/Navigation";
import { getChallengeById } from "@/data/challenges";

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  
  // Get challenge data by ID
  const challenge = challengeId ? getChallengeById(challengeId) : null;
  
  // Mock user progress - will be fetched from Supabase
  const [userProgress] = useState({
    isParticipating: true,
    isCompleted: false,
    progress: 65,
    completedSteps: [0, 1, 2, 3]
  });

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Kihívás nem található</h1>
            <p className="text-muted-foreground mb-4">A keresett kihívás nem létezik.</p>
            <Button onClick={() => navigate("/")}>Vissza a főoldalra</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinChallenge = (challengeId: string) => {
    // TODO: Implement with Supabase
    console.log("Joining challenge:", challengeId);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    // TODO: Implement with Supabase
    console.log("Completing challenge:", challengeId);
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
            Vissza a kihívásokhoz
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
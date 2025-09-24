import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChallengeDetail from "@/components/challenges/ChallengeDetail";
import Navigation from "@/components/Navigation";

// Mock data - will be replaced with real data from Supabase
const mockChallenge = {
  id: "1",
  title: "30-Day Plastic-Free Challenge",
  description: "Reduce single-use plastics in your daily life",
  longDescription: "Join thousands of people in reducing plastic waste by eliminating single-use plastics from your daily routine. This challenge will help you develop sustainable habits while making a real environmental impact.",
  category: "waste" as const,
  difficulty: "intermediate" as const,
  duration: "30 days",
  pointsReward: 500,
  participants: 1247,
  completionRate: 78,
  sponsor: {
    name: "EcoTech Solutions",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
  },
  steps: [
    "Assess your current plastic usage for 3 days",
    "Replace single-use water bottles with a reusable one",
    "Bring reusable bags for grocery shopping",
    "Choose products with minimal packaging",
    "Find plastic-free alternatives for personal care items",
    "Share your progress and inspire others",
    "Reflect on your journey and plan for the future"
  ],
  tips: [
    "Start small - focus on one item at a time",
    "Keep reusable items visible as reminders",
    "Find a plastic-free buddy for accountability",
    "Research local stores with bulk buying options",
    "Document your journey with photos"
  ],
  impact: {
    co2Saved: 15.5,
    treesEquivalent: 2
  },
  participants_preview: [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: "2", 
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ]
};

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  
  // Mock user progress - will be fetched from Supabase
  const [userProgress] = useState({
    isParticipating: true,
    isCompleted: false,
    progress: 65,
    completedSteps: [0, 1, 2, 3]
  });

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>

        <ChallengeDetail
          challenge={mockChallenge}
          userProgress={userProgress}
          onJoin={handleJoinChallenge}
          onComplete={handleCompleteChallenge}
        />
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
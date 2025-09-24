import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Target, 
  CheckCircle,
  Star,
  Share2,
  BookOpen,
  Leaf,
  Zap,
  Recycle,
  Heart
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: "energy" | "transport" | "food" | "waste" | "community";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  sponsor?: {
    name: string;
    logo: string;
  };
  steps: string[];
  tips: string[];
  impact: {
    co2Saved: number;
    treesEquivalent: number;
  };
  participants_preview: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

interface ChallengeDetailProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
  userProgress?: {
    isParticipating: boolean;
    isCompleted: boolean;
    progress: number;
    completedSteps: number[];
  };
}

const categoryConfig = {
  energy: { icon: Zap, color: "bg-gradient-sunset", label: "Energy" },
  transport: { icon: Target, color: "bg-gradient-ocean", label: "Transport" },
  food: { icon: Leaf, color: "bg-gradient-nature", label: "Food" },
  waste: { icon: Recycle, color: "bg-gradient-earth", label: "Waste" },
  community: { icon: Heart, color: "bg-gradient-primary", label: "Community" }
};

const difficultyConfig = {
  beginner: { color: "bg-success", label: "Beginner" },
  intermediate: { color: "bg-warning", label: "Intermediate" },
  advanced: { color: "bg-accent", label: "Advanced" },
  expert: { color: "bg-destructive", label: "Expert" }
};

const ChallengeDetail = ({ challenge, onJoin, onComplete, userProgress }: ChallengeDetailProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const { toast } = useToast();
  
  const CategoryIcon = categoryConfig[challenge.category].icon;
  
  const handleJoinChallenge = () => {
    onJoin?.(challenge.id);
    toast({
      title: "Challenge Joined!",
      description: `You've successfully joined "${challenge.title}". Good luck!`,
    });
  };

  const handleCompleteStep = (stepIndex: number) => {
    // TODO: Implement step completion logic
    toast({
      title: "Step Completed!",
      description: `Great progress on "${challenge.title}"!`,
    });
  };

  const handleCompleteChallenge = () => {
    onComplete?.(challenge.id);
    toast({
      title: "Challenge Completed! 🎉",
      description: `You earned ${challenge.pointsReward} points for completing "${challenge.title}"!`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: challenge.title,
        text: challenge.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Challenge link copied to clipboard",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${categoryConfig[challenge.category].color}`}>
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <Badge variant="secondary" className={difficultyConfig[challenge.difficulty].color}>
                  {difficultyConfig[challenge.difficulty].label}
                </Badge>
                {challenge.sponsor && (
                  <Badge variant="outline">Sponsored</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription className="text-base">
                {challenge.description}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Challenge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{challenge.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{challenge.pointsReward} points</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{challenge.participants} participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{challenge.completionRate}% completion</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4">{challenge.longDescription}</p>
          
          {/* Environmental Impact */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2 text-success">Environmental Impact</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">CO₂ Saved:</span>
                <span className="font-medium ml-2">{challenge.impact.co2Saved}kg</span>
              </div>
              <div>
                <span className="text-muted-foreground">Trees Equivalent:</span>
                <span className="font-medium ml-2">{challenge.impact.treesEquivalent}</span>
              </div>
            </div>
          </div>

          {/* Sponsor */}
          {challenge.sponsor && (
            <div className="flex items-center space-x-3 bg-card border rounded-lg p-3 mb-4">
              <img 
                src={challenge.sponsor.logo} 
                alt={challenge.sponsor.name}
                className="w-8 h-8 rounded"
              />
              <div>
                <p className="text-sm font-medium">Sponsored by</p>
                <p className="text-sm text-muted-foreground">{challenge.sponsor.name}</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {!userProgress?.isParticipating ? (
            <Button 
              onClick={handleJoinChallenge}
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              Join Challenge
            </Button>
          ) : userProgress.isCompleted ? (
            <div className="w-full">
              <Badge variant="default" className="w-full justify-center py-2 bg-success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Challenge Completed!
              </Badge>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{userProgress.progress}%</span>
              </div>
              <Progress value={userProgress.progress} className="w-full" />
              {userProgress.progress === 100 && (
                <Button 
                  onClick={handleCompleteChallenge}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  Complete Challenge
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Challenge Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenge.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    userProgress?.completedSteps.includes(index) 
                      ? 'bg-success text-success-foreground' 
                      : userProgress?.isParticipating 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {userProgress?.completedSteps.includes(index) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`${
                      userProgress?.completedSteps.includes(index) 
                        ? 'line-through text-muted-foreground' 
                        : ''
                    }`}>
                      {step}
                    </p>
                    {userProgress?.isParticipating && !userProgress?.completedSteps.includes(index) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleCompleteStep(index)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {challenge.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Participants Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Participants</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challenge.participants_preview.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{participant.name}</span>
                  </div>
                ))}
                {challenge.participants > challenge.participants_preview.length && (
                  <p className="text-sm text-muted-foreground">
                    +{challenge.participants - challenge.participants_preview.length} more participants
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
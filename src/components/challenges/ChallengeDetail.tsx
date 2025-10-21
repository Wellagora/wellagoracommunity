import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Heart,
  Lightbulb,
  Droplets,
  Bird,
  ArrowDownUp,
  TrendingUp
} from "lucide-react";

interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  category: "energy" | "transport" | "food" | "waste" | "community" | "innovation" | "water" | "biodiversity" | "circular-economy" | "green-finance";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  durationKey: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  sponsor?: {
    name: string;
    logo: string;
  };
  stepsKeys: string[];
  tipsKeys: string[];
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
  energy: { icon: Zap, color: "bg-gradient-sunset", label: "Energia" },
  transport: { icon: Target, color: "bg-gradient-ocean", label: "Közlekedés" },
  food: { icon: Leaf, color: "bg-gradient-nature", label: "Étel" },
  waste: { icon: Recycle, color: "bg-gradient-nature", label: "Hulladék" },
  community: { icon: Heart, color: "bg-gradient-primary", label: "Közösség" },
  innovation: { icon: Lightbulb, color: "bg-gradient-sunset", label: "Innováció" },
  water: { icon: Droplets, color: "bg-gradient-ocean", label: "Víz" },
  biodiversity: { icon: Bird, color: "bg-gradient-nature", label: "Biodiverzitás" },
  "circular-economy": { icon: ArrowDownUp, color: "bg-gradient-primary", label: "Körforgásos gazdaság" },
  "green-finance": { icon: TrendingUp, color: "bg-gradient-sunset", label: "Zöld finanszírozás" }
};

const difficultyConfig = {
  beginner: { color: "bg-success", label: "Kezdő" },
  intermediate: { color: "bg-warning", label: "Közepes" },
  advanced: { color: "bg-accent", label: "Haladó" },
  expert: { color: "bg-destructive", label: "Szakértő" }
};

const ChallengeDetail = ({ challenge, onJoin, onComplete, userProgress }: ChallengeDetailProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const CategoryIcon = categoryConfig[challenge.category].icon;
  
  const handleJoinChallenge = () => {
    onJoin?.(challenge.id);
    toast({
      title: t('challenges.join_success'),
      description: t('challenges.join_success_desc'),
    });
  };

  const handleCompleteStep = (stepIndex: number) => {
    // TODO: Implement step completion logic
    toast({
      title: t('challenges.step_completed'),
      description: t('challenges.step_completed_desc'),
    });
  };

  const handleCompleteChallenge = () => {
    onComplete?.(challenge.id);
    toast({
      title: t('challenges.challenge_completed'),
      description: t('challenges.challenge_completed_desc'),
    });
  };

  const handleShare = () => {
    toast({
      title: t('challenges.share'),
      description: t('challenges.share_desc'),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Main Challenge Card */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              {/* Category and badges - mobile friendly */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${categoryConfig[challenge.category].color}`}>
                  <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge 
                  className={`${difficultyConfig[challenge.difficulty].color} text-white text-xs`}
                >
                  {difficultyConfig[challenge.difficulty].label}
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{t(challenge.durationKey)}</span>
                </Badge>
              </div>
              
              <CardTitle className="text-xl sm:text-2xl text-foreground mb-2">
                {t(challenge.titleKey)}
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4 text-sm sm:text-base">
                {t(challenge.descriptionKey)}
              </CardDescription>
              
              {/* Stats - mobile optimized grid */}
              <div className="grid grid-cols-3 sm:flex sm:items-center sm:space-x-6 gap-3 sm:gap-0 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground mb-1 sm:mb-0" />
                  <span className="text-foreground font-medium text-center sm:text-left">
                    {challenge.participants.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
                  <Target className="w-4 h-4 text-success mb-1 sm:mb-0" />
                  <span className="text-foreground font-medium text-center sm:text-left">
                    {challenge.completionRate}%
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
                  <Trophy className="w-4 h-4 text-warning mb-1 sm:mb-0" />
                  <span className="text-foreground font-medium text-center sm:text-left">
                    {challenge.pointsReward}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Points card - responsive */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 p-4 sm:p-0 bg-primary/5 sm:bg-transparent rounded-lg sm:rounded-none">
              <div className="flex items-center sm:flex-col sm:text-right space-x-2 sm:space-x-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {challenge.pointsReward}
                </div>
                <div className="text-xs text-muted-foreground">{t('challenges.points_reward')}</div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="hover:bg-primary/10"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar - full width on mobile */}
          {userProgress?.isParticipating && !userProgress.isCompleted && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{t('challenges.your_progress')}</span>
                <span className="text-sm font-bold text-primary">{userProgress.progress}%</span>
              </div>
              <Progress value={userProgress.progress} className="h-2" />
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">{t('challenges.details')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t(challenge.longDescriptionKey)}
            </p>
          </div>
          
          {/* Environmental Impact - mobile optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center space-x-2 mb-2">
                <Leaf className="w-5 h-5 text-success" />
                <span className="text-sm sm:text-base font-semibold text-success">{t('challenges.co2_savings')}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {challenge.impact.co2Saved} kg
              </div>
              <div className="text-xs text-muted-foreground">
                {t('challenges.per_participant')}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm sm:text-base font-semibold text-primary">{t('challenges.tree_equivalent')}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {challenge.impact.treesEquivalent}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('challenges.tree_equivalent_desc')}
              </div>
            </div>
          </div>
          
          {/* Steps Section - mobile optimized */}
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">{t('challenges.steps_to_complete')}</h3>
            <div className="space-y-2 sm:space-y-3">
              {challenge.stepsKeys.map((stepKey, index) => (
                <div
                  key={stepKey}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                    userProgress?.completedSteps?.includes(index) 
                      ? 'bg-success/10 border-success/20 shadow-sm' 
                      : activeStep === index 
                      ? 'bg-primary/10 border-primary/20 shadow-sm' 
                      : 'bg-muted/30 border-border active:bg-muted/50'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    userProgress?.completedSteps?.includes(index) 
                      ? 'bg-success text-success-foreground' 
                      : activeStep === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {userProgress?.completedSteps?.includes(index) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm sm:text-base">{t(stepKey)}</p>
                    {userProgress?.isParticipating && !userProgress?.completedSteps?.includes(index) && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="mt-2 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteStep(index);
                        }}
                      >
                        {t('challenges.mark_complete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tips Section */}
          {challenge.tipsKeys && challenge.tipsKeys.length > 0 && (
            <div className="mb-6">
              <Button
                onClick={() => setShowTips(!showTips)}
                variant="outline"
                className="w-full justify-between mb-3 hover:bg-primary/10"
              >
                <span className="text-lg font-semibold text-foreground">{t('challenges.useful_tips')}</span>
                <BookOpen className={`w-5 h-5 transition-transform ${showTips ? 'rotate-180' : ''}`} />
              </Button>
              {showTips && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  {challenge.tipsKeys.map((tipKey, index) => (
                    <div key={tipKey} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-accent">{index + 1}</span>
                      </div>
                      <p className="text-foreground text-sm">{t(tipKey)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Sponsor Info */}
          {challenge.sponsor && (
            <div 
              className="p-4 rounded-lg bg-card border border-border cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => {
                const sponsor = challenge.sponsor;
                if (sponsor) {
                  // Navigate based on available IDs
                  window.location.href = `/profile?userId=${sponsor.name}`;
                }
              }}
            >
              <div className="flex items-center space-x-3">
                {typeof challenge.sponsor.logo === 'string' && challenge.sponsor.logo.startsWith('http') ? (
                  <img 
                    src={challenge.sponsor.logo} 
                    alt={challenge.sponsor.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                    {challenge.sponsor.logo}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Szponzor: {challenge.sponsor.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Támogatja ezt a kihívást • Kattints a profilhoz
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-6">
          {/* Action Buttons - mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {!userProgress?.isParticipating ? (
              <Button 
                onClick={handleJoinChallenge}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth h-11 sm:h-10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {t('challenges.join_challenge')}
              </Button>
            ) : userProgress.isCompleted ? (
              <Button 
                disabled
                className="flex-1 bg-success hover:bg-success h-11 sm:h-10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('challenges.challenge_completed_label')}
              </Button>
            ) : (
              <Button 
                onClick={handleCompleteChallenge}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth h-11 sm:h-10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('challenges.complete_challenge')}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="sm:w-auto h-11 sm:h-10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('challenges.share')}
            </Button>
          </div>
          
          {/* Participants Preview */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">{t('challenges.participants_label')}</span>
              <span className="text-xs text-muted-foreground">
                +{(challenge.participants - challenge.participants_preview.length).toLocaleString()} {t('challenges.more')}
              </span>
            </div>
            <div className="flex -space-x-2">
              {challenge.participants_preview.map((participant) => (
                <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChallengeDetail;
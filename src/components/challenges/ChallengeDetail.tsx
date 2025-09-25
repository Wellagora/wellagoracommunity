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
  Heart
} from "lucide-react";

interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  category: "energy" | "transport" | "food" | "waste" | "community" | "innovation" | "water" | "biodiversity" | "circular-economy" | "green-finance";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  duration: string;
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
  community: { icon: Heart, color: "bg-gradient-primary", label: "Közösség" }
};

const difficultyConfig = {
  beginner: { color: "bg-success", label: "Kezdő" },
  intermediate: { color: "bg-warning", label: "Közepes" },
  advanced: { color: "bg-accent", label: "Haladó" },
  expert: { color: "bg-destructive", label: "Szakértő" }
};

const ChallengeDetail = ({ challenge, onJoin, onComplete, userProgress }: ChallengeDetailProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const CategoryIcon = categoryConfig[challenge.category].icon;
  
  const handleJoinChallenge = () => {
    onJoin?.(challenge.id);
    toast({
      title: "Csatlakozás sikeres!",
      description: `Sikeresen csatlakoztál a "${t(challenge.titleKey)}" kihíváshoz. Sok szerencsét!`,
    });
  };

  const handleCompleteStep = (stepIndex: number) => {
    // TODO: Implement step completion logic
    toast({
      title: "Lépés teljesítve!",
      description: `Nagyszerű haladás a "${t(challenge.titleKey)}" kihívásban!`,
    });
  };

  const handleCompleteChallenge = () => {
    onComplete?.(challenge.id);
    toast({
      title: "Kihívás teljesítve!",
      description: `Gratulálunk! Teljesítetted a "${t(challenge.titleKey)}" kihívást!`,
    });
  };

  const handleShare = () => {
    toast({
      title: "Megosztás",
      description: `Kihívás megosztva: "${t(challenge.titleKey)}"`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Challenge Card */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${categoryConfig[challenge.category].color}`}>
                  <CategoryIcon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  className={`${difficultyConfig[challenge.difficulty].color} text-white`}
                >
                  {difficultyConfig[challenge.difficulty].label}
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{challenge.duration}</span>
                </Badge>
              </div>
              
              <CardTitle className="text-2xl text-foreground mb-2">
                {t(challenge.titleKey)}
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4">
                {t(challenge.descriptionKey)}
              </CardDescription>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {challenge.participants.toLocaleString()} résztvevő
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-success" />
                  <span className="text-foreground font-medium">
                    {challenge.completionRate}% teljesítési arány
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-foreground font-medium">
                    {challenge.pointsReward} pont
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">
                {challenge.pointsReward}
              </div>
              <div className="text-xs text-muted-foreground">pontot kapsz</div>
              
              {userProgress?.isParticipating && !userProgress.isCompleted && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-1">Haladás</div>
                  <Progress value={userProgress.progress} className="w-24 h-2" />
                  <div className="text-xs text-foreground mt-1">{userProgress.progress}%</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Kihívás Részletei</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t(challenge.longDescriptionKey)}
            </p>
          </div>
          
          {/* Environmental Impact */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center space-x-2 mb-2">
                <Leaf className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">CO₂ Megtakarítás</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {challenge.impact.co2Saved} kg
              </div>
              <div className="text-xs text-muted-foreground">
                Átlagosan egy résztvevőnként
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Fa Egyenérték</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {challenge.impact.treesEquivalent}
              </div>
              <div className="text-xs text-muted-foreground">
                Ennyi fa ültetésével egyenértékű
              </div>
            </div>
          </div>
          
          {/* Steps Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Lépések a Teljesítéshez</h3>
            <div className="space-y-3">
              {challenge.stepsKeys.map((stepKey, index) => (
                <div
                  key={stepKey}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    userProgress?.completedSteps?.includes(index) 
                      ? 'bg-success/10 border-success/20' 
                      : activeStep === index 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
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
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{t(stepKey)}</p>
                    {userProgress?.isParticipating && !userProgress?.completedSteps?.includes(index) && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="mt-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteStep(index);
                        }}
                      >
                        Teljesítve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Hasznos Tippek</h3>
            <div className="space-y-2">
              {challenge.tipsKeys.map((tipKey, index) => (
                <div key={tipKey} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">{index + 1}</span>
                  </div>
                  <p className="text-foreground text-sm">{t(tipKey)}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sponsor Info */}
          {challenge.sponsor && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center space-x-3">
                <img 
                  src={challenge.sponsor.logo} 
                  alt={challenge.sponsor.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    Szponzor: {challenge.sponsor.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Támogatja ezt a kihívást
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full">
            {!userProgress?.isParticipating ? (
              <Button 
                onClick={handleJoinChallenge}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Csatlakozás a Kihíváshoz
              </Button>
            ) : userProgress.isCompleted ? (
              <Button 
                disabled
                className="flex-1 bg-success hover:bg-success"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Kihívás Teljesítve!
              </Button>
            ) : (
              <Button 
                onClick={handleCompleteChallenge}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Kihívás Befejezése
              </Button>
            )}
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Megosztás
            </Button>
          </div>
          
          {/* Participants Preview */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Résztvevők</span>
              <span className="text-xs text-muted-foreground">
                +{(challenge.participants - challenge.participants_preview.length).toLocaleString()} további
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TreePine, 
  Zap, 
  Droplets, 
  Recycle,
  Users,
  TrendingUp,
  Heart,
  Sparkles,
  Target,
  ArrowUp
} from "lucide-react";
import progressImage from "@/assets/progress-celebration.jpg";

const ProgressVisualization = () => {
  const personalImpact = {
    co2Saved: 156.8,
    treesEquivalent: 23,
    waterSaved: 1245,
    wasteReduced: 89,
    currentLevel: 12,
    nextLevelProgress: 68,
    pointsToNextLevel: 320
  };

  const communityImpact = {
    totalMembers: 2847,
    co2SavedCommunity: 45600,
    activeThisWeek: 892,
    challengesCompleted: 12400
  };

  const achievements = [
    { id: 1, name: "First Steps", earned: true, icon: "🌱" },
    { id: 2, name: "Energy Saver", earned: true, icon: "⚡" },
    { id: 3, name: "Water Guardian", earned: true, icon: "💧" },
    { id: 4, name: "Waste Warrior", earned: false, icon: "♻️" },
    { id: 5, name: "Community Leader", earned: false, icon: "👑" },
  ];

  const milestones = [
    { target: "Plant 50 trees", current: 23, total: 50, color: "text-success" },
    { target: "Save 200kg CO₂", current: 156.8, total: 200, color: "text-primary" },
    { target: "Engage 10 friends", current: 7, total: 10, color: "text-accent" }
  ];

  return (
    <div className="space-y-8">
      {/* Personal Impact Hero */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-success/5 border-2 border-primary/20">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={progressImage} 
            alt="Progress visualization" 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Personal Stats */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-primary rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold">Your Impact Journey</h3>
                    <p className="text-muted-foreground">Making the world better, one action at a time</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <TreePine className="w-6 h-6 text-success mb-2" />
                  <div className="text-2xl font-bold text-success">{personalImpact.treesEquivalent}</div>
                  <div className="text-sm text-muted-foreground">Trees Worth</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Zap className="w-6 h-6 text-warning mb-2" />
                  <div className="text-2xl font-bold text-warning">{personalImpact.co2Saved}kg</div>
                  <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Droplets className="w-6 h-6 text-accent mb-2" />
                  <div className="text-2xl font-bold text-accent">{personalImpact.waterSaved}L</div>
                  <div className="text-sm text-muted-foreground">Water Saved</div>
                </div>
                
                <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
                  <Recycle className="w-6 h-6 text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">{personalImpact.wasteReduced}kg</div>
                  <div className="text-sm text-muted-foreground">Waste Reduced</div>
                </div>
              </div>
            </div>

            {/* Right: Level Progress */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">{personalImpact.currentLevel}</span>
                </div>
                <h4 className="text-xl font-semibold">Sustainability Champion</h4>
                <p className="text-muted-foreground">Level {personalImpact.currentLevel}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {personalImpact.currentLevel + 1}</span>
                  <span>{personalImpact.nextLevelProgress}%</span>
                </div>
                <Progress value={personalImpact.nextLevelProgress} className="h-4" />
                <div className="text-center">
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    <Target className="w-3 h-3 mr-1" />
                    {personalImpact.pointsToNextLevel} points to next level
                  </Badge>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-spring group">
                View Full Progress
                <ArrowUp className="w-4 h-4 ml-2 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span>Your Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-spring ${
                  achievement.earned 
                    ? 'bg-success/10 border-success/20 hover:bg-success/15' 
                    : 'bg-muted/30 border-muted/50 opacity-60'
                }`}
              >
                <div className={`text-2xl ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </div>
                  {achievement.earned && (
                    <div className="text-sm text-success">Unlocked! 🎉</div>
                  )}
                </div>
                {achievement.earned && (
                  <Badge className="bg-success text-success-foreground">
                    ✓ Earned
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card className="bg-glass backdrop-blur-md border-white/20 shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span>Community Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {communityImpact.co2SavedCommunity.toLocaleString()}kg
              </div>
              <div className="text-muted-foreground">CO₂ saved together this month</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <div className="text-xl font-bold text-primary">{communityImpact.totalMembers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Champions</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-xl">
                <div className="text-xl font-bold text-success">{communityImpact.activeThisWeek}</div>
                <div className="text-sm text-muted-foreground">Active This Week</div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="font-medium">You're in the top 15%!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your impact is above average. Keep inspiring others!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Your Sustainability Milestones
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{milestone.target}</span>
                <span className={`text-sm font-bold ${milestone.color}`}>
                  {milestone.current}/{milestone.total}
                </span>
              </div>
              <Progress 
                value={(milestone.current / milestone.total) * 100} 
                className="h-3" 
              />
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {Math.round(((milestone.current / milestone.total) * 100))}% Complete
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressVisualization;
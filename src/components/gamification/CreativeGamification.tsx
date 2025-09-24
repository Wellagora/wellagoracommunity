import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  TreePine, 
  Sprout, 
  Flower, 
  Users, 
  Gift, 
  Zap, 
  Trophy,
  Target,
  Calendar,
  Sparkles,
  Heart,
  Share2,
  Timer
} from "lucide-react";
import { useState } from "react";

interface ImpactTree {
  id: string;
  name: string;
  stage: "seed" | "sprout" | "sapling" | "tree" | "forest";
  co2Absorbed: number;
  actions: number;
  daysActive: number;
}

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  reward: string;
  progress: number;
  isActive: boolean;
}

interface TeamChallenge {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  progress: number;
  timeLeft: string;
  reward: string;
}

const CreativeGamification = () => {
  const [selectedTab, setSelectedTab] = useState<"forest" | "events" | "teams" | "gifts">("forest");

  // Mock data for Impact Forest
  const impactTrees: ImpactTree[] = [
    {
      id: "1",
      name: "Energy Conservation Oak",
      stage: "tree",
      co2Absorbed: 245.7,
      actions: 89,
      daysActive: 45
    },
    {
      id: "2", 
      name: "Transport Efficiency Pine",
      stage: "sapling",
      co2Absorbed: 127.3,
      actions: 34,
      daysActive: 22
    },
    {
      id: "3",
      name: "Waste Reduction Willow", 
      stage: "sprout",
      co2Absorbed: 67.8,
      actions: 18,
      daysActive: 12
    },
    {
      id: "4",
      name: "Community Action Cedar",
      stage: "seed",
      co2Absorbed: 12.4,
      actions: 5,
      daysActive: 3
    }
  ];

  const seasonalEvents: SeasonalEvent[] = [
    {
      id: "1",
      name: "Earth Month Mega Challenge",
      description: "Join 10,000+ participants in the largest sustainability challenge ever!",
      startDate: "2024-04-01",
      endDate: "2024-04-30", 
      participantCount: 8742,
      reward: "Exclusive Earth Guardian Badge + Tree Planting Certificate",
      progress: 67,
      isActive: true
    },
    {
      id: "2",
      name: "Summer Solstice Solar Sprint", 
      description: "Switch to renewable energy and win solar-powered rewards",
      startDate: "2024-06-15",
      endDate: "2024-06-25",
      participantCount: 2156,
      reward: "Solar Power Bank + Sustainability Toolkit",
      progress: 23,
      isActive: false
    }
  ];

  const teamChallenges: TeamChallenge[] = [
    {
      id: "1",
      name: "Neighborhood Green Squad",
      members: 7,
      maxMembers: 10,
      progress: 78,
      timeLeft: "5 days",
      reward: "Community Garden Startup Kit"
    },
    {
      id: "2", 
      name: "Office Eco Warriors",
      members: 12,
      maxMembers: 15,
      progress: 45,
      timeLeft: "12 days", 
      reward: "Company Sustainability Audit"
    }
  ];

  const getTreeIcon = (stage: ImpactTree['stage']) => {
    switch (stage) {
      case "seed": return <div className="w-4 h-4 bg-brown-500 rounded-full" />;
      case "sprout": return <Sprout className="w-6 h-6 text-green-400" />;
      case "sapling": return <TreePine className="w-8 h-8 text-green-500" />;
      case "tree": return <TreePine className="w-12 h-12 text-green-600" />;
      case "forest": return <TreePine className="w-16 h-16 text-green-700" />;
      default: return <Sprout className="w-6 h-6 text-green-400" />;
    }
  };

  const getStageColor = (stage: ImpactTree['stage']) => {
    switch (stage) {
      case "seed": return "bg-amber-100 text-amber-800";
      case "sprout": return "bg-green-100 text-green-800"; 
      case "sapling": return "bg-emerald-100 text-emerald-800";
      case "tree": return "bg-forest-100 text-forest-800";
      case "forest": return "bg-green-200 text-green-900";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button 
          variant={selectedTab === "forest" ? "default" : "ghost"} 
          onClick={() => setSelectedTab("forest")}
          className="flex items-center space-x-2"
        >
          <TreePine className="w-4 h-4" />
          <span>Impact Forest</span>
        </Button>
        <Button 
          variant={selectedTab === "events" ? "default" : "ghost"} 
          onClick={() => setSelectedTab("events")}
          className="flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Events</span>
        </Button>
        <Button 
          variant={selectedTab === "teams" ? "default" : "ghost"} 
          onClick={() => setSelectedTab("teams")}
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Teams</span>
        </Button>
        <Button 
          variant={selectedTab === "gifts" ? "default" : "ghost"} 
          onClick={() => setSelectedTab("gifts")}
          className="flex items-center space-x-2"
        >
          <Gift className="w-4 h-4" />
          <span>Rewards</span>
        </Button>
      </div>

      {/* Impact Forest Tab */}
      {selectedTab === "forest" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TreePine className="w-6 h-6 text-green-600" />
                <span>Your Impact Forest</span>
              </CardTitle>
              <CardDescription>
                Watch your sustainability actions grow into a thriving digital forest. Each category of actions grows its own tree!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactTrees.map((tree) => (
                  <Card key={tree.id} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        {getTreeIcon(tree.stage)}
                        <div>
                          <h3 className="font-medium text-sm">{tree.name}</h3>
                          <Badge className={getStageColor(tree.stage)} variant="secondary">
                            {tree.stage}
                          </Badge>
                        </div>
                        <div className="text-xs space-y-1 w-full">
                          <div className="flex justify-between">
                            <span>CO₂ Absorbed:</span>
                            <span className="font-medium">{tree.co2Absorbed} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Actions:</span>
                            <span className="font-medium">{tree.actions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Days Active:</span>
                            <span className="font-medium">{tree.daysActive}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-800">Forest Health Score</h3>
                    <p className="text-sm text-green-600">Your overall ecosystem impact</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">87%</div>
                    <p className="text-xs text-green-600">Thriving</p>
                  </div>
                </div>
                <Progress value={87} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seasonal Events Tab */}
      {selectedTab === "events" && (
        <div className="space-y-4">
          {seasonalEvents.map((event) => (
            <Card key={event.id} className={event.isActive ? "border-primary" : "opacity-75"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-warning" />
                      <span>{event.name}</span>
                      {event.isActive && <Badge variant="default">Active</Badge>}
                    </CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{event.participantCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">participants</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Event Progress</span>
                      <span>{event.progress}%</span>
                    </div>
                    <Progress value={event.progress} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Reward: {event.reward}</span>
                    </div>
                    <Button variant={event.isActive ? "default" : "outline"} size="sm">
                      {event.isActive ? "Join Event" : "Coming Soon"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team Challenges Tab */}
      {selectedTab === "teams" && (
        <div className="space-y-4">
          {teamChallenges.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>{team.name}</span>
                </CardTitle>
                <CardDescription>
                  {team.members}/{team.maxMembers} members • {team.timeLeft} remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Team Progress</span>
                      <span>{team.progress}%</span>
                    </div>
                    <Progress value={team.progress} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Reward: {team.reward}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Invite Friends
                      </Button>
                      <Button variant="default" size="sm">
                        Join Team
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Real-World Rewards Tab */}
      {selectedTab === "gifts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Plant a Real Tree</h3>
                  <p className="text-sm text-muted-foreground">1,000 points</p>
                </div>
                <Button variant="default" className="w-full">Redeem</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Eco Product Bundle</h3>
                  <p className="text-sm text-muted-foreground">1,500 points</p>
                </div>
                <Button variant="default" className="w-full">Redeem</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Charity Donation</h3>
                  <p className="text-sm text-muted-foreground">500 points</p>
                </div>
                <Button variant="default" className="w-full">Donate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreativeGamification;
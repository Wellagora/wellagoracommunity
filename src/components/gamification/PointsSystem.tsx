import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Leaf, 
  Recycle, 
  Heart,
  Crown,
  Medal,
  Award
} from "lucide-react";

interface UserStats {
  totalPoints: number;
  level: number;
  challengesCompleted: number;
  streakDays: number;
  badgesEarned: Badge[];
  nextLevelPoints: number;
  currentLevelPoints: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  challengesCompleted: number;
}

const PointsSystem = () => {
  // Mock user data - will be replaced with real data from Supabase
  const userStats: UserStats = {
    totalPoints: 2847,
    level: 12,
    challengesCompleted: 8,
    streakDays: 23,
    badgesEarned: [
      {
        id: "1",
        name: "First Steps",
        description: "Completed your first challenge",
        icon: "🌱",
        rarity: "common",
        earnedAt: "2024-03-01"
      },
      {
        id: "2", 
        name: "Plastic Warrior",
        description: "Completed 5 waste reduction challenges",
        icon: "♻️",
        rarity: "rare",
        earnedAt: "2024-03-15"
      },
      {
        id: "3",
        name: "Energy Saver",
        description: "Reduced energy consumption by 30%",
        icon: "⚡",
        rarity: "epic",
        earnedAt: "2024-03-20"
      }
    ],
    nextLevelPoints: 3000,
    currentLevelPoints: 2500
  };

  const availableBadges: Badge[] = [
    {
      id: "4",
      name: "Transport Hero", 
      description: "Complete 3 sustainable transport challenges",
      icon: "🚴‍♀️",
      rarity: "rare"
    },
    {
      id: "5",
      name: "Community Leader",
      description: "Organize a community environmental project",
      icon: "👑",
      rarity: "legendary"
    },
    {
      id: "6",
      name: "Green Streak",
      description: "Maintain a 30-day activity streak",
      icon: "🔥",
      rarity: "epic"
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      points: 4521,
      level: 18,
      challengesCompleted: 15
    },
    {
      id: "2",
      name: "Marcus Johnson", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      points: 3892,
      level: 16,
      challengesCompleted: 12
    },
    {
      id: "3",
      name: "You",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      points: 2847,
      level: 12,
      challengesCompleted: 8
    },
    {
      id: "4",
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      points: 2634,
      level: 11,
      challengesCompleted: 9
    },
    {
      id: "5",
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      points: 2156,
      level: 10,
      challengesCompleted: 7
    }
  ];

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case "common": return "bg-muted text-muted-foreground";
      case "rare": return "bg-blue-500 text-blue-50";
      case "epic": return "bg-purple-500 text-purple-50";
      case "legendary": return "bg-gradient-earth text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const progressToNextLevel = ((userStats.totalPoints - userStats.currentLevelPoints) / (userStats.nextLevelPoints - userStats.currentLevelPoints)) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Points</p>
                <p className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
                <Progress value={progressToNextLevel} className="w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats.nextLevelPoints - userStats.totalPoints} points to level {userStats.level + 1}
                </p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Challenges Completed</p>
                <p className="text-2xl font-bold">{userStats.challengesCompleted}</p>
              </div>
              <Target className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Current Streak</p>
                <p className="text-2xl font-bold">{userStats.streakDays} days</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Your Badges</span>
            </CardTitle>
            <CardDescription>
              Achievements you've unlocked through your sustainability journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userStats.badgesEarned.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                <div className="text-2xl">{badge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{badge.name}</h4>
                    <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                      {badge.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Available Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="w-5 h-5" />
              <span>Available Badges</span>
            </CardTitle>
            <CardDescription>
              Unlock these badges by completing specific challenges and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableBadges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card opacity-75">
                <div className="text-2xl grayscale">{badge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{badge.name}</h4>
                    <Badge className={getRarityColor(badge.rarity)} variant="outline">
                      {badge.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-warning" />
            <span>Leaderboard</span>
          </CardTitle>
          <CardDescription>
            See how you rank among other sustainability champions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`flex items-center space-x-4 p-4 rounded-lg border ${
                  entry.name === "You" ? "bg-primary/10 border-primary" : "bg-card"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                  {index + 1}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>
                    {entry.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{entry.name}</h4>
                    {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                    {entry.name === "You" && <Badge variant="outline">You</Badge>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Level {entry.level}</span>
                    <span>•</span>
                    <span>{entry.challengesCompleted} challenges</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsSystem;
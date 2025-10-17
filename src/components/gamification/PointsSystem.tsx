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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  // Mock user data - will be replaced with real data from Supabase
  const userStats: UserStats = {
    totalPoints: 2847,
    level: 12,
    challengesCompleted: 8,
    streakDays: 23,
    badgesEarned: [
      {
        id: "1",
        name: t('points.badge.first_steps'),
        description: t('points.badge.first_steps_desc'),
        icon: "🌱",
        rarity: "common",
        earnedAt: "2024-03-01"
      },
      {
        id: "2", 
        name: t('points.badge.plastic_warrior'),
        description: t('points.badge.plastic_warrior_desc'),
        icon: "♻️",
        rarity: "rare",
        earnedAt: "2024-03-15"
      },
      {
        id: "3",
        name: t('points.badge.energy_saver'),
        description: t('points.badge.energy_saver_desc'),
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
      name: t('points.badge.transport_hero'), 
      description: t('points.badge.transport_hero_desc'),
      icon: "🚴‍♀️",
      rarity: "rare"
    },
    {
      id: "5",
      name: t('points.badge.community_leader'),
      description: t('points.badge.community_leader_desc'),
      icon: "👑",
      rarity: "legendary"
    },
    {
      id: "6",
      name: t('points.badge.green_streak'),
      description: t('points.badge.green_streak_desc'),
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
      case "legendary": return "bg-gradient-primary text-primary-foreground";
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
                <p className="text-white/80 text-sm">{t('points.total_points')}</p>
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
                <p className="text-muted-foreground text-sm">{t('points.level')}</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
                <Progress value={progressToNextLevel} className="w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats.nextLevelPoints - userStats.totalPoints} {t('points.points_to_level')} {userStats.level + 1}
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
                <p className="text-muted-foreground text-sm">{t('points.challenges_completed')}</p>
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
                <p className="text-muted-foreground text-sm">{t('points.current_streak')}</p>
                <p className="text-2xl font-bold">{userStats.streakDays} {t('points.days')}</p>
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
              <span>{t('points.your_badges')}</span>
            </CardTitle>
            <CardDescription>
              {t('points.your_badges_desc')}
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
                      {t(`points.rarity.${badge.rarity}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('points.earned_on')} {new Date(badge.earnedAt).toLocaleDateString()}
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
              <span>{t('points.available_badges')}</span>
            </CardTitle>
            <CardDescription>
              {t('points.available_badges_desc')}
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
                      {t(`points.rarity.${badge.rarity}`)}
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
            <span>{t('points.leaderboard')}</span>
          </CardTitle>
          <CardDescription>
            {t('points.leaderboard_desc')}
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
                    <h4 className="font-medium">{entry.name === "You" ? t('points.you') : entry.name}</h4>
                    {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                    {entry.name === "You" && <Badge variant="outline">{t('points.you')}</Badge>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{t('points.level')} {entry.level}</span>
                    <span>•</span>
                    <span>{entry.challengesCompleted} {t('points.challenges')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{t('points.points')}</p>
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
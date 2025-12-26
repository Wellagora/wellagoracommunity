import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Star, 
  Calendar, 
  MapPin, 
  Users,
  Target,
  MessageCircle,
  Share2,
  Settings,
  Award,
  TrendingUp,
  Leaf,
  Zap,
  Recycle,
  Heart
} from "lucide-react";

interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
}

const UserProfile = ({ userId, isOwnProfile = false }: UserProfileProps) => {
  const { toast } = useToast();
  
  // Mock user data - will be fetched from Supabase
  const user = {
    id: userId,
    name: "Sarah Chen",
    role: "Citizen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    bio: "Passionate about sustainable living and community building. Love cycling, zero-waste cooking, and helping others on their eco journey! 🌱",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    stats: {
      totalPoints: 2840,
      challengesCompleted: 23,
      challengesActive: 4,
      communityRank: 1,
      forumPosts: 156,
      helpedUsers: 89
    },
    badges: [
      { id: "eco-warrior", name: "Eco Warrior", icon: "🌍", description: "Completed 20+ challenges", earned: "2024-02-15" },
      { id: "community-helper", name: "Community Helper", icon: "🤝", description: "Helped 50+ community members", earned: "2024-02-20" },
      { id: "cycling-champion", name: "Cycling Champion", icon: "🚴‍♀️", description: "Biked 500+ miles sustainably", earned: "2024-03-01" },
      { id: "waste-warrior", name: "Waste Warrior", icon: "♻️", description: "Reduced waste by 100+ kg", earned: "2024-03-05" },
      { id: "energy-saver", name: "Energy Saver", icon: "⚡", description: "Saved 500+ kWh energy", earned: "2024-03-10" }
    ],
    recentActivity: [
      {
        type: "challenge_completed",
        title: "Completed 'Zero Waste Week Challenge'",
        timestamp: "2 hours ago",
        points: 150
      },
      {
        type: "forum_post",
        title: "Posted in 'Sustainable Transport' forum",
        timestamp: "5 hours ago",
        content: "Great tips on e-bike maintenance!"
      },
      {
        type: "badge_earned",
        title: "Earned 'Energy Saver' badge",
        timestamp: "1 day ago",
        badge: "⚡"
      },
      {
        type: "challenge_joined",
        title: "Joined 'Plastic-Free March Challenge'",
        timestamp: "2 days ago"
      }
    ],
    activeChallenges: [
      {
        id: "1",
        title: "Plastic-Free March",
        progress: 65,
        category: "waste",
        daysLeft: 12
      },
      {
        id: "2", 
        title: "Bike to Work Week",
        progress: 80,
        category: "transport",
        daysLeft: 3
      },
      {
        id: "3",
        title: "Energy Saving Challenge",
        progress: 45,
        category: "energy", 
        daysLeft: 20
      }
    ],
    impactStats: {
      co2Saved: 245.6,
      treesEquivalent: 12,
      wasteReduced: 156.3,
      energySaved: 890
    }
  };

  const categoryIcons = {
    waste: Recycle,
    transport: Target,
    energy: Zap,
    community: Heart,
    food: Leaf
  };

  const handleSendMessage = () => {
    toast({
      title: "Üzenetküldés hamarosan!",
      description: "Ez a funkció hamarosan elérhető lesz.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Sustainability Profile`,
        text: `Check out ${user.name}'s amazing sustainability journey!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant="outline">{user.role}</Badge>
                <div className="flex space-x-1">
                  {user.badges.slice(0, 3).map((badge) => (
                    <span key={badge.id} className="text-lg" title={badge.name}>
                      {badge.icon}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-3">{user.bio}</p>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>Rank #{user.stats.communityRank}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isOwnProfile && (
                  <>
                    <Button onClick={handleSendMessage}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{user.stats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{user.stats.challengesCompleted}</div>
            <div className="text-sm text-muted-foreground">Challenges Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{user.stats.forumPosts}</div>
            <div className="text-sm text-muted-foreground">Forum Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{user.stats.helpedUsers}</div>
            <div className="text-sm text-muted-foreground">Users Helped</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
                    {activity.points && (
                      <Badge className="mt-1" variant="outline">+{activity.points} points</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Challenges</CardTitle>
                <CardDescription>{user.stats.challengesActive} challenges in progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.activeChallenges.map((challenge) => {
                  const CategoryIcon = categoryIcons[challenge.category as keyof typeof categoryIcons];
                  return (
                    <div key={challenge.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-4 h-4" />
                          <span className="font-medium">{challenge.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{challenge.daysLeft} days left</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                      <div className="text-right text-sm text-muted-foreground">
                        {challenge.progress}% complete
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Completed Challenges</span>
                  <span className="font-bold">{user.stats.challengesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak</span>
                  <span className="font-bold">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorite Category</span>
                  <span className="font-bold">Transport</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>{user.badges.length} badges earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">{badge.description}</div>
                      <div className="text-xs text-muted-foreground">Earned: {badge.earned}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-primary text-primary-foreground border-0">
              <CardHeader>
                <CardTitle>Community Participation</CardTitle>
                <CardDescription className="text-white/80">
                  Your contribution to the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Challenges Completed</span>
                  <span className="font-bold">{user.stats.challengesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Earned</span>
                  <span className="font-bold">{user.stats.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forum Posts</span>
                  <span className="font-bold">{user.stats.forumPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Users Helped</span>
                  <span className="font-bold">{user.stats.helpedUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Helped {user.stats.helpedUsers} users</div>
                    <div className="text-sm text-muted-foreground">Through forum posts and mentoring</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <div>
                    <div className="font-medium">Inspired 156 actions</div>
                    <div className="text-sm text-muted-foreground">Others joined challenges you shared</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-warning" />
                  <div>
                    <div className="font-medium">Top 5% contributor</div>
                    <div className="text-sm text-muted-foreground">In your regional community</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
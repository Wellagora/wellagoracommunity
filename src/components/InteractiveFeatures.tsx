import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  TrendingUp,
  Users,
  Sparkles,
  MapPin,
  Clock,
  ArrowUp
} from "lucide-react";

const InteractiveFeatures = () => {
  const [liveActivity, setLiveActivity] = useState([
    {
      id: 1,
      user: "Sarah M.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      action: "completed the Plastic-Free Week challenge",
      time: "2 min ago",
      location: "Munich",
      impact: "12kg CO₂ saved"
    },
    {
      id: 2,
      user: "Team GreenTech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      action: "organized a community tree planting event",
      time: "15 min ago",
      location: "Berlin",
      impact: "50 trees planted"
    },
    {
      id: 3,
      user: "Lisa K.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      action: "switched to renewable energy",
      time: "1 hour ago",
      location: "Hamburg",
      impact: "2.5t CO₂/year reduced"
    }
  ]);

  const [quickStats, setQuickStats] = useState({
    activeNow: 234,
    todayActions: 1847,
    co2SavedToday: 3420,
    newMembers: 156
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats(prev => ({
        ...prev,
        activeNow: prev.activeNow + Math.floor(Math.random() * 5) - 2,
        todayActions: prev.todayActions + Math.floor(Math.random() * 3),
        co2SavedToday: prev.co2SavedToday + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = (activityId: number) => {
    // Like functionality - to be implemented
  };

  const handleShare = (activity: typeof liveActivity[0]) => {
    if (navigator.share) {
      navigator.share({
        title: "Inspiring sustainability action!",
        text: `${activity.user} ${activity.action}. Join us on Wellagora!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Community Stats */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 border-2 border-primary/20 shadow-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold flex items-center">
              <div className="w-3 h-3 bg-success rounded-full mr-2 animate-pulse"></div>
              Live Community Activity
            </h3>
            <Badge className="bg-success/10 text-success border-success/20 animate-pulse">
              <Users className="w-3 h-3 mr-1" />
              {quickStats.activeNow} online
            </Badge>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-glass backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-primary">{quickStats.todayActions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Actions Today</div>
              <TrendingUp className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
            
            <div className="text-center p-3 bg-glass backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-success">{quickStats.co2SavedToday.toLocaleString()}kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved Today</div>
              <ArrowUp className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
            
            <div className="text-center p-3 bg-glass backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-accent">{quickStats.newMembers}</div>
              <div className="text-sm text-muted-foreground">New Members</div>
              <Sparkles className="w-4 h-4 text-warning mx-auto mt-1" />
            </div>
            
            <div className="text-center p-3 bg-glass backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-2xl font-bold text-warning">15</div>
              <div className="text-sm text-muted-foreground">Cities Connected</div>
              <MapPin className="w-4 h-4 text-accent mx-auto mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <div className="space-y-4">
        <h3 className="text-2xl font-heading font-bold flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-warning" />
          Recent Achievements
        </h3>
        
        <div className="space-y-4">
          {liveActivity.map((activity) => (
            <Card 
              key={activity.id} 
              className="bg-glass backdrop-blur-md border-white/20 shadow-premium hover:shadow-glow transition-spring hover-lift"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={activity.avatar} />
                    <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          <span className="text-primary font-semibold">{activity.user}</span>
                          {" "}{activity.action}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{activity.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className="bg-success/10 text-success border-success/20 ml-4">
                        {activity.impact}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(activity.id)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors group"
                      >
                        <Heart className="w-4 h-4 mr-1 group-hover:fill-current" />
                        Celebrate
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleShare(activity)}
                        className="hover:bg-accent/10 hover:text-accent transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-warning/10 hover:text-warning transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-spring"
          >
            View All Activity
            <ArrowUp className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Encouraging Message */}
      <Card className="bg-gradient-primary/10 border-2 border-primary/20 shadow-premium">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">
            You're Part of Something Amazing! 🌍
          </h3>
          <p className="text-muted-foreground mb-4">
            Every action you take creates ripples of positive change. 
            Join these incredible people making a difference right now.
          </p>
          <Button className="bg-gradient-primary hover:shadow-glow transition-spring">
            Take Your Next Action
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveFeatures;
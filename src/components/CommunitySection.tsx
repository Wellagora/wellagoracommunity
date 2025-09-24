import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Camera,
  Award
} from "lucide-react";

import communityImage from "@/assets/community-garden.jpg";

const CommunitySection = () => {
  const communityStats = [
    { label: "Active Members", value: "48.2K", icon: Users },
    { label: "Discussion Posts", value: "127K", icon: MessageCircle },
    { label: "Local Events", value: "2.8K", icon: Calendar },
    { label: "Success Stories", value: "15.6K", icon: Award },
  ];

  const forumPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "SC",
      title: "Best solar panel installation companies in Munich?",
      content: "Looking for recommendations for residential solar installation. Has anyone had good experiences with local companies?",
      category: "Energy",
      replies: 24,
      likes: 18,
      timeAgo: "2 hours ago",
      trending: true
    },
    {
      id: 2,
      author: "Mike Rodriguez",
      avatar: "MR",
      title: "Community Garden Success Story 🌱",
      content: "Our neighborhood garden project just harvested 200kg of vegetables! Here's what we learned along the way...",
      category: "Community",
      replies: 31,
      likes: 89,
      timeAgo: "5 hours ago",
      trending: false
    },
    {
      id: 3,
      author: "Emma Johnson",
      avatar: "EJ",
      title: "Zero-waste grocery shopping tips",
      content: "After 6 months of zero-waste shopping, I've learned some game-changing strategies. Here are my top 10 tips!",
      category: "Waste",
      replies: 45,
      likes: 156,
      timeAgo: "1 day ago",
      trending: true
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Community Tree Planting Day",
      date: "Oct 28, 2024",
      time: "9:00 AM",
      location: "Central Park, Munich",
      attendees: 89,
      organizer: "Green Munich NGO"
    },
    {
      id: 2,
      title: "Sustainable Business Workshop",
      date: "Nov 2, 2024", 
      time: "2:00 PM",
      location: "Innovation Hub, Berlin",
      attendees: 156,
      organizer: "EcoTech Solutions"
    },
    {
      id: 3,
      title: "Climate Action Town Hall",
      date: "Nov 8, 2024",
      time: "6:30 PM", 
      location: "City Hall, Hamburg",
      attendees: 234,
      organizer: "Hamburg Municipality"
    }
  ];

  const successStories = [
    {
      author: "Lisa Wang",
      avatar: "LW",
      story: "Reduced my household waste by 80% in 6 months using challenges from this platform!",
      impact: "320kg waste saved",
      badge: "Zero Waste Champion"
    },
    {
      author: "Team GreenTech",
      avatar: "GT",
      story: "Our office of 50 people completed the energy challenge and cut electricity usage by 25%!",
      impact: "2.1 tons CO₂ saved",
      badge: "Energy Efficiency Leader"
    }
  ];

  return (
    <section id="community" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Users className="w-4 h-4 mr-1" />
            Community Hub
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Connect, Share &{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Inspire Change
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join a vibrant community of sustainability champions. Share experiences, 
            get advice, participate in local events, and celebrate collective impact.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {communityStats.map((stat, index) => (
            <Card key={stat.label} className="text-center hover:shadow-eco transition-smooth">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Forum Posts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Community Discussions</h3>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
            </div>

            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="shadow-card hover:shadow-eco transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                            {post.title}
                          </h4>
                          {post.trending && (
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{post.author}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{post.category}</Badge>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                        
                        <p className="text-muted-foreground">{post.content}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <button className="flex items-center space-x-1 hover:text-primary transition-smooth">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.replies}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-primary transition-smooth">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-primary transition-smooth">
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              Load More Discussions
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                  >
                    <h5 className="font-semibold text-foreground mb-1">{event.title}</h5>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {event.attendees} attending
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.organizer}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-success" />
                  Success Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {successStories.map((story, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-success/10 text-success font-semibold text-xs">
                          {story.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground text-sm">{story.author}</div>
                        <Badge className="bg-success/10 text-success border-success/20 text-xs">
                          {story.badge}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{story.story}"</p>
                    <div className="text-xs font-medium text-success">{story.impact}</div>
                    {index < successStories.length - 1 && <hr className="border-border" />}
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-primary text-white border-0">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-lg mb-2">Ready to Get Involved?</h4>
                <p className="text-white/90 text-sm mb-4">
                  Join discussions, attend events, and connect with sustainability champions in your area.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                    Join Community
                  </Button>
                  <Button variant="ghost" className="w-full text-white border-white/20 hover:bg-white/10">
                    Find Local Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForumCard from "./ForumCard";
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  Search,
  Plus,
  Flame,
  Star,
  MapPin,
  Clock
} from "lucide-react";

const CommunityHub = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with Supabase data
  const forums = [
    {
      id: "general",
      name: "General Sustainability",
      description: "Discuss all things sustainability, share tips, and ask questions",
      category: "General",
      posts: 1247,
      members: 856,
      color: "bg-primary",
      recentPosts: [
        {
          id: "1",
          title: "Best solar panel options for small apartments?",
          excerpt: "Looking for advice on compact solar solutions...",
          author: {
            name: "Sarah Chen",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
            role: "Citizen"
          },
          replies: 23,
          views: 156,
          lastActivity: "2 hours ago",
          isPinned: false,
          isHot: true
        },
        {
          id: "2",
          title: "Weekly Challenge: Share Your Green Wins",
          excerpt: "Post your sustainability achievements from this week...",
          author: {
            name: "Mike Rodriguez",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            role: "Moderator"
          },
          replies: 67,
          views: 432,
          lastActivity: "5 hours ago",
          isPinned: true,
          isHot: false
        }
      ]
    },
    {
      id: "transport",
      name: "Sustainable Transport",
      description: "Electric vehicles, cycling, public transport, and green mobility solutions",
      category: "Transport",
      posts: 634,
      members: 423,
      color: "bg-blue-500",
      recentPosts: [
        {
          id: "3",
          title: "E-bike vs Public Transport Cost Analysis",
          excerpt: "Comparing monthly costs and environmental impact...",
          author: {
            name: "Emma Johnson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            role: "Business"
          },
          replies: 15,
          views: 89,
          lastActivity: "1 day ago",
          isPinned: false,
          isHot: false
        }
      ]
    },
    {
      id: "business",
      name: "Business & Corporate",
      description: "ESG initiatives, corporate sustainability, and green business practices",
      category: "Business",
      posts: 456,
      members: 234,
      color: "bg-accent",
      recentPosts: [
        {
          id: "4",
          title: "Implementing Green Policies in Small Companies",
          excerpt: "Step-by-step guide for businesses under 50 employees...",
          author: {
            name: "David Park",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            role: "Business"
          },
          replies: 31,
          views: 234,
          lastActivity: "3 hours ago",
          isPinned: false,
          isHot: true
        }
      ]
    }
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Community Tree Planting Day",
      date: "March 15, 2024",
      time: "9:00 AM",
      location: "Central Park",
      attendees: 67,
      organizer: "Green Future NGO"
    },
    {
      id: "2",
      title: "Sustainable Living Workshop",
      date: "March 20, 2024", 
      time: "2:00 PM",
      location: "Community Center",
      attendees: 34,
      organizer: "EcoTech Solutions"
    },
    {
      id: "3",
      title: "Bike to Work Challenge Kickoff",
      date: "March 25, 2024",
      time: "7:00 AM",
      location: "City Hall",
      attendees: 123,
      organizer: "Municipal Transport Dept"
    }
  ];

  const topContributors = [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      role: "Citizen",
      posts: 156,
      reputation: 2840,
      badges: ["🌱", "♻️", "🚴‍♀️"]
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      role: "Moderator",
      posts: 234,
      reputation: 3120,
      badges: ["👑", "🌍", "⭐"]
    },
    {
      id: "3",
      name: "Emma Johnson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      role: "Business",
      posts: 89,
      reputation: 1890,
      badges: ["💼", "🌿", "🏆"]
    }
  ];

  const handleViewForum = (forumId: string) => {
    // TODO: Navigate to forum detail page
    console.log("Viewing forum:", forumId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Community Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow sustainability champions, share knowledge, and collaborate on challenges
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forums, posts, and discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </Button>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="forums" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Forums List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Discussion Forums</h2>
                <Badge className="bg-success/10 text-success">
                  <Flame className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="grid gap-6">
                {forums.map((forum) => (
                  <ForumCard 
                    key={forum.id} 
                    forum={forum} 
                    onViewForum={handleViewForum}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-warning" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback>{contributor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{contributor.name}</div>
                        <div className="text-sm text-muted-foreground">{contributor.posts} posts • {contributor.reputation} rep</div>
                        <div className="flex space-x-1 mt-1">
                          {contributor.badges.map((badge, i) => (
                            <span key={i} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardContent className="p-6">
                  <h4 className="font-bold text-lg mb-4">Community Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/80">Total Members</span>
                      <span className="font-bold">8,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Posts Today</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Active Forums</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Online Now</span>
                      <span className="font-bold">234</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-eco transition-smooth">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>Organized by {event.organizer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-primary">
                    Join Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Member Directory</h3>
            <p className="text-muted-foreground">Connect with sustainability champions in your region</p>
            <Button className="mt-4">Browse Members</Button>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interest Groups</h3>
            <p className="text-muted-foreground">Join specialized groups based on your sustainability interests</p>
            <Button className="mt-4">Explore Groups</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
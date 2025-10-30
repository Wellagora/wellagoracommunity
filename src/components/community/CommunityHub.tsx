import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForumCard from "./ForumCard";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();

  // Mock data - will be replaced with Supabase data
  const forums = [
    {
      id: "general",
      name: t('community.forums.general.name'),
      description: t('community.forums.general.description'),
      category: "General",
      posts: 1247,
      members: 856,
      color: "bg-primary",
      recentPosts: [
        {
          id: "1",
          title: t('community.forums.general.post1.title'),
          excerpt: t('community.forums.general.post1.excerpt'),
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
          title: t('community.forums.general.post2.title'),
          excerpt: t('community.forums.general.post2.excerpt'),
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
      name: t('community.forums.transport.name'),
      description: t('community.forums.transport.description'),
      category: "Transport",
      posts: 634,
      members: 423,
      color: "bg-blue-500",
      recentPosts: [
        {
          id: "3",
          title: t('community.forums.transport.post1.title'),
          excerpt: t('community.forums.transport.post1.excerpt'),
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
      name: t('community.forums.business.name'),
      description: t('community.forums.business.description'),
      category: "Business",
      posts: 456,
      members: 234,
      color: "bg-accent",
      recentPosts: [
        {
          id: "4",
          title: t('community.forums.business.post1.title'),
          excerpt: t('community.forums.business.post1.excerpt'),
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
      title: t('community.events.tree_planting.title'),
      date: "March 15, 2024",
      time: "9:00 AM",
      location: t('community.events.tree_planting.location'),
      attendees: 67,
      organizer: t('community.events.tree_planting.organizer')
    },
    {
      id: "2",
      title: t('community.events.workshop.title'),
      date: "March 20, 2024", 
      time: "2:00 PM",
      location: t('community.events.workshop.location'),
      attendees: 34,
      organizer: t('community.events.workshop.organizer')
    },
    {
      id: "3",
      title: t('community.events.bike_challenge.title'),
      date: "March 25, 2024",
      time: "7:00 AM",
      location: t('community.events.bike_challenge.location'),
      attendees: 123,
      organizer: t('community.events.bike_challenge.organizer')
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
    <div className="max-w-7xl mx-auto space-y-8 xl:space-y-10">
      {/* Header */}
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 xl:mb-6">
          {t('community.title')}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl xl:max-w-3xl mx-auto">
          {t('community.subtitle')}
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between px-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('community.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1 sm:flex-none text-sm">
            <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('community.events')}</span>
          </Button>
          <Button className="flex-1 sm:flex-none bg-gradient-primary text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('community.new_post')}</span>
            <span className="sm:hidden">{t('community.post')}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="forums" className="space-y-4 sm:space-y-6 px-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="forums" className="text-xs sm:text-sm px-2 sm:px-4">{t('community.tabs.forums')}</TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm px-2 sm:px-4">{t('community.tabs.events')}</TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm px-2 sm:px-4">{t('community.tabs.members')}</TabsTrigger>
          <TabsTrigger value="groups" className="text-xs sm:text-sm px-2 sm:px-4">{t('community.tabs.groups')}</TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="space-y-4 sm:space-y-6">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Forums List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('community.discussion_forums')}</h2>
                <Badge className="bg-success/10 text-success">
                  <Flame className="w-3 h-3 mr-1" />
                  {t('community.active')}
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
                    {t('community.top_contributors')}
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
                        <div className="text-sm text-muted-foreground">{contributor.posts} {t('community.posts')} • {contributor.reputation} {t('community.rep')}</div>
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
                  <h4 className="font-bold text-lg mb-4">{t('community.community_stats')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('community.total_members')}</span>
                      <span className="font-bold">8,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('community.posts_today')}</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('community.active_forums')}</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('community.online_now')}</span>
                      <span className="font-bold">234</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 sm:space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-eco transition-smooth">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{t('community.organized_by')} {event.organizer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{event.date} {t('community.at')} {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.attendees} {t('community.attending')}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-primary">
                    {t('community.join_event')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('community.member_directory')}</h3>
            <p className="text-muted-foreground">{t('community.member_directory_desc')}</p>
            <Button className="mt-4">{t('community.browse_members')}</Button>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('community.interest_groups')}</h3>
            <p className="text-muted-foreground">{t('community.interest_groups_desc')}</p>
            <Button className="mt-4">{t('community.explore_groups')}</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
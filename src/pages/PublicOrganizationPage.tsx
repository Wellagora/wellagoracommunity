import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  Building, 
  TreePine, 
  Users, 
  Target, 
  MapPin,
  Share2,
  ExternalLink
} from "lucide-react";

const PublicOrganizationPage = () => {
  const { organizationId } = useParams();

  // Mock data - would come from Supabase based on organizationId
  const organizationData = {
    name: "GreenTech Solutions",
    type: "business", // or "government" or "ngo"
    logo: "",
    description: "Leading the way in corporate sustainability and environmental responsibility",
    location: "Budapest, Hungary",
    website: "https://greentech.example.com",
    regionalRank: 3,
    totalOrganizations: 47,
    stats: {
      activeChallenges: 12,
      peopleReached: 2847,
      co2Saved: 45.6,
      partnerships: 8
    },
    recentChallenges: [
      {
        id: "1",
        title: "Green Office Initiative",
        participants: 342,
        co2Saved: 18.5,
        status: "active",
        progress: 67,
        startDate: "2025-01-15"
      },
      {
        id: "2",
        title: "Bike to Work Campaign",
        participants: 156,
        co2Saved: 8.2,
        status: "active",
        progress: 45,
        startDate: "2025-02-01"
      },
      {
        id: "3",
        title: "Community Garden Project",
        participants: 89,
        co2Saved: 4.3,
        status: "completed",
        progress: 100,
        startDate: "2024-11-10"
      }
    ],
    impactStories: [
      {
        id: "1",
        title: "Solar Panel Installation Success",
        description: "Reduced office energy consumption by 40%",
        date: "2025-01-20",
        impact: "12.3t CO₂ saved"
      },
      {
        id: "2",
        title: "Employee Mobility Program",
        description: "80% of employees now use sustainable transport",
        date: "2025-02-15",
        impact: "8.9t CO₂ saved"
      }
    ]
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "business":
        return "🏢";
      case "government":
        return "🏛️";
      case "ngo":
        return "🌱";
      default:
        return "🌍";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "business":
        return "Business Organization";
      case "government":
        return "Government Institution";
      case "ngo":
        return "Non-Governmental Organization";
      default:
        return "Organization";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Header */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-card to-accent/5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <Avatar className="w-24 h-24">
                <AvatarImage src={organizationData.logo} />
                <AvatarFallback className="text-3xl bg-gradient-primary text-white">
                  {getTypeIcon(organizationData.type)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{organizationData.name}</h1>
                  <Badge variant="outline">{getTypeName(organizationData.type)}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{organizationData.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {organizationData.location}
                  </span>
                  {organizationData.website && (
                    <a 
                      href={organizationData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Regional Impact Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <Target className="w-8 h-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{organizationData.stats.activeChallenges}</p>
                <p className="text-xs text-muted-foreground">Active Initiatives</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Users className="w-8 h-8 text-accent mb-2" />
                <p className="text-2xl font-bold">{organizationData.stats.peopleReached.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">People Engaged</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TreePine className="w-8 h-8 text-success mb-2" />
                <p className="text-2xl font-bold">{organizationData.stats.co2Saved}t</p>
                <p className="text-xs text-muted-foreground">CO₂ Saved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Building className="w-8 h-8 text-warning mb-2" />
                <p className="text-2xl font-bold">{organizationData.stats.partnerships}</p>
                <p className="text-xs text-muted-foreground">Partnerships</p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Rank */}
          <Card className="bg-gradient-to-br from-warning/10 to-accent/10">
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-warning mx-auto mb-3" />
                <h3 className="text-sm text-muted-foreground mb-2">Regional Rank</h3>
                <p className="text-4xl font-bold text-foreground mb-1">#{organizationData.regionalRank}</p>
                <p className="text-xs text-muted-foreground">out of {organizationData.totalOrganizations} organizations</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Impact Score</p>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">85/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Challenges & Initiatives</TabsTrigger>
            <TabsTrigger value="impact">Impact Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {organizationData.recentChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{challenge.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <TreePine className="w-4 h-4" />
                            {challenge.co2Saved}t CO₂ saved
                          </span>
                          <span className="text-xs">Started: {challenge.startDate}</span>
                        </div>
                      </div>
                      <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                        {challenge.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {organizationData.impactStories.map((story) => (
                <Card key={story.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{story.title}</CardTitle>
                        <CardDescription>{story.date}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        {story.impact}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{story.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicOrganizationPage;

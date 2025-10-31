import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState<any>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!organizationId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .eq('is_public', true)
          .single();

        if (error || !data) {
          toast({
            title: "Error",
            description: "Organization not found or is not public",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setOrganizationData(data);
      } catch (err) {
        console.error('Error fetching organization:', err);
        toast({
          title: "Error",
          description: "Failed to load organization",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return null;
  }

  // Extended data with defaults for missing values
  const extendedData = {
    ...organizationData,
    description: organizationData.description || "Együtt dolgozunk a fenntartható jövőért",
    location: organizationData.location || "Magyarország",
    website: organizationData.website_url,
    stats: {
      activeChallenges: 0, // TODO: fetch from challenge_sponsorships
      peopleReached: 0, // TODO: calculate from activities
      co2Saved: organizationData.co2_reduction_total || 0,
      partnerships: 0 // TODO: fetch from partnerships
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-14 sm:mt-16">
        {/* Organization Header */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-primary/5 via-card to-accent/5">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
              {/* Logo */}
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto md:mx-0">
                <AvatarImage src={extendedData.logo_url} />
                <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-primary text-white">
                  {getTypeIcon(extendedData.type)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center md:items-start gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{extendedData.name}</h1>
                  <Badge variant="outline" className="text-xs sm:text-sm">{getTypeName(extendedData.type)}</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4 md:px-0">{extendedData.description}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {extendedData.location}
                  </span>
                  {extendedData.website && (
                    <a 
                      href={extendedData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto justify-center">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {extendedData.stats.activeChallenges > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">{extendedData.stats.activeChallenges}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Aktív kezdeményezések</p>
                </CardContent>
              </Card>
            )}
            {extendedData.stats.peopleReached > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">{extendedData.stats.peopleReached.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Elért emberek</p>
                </CardContent>
              </Card>
            )}
            {extendedData.stats.co2Saved > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <TreePine className="w-6 h-6 sm:w-8 sm:h-8 text-success mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">{extendedData.stats.co2Saved}t</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Megtakarított CO₂</p>
                </CardContent>
              </Card>
            )}
            {extendedData.stats.partnerships > 0 && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Building className="w-6 h-6 sm:w-8 sm:h-8 text-warning mb-2" />
                  <p className="text-xl sm:text-2xl font-bold">{extendedData.stats.partnerships}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Partnerségek</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Kihívások és kezdeményezések</TabsTrigger>
            <TabsTrigger value="impact">Hatástörténetek</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {extendedData.recentChallenges.map((challenge: any) => (
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
              {extendedData.impactStories.map((story: any) => (
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

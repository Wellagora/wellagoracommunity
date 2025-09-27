import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Building2, 
  Calendar,
  Users,
  MapPin,
  Globe,
  Target,
  Award,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'published' | 'completed';
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    max_participants: 20
  });

  // Redirect if not authenticated or not an organization
  useEffect(() => {
    if (!authLoading && (!user || profile?.user_role === "citizen")) {
      navigate("/dashboard");
    }
  }, [user, profile, authLoading, navigate]);

  // Load organization events
  useEffect(() => {
    if (profile?.organization_id) {
      loadEvents();
    }
  }, [profile?.organization_id]);

  const loadEvents = async () => {
    try {
      // Mock events for now - replace with actual Supabase query
      const mockEvents: Event[] = [
        {
          id: "1",
          title: "Városi Kerékpártúra",
          description: "Csatlakozz hozzánk egy fenntartható közlekedési túrára a város legszebb útvonalain!",
          date: "2024-04-15",
          location: "Központi Park",
          max_participants: 50,
          current_participants: 23,
          status: "published"
        },
        {
          id: "2", 
          title: "Zöld Technológia Workshop",
          description: "Ismerd meg a legújabb környezetbarát technológiákat és azok alkalmazási lehetőségeit.",
          date: "2024-04-22",
          location: "Tech Hub Budapest",
          max_participants: 30,
          current_participants: 8,
          status: "published"
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock event creation - replace with actual Supabase insert
      const event: Event = {
        id: Date.now().toString(),
        ...newEvent,
        current_participants: 0,
        status: 'draft'
      };

      setEvents([...events, event]);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        max_participants: 20
      });

      // Show success message
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleInfo = () => {
    switch (profile?.user_role) {
      case "business":
        return {
          title: "Vállalati Dashboard",
          subtitle: "Vállalati fenntarthatósági kezdeményezések kezelése",
          gradient: "from-accent to-secondary",
          icon: Building2
        };
      case "government":
        return {
          title: "Önkormányzati Dashboard", 
          subtitle: "Városi fenntarthatósági programok koordinálása",
          gradient: "from-warning to-destructive",
          icon: MapPin
        };
      case "ngo":
        return {
          title: "NGO Dashboard",
          subtitle: "Közösségi környezetvédelmi projektek irányítása", 
          gradient: "from-success to-primary",
          icon: Users
        };
      default:
        return {
          title: "Szervezeti Dashboard",
          subtitle: "Fenntarthatósági projektek kezelése",
          gradient: "from-primary to-success", 
          icon: Building2
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">Betöltés...</span>
        </div>
      </div>
    );
  }

  if (!user || profile?.user_role === "citizen") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleInfo.gradient} rounded-2xl shadow-premium mb-6`}>
            <RoleIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {roleInfo.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {roleInfo.subtitle}
          </p>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Badge className={`bg-gradient-to-r ${roleInfo.gradient} text-white px-4 py-2`}>
              {profile?.organization || "Szervezet"}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{profile?.organization || "Nem megadott"}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktív események</p>
                  <p className="text-2xl font-bold text-primary">{events.filter(e => e.status === 'published').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Résztvevők</p>
                  <p className="text-2xl font-bold text-success">
                    {events.reduce((sum, e) => sum + e.current_participants, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ megtakarítás</p>
                  <p className="text-2xl font-bold text-warning">1.2t</p>
                </div>
                <Target className="w-8 h-8 text-warning/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Elért pontszám</p>
                  <p className="text-2xl font-bold text-accent">2,450</p>
                </div>
                <Award className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="events" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2">
            <TabsTrigger value="events" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <Calendar className="w-4 h-4" />
              <span>Események</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <TrendingUp className="w-4 h-4" />
              <span>Elemzések</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <Users className="w-4 h-4" />
              <span>Közösség</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-success data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300">
              <Settings className="w-4 h-4" />
              <span>Beállítások</span>
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Create New Event */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Új esemény létrehozása</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Esemény címe</Label>
                      <Input
                        id="event-title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Pl. Fenntarthatósági workshop"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Dátum</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="bg-background/50"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-location">Helyszín</Label>
                      <Input
                        id="event-location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Pl. Központi irodaház"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-participants">Max. résztvevők</Label>
                      <Input
                        id="max-participants"
                        type="number"
                        value={newEvent.max_participants}
                        onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) })}
                        min="1"
                        className="bg-background/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Leírás</Label>
                    <Textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Írj részletes leírást az eseményről..."
                      className="bg-background/50 min-h-[100px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Plus className="mr-2 h-4 w-4" />
                    Esemény létrehozása
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Eseményeid</h3>
              {events.length === 0 ? (
                <Card className="text-center py-12 bg-card/30">
                  <div className="text-4xl mb-4">📅</div>
                  <h4 className="text-lg font-medium text-foreground mb-2">Még nincsenek eseményeid</h4>
                  <p className="text-muted-foreground">Hozd létre az első eseményedet a fenti űrlap segítségével!</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {events.map((event) => (
                    <Card key={event.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-foreground">{event.title}</h4>
                              <Badge 
                                variant={event.status === 'published' ? 'default' : 'secondary'}
                                className={event.status === 'published' ? 'bg-success text-success-foreground' : ''}
                              >
                                {event.status === 'published' ? 'Aktív' : 'Vázlat'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{event.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(event.date).toLocaleDateString('hu-HU')}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{event.current_participants}/{event.max_participants}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Other tabs placeholder */}
          <TabsContent value="analytics" className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Elemzések fejlesztés alatt</h3>
            <p className="text-muted-foreground">Részletes statisztikák és jelentések hamarosan!</p>
          </TabsContent>

          <TabsContent value="community" className="text-center py-16">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Közösségi funkciók fejlesztés alatt</h3>
            <p className="text-muted-foreground">Kapcsolódj más szervezetekkel és ossz meg tapasztalatokat!</p>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Szervezeti beállítások</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Profil szerkesztése</span>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/profile")}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Szerkesztés
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationDashboard;

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TreePine,
  Users,
  Gift,
  Calendar,
  Sparkles,
  Trophy,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CreativeGamification = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"forest" | "events" | "teams" | "gifts">("forest");

  // Fetch user's real WellPoints data
  const { data: profile } = useQuery({
    queryKey: ['gamification-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('wellpoints_balance, current_streak, longest_streak, last_activity_date')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch real completed challenges count
  const { data: completedChallenges } = useQuery({
    queryKey: ['gamification-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('challenge_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch real events count the user has joined
  const { data: eventsJoined } = useQuery({
    queryKey: ['gamification-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const comingSoonCard = (title: string, description: string) => (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="p-8 text-center">
        <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
        <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        <Badge variant="outline" className="mt-4">
          {language === 'hu' ? 'Hamarosan' : language === 'de' ? 'Demnächst' : 'Coming Soon'}
        </Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === "forest" ? "default" : "ghost"}
          onClick={() => setSelectedTab("forest")}
          className="flex items-center space-x-2"
        >
          <TreePine className="w-4 h-4" />
          <span>{language === 'hu' ? 'Hatásom' : language === 'de' ? 'Mein Einfluss' : 'My Impact'}</span>
        </Button>
        <Button
          variant={selectedTab === "events" ? "default" : "ghost"}
          onClick={() => setSelectedTab("events")}
          className="flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'hu' ? 'Események' : language === 'de' ? 'Veranstaltungen' : 'Events'}</span>
        </Button>
        <Button
          variant={selectedTab === "teams" ? "default" : "ghost"}
          onClick={() => setSelectedTab("teams")}
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>{language === 'hu' ? 'Csapatok' : language === 'de' ? 'Teams' : 'Teams'}</span>
        </Button>
        <Button
          variant={selectedTab === "gifts" ? "default" : "ghost"}
          onClick={() => setSelectedTab("gifts")}
          className="flex items-center space-x-2"
        >
          <Gift className="w-4 h-4" />
          <span>{language === 'hu' ? 'Jutalmak' : language === 'de' ? 'Belohnungen' : 'Rewards'}</span>
        </Button>
      </div>

      {/* My Impact Tab — real data */}
      {selectedTab === "forest" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span>{language === 'hu' ? 'Az én hatásom' : language === 'de' ? 'Mein Einfluss' : 'My Impact'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'hu'
                  ? 'A fenntarthatósági tevékenységeid összefoglalója'
                  : language === 'de'
                  ? 'Zusammenfassung deiner Nachhaltigkeitsaktivitäten'
                  : 'Summary of your sustainability activities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* WellPoints */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {profile?.wellpoints_balance || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">WellPontok</div>
                  </CardContent>
                </Card>

                {/* Current Streak */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-amber-500 mb-1">
                      🔥 {profile?.current_streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'hu' ? 'Napos sorozat' : language === 'de' ? 'Tage-Serie' : 'Day streak'}
                    </div>
                  </CardContent>
                </Card>

                {/* Challenges completed */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-1">
                      <Trophy className="w-6 h-6 inline mr-1" />
                      {completedChallenges || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'hu' ? 'Kihívás teljesítve' : language === 'de' ? 'Herausforderungen' : 'Challenges done'}
                    </div>
                  </CardContent>
                </Card>

                {/* Events joined */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      <Calendar className="w-6 h-6 inline mr-1" />
                      {eventsJoined || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'hu' ? 'Esemény részvétel' : language === 'de' ? 'Teilgenommene Events' : 'Events joined'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Longest streak */}
              {(profile?.longest_streak || 0) > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center">
                  {language === 'hu'
                    ? `Leghosszabb sorozatod: ${profile?.longest_streak} nap`
                    : language === 'de'
                    ? `Längste Serie: ${profile?.longest_streak} Tage`
                    : `Your longest streak: ${profile?.longest_streak} days`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events — coming soon */}
      {selectedTab === "events" && comingSoonCard(
        language === 'hu' ? 'Szezonális események' : language === 'de' ? 'Saisonale Events' : 'Seasonal Events',
        language === 'hu'
          ? 'Hamarosan szezonális fenntarthatósági kihívásokkal bővítjük a platformot. Gyűjts extra WellPontokat közösségi események során!'
          : language === 'de'
          ? 'Bald erweitern wir die Plattform mit saisonalen Nachhaltigkeitsherausforderungen.'
          : 'Seasonal sustainability challenges are coming soon. Earn extra WellPoints during community events!'
      )}

      {/* Teams — coming soon */}
      {selectedTab === "teams" && comingSoonCard(
        language === 'hu' ? 'Csapat kihívások' : language === 'de' ? 'Team-Herausforderungen' : 'Team Challenges',
        language === 'hu'
          ? 'Alakíts csapatot barátaiddal és vegyetek részt együtt fenntarthatósági kihívásokban!'
          : language === 'de'
          ? 'Bilde ein Team mit Freunden und nehmt gemeinsam an Nachhaltigkeitsherausforderungen teil!'
          : 'Form a team with friends and take on sustainability challenges together!'
      )}

      {/* Rewards — coming soon */}
      {selectedTab === "gifts" && comingSoonCard(
        language === 'hu' ? 'WellPont beváltás' : language === 'de' ? 'WellPunkt-Einlösung' : 'WellPoints Redemption',
        language === 'hu'
          ? 'Hamarosan a WellPontjaidat valódi jutalmakra válthatod be: faültetés, ökológiai csomagok és jótékonysági adományok!'
          : language === 'de'
          ? 'Bald kannst du deine WellPunkte gegen echte Belohnungen eintauschen!'
          : 'Soon you can redeem your WellPoints for real rewards: tree planting, eco bundles, and charitable donations!'
      )}
    </div>
  );
};

export default CreativeGamification;

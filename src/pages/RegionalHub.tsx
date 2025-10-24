import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import RegionSelector, { Region } from '@/components/dynamic/RegionSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionalStakeholderMap from '@/components/matching/RegionalStakeholderMap';
import ModernRegionalVisualization from '@/components/matching/ModernRegionalVisualization';
import StakeholderFilters from '@/components/matching/StakeholderFilters';
import ChallengeSponsorshipModal from '@/components/challenges/ChallengeSponsorshipModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, 
  MapPin, 
  Users, 
  Search,
  Map,
  Target,
  Building2,
  Sprout,
  TrendingUp,
  Euro
} from 'lucide-react';
import { challenges, Challenge } from '@/data/challenges';

interface StakeholderProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  latitude: number;
  longitude: number;
  description: string;
  sustainabilityGoals: string[];
  avatar: string;
  verified: boolean;
  impactScore: number;
  isRegistered: boolean;
}

interface SponsorInfo {
  id: string;
  userId: string;
  name: string;
  logo: string;
  package: string;
  organizationId?: string;
}

interface RegionalChallenge extends Omit<Challenge, 'sponsor'> {
  region: string;
  sponsor?: SponsorInfo;
}

const RegionalHub = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(true);
  const [recentRegions, setRecentRegions] = useState<Region[]>([]);
  const [viewMode, setViewMode] = useState<'stakeholders' | 'challenges' | 'sponsorship'>('stakeholders');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['citizen', 'business', 'government', 'ngo']);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [selectedChallengeForSponsorship, setSelectedChallengeForSponsorship] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setShowRegionSelector(false);
    setRecentRegions(prev => {
      const filtered = prev.filter(r => r.id !== region.id);
      return [region, ...filtered].slice(0, 5);
    });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Generate regional stakeholders (registered + potential)
  const getRegionalStakeholders = (): StakeholderProfile[] => {
    if (!selectedRegion) return [];
    
    return [
      // Registered stakeholders
      {
        id: "1",
        name: "GreenTech Solutions",
        type: "business",
        organization: "GreenTech Solutions Kft.",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat + 0.01,
        longitude: selectedRegion.coordinates.lng + 0.01,
        description: "Megújuló energia technológiák fejlesztése.",
        sustainabilityGoals: ["Megújuló energia", "CO₂ csökkentés"],
        avatar: "🏢",
        verified: true,
        impactScore: 2450,
        isRegistered: true,
      },
      {
        id: "2",
        name: `${selectedRegion.displayName} Önkormányzat`,
        type: "government",
        organization: `${selectedRegion.displayName} Önkormányzat`,
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat - 0.01,
        longitude: selectedRegion.coordinates.lng - 0.01,
        description: "Városi fenntarthatósági programok.",
        sustainabilityGoals: ["Zöld területek", "Közlekedés"],
        avatar: "🏛️",
        verified: true,
        impactScore: 3200,
        isRegistered: true,
      },
      // Potential stakeholders (not yet registered)
      {
        id: "3",
        name: "Helyi Napelemes Projektek",
        type: "business",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat + 0.015,
        longitude: selectedRegion.coordinates.lng - 0.015,
        description: "Potenciális partner napelemes telepítésekhez.",
        sustainabilityGoals: ["Napenergia", "Energia hatékonyság"],
        avatar: "☀️",
        verified: false,
        impactScore: 0,
        isRegistered: false,
      },
      {
        id: "4",
        name: "Zöld Jövő Alapítvány",
        type: "ngo",
        organization: "Zöld Jövő Közhasznú Alapítvány",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat + 0.02,
        longitude: selectedRegion.coordinates.lng - 0.02,
        description: "Környezettudatossági oktatás.",
        sustainabilityGoals: ["Oktatás", "Közösségi kertek"],
        avatar: "🌱",
        verified: true,
        impactScore: 1850,
        isRegistered: true,
      },
      {
        id: "5",
        name: "Körforgásos Gazdaság Centrum",
        type: "business",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat - 0.02,
        longitude: selectedRegion.coordinates.lng + 0.015,
        description: "Potenciális partner újrahasznosításhoz.",
        sustainabilityGoals: ["Körforgásos gazdaság", "Újrahasznosítás"],
        avatar: "♻️",
        verified: false,
        impactScore: 0,
        isRegistered: false,
      },
    ];
  };

  // Fetch sponsorships from database
  useEffect(() => {
    if (!selectedRegion) return;

    const fetchSponsorships = async () => {
      const { data, error } = await supabase
        .from('challenge_sponsorships')
        .select(`
          *,
          profiles!challenge_sponsorships_sponsor_user_id_fkey(
            first_name,
            last_name,
            public_display_name,
            avatar_url,
            organization
          ),
          organizations(
            name,
            logo_url
          )
        `)
        .eq('region', selectedRegion.id)
        .eq('status', 'active');

      if (!error && data) {
        setSponsorships(data);
      }
    };

    fetchSponsorships();
  }, [selectedRegion]);

  // Generate regional challenges with real sponsorship data
  const getRegionalChallenges = (): RegionalChallenge[] => {
    if (!selectedRegion) return [];
    
    return challenges.slice(0, 6).map(challenge => {
      // Find sponsorship for this challenge in this region
      const sponsorship = sponsorships.find(
        s => s.challenge_id === challenge.id
      );

      let sponsor: SponsorInfo | undefined;
      
      if (sponsorship) {
        const profile = sponsorship.profiles;
        const org = sponsorship.organizations;
        
        sponsor = {
          id: sponsorship.id,
          userId: sponsorship.sponsor_user_id,
          name: org?.name || profile?.organization || profile?.public_display_name || 
                `${profile?.first_name} ${profile?.last_name}`,
          logo: org?.logo_url || profile?.avatar_url || "🏢",
          package: sponsorship.package_type,
          organizationId: sponsorship.sponsor_organization_id
        };
      }

      return {
        ...challenge,
        sponsor,
        region: selectedRegion.id,
      };
    });
  };

  const allProfiles = getRegionalStakeholders();
  const regionalChallenges = getRegionalChallenges();
  
  // Filter profiles
  let filteredProfiles = allProfiles.filter(p => selectedTypes.includes(p.type));
  
  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              {selectedRegion ? selectedRegion.displayName : 'Regionális Központ'}
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            {selectedRegion 
              ? 'Partnerek, kihívások és szponzorálási lehetőségek egy helyen'
              : 'Válassz régiót a fenntartható együttműködésekhez'
            }
          </p>
          
          {selectedRegion && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge 
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setShowRegionSelector(true)}
              >
                📍 {selectedRegion.displayName}
              </Badge>
              <Badge variant="secondary" className="bg-success/20 text-success">
                {filteredProfiles.filter(p => p.isRegistered).length} regisztrált
              </Badge>
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                {filteredProfiles.filter(p => !p.isRegistered).length} potenciális
              </Badge>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {!selectedRegion ? (
            <div className="text-center py-20">
              <Map className="w-24 h-24 mx-auto mb-6 text-primary opacity-50" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Válassz régiót
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Fedezd fel a helyi fenntarthatósági ökoszisztémát, találj partnereket és támogass regionális kezdeményezéseket.
              </p>
              <Button 
                size="lg"
                onClick={() => setShowRegionSelector(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Search className="w-5 h-5 mr-2" />
                Régió kiválasztása
              </Button>
            </div>
          ) : (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
                <TabsTrigger value="stakeholders" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Partnerek
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Kihívások
                </TabsTrigger>
                <TabsTrigger value="sponsorship" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Szponzorálás
                </TabsTrigger>
              </TabsList>

              {/* Stakeholders Tab */}
              <TabsContent value="stakeholders" className="space-y-6">
                <StakeholderFilters
                  selectedTypes={selectedTypes}
                  onTypeToggle={handleTypeToggle}
                  selectedRegion={selectedRegion.id}
                  onRegionChange={() => {}}
                  regions={[]}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  totalCount={filteredProfiles.length}
                />

                <ModernRegionalVisualization
                  stakeholders={filteredProfiles.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    organization: p.organization,
                    location: p.location,
                    region: p.region,
                    city: p.city,
                    district: p.city,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    bio: p.description,
                    sustainability_goals: p.sustainabilityGoals,
                    avatar: p.avatar,
                    impactScore: p.impactScore
                  }))}
                  onStakeholderClick={(stakeholder) => {
                    toast({
                      title: "Stakeholder kiválasztva",
                      description: stakeholder.name,
                    });
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{profile.avatar}</div>
                            <div>
                              <CardTitle className="text-base">{profile.name}</CardTitle>
                              {profile.organization && (
                                <p className="text-xs text-muted-foreground">{profile.organization}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={profile.isRegistered ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                            {profile.isRegistered ? "Regisztrált" : "Potenciális"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{profile.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {profile.sustainabilityGoals.slice(0, 2).map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Sprout className="w-3 h-3 mr-1" />
                              {goal}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full" size="sm" onClick={() => {
                          toast({
                            title: profile.isRegistered ? "Kapcsolatfelvétel" : "Meghívás küldése",
                            description: `${profile.isRegistered ? "Hamarosan" : "Meghívó küldése"} - ${profile.name}`,
                          });
                        }}>
                          {profile.isRegistered ? "Kapcsolatfelvétel" : "Meghívás küldése"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-6">
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Target className="w-12 h-12 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">Regionális Kihívások</h3>
                        <p className="text-muted-foreground">
                          Ezek a kihívások specifikusan ehhez a régióhoz kapcsolódnak. Vállalatok szponzorálhatják őket a láthatóság növelése és az ESG célok elérése érdekében.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionalChallenges.map((challenge) => (
                    <Card key={challenge.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-primary/20 text-primary">{challenge.category}</Badge>
                          <Badge variant="outline">{challenge.difficulty}</Badge>
                        </div>
                        <CardTitle className="text-lg">{t(challenge.titleKey)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {t(challenge.descriptionKey)}
                        </p>
                        
                        {challenge.sponsor ? (
                          <div 
                            className="bg-muted/50 rounded-lg p-3 mb-4 cursor-pointer hover:bg-muted transition-all group"
                            onClick={() => {
                              if (challenge.sponsor?.organizationId) {
                                navigate(`/organization/${challenge.sponsor.organizationId}`);
                              } else if (challenge.sponsor?.userId) {
                                navigate(`/profile?userId=${challenge.sponsor.userId}`);
                              }
                            }}
                          >
                            <p className="text-xs text-muted-foreground mb-1">Szponzor:</p>
                            <div className="flex items-center gap-2">
                              {challenge.sponsor.logo.startsWith('http') ? (
                                <img src={challenge.sponsor.logo} alt={challenge.sponsor.name} className="w-8 h-8 rounded object-cover" />
                              ) : (
                                <span className="text-2xl">{challenge.sponsor.logo}</span>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                                  {challenge.sponsor.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {challenge.sponsor.package} csomag
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-warning/10 rounded-lg p-3 mb-4 border border-warning/20">
                            <p className="text-xs text-warning">Még nincs szponzor</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {selectedRegion.displayName}
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {challenge.pointsReward} pont
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm" variant="outline">
                            Részletek
                          </Button>
                          {!challenge.sponsor && user && (
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => setSelectedChallengeForSponsorship({
                                id: challenge.id,
                                title: t(challenge.titleKey)
                              })}
                            >
                              Szponzorálás
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Sponsorship Tab */}
              <TabsContent value="sponsorship" className="space-y-6">
                <Card className="bg-gradient-to-r from-warning/10 to-success/10 border-warning/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Building2 className="w-12 h-12 text-warning flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">Regionális Szponzorálás</h3>
                        <p className="text-muted-foreground mb-4">
                          Támogasd a helyi fenntarthatósági kezdeményezéseket, növeld a márkaismertségedet és érj el mérhető ESG célokat.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-success/20 text-success">Márkaismertség</Badge>
                          <Badge className="bg-primary/20 text-primary">ESG jelentések</Badge>
                          <Badge className="bg-accent/20 text-accent">Közösségi hatás</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bronze Package */}
                  <Card className="border-2 border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <CardHeader>
                      <Badge className="bg-amber-500/10 text-amber-600 w-fit">Bronz</Badge>
                      <CardTitle className="text-2xl mt-2">150.000 HUF</CardTitle>
                      <p className="text-sm text-muted-foreground">500 EUR / 3 hónap</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          1 szponzorált kihívás
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Logó megjelenítés
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Havi riport
                        </li>
                      </ul>
                      <Button className="w-full">Választás</Button>
                    </CardContent>
                  </Card>

                  {/* Silver Package */}
                  <Card className="border-2 border-gray-400/20 hover:border-gray-400/40 transition-all">
                    <CardHeader>
                      <Badge className="bg-gray-400/10 text-gray-600 w-fit">Ezüst</Badge>
                      <CardTitle className="text-2xl mt-2">300.000 HUF</CardTitle>
                      <p className="text-sm text-muted-foreground">1.000 EUR / 6 hónap</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          3 szponzorált kihívás
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Kiemelt megjelenés
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Heti riport + ESG metrikák
                        </li>
                      </ul>
                      <Button className="w-full bg-gray-600 hover:bg-gray-700">Választás</Button>
                    </CardContent>
                  </Card>

                  {/* Gold Package */}
                  <Card className="border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                    <CardHeader>
                      <Badge className="bg-yellow-500/10 text-yellow-600 w-fit">Arany</Badge>
                      <CardTitle className="text-2xl mt-2">600.000 HUF</CardTitle>
                      <p className="text-sm text-muted-foreground">2.000 EUR / 12 hónap</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Korlátlan kihívások
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Exkluzív márkajelenlét
                        </li>
                        <li className="text-sm flex items-start">
                          <span className="text-success mr-2">✓</span>
                          Valós idejű analytics + dedikált support
                        </li>
                      </ul>
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        Választás
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Regionális Hatás Kalkulátor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Várható elérés</p>
                        <p className="text-2xl font-bold text-primary">5.000+</p>
                        <p className="text-xs text-muted-foreground">résztvevő/hónap</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">CO₂ megtakarítás</p>
                        <p className="text-2xl font-bold text-success">250 kg</p>
                        <p className="text-xs text-muted-foreground">átlagosan/kihívás</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Márkaismertség</p>
                        <p className="text-2xl font-bold text-accent">+35%</p>
                        <p className="text-xs text-muted-foreground">átlagos növekedés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>

      {selectedChallengeForSponsorship && (
        <ChallengeSponsorshipModal
          open={!!selectedChallengeForSponsorship}
          onOpenChange={(open) => !open && setSelectedChallengeForSponsorship(null)}
          challengeId={selectedChallengeForSponsorship.id}
          challengeTitle={selectedChallengeForSponsorship.title}
          region={selectedRegion?.id || ''}
        />
      )}

      {showRegionSelector && (
        <RegionSelector
          selectedRegion={selectedRegion}
          onRegionSelect={handleRegionSelect}
          onClose={() => setShowRegionSelector(false)}
          recentRegions={recentRegions}
          favoriteRegions={[]}
        />
      )}
    </div>
  );
};

export default RegionalHub;

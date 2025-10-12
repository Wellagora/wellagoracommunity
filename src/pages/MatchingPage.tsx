import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Layers } from "lucide-react";
import RegionalStakeholderMap from "@/components/matching/RegionalStakeholderMap";
import StakeholderFilters from "@/components/matching/StakeholderFilters";

interface MatchProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  description: string;
  compatibility: number;
  sustainabilityGoals: string[];
  recentActivity: string;
  avatar: string;
  verified: boolean;
  joinedDate: string;
  impactScore: number;
  sharedInterests: string[];
}

const MatchingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [selectedRegion, setSelectedRegion] = useState<string>("budapest");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['citizen', 'business', 'government', 'ngo']);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStakeholder, setSelectedStakeholder] = useState<MatchProfile | null>(null);
  
  const regions = [
    { id: "all", name: "Összes régió" },
    { id: "budapest", name: "Budapest" },
    { id: "pest", name: "Pest megye" },
    { id: "debrecen", name: "Debrecen" },
    { id: "szeged", name: "Szeged" },
    { id: "miskolc", name: "Miskolc" },
    { id: "pecs", name: "Pécs" },
    { id: "gyor", name: "Győr" }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Mock profiles for demonstration
  const allProfiles: MatchProfile[] = [
    {
      id: "1",
      name: "GreenTech Solutions",
      type: "business",
      organization: "GreenTech Solutions Kft.",
      location: "Budapest, V. kerület",
      region: "budapest",
      city: "Budapest",
      district: "V. kerület",
      latitude: 47.4979,
      longitude: 19.0402,
      description: "Megújuló energia technológiák fejlesztése és telepítése. Szeretnénk együttműködni helyi közösségekkel a fenntartható energia projektek megvalósításában.",
      compatibility: 92,
      sustainabilityGoals: ["Megújuló energia", "Szén-dioxid csökkentés", "Közösségi projektek"],
      recentActivity: "Új napelemes projekt indítása",
      avatar: "🏢",
      verified: true,
      joinedDate: "2023-08-15",
      impactScore: 2450,
      sharedInterests: ["Energia hatékonyság", "Klímaváltozás", "Technológiai innováció"]
    },
    {
      id: "2", 
      name: "Budapest V. kerület",
      type: "government",
      organization: "Budapest V. kerületi Önkormányzat",
      location: "Budapest, V. kerület",
      region: "budapest",
      city: "Budapest",
      district: "V. kerület",
      latitude: 47.4950,
      longitude: 19.0510,
      description: "Városi fenntarthatósági programok koordinálása. Keresünk partnereket a zöld infrastruktúra fejlesztéséhez és közösségi környezetvédelmi oktatáshoz.",
      compatibility: 88,
      sustainabilityGoals: ["Városi zöld területek", "Közlekedés optimalizálás", "Hulladékcsökkentés"],
      recentActivity: "Kerékpárút bővítési terv",
      avatar: "🏛️",
      verified: true,
      joinedDate: "2023-09-22",
      impactScore: 3200,
      sharedInterests: ["Városi tervezés", "Közösségi programok", "Környezettudatosság"]
    },
    {
      id: "3",
      name: "Zöld Jövő Alapítvány",
      type: "ngo",
      organization: "Zöld Jövő Közhasznú Alapítvány",
      location: "Debrecen, Magyarország", 
      region: "debrecen",
      city: "Debrecen",
      district: "",
      latitude: 47.5316,
      longitude: 21.6273,
      description: "Környezettudatossági oktatás és közösségi kertészkedés programok. Szervezünk workshopokat és eseményeket a fenntartható életmód népszerűsítésére.",
      compatibility: 85,
      sustainabilityGoals: ["Oktatás", "Közösségi kertek", "Biodiverzitás"],
      recentActivity: "Iskolai környezetoktatási program",
      avatar: "🌱",
      verified: true,
      joinedDate: "2023-07-10",
      impactScore: 1850,
      sharedInterests: ["Oktatás", "Természetvédelem", "Közösségi munkák"]
    },
    {
      id: "4",
      name: "Kovács Anna",
      type: "citizen",
      location: "Szeged, Magyarország",
      region: "szeged",
      city: "Szeged",
      district: "",
      latitude: 46.2530,
      longitude: 20.1414,
      description: "Környezetmérnök, aki helyi fenntarthatósági projekteket koordinál. Szeretek közösségi kertekben dolgozni és környezettudatos rendezvényeket szervezni.",
      compatibility: 78,
      sustainabilityGoals: ["Hulladék csökkentés", "Helyi termelés", "Közösségi aktivizmus"],
      recentActivity: "Szomszédsági komposztáló program indítása",
      avatar: "👩‍🔬",
      verified: false,
      joinedDate: "2023-11-03",
      impactScore: 920,
      sharedInterests: ["Kertészkedés", "Hulladékcsökkentés", "DIY projektek"]
    },
    {
      id: "5",
      name: "EcoWaste Kft.",
      type: "business",
      organization: "EcoWaste Hulladékkezelő Kft.",
      location: "Pécs, Magyarország",
      region: "pecs",
      city: "Pécs",
      district: "",
      latitude: 46.0727,
      longitude: 18.2320,
      description: "Szelektív hulladékgyűjtés és újrahasznosítás. Segítünk vállalkozásoknak és magánszemélyeknek a körforgásos gazdaság bevezetésében.",
      compatibility: 87,
      sustainabilityGoals: ["Hulladék csökkentés", "Újrahasznosítás", "Körforgásos gazdaság"],
      recentActivity: "Új komposztálási program",
      avatar: "♻️",
      verified: true,
      joinedDate: "2023-06-20",
      impactScore: 2100,
      sharedInterests: ["Hulladékkezelés", "Újrahasznosítás", "Fenntarthatóság"]
    },
    {
      id: "6",
      name: "Győr Green City",
      type: "government",
      organization: "Győr Önkormányzat",
      location: "Győr, Magyarország",
      region: "gyor",
      city: "Győr",
      district: "",
      latitude: 47.6875,
      longitude: 17.6504,
      description: "Zöld város program koordinálása. Törekszünk arra, hogy Győr az ország legzöldebb városa legyen, ehhez keresünk partnereket.",
      compatibility: 91,
      sustainabilityGoals: ["Városi zöldítés", "Energia hatékonyság", "Zöld infrastruktúra"],
      recentActivity: "Új városi park létrehozása",
      avatar: "🌳",
      verified: true,
      joinedDate: "2023-05-12",
      impactScore: 3500,
      sharedInterests: ["Városi tervezés", "Zöld infrastruktúra", "Közösségi részvétel"]
    }
  ];

  // Filter profiles
  let filteredProfiles = allProfiles;
  
  // Filter by region
  if (selectedRegion !== "all") {
    filteredProfiles = filteredProfiles.filter(p => p.region === selectedRegion);
  }
  
  // Filter by types
  filteredProfiles = filteredProfiles.filter(p => selectedTypes.includes(p.type));
  
  // Filter by search query
  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };


  if (!user) {
    return null;
  }


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Regionális Stakeholder Hálózat
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Találj együttműködő partnereket a régióban: magánszemélyek, cégek, civil szervezetek és önkormányzatok
          </p>
        </div>
          
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'map' | 'cards')} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Térkép nézet
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Lista nézet
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="mt-6">
            <StakeholderFilters
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              regions={regions}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={filteredProfiles.length}
            />
          </div>

          {/* Map View */}
          <TabsContent value="map" className="mt-6">
            <div className="h-[600px] rounded-lg overflow-hidden">
              <RegionalStakeholderMap
                stakeholders={filteredProfiles.map(p => ({
                  id: p.id,
                  name: p.name,
                  type: p.type,
                  organization: p.organization,
                  location: p.location,
                  region: p.region,
                  city: p.city,
                  district: p.district,
                  latitude: p.latitude,
                  longitude: p.longitude,
                  bio: p.description,
                  sustainability_goals: p.sustainabilityGoals,
                  avatar: p.avatar
                }))}
                onStakeholderClick={(s) => {
                  const fullProfile = filteredProfiles.find(p => p.id === s.id);
                  if (fullProfile) setSelectedStakeholder(fullProfile);
                }}
              />
            </div>
          </TabsContent>

          {/* Cards View */}
          <TabsContent value="cards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStakeholder(profile)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{profile.avatar}</div>
                        <div>
                          <CardTitle className="text-base">{profile.name}</CardTitle>
                          {profile.organization && (
                            <p className="text-xs text-muted-foreground">{profile.organization}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{profile.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.sustainabilityGoals.slice(0, 2).map((goal, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{goal}</Badge>
                      ))}
                    </div>
                    <Button className="w-full" size="sm">Kapcsolatfelvétel</Button>
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

export default MatchingPage;
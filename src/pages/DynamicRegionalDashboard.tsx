import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RegionSelector, { Region } from '@/components/dynamic/RegionSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import RegionalStakeholderMap from '@/components/matching/RegionalStakeholderMap';
import StakeholderFilters from '@/components/matching/StakeholderFilters';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  MapPin, 
  Users, 
  Search,
  Map,
  Layers,
  Building2,
  Sprout
} from 'lucide-react';

interface MatchProfile {
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
}

const DynamicRegionalDashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(!selectedRegion);
  const [recentRegions, setRecentRegions] = useState<Region[]>([]);
  const [favoriteRegions] = useState<Region[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['citizen', 'business', 'government', 'ngo']);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStakeholder, setSelectedStakeholder] = useState<MatchProfile | null>(null);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setShowRegionSelector(false);
    
    // Add to recent regions
    setRecentRegions(prev => {
      const filtered = prev.filter(r => r.id !== region.id);
      return [region, ...filtered].slice(0, 5);
    });
  };

  const handleChangeRegion = () => {
    setShowRegionSelector(true);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Mock stakeholder data based on selected region
  const getRegionalStakeholders = (): MatchProfile[] => {
    if (!selectedRegion) return [];
    
    const baseStakeholders: MatchProfile[] = [
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
        description: "Megújuló energia technológiák fejlesztése és telepítése.",
        sustainabilityGoals: ["Megújuló energia", "Szén-dioxid csökkentés"],
        avatar: "🏢",
        verified: true,
        impactScore: 2450,
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
        description: "Városi fenntarthatósági programok koordinálása.",
        sustainabilityGoals: ["Városi zöld területek", "Közlekedés optimalizálás"],
        avatar: "🏛️",
        verified: true,
        impactScore: 3200,
      },
      {
        id: "3",
        name: "Zöld Jövő Alapítvány",
        type: "ngo",
        organization: "Zöld Jövő Közhasznú Alapítvány",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat + 0.02,
        longitude: selectedRegion.coordinates.lng - 0.02,
        description: "Környezettudatossági oktatás és közösségi kertészkedés programok.",
        sustainabilityGoals: ["Oktatás", "Közösségi kertek", "Biodiverzitás"],
        avatar: "🌱",
        verified: true,
        impactScore: 1850,
      },
      {
        id: "4",
        name: "Kovács Anna",
        type: "citizen",
        location: selectedRegion.displayName,
        region: selectedRegion.id,
        city: selectedRegion.displayName,
        latitude: selectedRegion.coordinates.lat - 0.02,
        longitude: selectedRegion.coordinates.lng + 0.02,
        description: "Környezetmérnök, aki helyi fenntarthatósági projekteket koordinál.",
        sustainabilityGoals: ["Hulladék csökkentés", "Helyi termelés"],
        avatar: "👩‍🔬",
        verified: false,
        impactScore: 920,
      },
    ];

    return baseStakeholders;
  };

  const allProfiles = getRegionalStakeholders();
  
  // Filter profiles
  let filteredProfiles = allProfiles.filter(p => selectedTypes.includes(p.type));
  
  // Filter by search query
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
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center">
              {selectedRegion ? `${selectedRegion.displayName} - ${t('matching.regional_network')}` : t('matching.regional_network')}
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 text-center px-4">
            {selectedRegion 
              ? `${t('matching.find_partners_in')} ${selectedRegion.displayName}`
              : t('matching.regional_desc')
            }
          </p>
          
          {/* Region Action Button */}
          {!selectedRegion && (
            <div className="flex justify-center mb-6">
              <Button 
                onClick={() => setShowRegionSelector(true)}
                size="lg"
                className="bg-gradient-to-r from-success to-warning hover:from-success/90 hover:to-warning/90 text-white px-8 py-4 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
              >
                🌍 {t('3d_dashboard.region_select')}
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {selectedRegion && (
              <>
                <Badge 
                  className="bg-gradient-to-r from-success to-warning text-white px-4 py-2 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setShowRegionSelector(true)}
                >
                  📍 {selectedRegion.displayName}
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {filteredProfiles.length} {t('matching.stakeholders')}
                </Badge>
              </>
            )}
          </div>
        </motion.div>



        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {!selectedRegion ? (
            <div className="text-center py-12 md:py-20 px-4">
              <Users className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-6 text-primary opacity-50" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('matching.choose_region_to_start')}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('matching.select_region_find_partners')}
              </p>
              <Button 
                size="lg"
                onClick={() => setShowRegionSelector(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('3d_dashboard.region_select')}
              </Button>
            </div>
          ) : (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'map' | 'cards')} className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  {t('matching.map_view')}
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {t('matching.list_view')}
                </TabsTrigger>
              </TabsList>

              {/* Filters */}
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

              {/* Map View */}
              <TabsContent value="map" className="mt-6">
                <div className="relative rounded-2xl overflow-hidden" style={{ height: '70vh', minHeight: '500px', maxHeight: '800px' }}>
                  <RegionalStakeholderMap
                    stakeholders={filteredProfiles.map(p => ({
                      id: p.id,
                      name: p.name,
                      type: p.type,
                      organization: p.organization,
                      location: p.location,
                      region: p.region,
                      city: p.city,
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
                    center={[selectedRegion.coordinates.lat, selectedRegion.coordinates.lng]}
                    zoom={11}
                  />
                </div>
              </TabsContent>

              {/* Cards View */}
              <TabsContent value="cards" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
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
                          {profile.verified && (
                            <Badge className="bg-success/20 text-success">✓</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{profile.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {profile.sustainabilityGoals.slice(0, 3).map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Sprout className="w-3 h-3 mr-1" />
                              {goal}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {profile.city}
                          </div>
                          <div className="text-xs font-semibold text-primary">
                            {profile.impactScore} {t('points.points')}
                          </div>
                        </div>
                        <Button className="w-full" size="sm" onClick={() => {
                          toast({
                            title: t('matching.contact'),
                            description: `${t('matching.contact')} - ${profile.name}`,
                          });
                        }}>
                          {t('matching.contact')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>

        {/* Feature Overview */}
        {!selectedRegion && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <Users className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('matching.find_partners')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('matching.find_partners_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <Building2 className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('matching.local_collaboration')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('matching.local_collaboration_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <MapPin className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-success" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('matching.regional_focus')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('matching.regional_focus_desc')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Region Selector Modal */}
      {showRegionSelector && (
        <RegionSelector
          selectedRegion={selectedRegion}
          onRegionSelect={handleRegionSelect}
          onClose={() => setShowRegionSelector(false)}
          recentRegions={recentRegions}
          favoriteRegions={favoriteRegions}
        />
      )}
    </div>
  );
};

export default DynamicRegionalDashboard;
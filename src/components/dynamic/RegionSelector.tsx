import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Globe, Building2, Users, Navigation, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export interface Region {
  id: string;
  name: string;
  displayName: string;
  type: 'country' | 'state' | 'city' | 'district' | 'municipality';
  parentId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  population?: number;
  area?: number; // km²
  language: string;
  currency?: string;
  adminLevel: number;
  children?: Region[];
  thumbnail?: string;
}

interface RegionSelectorProps {
  selectedRegion: Region | null;
  onRegionSelect: (region: Region) => void;
  onClose?: () => void;
  recentRegions?: Region[];
  favoriteRegions?: Region[];
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionSelect,
  onClose,
  recentRegions = [],
  favoriteRegions = []
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Region[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hierarchyPath, setHierarchyPath] = useState<Region[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch regions from projects table
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, name, slug, region_name, villages')
          .eq('is_active', true);

        if (error) throw error;

        // Convert projects to regions format
        const projectRegions: Region[] = (projects || []).map(project => ({
          id: project.id,
          name: project.name,
          displayName: project.region_name || project.name,
          type: 'district' as const,
          coordinates: { lat: 46.9, lng: 17.7 }, // Default to Káli basin area
          language: 'hu',
          currency: 'HUF',
          adminLevel: 6,
          population: (project.villages?.length || 0) * 500, // Estimate
          area: (project.villages?.length || 0) * 15, // Estimate km²
        }));

        // Add Hungary as parent country
        const hungaryRegion: Region = {
          id: 'hungary',
          name: 'Hungary',
          displayName: 'Magyarország',
          type: 'country',
          coordinates: { lat: 47.1625, lng: 19.5033 },
          bounds: { north: 48.5853, south: 45.7370, east: 22.9060, west: 16.1139 },
          population: 9750000,
          area: 93028,
          language: 'hu',
          currency: 'HUF',
          adminLevel: 2
        };

        setRegions([hungaryRegion, ...projectRegions]);
      } catch {
        // Fallback to basic Hungary region
        setRegions([{
          id: 'hungary',
          name: 'Hungary',
          displayName: 'Magyarország',
          type: 'country',
          coordinates: { lat: 47.1625, lng: 19.5033 },
          language: 'hu',
          currency: 'HUF',
          adminLevel: 2
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const results = regions.filter(region =>
        region.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, regions]);

  const getRegionTypeIcon = (type: Region['type']) => {
    switch (type) {
      case 'country': return Globe;
      case 'state': return Building2;
      case 'city': return MapPin;
      case 'district': return Navigation;
      case 'municipality': return Users;
      default: return MapPin;
    }
  };

  const getRegionTypeColor = (type: Region['type']) => {
    switch (type) {
      case 'country': return 'text-primary border-primary bg-primary/10';
      case 'state': return 'text-accent border-accent bg-accent/10';
      case 'city': return 'text-success border-success bg-success/10';
      case 'district': return 'text-warning border-warning bg-warning/10';
      case 'municipality': return 'text-secondary border-secondary bg-secondary/10';
      default: return 'text-muted-foreground border-border bg-muted';
    }
  };

  const buildHierarchyPath = (region: Region): Region[] => {
    const path: Region[] = [];
    let current = region;
    
    while (current) {
      path.unshift(current);
      if (current.parentId) {
        current = regions.find(r => r.id === current.parentId)!;
      } else {
        break;
      }
    }
    
    return path;
  };

  const handleRegionClick = (region: Region) => {
    const path = buildHierarchyPath(region);
    setHierarchyPath(path);
    onRegionSelect(region);
  };

  const formatPopulation = (population?: number) => {
    if (!population) return 'N/A';
    if (population >= 1000000) return `${(population / 1000000).toFixed(1)}M`;
    if (population >= 1000) return `${(population / 1000).toFixed(0)}K`;
    return population.toString();
  };

  const suggestedRegions = useMemo(() => {
    const suggestions: Region[] = [];
    
    // Add favorites
    suggestions.push(...favoriteRegions);
    
    // Add recent regions
    suggestions.push(...recentRegions.filter(r => !favoriteRegions.some(f => f.id === r.id)));
    
    // Add popular regions if we need more
    if (suggestions.length < 6) {
      const popular = regions
        .filter(r => !suggestions.some(s => s.id === r.id))
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .slice(0, 6 - suggestions.length);
      suggestions.push(...popular);
    }
    
    return suggestions;
  }, [favoriteRegions, recentRegions, regions]);

  return (
    <motion.div
      className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-premium overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Select Region</h2>
              <p className="text-muted-foreground">Choose a region to visualize sustainability data</p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>

          {/* Hierarchy Breadcrumb */}
          {hierarchyPath.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/30 rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {hierarchyPath.map((region, index) => (
                <div key={region.id} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  <Badge variant="outline" className={getRegionTypeColor(region.type)}>
                    {region.displayName}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for regions (e.g., Vienna, Hietzing, Budapest...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
            {/* Search Results or Suggestions */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {searchQuery ? 'Search Results' : 'Suggested Regions'}
              </h3>
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading regions...</span>
                  </div>
                ) : (
                <AnimatePresence>
                  {(searchQuery ? searchResults : suggestedRegions).map((region, index) => {
                    const IconComponent = getRegionTypeIcon(region.type);
                    return (
                      <motion.div
                        key={region.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md border ${
                            selectedRegion?.id === region.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleRegionClick(region)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border ${getRegionTypeColor(region.type)}`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{region.displayName}</div>
                                  <div className="text-sm text-muted-foreground capitalize">
                                    {region.type}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-foreground">
                                  {formatPopulation(region.population)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {region.area ? `${region.area.toFixed(0)} km²` : ''}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                )}
              </div>
            </div>

            {/* Region Preview */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Region Preview</h3>
              {selectedRegion ? (
                <Card className="border-primary bg-primary/5">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xl font-bold text-primary">{selectedRegion.displayName}</h4>
                          <Badge variant="outline" className={getRegionTypeColor(selectedRegion.type)}>
                            {selectedRegion.type}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Population: {formatPopulation(selectedRegion.population)}</div>
                          {selectedRegion.area && <div>Area: {selectedRegion.area.toFixed(0)} km²</div>}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Language</div>
                          <div className="font-medium">{selectedRegion.language.toUpperCase()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Currency</div>
                          <div className="font-medium">{selectedRegion.currency || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Coordinates</div>
                          <div className="font-medium text-xs">
                            {selectedRegion.coordinates.lat.toFixed(4)}, {selectedRegion.coordinates.lng.toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Admin Level</div>
                          <div className="font-medium">{selectedRegion.adminLevel}</div>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        onClick={() => onRegionSelect(selectedRegion)}
                      >
                        Load {selectedRegion.displayName}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a region to see preview</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </motion.div>
    </motion.div>
  );
};

export default RegionSelector;
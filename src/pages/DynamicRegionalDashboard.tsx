import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RegionSelector, { Region } from '@/components/dynamic/RegionSelector';
import Enhanced3DDashboard from '@/components/enhanced/Enhanced3DDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, 
  MapPin, 
  Zap, 
  Users, 
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Search
} from 'lucide-react';

const DynamicRegionalDashboard = () => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showRegionSelector, setShowRegionSelector] = useState(!selectedRegion);
  const [recentRegions, setRecentRegions] = useState<Region[]>([]);
  const [favoriteRegions] = useState<Region[]>([]);

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
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              {selectedRegion ? `${selectedRegion.displayName} - Fenntarthatóság` : "Dynamic Regional Orchestrator"}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            {selectedRegion 
              ? `Fedezd fel ${selectedRegion.displayName} fenntarthatósági ökoszisztémáját 3D-ben`
              : "Válassz egy régiót és fedezd fel a fenntarthatóság lehetőségeit AI-powered elemzésekkel"
            }
          </p>
          
          {/* Region Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              onClick={() => setShowRegionSelector(true)}
              size="lg"
              className="bg-gradient-to-r from-success to-warning hover:from-success/90 hover:to-warning/90 text-white px-8 py-4 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              🌍 {selectedRegion ? "Régió Váltása" : "Régió Kiválasztása"}
            </Button>
            {selectedRegion && (
              <Button 
                onClick={() => handleChangeRegion()}
                variant="outline"
                size="lg"
                className="border-2 border-success hover:bg-success hover:text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
              >
                🔄 Másik Régió Böngészése
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {selectedRegion && (
              <Badge className="bg-gradient-to-r from-success to-warning text-white px-4 py-2">
                🌍 {selectedRegion.displayName} • {selectedRegion.population?.toLocaleString() || "N/A"} lakos • {selectedRegion.area?.toFixed(0) || "N/A"} km²
              </Badge>
            )}
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              3D Visualization
            </Badge>
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              Real-time Data
            </Badge>
            <Badge variant="secondary" className="bg-success/20 text-success">
              AI-Powered Matching
            </Badge>
            <Badge variant="secondary" className="bg-warning/20 text-warning">
              Global Coverage
            </Badge>
          </div>
        </motion.div>

        {/* Quick Actions Bar */}
        {selectedRegion && (
          <motion.div
            className="flex items-center justify-between mb-6 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold text-foreground">{selectedRegion.displayName}</div>
                <div className="text-sm text-muted-foreground capitalize">{selectedRegion.type}</div>
              </div>
              <Badge variant="outline">{selectedRegion.language.toUpperCase()}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleChangeRegion}>
                <Search className="w-4 h-4 mr-2" />
                Change Region
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recent Regions */}
        {recentRegions.length > 0 && !showRegionSelector && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recentRegions.map((region) => (
                    <Button
                      key={region.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegionSelect(region)}
                      className={selectedRegion?.id === region.id ? 'bg-primary/10 border-primary' : ''}
                    >
                      {region.displayName}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {!selectedRegion ? (
            <div className="text-center py-20">
              <Globe className="w-24 h-24 mx-auto mb-6 text-primary opacity-50" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Choose Your Region
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Select any region worldwide to visualize sustainability data, stakeholder networks, 
                and real-time environmental metrics in an interactive 3D environment.
              </p>
              <Button 
                size="lg"
                onClick={() => setShowRegionSelector(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Search className="w-5 h-5 mr-2" />
                Select Region
              </Button>
            </div>
          ) : (
            <ModernDashboard3D />
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
            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Explore any region from countries to districts with dynamic data loading 
                  and adaptive visualization levels.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
                <p className="text-muted-foreground">
                  Live data integration with weather, air quality, energy consumption, 
                  and sustainability metrics updating in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-success" />
                <h3 className="text-xl font-semibold mb-3">Smart Stakeholders</h3>
                <p className="text-muted-foreground">
                  AI-powered stakeholder detection and matching based on regional 
                  characteristics, culture, and administrative structures.
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
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RegionSelector, { Region } from '@/components/dynamic/RegionSelector';
import ModernDashboard3D from '@/components/enhanced/ModernDashboard3D';
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center">
              {selectedRegion ? `${selectedRegion.displayName} - ${t('3d_dashboard.sustainability')}` : t('3d_dashboard.title')}
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 text-center px-4">
            {selectedRegion 
              ? `${t('3d_dashboard.explore_ecosystem').replace('{region}', selectedRegion.displayName)}`
              : t('3d_dashboard.select_region_desc')
            }
          </p>
          
          {/* Region Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              onClick={() => setShowRegionSelector(true)}
              size="lg"
              className="bg-gradient-to-r from-success to-warning hover:from-success/90 hover:to-warning/90 text-white px-8 py-4 rounded-2xl font-semibold shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              🌍 {selectedRegion ? t('3d_dashboard.region_change') : t('3d_dashboard.region_select')}
            </Button>
            {selectedRegion && (
              <Button 
                onClick={() => handleChangeRegion()}
                variant="outline"
                size="lg"
                className="border-2 border-success hover:bg-success hover:text-white px-6 md:px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
              >
                🔄 {t('3d_dashboard.browse_another')}
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
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-semibold text-foreground">{selectedRegion.displayName}</div>
                <div className="text-sm text-muted-foreground capitalize">{selectedRegion.type}</div>
              </div>
              <Badge variant="outline">{selectedRegion.language.toUpperCase()}</Badge>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleChangeRegion} className="flex-1 md:flex-none">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('nav.change_region')}</span>
                <span className="sm:hidden">{t('3d_dashboard.region_change')}</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('nav.refresh')}
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
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t('nav.recent_regions')}
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
            <div className="text-center py-12 md:py-20 px-4">
              <Globe className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-6 text-primary opacity-50" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('3d_dashboard.choose_your_region')}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('3d_dashboard.select_region_info')}
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
              <CardContent className="p-4 md:p-6">
                <Globe className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('3d_dashboard.global_coverage')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('3d_dashboard.global_coverage_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 md:p-6">
                <Zap className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('3d_dashboard.real_time_analytics')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('3d_dashboard.real_time_analytics_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 md:p-6">
                <Users className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 text-success" />
                <h3 className="text-lg md:text-xl font-semibold mb-3">{t('3d_dashboard.smart_stakeholders')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('3d_dashboard.smart_stakeholders_desc')}
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
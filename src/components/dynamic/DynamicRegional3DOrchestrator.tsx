import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Region } from './RegionSelector';
import { regionDataService, RegionalData, StakeholderData } from '@/services/RegionDataService';
import { 
  Globe, 
  MapPin, 
  Users, 
  Building2, 
  Zap, 
  Leaf,
  TrendingUp,
  Eye,
  EyeOff,
  Settings,
  Loader2,
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react';

interface DynamicStakeholder3DProps {
  stakeholder: StakeholderData;
  position: [number, number, number];
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const DynamicStakeholder3D: React.FC<DynamicStakeholder3DProps> = ({
  stakeholder,
  position,
  selected,
  hovered,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const getStakeholderColor = (type: StakeholderData['type'], impactScore: number) => {
    const intensity = impactScore / 100;
    const colors = {
      municipality: new THREE.Color(0x2563EB).lerp(new THREE.Color(0x60A5FA), intensity),
      business: new THREE.Color(0xF97316).lerp(new THREE.Color(0xFB923C), intensity),
      ngo: new THREE.Color(0x10B981).lerp(new THREE.Color(0x34D399), intensity),
      citizen: new THREE.Color(0x8B5CF6).lerp(new THREE.Color(0xA78BFA), intensity),
      educational: new THREE.Color(0x06B6D4).lerp(new THREE.Color(0x67E8F9), intensity),
      government: new THREE.Color(0xDC2626).lerp(new THREE.Color(0xF87171), intensity)
    };
    return colors[type];
  };

  const getStakeholderHeight = (impactScore: number) => {
    return 0.5 + (impactScore / 100) * 3;
  };

  const getStakeholderShape = (type: StakeholderData['type']) => {
    switch (type) {
      case 'municipality':
      case 'government':
        return 'box'; // Government buildings as rectangular
      case 'business':
        return 'cylinder'; // Business as cylindrical towers
      case 'educational':
        return 'cone'; // Educational as distinctive cones
      default:
        return 'sphere'; // NGOs and citizens as spheres
    }
  };

  const color = getStakeholderColor(stakeholder.type, stakeholder.impactScore);
  const height = getStakeholderHeight(stakeholder.impactScore);
  const shape = getStakeholderShape(stakeholder.type);
  const scale = hovered ? 1.1 : selected ? 1.05 : 1;

  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        scale={[scale, scale, scale]}
      >
        {shape === 'box' && <boxGeometry args={[0.8, height, 0.8]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[0.4, 0.4, height, 8]} />}
        {shape === 'cone' && <coneGeometry args={[0.5, height, 6]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.4 + height * 0.1]} />}
        
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered || selected ? 0.9 : 0.7}
          roughness={0.3}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.2 : selected ? 0.1 : 0.05}
        />
      </mesh>

      {/* Impact indicator ring */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Connection points */}
      {stakeholder.connections.map((connectionId, index) => (
        <mesh key={connectionId} position={[0, height + 0.2, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

interface DynamicRegional3DOrchestratorProps {
  selectedRegion: Region | null;
  onRegionChange?: (region: Region | null) => void;
}

const DynamicRegional3DOrchestrator: React.FC<DynamicRegional3DOrchestratorProps> = ({
  selectedRegion,
  onRegionChange
}) => {
  const { t } = useLanguage();
  const [regionalData, setRegionalData] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderData | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const cameraRef = useRef<THREE.Camera>();

  // Load regional data when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setRegionalData(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await regionDataService.fetchRegionalData(selectedRegion);
        setRegionalData(data);
        setSelectedStakeholder(null);
        adjustCameraForRegion(selectedRegion);
      } catch {
        // Silent failure - regional data load is non-critical
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedRegion]);

  // Real-time data updates
  useEffect(() => {
    if (!realTimeUpdates || !selectedRegion) return;

    const interval = setInterval(async () => {
      try {
        const weatherData = await regionDataService.getWeatherData(selectedRegion);
        setRegionalData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            realTimeData: {
              ...prev.realTimeData,
              temperature: weatherData.temperature,
              airQuality: weatherData.airQuality
            }
          };
        });
      } catch {
        // Silent failure - real-time update is non-critical
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates, selectedRegion]);

  const adjustCameraForRegion = (region: Region) => {
    if (!cameraRef.current) return;

    // Adjust camera distance based on region type
    const distances = {
      country: 50,
      state: 30,
      city: 20,
      district: 15,
      municipality: 10
    };

    const distance = distances[region.type] || 20;
    
    // Animate camera to new position
    // In real implementation, use camera animation library
  };

  const generateStakeholderPositions = (stakeholders: StakeholderData[], region: Region) => {
    const bounds = region.bounds || {
      north: region.coordinates.lat + 0.1,
      south: region.coordinates.lat - 0.1,
      east: region.coordinates.lng + 0.1,
      west: region.coordinates.lng - 0.1
    };

    const mapSize = viewMode === 'detailed' ? 20 : 10;

    return stakeholders.map(stakeholder => {
      // Convert lat/lng to 3D world coordinates
      const x = ((stakeholder.coordinates.lng - bounds.west) / (bounds.east - bounds.west) - 0.5) * mapSize;
      const z = ((stakeholder.coordinates.lat - bounds.south) / (bounds.north - bounds.south) - 0.5) * mapSize;
      const y = stakeholder.impactScore / 100 * 2;

      return { stakeholder, position: [x, y, z] as [number, number, number] };
    });
  };

  const stakeholderPositions = useMemo(() => {
    if (!regionalData) return [];
    return generateStakeholderPositions(regionalData.stakeholders, regionalData.region);
  }, [regionalData, viewMode]);

  const connectionLines = useMemo(() => {
    if (!showConnections || !regionalData) return [];

    const lines: Array<{ start: THREE.Vector3; end: THREE.Vector3; strength: number }> = [];
    
    stakeholderPositions.forEach(({ stakeholder, position }) => {
      stakeholder.connections.forEach(connectionId => {
        const connectedStakeholder = stakeholderPositions.find(
          ({ stakeholder: s }) => s.id === connectionId
        );
        if (connectedStakeholder) {
          const strength = (stakeholder.impactScore + connectedStakeholder.stakeholder.impactScore) / 200;
          lines.push({
            start: new THREE.Vector3(...position),
            end: new THREE.Vector3(...connectedStakeholder.position),
            strength
          });
        }
      });
    });

    return lines;
  }, [stakeholderPositions, showConnections, regionalData]);

  if (!selectedRegion) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Region Selected</h3>
          <p className="text-muted-foreground">Select a region to visualize sustainability data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Region Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                {selectedRegion.displayName}
                <Badge variant="outline" className="capitalize">
                  {selectedRegion.type}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRegion.population ? `${(selectedRegion.population / 1000000).toFixed(1)}M residents` : ''} 
                {selectedRegion.area && ` • ${selectedRegion.area.toFixed(0)} km²`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={realTimeUpdates ? 'bg-success/10 border-success text-success' : ''}
              >
                {realTimeUpdates ? <Activity className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Real-time
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              >
                {viewMode === 'overview' ? 'Detailed' : 'Overview'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {regionalData && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{regionalData.metrics.co2Reduction}%</div>
                <div className="text-sm text-muted-foreground">CO₂ Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{regionalData.stakeholders.length}</div>
                <div className="text-sm text-muted-foreground">Stakeholders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{regionalData.challenges.length}</div>
                <div className="text-sm text-muted-foreground">Active Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{regionalData.realTimeData.temperature}°C</div>
                <div className="text-sm text-muted-foreground">Temperature</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 3D Visualization */}
      <div className="relative">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full h-[600px] relative bg-gradient-to-br from-primary/5 to-accent/5">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Loading {selectedRegion.displayName}...</p>
                  </div>
                </div>
              ) : (
                <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
                  <ambientLight intensity={0.6} />
                  <pointLight position={[20, 20, 20]} intensity={1.2} />
                  <directionalLight position={[10, 10, 10]} intensity={0.8} />

                  {/* Ground plane */}
                  <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[30, 30]} />
                    <meshStandardMaterial 
                      color="#f8fafc" 
                      transparent 
                      opacity={0.8}
                      roughness={0.8}
                    />
                  </mesh>

                  {/* Region boundary visualization */}
                  <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[8, 10, 32]} />
                    <meshBasicMaterial color="#2563EB" transparent opacity={0.2} />
                  </mesh>

                  {/* Stakeholders */}
                  {stakeholderPositions.map(({ stakeholder, position }) => (
                    <DynamicStakeholder3D
                      key={stakeholder.id}
                      stakeholder={stakeholder}
                      position={position}
                      selected={selectedStakeholder?.id === stakeholder.id}
                      hovered={hoveredStakeholder === stakeholder.id}
                      onClick={() => setSelectedStakeholder(stakeholder)}
                      onPointerOver={() => setHoveredStakeholder(stakeholder.id)}
                      onPointerOut={() => setHoveredStakeholder(null)}
                    />
                  ))}

                  {/* Connection lines */}
                  {connectionLines.map((line, index) => (
                    <primitive
                      key={index}
                      object={
                        new THREE.Line(
                          new THREE.BufferGeometry().setFromPoints([line.start, line.end]),
                          new THREE.LineBasicMaterial({
                            color: new THREE.Color().lerpColors(
                              new THREE.Color(0x2563EB),
                              new THREE.Color(0xF97316),
                              line.strength
                            ),
                            transparent: true,
                            opacity: 0.4
                          })
                        )
                      }
                    />
                  ))}

                  {/* Labels */}
                  {showLabels && stakeholderPositions.map(({ stakeholder, position }) => (
                    <Text
                      key={`label-${stakeholder.id}`}
                      position={[position[0], position[1] + 2, position[2]]}
                      fontSize={0.3}
                      color="#ffffff"
                      anchorX="center"
                      anchorY="middle"
                      outlineWidth={0.02}
                      outlineColor="#000000"
                    >
                      {stakeholder.name}
                    </Text>
                  ))}

                  <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={8}
                    maxDistance={50}
                  />
                </Canvas>
              )}

              {/* Control Overlay */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-lg p-3 rounded-lg border shadow-lg">
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConnections(!showConnections)}
                    className={showConnections ? 'bg-primary/10' : ''}
                  >
                    {showConnections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Connections
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLabels(!showLabels)}
                    className={showLabels ? 'bg-primary/10' : ''}
                  >
                    {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Labels
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Stakeholder Details */}
      <AnimatePresence>
        {selectedStakeholder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {selectedStakeholder.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {selectedStakeholder.type}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedStakeholder.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStakeholder(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {selectedStakeholder.impactScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Impact Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {selectedStakeholder.challengesActive}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Challenges</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {selectedStakeholder.co2Reduction}kg
                    </div>
                    <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">
                      {selectedStakeholder.connections.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Connections</div>
                  </div>
                </div>

                <Separator className="mb-4" />

                <p className="text-muted-foreground mb-4">{selectedStakeholder.description}</p>

                <div className="flex gap-2">
                  {selectedStakeholder.website && (
                    <Button variant="outline" size="sm">
                      Visit Website
                    </Button>
                  )}
                  <Button size="sm">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Metrics */}
      {regionalData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Sustainability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(regionalData.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                Real-time Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Air Quality</span>
                <span className="font-medium">{regionalData.realTimeData.airQuality}%</span>
              </div>
              <div className="flex justify-between">
                <span>Energy Use</span>
                <span className="font-medium">{regionalData.realTimeData.energyConsumption} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Traffic</span>
                <span className="font-medium">{regionalData.realTimeData.trafficDensity}%</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature</span>
                <span className="font-medium">{regionalData.realTimeData.temperature}°C</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Stakeholders</span>
                <span className="font-medium">{regionalData.stakeholders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Challenges</span>
                <span className="font-medium">{regionalData.challenges.filter(c => c.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Impact Score</span>
                <span className="font-medium">
                  {Math.round(regionalData.stakeholders.reduce((acc, s) => acc + s.impactScore, 0) / regionalData.stakeholders.length)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total CO₂ Saved</span>
                <span className="font-medium">
                  {(regionalData.stakeholders.reduce((acc, s) => acc + s.co2Reduction, 0) / 1000).toFixed(1)}t
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DynamicRegional3DOrchestrator;
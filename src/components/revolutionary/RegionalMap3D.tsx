import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RegionalData {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  impactScore: number;
  challengesActive: number;
  stakeholders: number;
  co2Reduction: number;
  type: 'municipality' | 'business' | 'ngo' | 'citizen';
}

interface CityBlockProps {
  position: [number, number, number];
  color: string;
  height: number;
  onClick: () => void;
  hovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const CityBlock: React.FC<CityBlockProps> = ({ 
  position, 
  color, 
  height, 
  onClick, 
  hovered, 
  onPointerOver, 
  onPointerOut 
}) => {
  return (
    <mesh
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial 
        color={hovered ? '#FB923C' : color}
        transparent
        opacity={hovered ? 0.9 : 0.7}
      />
    </mesh>
  );
};

const ConnectionLine: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; active: boolean }> = ({ 
  start, 
  end, 
  active 
}) => {
  const points = useMemo(() => [start, end], [start, end]);
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);
  
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: active ? '#FB923C' : '#2563EB',
      transparent: true,
      opacity: active ? 0.8 : 0.4
    }))} />
  );
};

const RegionalHeatmap: React.FC<{ data: RegionalData[] }> = ({ data }) => {
  return (
    <>
      {data.map((region, index) => (
        <mesh key={region.id} position={[region.x, -0.1, region.y]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial 
            color={region.impactScore > 70 ? '#10B981' : region.impactScore > 40 ? '#FB923C' : '#EF4444'}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  );
};

const RegionalMap3D: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionalData | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);

  const mockRegionalData: RegionalData[] = [
    {
      id: 'vienna-center',
      name: 'Vienna Center',
      x: 0,
      y: 0,
      z: 0,
      impactScore: 87,
      challengesActive: 15,
      stakeholders: 245,
      co2Reduction: 2340,
      type: 'municipality'
    },
    {
      id: 'district-2',
      name: 'Leopoldstadt',
      x: 3,
      y: 0,
      z: 2,
      impactScore: 64,
      challengesActive: 8,
      stakeholders: 156,
      co2Reduction: 1820,
      type: 'business'
    },
    {
      id: 'district-3', 
      name: 'Landstraße',
      x: -2,
      y: 0,
      z: -1,
      impactScore: 72,
      challengesActive: 12,
      stakeholders: 189,
      co2Reduction: 2100,
      type: 'ngo'
    },
    {
      id: 'district-4',
      name: 'Wieden',
      x: 1,
      y: 0,
      z: -3,
      impactScore: 56,
      challengesActive: 6,
      stakeholders: 98,
      co2Reduction: 980,
      type: 'citizen'
    }
  ];

  const getRegionColor = (type: RegionalData['type']) => {
    switch (type) {
      case 'municipality': return '#2563EB';
      case 'business': return '#FB923C';
      case 'ngo': return '#10B981';
      case 'citizen': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const connectionPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < mockRegionalData.length; i++) {
      for (let j = i + 1; j < mockRegionalData.length; j++) {
        const region1 = mockRegionalData[i];
        const region2 = mockRegionalData[j];
        pairs.push({
          start: new THREE.Vector3(region1.x, region1.impactScore / 20, region1.y),
          end: new THREE.Vector3(region2.x, region2.impactScore / 20, region2.y),
          active: (region1.impactScore + region2.impactScore) / 2 > 65
        });
      }
    }
    return pairs;
  }, []);

  return (
    <div className="w-full h-[600px] relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        {/* Ground plane */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.8} />
        </mesh>

        {/* Regional heatmap */}
        <RegionalHeatmap data={mockRegionalData} />

        {/* City blocks */}
        {mockRegionalData.map((region) => (
          <CityBlock
            key={region.id}
            position={[region.x, region.impactScore / 20, region.y]}
            color={getRegionColor(region.type)}
            height={region.impactScore / 20}
            hovered={hoveredRegion === region.id}
            onPointerOver={() => setHoveredRegion(region.id)}
            onPointerOut={() => setHoveredRegion(null)}
            onClick={() => setSelectedRegion(region)}
          />
        ))}

        {/* Connection lines */}
        {showConnections && connectionPairs.map((connection, index) => (
          <ConnectionLine
            key={index}
            start={connection.start}
            end={connection.end}
            active={connection.active}
          />
        ))}

        {/* Region labels */}
        {mockRegionalData.map((region) => (
          <Text
            key={`label-${region.id}`}
            position={[region.x, region.impactScore / 20 + 1, region.y]}
            fontSize={0.3}
            color="#1f2937"
            anchorX="center"
            anchorY="middle"
          >
            {region.name}
          </Text>
        ))}

        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>

      {/* Regional progress indicator */}
      <motion.div 
        className="absolute top-6 left-6 bg-card/95 backdrop-blur-lg p-4 rounded-xl border-2 border-primary/20 shadow-glow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-primary mb-2">Vienna CO₂ Reduction</h3>
        <div className="flex items-center gap-3">
          <Progress value={67} className="w-32" />
          <Badge variant="default" className="bg-primary text-primary-foreground">67% Complete</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Regional Goal: 15% reduction by 2025</p>
      </motion.div>

      {/* Control panel */}
      <motion.div 
        className="absolute top-6 right-6 bg-card/95 backdrop-blur-lg p-4 rounded-xl border-2 border-primary/20 shadow-glow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showConnections 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {showConnections ? 'Hide' : 'Show'} Connections
          </button>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span>Municipality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent"></div>
              <span>Business</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success"></div>
              <span>NGO</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected region popup */}
      {selectedRegion && (
        <motion.div 
          className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-lg p-6 rounded-xl border-2 border-primary/20 shadow-premium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-primary">{selectedRegion.name}</h3>
              <Badge variant="outline" className="mt-1 capitalize">{selectedRegion.type}</Badge>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="text-2xl font-bold text-primary">{selectedRegion.impactScore}%</div>
              <div className="text-sm text-muted-foreground">Impact Score</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-accent">{selectedRegion.challengesActive}</div>
              <div className="text-sm text-muted-foreground">Active Challenges</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-success">{selectedRegion.stakeholders}</div>
              <div className="text-sm text-muted-foreground">Stakeholders</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-primary">{selectedRegion.co2Reduction}kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved</div>
            </Card>
          </div>
          
          <motion.button
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-dark transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Regional Challenges
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default RegionalMap3D;
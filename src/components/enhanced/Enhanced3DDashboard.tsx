import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  MapPin, 
  Target, 
  Zap, 
  Leaf, 
  TrendingUp,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  Filter,
  Search
} from 'lucide-react';

interface StakeholderData {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'ngo' | 'citizen';
  position: [number, number, number];
  impactScore: number;
  connections: string[];
  matchScore?: number;
  isMatch?: boolean;
  description: string;
  projects: number;
  co2Saved: number;
}

interface GuildMember {
  id: string;
  name: string;
  avatar: string;
  type: string;
  status: 'online' | 'offline';
  points: number;
}

const AnimatedBuilding: React.FC<{
  position: [number, number, number];
  data: StakeholderData;
  selected: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ position, data, selected, onSelect, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      if (selected) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + position[1];
      }
    }
  });

  const getColor = () => {
    if (data.isMatch) return '#FB923C';
    switch (data.type) {
      case 'municipality': return '#3B82F6';
      case 'business': return '#F97316';
      case 'ngo': return '#10B981';
      case 'citizen': return '#A855F7';
      default: return '#6B7280';
    }
  };

  const height = Math.max(0.5, data.impactScore / 20);

  return (
    <group position={position}>
      {/* Main building */}
      <mesh
        ref={meshRef}
        onClick={onSelect}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <cylinderGeometry args={[0.8, 1.2, height, 8]} />
        <meshStandardMaterial 
          color={getColor()}
          transparent
          opacity={selected ? 0.9 : 0.7}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Glow effect */}
      {data.isMatch && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[2, 2, 0.1, 16]} />
          <meshBasicMaterial 
            color="#FB923C"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {data.name}
      </Text>

      {/* Match indicator */}
      {data.isMatch && (
        <Html position={[0, height + 1, 0]} center>
          <div className="bg-gradient-to-r from-primary to-accent text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            {data.matchScore}% Match
          </div>
        </Html>
      )}
    </group>
  );
};

const ConnectionLine: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  active: boolean;
}> = ({ start, end, active }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = active ? 0.8 : 0.3;
    }
  });

  const points = useMemo(() => [start, end], [start, end]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <primitive 
      ref={lineRef}
      object={new THREE.Line(
        geometry, 
        new THREE.LineBasicMaterial({
          color: active ? '#FB923C' : '#3B82F6',
          transparent: true,
          opacity: active ? 0.8 : 0.3
        })
      )} 
    />
  );
};

const Enhanced3DDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderData | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [showMatches, setShowMatches] = useState(true);
  const [viewMode, setViewMode] = useState<'network' | 'matches'>('network');

  // Mock data with matching information
  const stakeholders: StakeholderData[] = useMemo(() => [
    {
      id: '1',
      name: 'Vienna Center',
      type: 'municipality',
      position: [0, 0, 0],
      impactScore: 87,
      connections: ['2', '3'],
      matchScore: 92,
      isMatch: true,
      description: 'Smart city initiatives and renewable energy projects',
      projects: 15,
      co2Saved: 2340
    },
    {
      id: '2',
      name: 'GreenTech Ltd',
      type: 'business',
      position: [4, 0, 3],
      impactScore: 64,
      connections: ['1', '4'],
      matchScore: 88,
      isMatch: true,
      description: 'Renewable energy technology development',
      projects: 8,
      co2Saved: 1820
    },
    {
      id: '3',
      name: 'EcoFuture NGO',
      type: 'ngo',
      position: [-3, 0, -2],
      impactScore: 72,
      connections: ['1', '5'],
      matchScore: 85,
      isMatch: true,
      description: 'Environmental education and community gardens',
      projects: 12,
      co2Saved: 2100
    },
    {
      id: '4',
      name: 'Local Citizens',
      type: 'citizen',
      position: [2, 0, -4],
      impactScore: 56,
      connections: ['2'],
      description: 'Community sustainability initiatives',
      projects: 6,
      co2Saved: 980
    },
    {
      id: '5',
      name: 'District Council',
      type: 'municipality',
      position: [-4, 0, 2],
      impactScore: 78,
      connections: ['3'],
      matchScore: 78,
      isMatch: true,
      description: 'Urban planning and green infrastructure',
      projects: 11,
      co2Saved: 1950
    }
  ], []);

  const guildMembers: GuildMember[] = useMemo(() => [
    { id: '1', name: 'Guilds', avatar: '🏛️', type: '22563FB', status: 'online', points: 2450 },
    { id: '2', name: 'Bluent', avatar: '🔧', type: 'Tobla argod', status: 'online', points: 1830 },
    { id: '3', name: 'Soreflores', avatar: '🌱', type: '230', status: 'online', points: 1650 },
    { id: '4', name: 'Dirtess', avatar: '💎', type: '856', status: 'offline', points: 980 },
    { id: '5', name: 'Realermene', avatar: '🔄', type: '74L', status: 'online', points: 2100 }
  ], []);

  const matches = stakeholders.filter(s => s.isMatch);
  const connections = useMemo(() => {
    const lines = [];
    for (const stakeholder of stakeholders) {
      for (const connectionId of stakeholder.connections) {
        const connected = stakeholders.find(s => s.id === connectionId);
        if (connected) {
          lines.push({
            start: new THREE.Vector3(...stakeholder.position),
            end: new THREE.Vector3(...connected.position),
            active: stakeholder.isMatch || connected.isMatch
          });
        }
      }
    }
    return lines;
  }, [stakeholders]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <div className="text-2xl font-bold text-white">Guildap</div>
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
            {t('3d_dashboard.title')}
          </Badge>
        </div>
      </div>

      {/* Guild System Sidebar */}
      <motion.div 
        className="absolute left-6 top-24 w-80 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {t('3d_dashboard.guild_system')}
          </h3>
          
          <div className="space-y-3">
            {guildMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    <div className="text-white font-medium">{member.name}</div>
                    <div className="text-gray-400 text-sm">{member.type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-gray-300 text-sm">{member.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Predictive Impact Panel */}
      <motion.div 
        className="absolute right-6 top-24 w-80 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {t('3d_dashboard.predictive_impact')}
          </h3>

          {/* Analytics Chart Placeholder */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-4">
            <div className="text-white text-sm mb-2">Vogren Ruuaris</div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="text-blue-300 text-xs">Welas Halos</div>
                <div className="h-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded mt-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-green-300 text-xs">Arinose Etude Contmame</div>
                <div className="h-8 bg-gradient-to-t from-green-500 to-green-300 rounded mt-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Circular Economy */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{t('3d_dashboard.circular_economy')}</span>
              <Badge variant="outline" className="border-white/20 text-white">
                4F923C
              </Badge>
            </div>
            <div className="text-gray-400 text-sm">{t('3d_dashboard.resource_annotation')}</div>
            <div className="text-gray-300 text-xs mt-1">Mintauiues</div>
            <Button size="sm" className="mt-2 bg-slate-700 hover:bg-slate-600 text-white">
              Stokne
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Floating Match Tooltips */}
      <AnimatePresence>
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${30 + (index * 15)}%`,
              top: `${40 + (index * 8)}%`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2">
              <div className="text-lg">{match.type === 'municipality' ? '🏛️' : match.type === 'business' ? '🏢' : '🌱'}</div>
              <div>
                <div className="font-medium text-sm">
                  {match.type === 'municipality' ? t('3d_dashboard.municipality') : 
                   match.type === 'business' ? t('3d_dashboard.local_business') : 'NGO'} + 
                </div>
                <div className="text-xs opacity-90">= {t('3d_dashboard.perfect_match')}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CO2 Reduction Progress */}
      <motion.div 
        className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-6 py-4 z-10"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center space-x-4">
          <Leaf className="w-6 h-6 text-green-400" />
          <div>
            <div className="text-white font-bold">Vienna {t('3d_dashboard.co2_reduction')}: 67% {t('3d_dashboard.complete')}</div>
            <Progress value={67} className="w-64 mt-2" />
          </div>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <Canvas className="absolute inset-0">
        <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={60} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#87CEEB" />
        
        {/* Ground */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial 
            color="#1e293b" 
            transparent 
            opacity={0.8}
            roughness={0.8}
          />
        </mesh>

        {/* Grid pattern */}
        <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial 
            color="#334155" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>

        {/* Stakeholder buildings */}
        {stakeholders.map((stakeholder) => (
          <AnimatedBuilding
            key={stakeholder.id}
            position={stakeholder.position}
            data={stakeholder}
            selected={selectedStakeholder?.id === stakeholder.id}
            onSelect={() => setSelectedStakeholder(stakeholder)}
            onHover={(hovered) => setHoveredStakeholder(hovered ? stakeholder.id : null)}
          />
        ))}

        {/* Connection lines */}
        {connections.map((connection, index) => (
          <ConnectionLine
            key={index}
            start={connection.start}
            end={connection.end}
            active={connection.active}
          />
        ))}

        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      {/* Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-3 z-10">
        <Button 
          onClick={() => navigate('/matching')}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl"
        >
          <Heart className="w-4 h-4 mr-2" />
          Smart Matching
        </Button>
        <Button 
          variant="outline" 
          className="border-white/20 bg-white/10 backdrop-blur text-white hover:bg-white/20"
        >
          <Settings className="w-4 h-4 mr-2" />
          View Settings
        </Button>
      </div>

      {/* Selected Stakeholder Details */}
      <AnimatePresence>
        {selectedStakeholder && (
          <motion.div
            className="absolute bottom-6 left-6 max-w-md bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <Card className="bg-transparent border-none">
              <CardContent className="p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedStakeholder.name}</h3>
                    <Badge className="mt-1 capitalize bg-primary/20 text-primary border-primary/30">
                      {selectedStakeholder.type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedStakeholder(null)}
                    className="text-white hover:text-gray-300"
                  >
                    ✕
                  </Button>
                </div>

                <p className="text-gray-300 mb-4">{selectedStakeholder.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedStakeholder.impactScore}</div>
                    <div className="text-xs text-gray-400">Impact Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{selectedStakeholder.projects}</div>
                    <div className="text-xs text-gray-400">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{selectedStakeholder.co2Saved}</div>
                    <div className="text-xs text-gray-400">CO₂ Saved</div>
                  </div>
                </div>

                {selectedStakeholder.isMatch && (
                  <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="font-medium">{selectedStakeholder.matchScore}% {t('3d_dashboard.perfect_match')}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/matching')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Enhanced3DDashboard;
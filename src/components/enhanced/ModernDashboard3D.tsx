import React, { useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, MapPin, Target, Zap, Leaf, TrendingUp, Heart, MessageCircle, 
  Calendar, Settings, Filter, Search, Trophy, Crown, Star, ChevronRight, X,
  BarChart3, PieChart, Activity, Briefcase, Globe, Recycle
} from 'lucide-react';

interface FutureImpact {
  id: string;
  title: string;
  value: string;
  change: number;
  data: number[];
  color: string;
}

interface StakeholderNode {
  id: string;
  name: string;
  type: string;
  connections: string[];
  impact: number;
  avatar: string;
  status: 'online' | 'offline';
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline';
}

interface BossBattle {
  id: string;
  title: string;
  progress: number;
  waterScarcity: number;
  energyBattle: number;
  enemy: string;
}

const ModernDashboard3D: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedModal, setSelectedModal] = useState<'team' | 'boss' | 'guild' | 'scenario' | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Future Impacts Data
  const futureImpacts: FutureImpact[] = useMemo(() => [
    {
      id: '1',
      title: 'Future Impacts',
      value: '#285,958',
      change: 12.5,
      data: [20, 45, 35, 60, 75, 90, 85],
      color: '#3B82F6'
    },
    {
      id: '2', 
      title: 'Future Impact',
      value: 'Exint · Pronat · Goination',
      change: 8.3,
      data: [30, 25, 50, 40, 65, 80, 70],
      color: '#10B981'
    },
    {
      id: '3',
      title: 'Futirijne Impacts',
      value: '#3881206',
      change: -2.1,
      data: [40, 60, 45, 70, 55, 85, 75],
      color: '#F59E0B'
    }
  ], []);

  // Stakeholder Network Data  
  const stakeholderNodes: StakeholderNode[] = useMemo(() => [
    { id: '1', name: 'Toshaklaim', type: 'Zegoennia', connections: ['2', '3'], impact: 85, avatar: '🏢', status: 'online' },
    { id: '2', name: 'Guilds', type: 'Business', connections: ['1', '4'], impact: 92, avatar: '🏛️', status: 'online' },
    { id: '3', name: 'EcoVision', type: 'NGO', connections: ['1', '5'], impact: 78, avatar: '🌱', status: 'online' },
    { id: '4', name: 'Citizens', type: 'Community', connections: ['2'], impact: 65, avatar: '👥', status: 'offline' },
    { id: '5', name: 'Municipality', type: 'Government', connections: ['3'], impact: 88, avatar: '🏛️', status: 'online' }
  ], []);

  // Team System Data
  const teamMembers: TeamMember[] = useMemo(() => [
    { id: '1', name: 'Very flavum', avatar: '👤', role: 'Team Lead', status: 'online' },
    { id: '2', name: 'Initiate Deohvethen', avatar: '🌟', role: 'Developer', status: 'online' },
    { id: '3', name: 'Garden Proavel', avatar: '🛠️', role: 'Designer', status: 'offline' }
  ], []);

  // Boss Battle Data
  const bossBattle: BossBattle = useMemo(() => ({
    id: 'city-battle',
    title: 'City Battle',
    progress: 65,
    waterScarcity: 78,
    energyBattle: 85,
    enemy: 'ENERGY'
  }), []);

  const MiniChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => (
    <div className="flex items-end space-x-1 h-12">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-gradient-to-t rounded-sm transition-all duration-300"
          style={{
            height: `${(value / Math.max(...data)) * 100}%`,
            width: '8px',
            background: `linear-gradient(to top, ${color}80, ${color})`
          }}
        />
      ))}
    </div>
  );

  const NetworkGraph: React.FC = () => (
    <div className="relative w-full h-48 bg-slate-800/50 rounded-lg p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        {stakeholderNodes.map((node, index) => (
          <motion.div
            key={node.id}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              node.status === 'online' ? 'bg-green-500/20 border-green-400' : 'bg-gray-500/20 border-gray-400'
            } border-2 ${hoveredNode === node.id ? 'scale-125 shadow-glow' : ''}`}
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${30 + (index % 2) * 40}%`
            }}
            onHoverStart={() => setHoveredNode(node.id)}
            onHoverEnd={() => setHoveredNode(null)}
            whileHover={{ scale: 1.2 }}
          >
            <span className="text-lg">{node.avatar}</span>
          </motion.div>
        ))}
      </div>
      {/* Connection lines would go here */}
      <svg className="absolute inset-0 pointer-events-none">
        <defs>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        {/* Sample connection lines */}
        <line x1="20%" y1="50%" x2="40%" y2="30%" stroke="url(#connectionGrad)" strokeWidth="2" />
        <line x1="40%" y1="70%" x2="60%" y2="50%" stroke="url(#connectionGrad)" strokeWidth="2" />
      </svg>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Top Future Impact Panels */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {futureImpacts.map((impact) => (
            <motion.div
              key={impact.id}
              className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">{impact.title}</h3>
                <Badge variant="outline" className="text-xs border-white/20 text-white">
                  {impact.change > 0 ? '+' : ''}{impact.change}%
                </Badge>
              </div>
              <div className="text-white text-xl font-bold mb-3">{impact.value}</div>
              <MiniChart data={impact.data} color={impact.color} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Left Stakeholder Relationship Panel */}
      <motion.div
        className="absolute left-6 top-40 w-80 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Stakeholder relationship
            </h3>
            <Button size="sm" variant="ghost" className="text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <NetworkGraph />
          <div className="mt-4 space-y-2">
            {stakeholderNodes.slice(0, 3).map((node) => (
              <div key={node.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span>{node.avatar}</span>
                  <span className="text-white">{node.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-gray-300">{node.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Predictive Analytics Panel */}
      <motion.div
        className="absolute right-6 top-40 w-80 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Predictive Analytics</h3>
            <Button size="sm" variant="ghost" className="text-white">
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>

          {/* Analytics Chart */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-4">
            <MiniChart data={[30, 45, 60, 75, 65, 80, 90]} color="#3B82F6" />
          </div>

          {/* Community Cards */}
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Initiate Community</div>
                  <div className="text-gray-400 text-xs">Garden Project</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Progress Indicators */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Renewable Energy Adoption</span>
                  <span className="text-gray-300">903%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Waste Reduction Rate</span>
                  <span className="text-gray-300">86%</span>
                </div>
                <Progress value={86} className="h-2" />
              </div>

              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white text-xs">CFBB925C</div>
                <div className="text-gray-400 text-xs">7/16</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Action Panels */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between z-10">
        {/* Team System */}
        <motion.div
          className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setSelectedModal('team')}
        >
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Team System
          </h4>
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((member) => (
              <div key={member.id} className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-slate-800">
                <span className="text-xs">{member.avatar}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Boss Battle */}
        <motion.div
          className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setSelectedModal('boss')}
        >
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            Boss Battle
          </h4>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-white text-sm">{bossBattle.progress}%</div>
          </div>
        </motion.div>

        {/* Scenario Planning */}
        <motion.div
          className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => setSelectedModal('scenario')}
        >
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            What if Scenario Planning
          </h4>
          <div className="flex items-center space-x-2">
            <Recycle className="w-6 h-6 text-green-400" />
            <span className="text-white text-sm">Circular Resource Matching</span>
          </div>
        </motion.div>
      </div>

      {/* Central 3D Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
          <div className="text-white text-center">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold mb-2">Smart City Network</h2>
            <p className="text-gray-300">Connecting stakeholders for sustainability</p>
          </div>
        </div>
      </div>

      {/* Navigation to Matching */}
      <div className="absolute top-6 right-6 z-20">
        <Button 
          onClick={() => navigate('/matching')}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl"
        >
          <Heart className="w-4 h-4 mr-2" />
          Smart Matching
        </Button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedModal(null)}
          >
            <motion.div
              className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  {selectedModal === 'team' && 'Team System'}
                  {selectedModal === 'boss' && 'Boss Battle'}
                  {selectedModal === 'guild' && 'Guild System'}
                  {selectedModal === 'scenario' && 'Scenario Planning'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedModal(null)}>
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>

              <div className="text-white">
                {selectedModal === 'team' && (
                  <div className="space-y-4">
                    <p>Manage your sustainability team and track collaborative progress.</p>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <div className="flex items-center space-x-2">
                            <span>{member.avatar}</span>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-gray-400">{member.role}</div>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedModal === 'boss' && (
                  <div className="space-y-4">
                    <p>Current city-wide sustainability challenge:</p>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{bossBattle.title}</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Water Scarcity Challenge</span>
                            <span>{bossBattle.waterScarcity}%</span>
                          </div>
                          <Progress value={bossBattle.waterScarcity} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Energy Battle</span>
                            <span>{bossBattle.energyBattle}%</span>
                          </div>
                          <Progress value={bossBattle.energyBattle} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedModal === 'scenario' && (
                  <div className="space-y-4">
                    <p>Explore different sustainability scenarios and their potential impact.</p>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Circular Economy Resource Matching</h4>
                      <p className="text-sm text-gray-300">
                        Connect waste outputs from one organization to inputs of another, 
                        creating a circular resource flow that reduces waste and maximizes efficiency.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full mt-4" onClick={() => setSelectedModal(null)}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDashboard3D;
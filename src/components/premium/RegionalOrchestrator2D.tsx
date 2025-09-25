import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Leaf, 
  TrendingUp, 
  Award, 
  Target,
  ArrowRight,
  Zap,
  Handshake,
  BarChart3
} from 'lucide-react';

interface DistrictData {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'ngo' | 'citizen';
  progress: number;
  challenges: number;
  stakeholders: number;
  co2Saved: number;
  connections: string[];
  x: number;
  y: number;
}

const RegionalOrchestrator2D = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const controls = useAnimation();

  const districts: DistrictData[] = [
    {
      id: 'center',
      name: 'Vienna Center',
      type: 'municipality',
      progress: 87,
      challenges: 15,
      stakeholders: 245,
      co2Saved: 2340,
      connections: ['leopoldstadt', 'landstrasse'],
      x: 2,
      y: 2
    },
    {
      id: 'leopoldstadt',
      name: 'Leopoldstadt',
      type: 'business',
      progress: 64,
      challenges: 8,
      stakeholders: 156,
      co2Saved: 1820,
      connections: ['center', 'landstrasse'],
      x: 4,
      y: 1
    },
    {
      id: 'landstrasse',
      name: 'Landstraße',
      type: 'ngo',
      progress: 72,
      challenges: 12,
      stakeholders: 189,
      co2Saved: 2100,
      connections: ['center', 'wieden'],
      x: 3,
      y: 3
    },
    {
      id: 'wieden',
      name: 'Wieden',
      type: 'citizen',
      progress: 56,
      challenges: 6,
      stakeholders: 98,
      co2Saved: 980,
      connections: ['landstrasse', 'margareten'],
      x: 1,
      y: 4
    },
    {
      id: 'margareten',
      name: 'Margareten',
      type: 'municipality',
      progress: 78,
      challenges: 11,
      stakeholders: 167,
      co2Saved: 1950,
      connections: ['wieden', 'mariahilf'],
      x: 0,
      y: 2
    },
    {
      id: 'mariahilf',
      name: 'Mariahilf',
      type: 'business',
      progress: 69,
      challenges: 9,
      stakeholders: 134,
      co2Saved: 1650,
      connections: ['margareten', 'neubau'],
      x: 1,
      y: 0
    },
    {
      id: 'neubau',
      name: 'Neubau',
      type: 'ngo',
      progress: 83,
      challenges: 14,
      stakeholders: 203,
      co2Saved: 2180,
      connections: ['mariahilf', 'josefstadt'],
      x: 3,
      y: 1
    },
    {
      id: 'josefstadt',
      name: 'Josefstadt',
      type: 'citizen',
      progress: 61,
      challenges: 7,
      stakeholders: 112,
      co2Saved: 1420,
      connections: ['neubau'],
      x: 4,
      y: 3
    }
  ];

  const getTypeColor = (type: DistrictData['type']) => {
    switch (type) {
      case 'municipality': return 'border-primary bg-primary/10';
      case 'business': return 'border-accent bg-accent/10';
      case 'ngo': return 'border-success bg-success/10';
      case 'citizen': return 'border-secondary bg-secondary/10';
    }
  };

  const getTypeIcon = (type: DistrictData['type']) => {
    switch (type) {
      case 'municipality': return Building2;
      case 'business': return TrendingUp;
      case 'ngo': return Handshake;
      case 'citizen': return Users;
    }
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
      // Animate progress counter
      const timer = setTimeout(() => {
        setProgressValue(67);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const districtVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-8">
      {/* Header with Progress Ring */}
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-border opacity-20"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="60"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 60}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 60 * (1 - progressValue / 100)
              }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#FB923C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {progressValue}%
            </motion.div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Vienna CO₂ Reduction</h2>
          <p className="text-muted-foreground">Regional Goal: 15% reduction by 2025</p>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div 
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Isometric District Grid */}
        <div className="relative min-h-[600px] bg-gradient-to-br from-background via-card/20 to-background rounded-3xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Connection Lines SVG */}
          {showConnections && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FB923C" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {districts.map((district) =>
                district.connections.map((connectionId) => {
                  const connectedDistrict = districts.find(d => d.id === connectionId);
                  if (!connectedDistrict) return null;
                  
                  const startX = (district.x * 140) + 100;
                  const startY = (district.y * 120) + 100;
                  const endX = (connectedDistrict.x * 140) + 100;
                  const endY = (connectedDistrict.y * 120) + 100;
                  
                  const midX = (startX + endX) / 2;
                  const midY = (startY + endY) / 2 - 20;
                  
                  return (
                    <motion.path
                      key={`${district.id}-${connectionId}`}
                      d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                      stroke="url(#connectionGradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: 1 + Math.random() * 0.5,
                        ease: "easeInOut"
                      }}
                      className={hoveredDistrict === district.id || hoveredDistrict === connectionId ? 'opacity-100' : 'opacity-60'}
                    />
                  );
                })
              )}
            </svg>
          )}
          
          {/* District Cards */}
          <div className="relative" style={{ zIndex: 2 }}>
            {districts.map((district, index) => {
              const IconComponent = getTypeIcon(district.type);
              const isHovered = hoveredDistrict === district.id;
              const isConnected = selectedDistrict?.connections.includes(district.id);
              
              return (
                <motion.div
                  key={district.id}
                  className="absolute"
                  style={{
                    left: `${district.x * 140}px`,
                    top: `${district.y * 120}px`,
                    transform: 'perspective(1000px) rotateX(15deg) rotateY(-5deg)'
                  }}
                  variants={districtVariants}
                  whileHover={{ 
                    y: -8,
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredDistrict(district.id)}
                  onHoverEnd={() => setHoveredDistrict(null)}
                  onClick={() => setSelectedDistrict(district)}
                >
                  <Card className={`
                    w-48 cursor-pointer transition-all duration-300 backdrop-blur-lg
                    ${getTypeColor(district.type)}
                    ${isHovered ? 'shadow-glow border-2' : 'shadow-premium border'}
                    ${isConnected ? 'ring-2 ring-primary/50' : ''}
                  `}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(district.type)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {district.name}
                          </div>
                        </div>
                        <Badge className="text-xs" variant="outline">
                          {district.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{district.progress}%</span>
                        </div>
                        <Progress 
                          value={district.progress} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-muted-foreground" />
                          <span>{district.challenges}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span>{district.stakeholders}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Leaf className="w-3 h-3 text-success" />
                          <span>{district.co2Saved}kg</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-warning" />
                          <span>{district.connections.length}</span>
                        </div>
                      </div>
                      
                      <motion.div
                        className="pt-2 border-t border-border/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Button 
                          size="sm" 
                          className="w-full text-xs bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Control Panel */}
        <motion.div 
          className="absolute top-6 right-6 bg-card/95 backdrop-blur-lg p-4 rounded-2xl border border-border/50 shadow-premium"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="space-y-3">
            <Button
              onClick={() => setShowConnections(!showConnections)}
              size="sm"
              variant={showConnections ? "default" : "outline"}
              className="w-full text-xs"
            >
              {showConnections ? 'Hide' : 'Show'} Connections
            </Button>
            
            <div className="space-y-2 text-xs">
              <div className="font-medium text-foreground mb-2">Legend</div>
              {[
                { type: 'municipality', label: 'Municipality', color: '#2563EB' },
                { type: 'business', label: 'Business', color: '#FB923C' },
                { type: 'ngo', label: 'NGO', color: '#10B981' },
                { type: 'citizen', label: 'Citizen', color: '#8B5CF6' }
              ].map(({ type, label, color }) => (
                <div key={type} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: color + '20', borderColor: color }}
                  />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Selected District Modal */}
      {selectedDistrict && (
        <motion.div 
          className="fixed inset-0 bg-background/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedDistrict(null)}
        >
          <motion.div
            className="bg-card border border-border rounded-3xl p-8 max-w-2xl w-full shadow-premium"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{selectedDistrict.name}</h3>
                <Badge className="mt-2 capitalize">{selectedDistrict.type}</Badge>
              </div>
              <Button 
                onClick={() => setSelectedDistrict(null)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{selectedDistrict.progress}%</div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">{selectedDistrict.challenges}</div>
                <div className="text-sm text-muted-foreground">Challenges</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">{selectedDistrict.stakeholders}</div>
                <div className="text-sm text-muted-foreground">Stakeholders</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">{selectedDistrict.co2Saved}kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </Card>
            </div>
            
            <div className="flex space-x-4">
              <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="flex-1">
                <Handshake className="w-4 h-4 mr-2" />
                Find Partners
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RegionalOrchestrator2D;
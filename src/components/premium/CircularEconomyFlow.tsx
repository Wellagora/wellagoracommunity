import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Recycle, 
  Factory,
  Truck, 
  Store, 
  Home, 
  Leaf,
  AlertCircle,
  TrendingUp,
  Zap,
  Droplets,
  Wind
} from 'lucide-react';

interface FlowNode {
  id: string;
  name: string;
  type: 'producer' | 'processor' | 'consumer' | 'recycler';
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  resources: {
    input: string[];
    output: string[];
  };
  efficiency: number;
  impact: number;
  connections: string[];
}

interface ResourceFlow {
  from: string;
  to: string;
  resource: string;
  volume: number;
  efficiency: number;
}

const CircularEconomyFlow = () => {
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showOpportunities, setShowOpportunities] = useState(false);

  const nodes: FlowNode[] = [
    {
      id: 'manufacturer',
      name: 'EcoTech Manufacturing',
      type: 'producer',
      icon: Factory,
      position: { x: 0, y: 1 },
      resources: {
        input: ['Raw Materials', 'Energy'],
        output: ['Products', 'Waste Heat', 'Byproducts']
      },
      efficiency: 78,
      impact: 2.3,
      connections: ['logistics', 'recycler']
    },
    {
      id: 'logistics',
      name: 'Green Logistics Hub',
      type: 'processor',
      icon: Truck,
      position: { x: 2, y: 0 },
      resources: {
        input: ['Products', 'Packaging'],
        output: ['Distributed Products', 'Packaging Waste']
      },
      efficiency: 85,
      impact: 1.2,
      connections: ['retailer', 'recycler']
    },
    {
      id: 'retailer',
      name: 'Sustainable Retailers',
      type: 'consumer',
      icon: Store,
      position: { x: 4, y: 1 },
      resources: {
        input: ['Products'],
        output: ['Sales', 'Product Waste']
      },
      efficiency: 72,
      impact: 0.8,
      connections: ['household', 'recycler']
    },
    {
      id: 'household',
      name: 'Vienna Households',
      type: 'consumer',
      icon: Home,
      position: { x: 4, y: 3 },
      resources: {
        input: ['Products', 'Services'],
        output: ['Organic Waste', 'Recyclables', 'Energy']
      },
      efficiency: 65,
      impact: 1.5,
      connections: ['recycler', 'energy']
    },
    {
      id: 'recycler',
      name: 'Circular Processing',
      type: 'recycler',
      icon: Recycle,
      position: { x: 2, y: 3 },
      resources: {
        input: ['Waste Heat', 'Byproducts', 'Packaging Waste', 'Product Waste', 'Organic Waste', 'Recyclables'],
        output: ['Raw Materials', 'Energy', 'Compost']
      },
      efficiency: 89,
      impact: 3.1,
      connections: ['manufacturer', 'energy']
    },
    {
      id: 'energy',
      name: 'Renewable Energy',
      type: 'processor',
      icon: Zap,
      position: { x: 0, y: 3 },
      resources: {
        input: ['Energy', 'Compost'],
        output: ['Clean Energy', 'Nutrients']
      },
      efficiency: 92,
      impact: 2.8,
      connections: ['manufacturer', 'household']
    }
  ];

  const flows: ResourceFlow[] = [
    { from: 'manufacturer', to: 'logistics', resource: 'Products', volume: 100, efficiency: 95 },
    { from: 'manufacturer', to: 'recycler', resource: 'Waste Heat', volume: 60, efficiency: 78 },
    { from: 'logistics', to: 'retailer', resource: 'Products', volume: 95, efficiency: 90 },
    { from: 'logistics', to: 'recycler', resource: 'Packaging', volume: 25, efficiency: 85 },
    { from: 'retailer', to: 'household', resource: 'Products', volume: 90, efficiency: 88 },
    { from: 'retailer', to: 'recycler', resource: 'Waste', volume: 15, efficiency: 72 },
    { from: 'household', to: 'recycler', resource: 'Recyclables', volume: 70, efficiency: 65 },
    { from: 'household', to: 'energy', resource: 'Organic', volume: 40, efficiency: 68 },
    { from: 'recycler', to: 'manufacturer', resource: 'Materials', volume: 85, efficiency: 89 },
    { from: 'recycler', to: 'energy', resource: 'Biogas', volume: 45, efficiency: 82 },
    { from: 'energy', to: 'manufacturer', resource: 'Power', volume: 120, efficiency: 92 },
    { from: 'energy', to: 'household', resource: 'Power', volume: 80, efficiency: 94 }
  ];

  const opportunities = [
    {
      id: 'heat-recovery',
      title: 'Waste Heat Recovery System',
      description: 'Capture and redistribute waste heat from manufacturing',
      potential: '+15% efficiency',
      investment: '€2.3M',
      impact: 'High',
      nodes: ['manufacturer', 'energy']
    },
    {
      id: 'smart-packaging',
      title: 'Smart Packaging Loop',
      description: 'IoT-enabled reusable packaging system',
      potential: '+22% material recovery',
      investment: '€1.8M',
      impact: 'Medium',
      nodes: ['logistics', 'retailer', 'recycler']
    },
    {
      id: 'biogas-expansion',
      title: 'Community Biogas Network',
      description: 'Expand organic waste to energy conversion',
      potential: '+35% renewable energy',
      investment: '€4.1M',
      impact: 'High',
      nodes: ['household', 'energy', 'recycler']
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNodeColor = (type: FlowNode['type'], efficiency: number) => {
    const baseColors = {
      producer: efficiency > 80 ? 'border-primary bg-primary/20' : 'border-primary/60 bg-primary/10',
      processor: efficiency > 80 ? 'border-accent bg-accent/20' : 'border-accent/60 bg-accent/10',
      consumer: efficiency > 80 ? 'border-secondary bg-secondary/20' : 'border-secondary/60 bg-secondary/10',
      recycler: efficiency > 80 ? 'border-success bg-success/20' : 'border-success/60 bg-success/10'
    };
    return baseColors[type];
  };

  const getResourceColor = (resource: string) => {
    if (resource.includes('Waste') || resource.includes('Recyclables')) return '#EF4444';
    if (resource.includes('Energy') || resource.includes('Power')) return '#F59E0B';
    if (resource.includes('Materials') || resource.includes('Products')) return '#3B82F6';
    if (resource.includes('Organic') || resource.includes('Compost')) return '#10B981';
    return '#6B7280';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Circular Economy Flow</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real-time visualization of resource flows and optimization opportunities in Vienna's circular economy
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => setShowOpportunities(!showOpportunities)}
          variant={showOpportunities ? "default" : "outline"}
          className="bg-gradient-to-r from-primary to-accent"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {showOpportunities ? 'Hide' : 'Show'} Opportunities
        </Button>
      </div>

      {/* Main Flow Diagram */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 min-h-[600px] overflow-hidden border border-black/5">
        
        {/* Flow Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            {flows.map((flow) => (
              <linearGradient key={`gradient-${flow.from}-${flow.to}`} id={`flow-${flow.from}-${flow.to}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getResourceColor(flow.resource)} stopOpacity="0.8" />
                <stop offset="100%" stopColor={getResourceColor(flow.resource)} stopOpacity="0.3" />
              </linearGradient>
            ))}
          </defs>
          
          {flows.map((flow, index) => {
            const fromNode = nodes.find(n => n.id === flow.from);
            const toNode = nodes.find(n => n.id === flow.to);
            if (!fromNode || !toNode) return null;
            
            const startX = (fromNode.position.x * 180) + 120;
            const startY = (fromNode.position.y * 140) + 80;
            const endX = (toNode.position.x * 180) + 120;
            const endY = (toNode.position.y * 140) + 80;
            
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 30;
            
            return (
              <g key={`${flow.from}-${flow.to}`}>
                <motion.path
                  d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                  stroke={`url(#flow-${flow.from}-${flow.to})`}
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ 
                    duration: 2, 
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    repeatDelay: 8
                  }}
                />
                
                {/* Animated Flow Particles */}
                <motion.circle
                  r="4"
                  fill={getResourceColor(flow.resource)}
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 3,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    offsetPath: `path('M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}')`,
                    offsetRotate: 'auto'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Node Cards */}
        <div className="relative" style={{ zIndex: 2 }}>
          {nodes.map((node, index) => {
            const IconComponent = node.icon;
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: `${node.position.x * 180}px`,
                  top: `${node.position.y * 140}px`
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedNode(node)}
              >
                <Card className={`
                  w-56 cursor-pointer transition-all duration-300 backdrop-blur-lg
                  ${getNodeColor(node.type, node.efficiency)}
                  ${isSelected ? 'shadow-glow border-2' : 'shadow-premium border'}
                `}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getNodeColor(node.type, node.efficiency)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {node.name}
                        </div>
                      </div>
                      <Badge className="text-xs capitalize" variant="outline">
                        {node.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className={`font-medium ${node.efficiency > 80 ? 'text-success' : node.efficiency > 70 ? 'text-warning' : 'text-destructive'}`}>
                          {node.efficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-border/30 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            node.efficiency > 80 ? 'bg-success' : 
                            node.efficiency > 70 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${node.efficiency}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-muted-foreground">Impact: {node.impact}x</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Recycle className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">{node.connections.length} flows</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Opportunities Panel */}
      <AnimatePresence>
        {showOpportunities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-success" />
                  Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {opportunities.map((opportunity, index) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-glow transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-foreground">{opportunity.title}</h4>
                            <Badge className={`
                              ${opportunity.impact === 'High' ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'}
                            `}>
                              {opportunity.impact}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {opportunity.description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Potential:</span>
                              <span className="font-medium text-success">{opportunity.potential}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Investment:</span>
                              <span className="font-medium text-foreground">{opportunity.investment}</span>
                            </div>
                          </div>
                          
                          <Button className="w-full bg-gradient-to-r from-primary to-accent text-sm">
                            Explore Opportunity
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-2xl w-full shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedNode.name}</h3>
                  <Badge className="mt-2 capitalize">{selectedNode.type}</Badge>
                </div>
                <Button 
                  onClick={() => setSelectedNode(null)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Resource Inputs</h4>
                  <div className="space-y-2">
                    {selectedNode.resources.input.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getResourceColor(resource) }}
                        />
                        <span className="text-muted-foreground">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Resource Outputs</h4>
                  <div className="space-y-2">
                    {selectedNode.resources.output.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getResourceColor(resource) }}
                        />
                        <span className="text-muted-foreground">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{selectedNode.efficiency}%</div>
                    <div className="text-sm text-muted-foreground">Efficiency Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{selectedNode.impact}x</div>
                    <div className="text-sm text-muted-foreground">Impact Multiplier</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircularEconomyFlow;
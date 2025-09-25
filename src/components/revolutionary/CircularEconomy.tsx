import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Recycle, 
  ArrowRight, 
  Leaf, 
  Factory,
  Home,
  Building2,
  Zap,
  Droplets,
  Trash2,
  Package,
  RefreshCw
} from "lucide-react";

interface ResourceFlow {
  id: string;
  from: string;
  to: string;
  resource: string;
  amount: number;
  efficiency: number;
  color: string;
}

interface CircularNode {
  id: string;
  name: string;
  type: 'business' | 'household' | 'facility' | 'government';
  icon: any;
  resources: { input: string[], output: string[] };
  efficiency: number;
  position: { x: number; y: number };
}

const CircularEconomy = () => {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  const nodes: CircularNode[] = [
    {
      id: 'households',
      name: 'Households',
      type: 'household',
      icon: Home,
      resources: { input: ['energy', 'water'], output: ['organic-waste', 'recyclables'] },
      efficiency: 78,
      position: { x: 20, y: 20 }
    },
    {
      id: 'businesses',
      name: 'Businesses',
      type: 'business',
      icon: Building2,
      resources: { input: ['materials', 'energy'], output: ['products', 'waste'] },
      efficiency: 85,
      position: { x: 80, y: 20 }
    },
    {
      id: 'recycling',
      name: 'Recycling',
      type: 'facility',
      icon: Recycle,
      resources: { input: ['waste', 'recyclables'], output: ['materials', 'energy'] },
      efficiency: 92,
      position: { x: 50, y: 80 }
    },
    {
      id: 'energy',
      name: 'Energy Plant',
      type: 'facility',
      icon: Zap,
      resources: { input: ['organic-waste'], output: ['energy', 'compost'] },
      efficiency: 88,
      position: { x: 20, y: 80 }
    }
  ];

  const flows: ResourceFlow[] = [
    {
      id: 'household-waste',
      from: 'households',
      to: 'recycling',
      resource: 'Organic Waste',
      amount: 2400,
      efficiency: 95,
      color: 'success'
    },
    {
      id: 'business-materials',
      from: 'businesses',
      to: 'recycling',
      resource: 'Materials',
      amount: 1800,
      efficiency: 87,
      color: 'primary'
    },
    {
      id: 'recycled-energy',
      from: 'recycling',
      to: 'energy',
      resource: 'Bio-fuel',
      amount: 950,
      efficiency: 91,
      color: 'warning'
    },
    {
      id: 'clean-energy',
      from: 'energy',
      to: 'households',
      resource: 'Clean Energy',
      amount: 3200,
      efficiency: 89,
      color: 'accent'
    }
  ];

  // Animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % flows.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getResourceIcon = (resource: string) => {
    if (resource.includes('waste') || resource.includes('Waste')) return Trash2;
    if (resource.includes('energy') || resource.includes('Energy')) return Zap;
    if (resource.includes('water') || resource.includes('Water')) return Droplets;
    if (resource.includes('materials') || resource.includes('Materials')) return Package;
    return Recycle;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-success';
    if (efficiency >= 75) return 'text-primary';
    if (efficiency >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-4">
      {/* Circular Flow Visualization */}
      <div className="relative h-48 bg-gradient-to-br from-muted/20 to-transparent rounded-xl border border-border/30 overflow-hidden">
        {/* Nodes */}
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="absolute"
              style={{ 
                left: `${node.position.x}%`, 
                top: `${node.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative group">
                <div className="w-12 h-12 bg-card border-2 border-primary/30 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {node.name}
                </div>
                
                {/* Efficiency indicator */}
                <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${getEfficiencyColor(node.efficiency)}`}>
                  {node.efficiency}%
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Animated Flow Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {flows.map((flow, index) => {
            const fromNode = nodes.find(n => n.id === flow.from);
            const toNode = nodes.find(n => n.id === flow.to);
            
            if (!fromNode || !toNode) return null;
            
            const x1 = (fromNode.position.x / 100) * 100 + '%';
            const y1 = (fromNode.position.y / 100) * 100 + '%';
            const x2 = (toNode.position.x / 100) * 100 + '%';
            const y2 = (toNode.position.y / 100) * 100 + '%';
            
            return (
              <motion.line
                key={flow.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={animationStep === index ? `hsl(var(--${flow.color}))` : 'hsl(var(--border))'}
                strokeWidth={animationStep === index ? 3 : 1}
                strokeDasharray="5,5"
                opacity={animationStep === index ? 1 : 0.3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {/* Flow animation particles */}
        <AnimatePresence>
          {flows.map((flow, index) => {
            if (animationStep !== index) return null;
            
            const fromNode = nodes.find(n => n.id === flow.from);
            const toNode = nodes.find(n => n.id === flow.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <motion.div
                key={`particle-${flow.id}-${animationStep}`}
                className="absolute w-2 h-2 rounded-full bg-primary"
                initial={{ 
                  left: `${fromNode.position.x}%`, 
                  top: `${fromNode.position.y}%` 
                }}
                animate={{ 
                  left: `${toNode.position.x}%`, 
                  top: `${toNode.position.y}%` 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Current Flow Info */}
      <motion.div
        key={animationStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            <span className="font-semibold text-sm text-primary">Active Flow</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {flows[animationStep]?.efficiency}% efficiency
          </Badge>
        </div>
        
        <div className="text-sm text-foreground">
          <span className="font-medium">{flows[animationStep]?.resource}</span> • {flows[animationStep]?.amount.toLocaleString()} kg/day
        </div>
      </motion.div>

      {/* Resource Flows List */}
      <div className="space-y-2">
        {flows.slice(0, 3).map((flow, index) => {
          const ResourceIcon = getResourceIcon(flow.resource);
          
          return (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg border border-border/30 hover:border-border/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ResourceIcon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">{flow.resource}</div>
                  <div className="text-xs text-muted-foreground">{flow.amount.toLocaleString()} kg/day</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={flow.efficiency} className="w-12 h-1" />
                <span className={`text-xs font-semibold ${getEfficiencyColor(flow.efficiency)}`}>
                  {flow.efficiency}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Button */}
      <Button variant="outline" size="sm" className="w-full">
        <Leaf className="w-4 h-4 mr-2" />
        Optimize Circular Flow
      </Button>
    </div>
  );
};

export default CircularEconomy;
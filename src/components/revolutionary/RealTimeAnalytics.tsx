import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Users,
  Target,
  Globe,
  Clock,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: any;
}

interface ActivityEvent {
  id: string;
  type: 'challenge' | 'partnership' | 'achievement' | 'milestone';
  description: string;
  time: string;
  impact: number;
  user?: string;
}

const RealTimeAnalytics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'co2-saved',
      label: 'CO₂ Saved',
      value: 2340,
      unit: 'kg',
      change: 12.5,
      trend: 'up',
      color: 'success',
      icon: Zap
    },
    {
      id: 'active-users',
      label: 'Active Users',
      value: 1547,
      unit: '',
      change: 8.2,
      trend: 'up',
      color: 'primary',
      icon: Users
    },
    {
      id: 'challenges',
      label: 'Challenges',
      value: 23,
      unit: '',
      change: -2.1,
      trend: 'down',
      color: 'warning',
      icon: Target
    },
    {
      id: 'partnerships',
      label: 'Partnerships',
      value: 156,
      unit: '',
      change: 15.8,
      trend: 'up',
      color: 'accent',
      icon: Globe
    }
  ]);

  const [activities] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'challenge',
      description: 'New energy challenge started',
      time: '2 min ago',
      impact: 45,
      user: 'EcoTech Corp'
    },
    {
      id: '2',
      type: 'partnership',
      description: 'Municipality partnership formed',
      time: '5 min ago',
      impact: 120,
      user: 'Vienna City Council'
    },
    {
      id: '3',
      type: 'achievement',
      description: '1000kg CO₂ milestone reached',
      time: '8 min ago',
      impact: 1000
    },
    {
      id: '4',
      type: 'challenge',
      description: 'Waste reduction completed',
      time: '12 min ago',
      impact: 78,
      user: 'Green Future NGO'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10) - 5,
        change: (Math.random() * 20) - 10
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'challenge': return Target;
      case 'partnership': return Users;
      case 'achievement': return TrendingUp;
      case 'milestone': return Zap;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'challenge': return 'text-primary';
      case 'partnership': return 'text-accent';
      case 'achievement': return 'text-success';
      case 'milestone': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-2.5 bg-card/50 rounded-lg border border-border/30"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-3.5 h-3.5 text-${metric.color}`} />
                <div className={`flex items-center gap-0.5 ${getTrendColor(metric.trend)}`}>
                  <TrendIcon className="w-2.5 h-2.5" />
                  <span className="text-xs font-medium">
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-foreground leading-tight">
                  {metric.value.toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground leading-tight truncate">{metric.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time Activity Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Live Activity</h4>
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
            <Activity className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
          {activities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-card/30 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <ActivityIcon className={`w-2.5 h-2.5 ${getActivityColor(activity.type)}`} />
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs text-foreground font-medium leading-tight truncate">
                    {activity.description}
                  </div>
                  {activity.user && (
                    <div className="text-xs text-muted-foreground truncate">
                      by {activity.user}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.impact > 0 && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        +{activity.impact}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-3 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-success" />
            <span className="font-semibold text-sm text-success">System Health</span>
          </div>
          <Badge className="bg-success/20 text-success text-xs">Optimal</Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">API Response</span>
            <span className="text-success font-medium">12ms</span>
          </div>
          <Progress value={98} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>98% Uptime</span>
            <span>2.4k req/min</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeAnalytics;
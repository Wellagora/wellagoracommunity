import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import RegionalOrchestrator2D from '@/components/premium/RegionalOrchestrator2D';
import StakeholderOrchestration from '@/components/revolutionary/StakeholderOrchestration';
import PredictiveImpactDashboard from '@/components/revolutionary/PredictiveImpactDashboard';
import RegionalChallenges from '@/components/revolutionary/RegionalChallenges';
import { 
  Map, 
  Users, 
  BarChart3, 
  Sword, 
  Recycle, 
  Activity,
  Globe,
  Zap,
  TrendingUp,
  Target,
  Bell,
  Settings
} from 'lucide-react';

const RevolutionaryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'partnership',
      message: 'New partnership opportunity with GreenTech Solutions',
      time: '2 min ago'
    },
    {
      id: 2,
      type: 'challenge',
      message: 'Vienna CO₂ Boss Battle: 67% complete!',
      time: '5 min ago'
    },
    {
      id: 3,
      type: 'prediction',
      message: 'AI predicts 15% efficiency boost with current parameters',
      time: '10 min ago'
    }
  ]);

  const tabItems = [
    {
      id: 'map',
      label: '3D Regional Map',
      icon: <Map className="w-4 h-4" />,
      component: RegionalOrchestrator2D
    },
    {
      id: 'orchestration',
      label: 'AI Orchestration',
      icon: <Users className="w-4 h-4" />,
      component: StakeholderOrchestration
    },
    {
      id: 'predictions',
      label: 'Impact Predictions',
      icon: <BarChart3 className="w-4 h-4" />,
      component: PredictiveImpactDashboard
    },
    {
      id: 'challenges',
      label: 'Regional Battles',
      icon: <Sword className="w-4 h-4" />,
      component: RegionalChallenges
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navigation />
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">Wellagora</h1>
                  <p className="text-xs text-muted-foreground">Revolutionary Sustainability Platform</p>
                </div>
              </motion.div>

              <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-white animate-pulse">
                Beta 2.0
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Live metrics */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary">67%</div>
                  <div className="text-muted-foreground text-xs">Regional Goal</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-success">599</div>
                  <div className="text-muted-foreground text-xs">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-accent">33.5t</div>
                  <div className="text-muted-foreground text-xs">CO₂ Saved</div>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{notifications.length}</span>
                </div>
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Revolutionary Features Overview */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Regional Sustainability Orchestration
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of collaborative sustainability with AI-powered stakeholder matching, 
              3D visualization, and predictive impact analytics.
            </p>
          </div>

          {/* Feature highlight cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[
              {
                icon: <Map className="w-5 h-5" />,
                title: "3D Interactive Map",
                description: "Real-time regional heatmap with stakeholder connections",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: "AI Matching",
                description: "Tinder-style stakeholder partnership discovery",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: "Predictive Analytics",
                description: "Scenario planning with confidence intervals",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Sword className="w-5 h-5" />,
                title: "Regional Battles",
                description: "Gamified city-wide sustainability challenges",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden"
              >
                <Card className="p-4 h-full bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}></div>
                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-3`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revolutionary Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm border border-primary/20">
              {tabItems.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              {tabItems.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <tab.component />
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div 
          className="fixed bottom-6 right-6 w-80 max-h-64 overflow-hidden z-30"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="bg-card/95 backdrop-blur-lg border-2 border-primary/20 shadow-glow">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Live Activity</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className="p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                  <span className="text-xs text-muted-foreground opacity-60">{notification.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default RevolutionaryDashboard;
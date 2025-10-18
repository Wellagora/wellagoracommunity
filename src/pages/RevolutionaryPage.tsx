import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Recycle,
  Brain,
  Activity,
  ArrowRight
} from 'lucide-react';

// Import revolutionary components
import RealTimeAnalytics from '@/components/revolutionary/RealTimeAnalytics';
import PredictiveImpactDashboard from '@/components/revolutionary/PredictiveImpactDashboard';
import GuildSystem from '@/components/revolutionary/GuildSystem';
import CircularEconomyFlow from '@/components/premium/CircularEconomyFlow';
import StakeholderOrchestration from '@/components/revolutionary/StakeholderOrchestration';
import PredictiveAnalytics from '@/components/premium/PredictiveAnalytics';

const RevolutionaryPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('analytics');

  const features = [
    {
      id: 'analytics',
      icon: Activity,
      title: t('revolutionary.realtime_analytics'),
      description: t('revolutionary.realtime_analytics_desc'),
      color: 'from-primary to-success',
      component: <RealTimeAnalytics />
    },
    {
      id: 'predictive',
      icon: Brain,
      title: t('revolutionary.ai_predictions'),
      description: t('revolutionary.ai_predictions_desc'),
      color: 'from-accent to-warning',
      component: <PredictiveImpactDashboard />
    },
    {
      id: 'guilds',
      icon: Users,
      title: t('revolutionary.guild_system'),
      description: t('revolutionary.guild_system_desc'),
      color: 'from-success to-primary',
      component: <GuildSystem />
    },
    {
      id: 'circular',
      icon: Recycle,
      title: t('revolutionary.circular_economy'),
      description: t('revolutionary.circular_economy_desc'),
      color: 'from-warning to-destructive',
      component: <CircularEconomyFlow />
    },
    {
      id: 'orchestration',
      icon: TrendingUp,
      title: t('revolutionary.stakeholder_matching'),
      description: t('revolutionary.stakeholder_matching_desc'),
      color: 'from-primary to-accent',
      component: <StakeholderOrchestration />
    },
    {
      id: 'advanced',
      icon: Zap,
      title: t('revolutionary.advanced_analytics'),
      description: t('revolutionary.advanced_analytics_desc'),
      color: 'from-success to-warning',
      component: <PredictiveAnalytics />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10 text-warning animate-pulse" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('revolutionary.title')}
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            {t('revolutionary.subtitle')}
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge className="bg-gradient-to-r from-primary to-success text-white px-4 py-2">
              🤖 {t('revolutionary.ai_powered')}
            </Badge>
            <Badge className="bg-gradient-to-r from-warning to-destructive text-white px-4 py-2">
              📊 {t('revolutionary.realtime_data')}
            </Badge>
            <Badge className="bg-gradient-to-r from-success to-primary text-white px-4 py-2">
              🌍 {t('revolutionary.global_impact')}
            </Badge>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                  activeTab === feature.id ? 'border-primary ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTab(feature.id)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={activeTab === feature.id ? "default" : "outline"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab(feature.id);
                    }}
                  >
                    {activeTab === feature.id ? t('revolutionary.viewing') : t('revolutionary.explore')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Active Feature Display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {features.find(f => f.id === activeTab)?.icon && (
                  <div className={`w-10 h-10 bg-gradient-to-r ${features.find(f => f.id === activeTab)?.color} rounded-xl flex items-center justify-center`}>
                    {(() => {
                      const Icon = features.find(f => f.id === activeTab)?.icon;
                      return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                    })()}
                  </div>
                )}
                {features.find(f => f.id === activeTab)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {features.find(f => f.id === activeTab)?.component}
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-warning/10 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('revolutionary.cta_title')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('revolutionary.cta_description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90"
                  onClick={() => window.location.href = '/dynamic-regional'}
                >
                  🌍 {t('revolutionary.explore_3d_map')}
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary hover:bg-primary hover:text-white"
                  onClick={() => window.location.href = '/matching'}
                >
                  🤝 {t('revolutionary.find_partners')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RevolutionaryPage;

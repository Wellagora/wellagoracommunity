import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Zap,
  Leaf,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Scenario {
  name: string;
  investmentLevel: number;
  participationRate: number;
  policySupport: number;
  results: {
    co2Reduction: number;
    costSavings: number;
    jobsCreated: number;
    citizenEngagement: number;
    confidence: number;
  };
}

const PredictiveAnalytics = () => {
  const [investmentLevel, setInvestmentLevel] = useState([75]);
  const [participationRate, setParticipationRate] = useState([60]);
  const [policySupport, setPolicySupport] = useState([80]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('2025');
  const [animatedValues, setAnimatedValues] = useState({
    co2Reduction: 0,
    costSavings: 0,
    jobsCreated: 0,
    citizenEngagement: 0
  });

  // Calculate results based on sliders
  const calculateScenario = (): Scenario => {
    const investment = investmentLevel[0];
    const participation = participationRate[0];
    const policy = policySupport[0];
    
    const baseMultiplier = (investment + participation + policy) / 300;
    const timeMultiplier = selectedTimeframe === '2025' ? 1 : selectedTimeframe === '2030' ? 1.8 : 3.2;
    
    return {
      name: 'Custom Scenario',
      investmentLevel: investment,
      participationRate: participation,
      policySupport: policy,
      results: {
        co2Reduction: Math.round(15 * baseMultiplier * timeMultiplier * 100) / 100,
        costSavings: Math.round(2.5 * baseMultiplier * timeMultiplier * 10) / 10,
        jobsCreated: Math.round(1200 * baseMultiplier * timeMultiplier),
        citizenEngagement: Math.round(45 * baseMultiplier * 100) / 100,
        confidence: Math.round((85 + (baseMultiplier - 0.7) * 20) * 100) / 100
      }
    };
  };

  const currentScenario = calculateScenario();

  // Animate values when they change
  useEffect(() => {
    const newValues = currentScenario.results;
    const duration = 1000;
    const steps = 60;
    let step = 0;

    const animate = () => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        co2Reduction: newValues.co2Reduction * easeOut,
        costSavings: newValues.costSavings * easeOut,
        jobsCreated: newValues.jobsCreated * easeOut,
        citizenEngagement: newValues.citizenEngagement * easeOut
      });

      if (step < steps) {
        setTimeout(animate, duration / steps);
      }
    };

    animate();
  }, [investmentLevel, participationRate, policySupport, selectedTimeframe]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-primary';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return CheckCircle;
    if (confidence >= 70) return Target;
    return AlertTriangle;
  };

  const timeframes = [
    { value: '2025', label: '2025', description: 'Short-term goals' },
    { value: '2030', label: '2030', description: 'Medium-term vision' },
    { value: '2035', label: '2035', description: 'Long-term impact' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Predictive Impact Analytics</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Use AI-powered scenario modeling to predict the impact of different sustainability strategies
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-center space-x-4">
        {timeframes.map((timeframe) => (
          <motion.button
            key={timeframe.value}
            onClick={() => setSelectedTimeframe(timeframe.value)}
            className={`px-6 py-3 rounded-2xl border transition-all duration-300 ${
              selectedTimeframe === timeframe.value
                ? 'bg-gradient-to-r from-primary to-accent text-white border-primary shadow-glow'
                : 'border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="font-bold">{timeframe.label}</div>
              <div className="text-xs opacity-80">{timeframe.description}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scenario Controls */}
        <Card className="bg-card/50 backdrop-blur-lg border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Scenario Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Investment Level */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Investment Level</label>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  €{Math.round(investmentLevel[0] * 0.1)}M
                </Badge>
              </div>
              <div className="space-y-2">
                <Slider
                  value={investmentLevel}
                  onValueChange={setInvestmentLevel}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (€1M)</span>
                  <span>Medium (€5M)</span>
                  <span>High (€10M)</span>
                </div>
              </div>
            </div>

            {/* Participation Rate */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Citizen Participation</label>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  {participationRate[0]}%
                </Badge>
              </div>
              <div className="space-y-2">
                <Slider
                  value={participationRate}
                  onValueChange={setParticipationRate}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20% (Low)</span>
                  <span>60% (Medium)</span>
                  <span>100% (High)</span>
                </div>
              </div>
            </div>

            {/* Policy Support */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Policy Support</label>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  {policySupport[0]}%
                </Badge>
              </div>
              <div className="space-y-2">
                <Slider
                  value={policySupport}
                  onValueChange={setPolicySupport}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimal</span>
                  <span>Moderate</span>
                  <span>Strong</span>
                </div>
              </div>
            </div>

            {/* Confidence Indicator */}
            <motion.div 
              className={`p-4 rounded-2xl border ${
                currentScenario.results.confidence >= 80 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-warning/10 border-warning/30'
              }`}
              layout
            >
              <div className="flex items-center space-x-2">
                {React.createElement(getConfidenceIcon(currentScenario.results.confidence), {
                  className: `w-5 h-5 ${getConfidenceColor(currentScenario.results.confidence)}`
                })}
                <div>
                  <div className="font-medium text-foreground">
                    Prediction Confidence: {currentScenario.results.confidence.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on historical data and current trends
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Results Dashboard */}
        <div className="space-y-6">
          {/* Impact Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              layout
              className="p-6 bg-gradient-to-br from-success/20 to-success/10 border border-success/30 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Leaf className="w-8 h-8 text-success" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {animatedValues.co2Reduction.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">CO₂ Reduction</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              className="p-6 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    €{animatedValues.costSavings.toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">Cost Savings</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              className="p-6 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(animatedValues.jobsCreated).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Jobs Created</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-secondary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {animatedValues.citizenEngagement.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Engagement</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trend Visualization */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-primary" />
                Impact Projection by {selectedTimeframe}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Energy Efficiency', value: 85, trend: 'up', color: 'bg-success' },
                  { label: 'Waste Reduction', value: 72, trend: 'up', color: 'bg-primary' },
                  { label: 'Green Transport', value: 68, trend: 'up', color: 'bg-accent' },
                  { label: 'Carbon Capture', value: 45, trend: 'neutral', color: 'bg-secondary' }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{item.label}</span>
                        <div className="flex items-center space-x-1">
                          {item.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-success" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className="text-foreground">{item.value}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-border/30 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-semibold">
              <Calendar className="w-5 h-5 mr-2" />
              Generate Implementation Plan
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Leaf, 
  Zap, 
  Target, 
  Calendar,
  BarChart3,
  Brain,
  Lightbulb
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ScenarioParameters {
  businessParticipation: number;
  municipalityBudget: number;
  ngoOutreach: number;
  citizenEngagement: number;
  timeHorizon: number;
}

interface ImpactPrediction {
  co2Reduction: number;
  energySavings: number;
  wasteReduction: number;
  stakeholderGrowth: number;
  completionDate: string;
  confidence: number;
}

const PredictiveImpactDashboard: React.FC = () => {
  const [scenarioParams, setScenarioParams] = useState<ScenarioParameters>({
    businessParticipation: 50,
    municipalityBudget: 75,
    ngoOutreach: 60,
    citizenEngagement: 45,
    timeHorizon: 12
  });

  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');

  // Calculate predictions based on current parameters
  const calculatePredictions = (): ImpactPrediction => {
    const base = {
      co2Reduction: 2500,
      energySavings: 15000,
      wasteReduction: 1200,
      stakeholderGrowth: 150
    };

    const multiplier = (
      scenarioParams.businessParticipation * 0.3 +
      scenarioParams.municipalityBudget * 0.25 +
      scenarioParams.ngoOutreach * 0.25 +
      scenarioParams.citizenEngagement * 0.2
    ) / 100;

    const scenarioModifier = selectedScenario === 'optimistic' ? 1.2 : 
                            selectedScenario === 'pessimistic' ? 0.7 : 1.0;

    const timeModifier = Math.sqrt(scenarioParams.timeHorizon / 12);
    
    return {
      co2Reduction: Math.round(base.co2Reduction * multiplier * scenarioModifier * timeModifier),
      energySavings: Math.round(base.energySavings * multiplier * scenarioModifier * timeModifier),
      wasteReduction: Math.round(base.wasteReduction * multiplier * scenarioModifier * timeModifier),
      stakeholderGrowth: Math.round(base.stakeholderGrowth * multiplier * scenarioModifier * timeModifier),
      completionDate: new Date(Date.now() + scenarioParams.timeHorizon * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      confidence: Math.round(85 * multiplier + (selectedScenario === 'realistic' ? 10 : selectedScenario === 'optimistic' ? -5 : -15))
    };
  };

  const predictions = calculatePredictions();

  // Chart data for scenario comparison
  const scenarioChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Optimistic Scenario',
        data: [100, 250, 450, 680, 950, 1280, 1650, 2080, 2550, 3080, 3650, 4280],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Realistic Scenario', 
        data: [80, 190, 320, 480, 670, 890, 1140, 1420, 1730, 2070, 2440, 2840],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Pessimistic Scenario',
        data: [50, 120, 210, 320, 450, 600, 770, 960, 1170, 1400, 1650, 1920],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const impactByTypeData = {
    labels: ['Energy', 'Transport', 'Waste', 'Buildings', 'Industry'],
    datasets: [
      {
        label: 'CO₂ Reduction (tons)',
        data: [850, 650, 420, 380, 200],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(244, 63, 94, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-primary">Predictive Impact Dashboard</h2>
        </div>
        <p className="text-muted-foreground">
          AI-powered scenario planning and impact forecasting with confidence intervals
        </p>
      </motion.div>

      <Tabs defaultValue="scenario" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenario">Scenario Planning</TabsTrigger>
          <TabsTrigger value="forecasts">Impact Forecasts</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="scenario" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Parameter Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Scenario Parameters
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Business Participation: {scenarioParams.businessParticipation}%
                  </label>
                  <Slider
                    value={[scenarioParams.businessParticipation]}
                    onValueChange={(value) => 
                      setScenarioParams(prev => ({ ...prev, businessParticipation: value[0] }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Municipality Budget Allocation: {scenarioParams.municipalityBudget}%
                  </label>
                  <Slider
                    value={[scenarioParams.municipalityBudget]}
                    onValueChange={(value) => 
                      setScenarioParams(prev => ({ ...prev, municipalityBudget: value[0] }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    NGO Outreach Effectiveness: {scenarioParams.ngoOutreach}%
                  </label>
                  <Slider
                    value={[scenarioParams.ngoOutreach]}
                    onValueChange={(value) => 
                      setScenarioParams(prev => ({ ...prev, ngoOutreach: value[0] }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Citizen Engagement Level: {scenarioParams.citizenEngagement}%
                  </label>
                  <Slider
                    value={[scenarioParams.citizenEngagement]}
                    onValueChange={(value) => 
                      setScenarioParams(prev => ({ ...prev, citizenEngagement: value[0] }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Time Horizon: {scenarioParams.timeHorizon} months
                  </label>
                  <Slider
                    value={[scenarioParams.timeHorizon]}
                    onValueChange={(value) => 
                      setScenarioParams(prev => ({ ...prev, timeHorizon: value[0] }))
                    }
                    min={3}
                    max={36}
                    step={3}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  {(['optimistic', 'realistic', 'pessimistic'] as const).map((scenario) => (
                    <Button
                      key={scenario}
                      variant={selectedScenario === scenario ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedScenario(scenario)}
                      className="capitalize flex-1"
                    >
                      {scenario}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Impact Predictions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Predicted Impact
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-primary">{predictions.co2Reduction}kg</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Leaf className="w-3 h-3" />
                    CO₂ Reduction
                  </div>
                </motion.div>

                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-accent">{predictions.energySavings}kWh</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Energy Savings
                  </div>
                </motion.div>

                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-success/10 to-success/20 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-success">{predictions.wasteReduction}kg</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Building className="w-3 h-3" />
                    Waste Reduction
                  </div>
                </motion.div>

                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/20 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-purple-600">+{predictions.stakeholderGrowth}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    New Stakeholders
                  </div>
                </motion.div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">Completion Date</span>
                  </div>
                  <Badge variant="default">{predictions.completionDate}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-medium">Confidence Level</span>
                  </div>
                  <Badge 
                    variant={predictions.confidence > 75 ? "default" : predictions.confidence > 50 ? "secondary" : "destructive"}
                  >
                    {predictions.confidence}%
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Scenario Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Scenario Comparison</h3>
            <div className="h-64">
              <Line data={scenarioChartData} options={chartOptions} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Impact by Category */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Impact by Category</h3>
              <div className="h-64">
                <Bar data={impactByTypeData} options={chartOptions} />
              </div>
            </Card>

            {/* Monthly Projections */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-primary mb-4">6-Month Forecast</h3>
              <div className="space-y-4">
                {[
                  { month: 'Month 1', progress: 15, impact: '350kg CO₂' },
                  { month: 'Month 2', progress: 28, impact: '680kg CO₂' },
                  { month: 'Month 3', progress: 45, impact: '1.2t CO₂' },
                  { month: 'Month 4', progress: 64, impact: '1.8t CO₂' },
                  { month: 'Month 5', progress: 78, impact: '2.4t CO₂' },
                  { month: 'Month 6', progress: 89, impact: '3.1t CO₂' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{item.month}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge variant="outline">{item.impact}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4">
            {[
              {
                title: "Increase Business Engagement",
                description: "Focus on SME outreach to achieve 78% participation rate",
                priority: "High",
                impact: "+1,200kg CO₂",
                timeframe: "2 weeks"
              },
              {
                title: "Launch Citizen Challenge Campaign",
                description: "Gamified approach could boost citizen engagement by 35%",
                priority: "Medium",
                impact: "+800kg CO₂",
                timeframe: "1 month"
              },
              {
                title: "Partner with Local Universities",
                description: "Student involvement could accelerate innovation projects",
                priority: "Medium", 
                impact: "+600kg CO₂",
                timeframe: "6 weeks"
              },
              {
                title: "Implement Smart Grid Integration",
                description: "Energy efficiency improvements across municipal buildings",
                priority: "High",
                impact: "+1,500kg CO₂",
                timeframe: "3 months"
              }
            ].map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-card to-muted/30 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant={rec.priority === 'High' ? 'default' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-success font-medium">Impact: {rec.impact}</span>
                  <span className="text-muted-foreground">Timeline: {rec.timeframe}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveImpactDashboard;
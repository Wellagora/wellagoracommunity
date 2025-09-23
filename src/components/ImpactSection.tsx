import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Leaf,
  Droplets,
  Zap,
  Recycle,
  Users,
  Target,
  Award,
  BarChart3,
  Globe,
  TreePine,
  Wind
} from "lucide-react";

const ImpactSection = () => {
  const impactMetrics = [
    {
      icon: Leaf,
      title: "CO₂ Saved",
      value: "2,847",
      unit: "tons",
      change: "+18%",
      description: "Carbon emissions prevented this year",
      color: "success"
    },
    {
      icon: TreePine,
      title: "Trees Planted",
      value: "23,456",
      unit: "trees",
      change: "+24%",
      description: "New trees planted by community",
      color: "primary"
    },
    {
      icon: Droplets,
      title: "Water Saved",
      value: "1.2M",
      unit: "liters",
      change: "+12%",
      description: "Water conserved through challenges",
      color: "accent"
    },
    {
      icon: Recycle,
      title: "Waste Reduced",
      value: "847",
      unit: "tons",
      change: "+31%",
      description: "Waste diverted from landfills",
      color: "warning"
    }
  ];

  const regionalProgress = [
    {
      region: "Munich Region",
      progress: 78,
      participants: "12.4K",
      impact: "245 tons CO₂ saved",
      color: "primary"
    },
    {
      region: "Berlin Region", 
      progress: 65,
      participants: "18.7K",
      impact: "392 tons CO₂ saved",
      color: "accent"
    },
    {
      region: "Hamburg Region",
      progress: 82,
      participants: "9.8K",
      impact: "187 tons CO₂ saved", 
      color: "success"
    },
    {
      region: "Stuttgart Region",
      progress: 71,
      participants: "7.5K",
      impact: "156 tons CO₂ saved",
      color: "warning"
    }
  ];

  const sdgGoals = [
    { goal: "Climate Action", progress: 76, icon: Globe },
    { goal: "Clean Energy", progress: 68, icon: Zap },
    { goal: "Sustainable Cities", progress: 82, icon: Users },
    { goal: "Life on Land", progress: 74, icon: TreePine },
    { goal: "Clean Water", progress: 71, icon: Droplets },
    { goal: "Responsible Consumption", progress: 79, icon: Recycle }
  ];

  return (
    <section id="impact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-success/10 text-success border-success/20 mb-4">
            <TrendingUp className="w-4 h-4 mr-1" />
            Collective Impact
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Measuring Real{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Environmental Impact
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Track the collective environmental impact of our community. Every action counts, 
            every challenge completed moves us closer to a sustainable future.
          </p>
        </div>

        {/* Key Impact Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactMetrics.map((metric, index) => (
            <Card 
              key={metric.title} 
              className="relative overflow-hidden shadow-card hover:shadow-eco transition-smooth group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${metric.color}/10 rounded-full flex items-center justify-center`}>
                    <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                  </div>
                  <Badge className={`bg-${metric.color}/10 text-${metric.color} border-${metric.color}/20`}>
                    {metric.change}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <h4 className="font-semibold text-foreground">{metric.title}</h4>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
              
              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-${metric.color}/5 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none`}></div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Regional Progress */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-primary" />
              Regional Progress
            </h3>
            
            <div className="space-y-6">
              {regionalProgress.map((region, index) => (
                <Card key={region.region} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.participants} participants • {region.impact}
                        </p>
                      </div>
                      <Badge className={`bg-${region.color}/10 text-${region.color} border-${region.color}/20`}>
                        {region.progress}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Goal Progress</span>
                        <span className="font-medium text-foreground">{region.progress}%</span>
                      </div>
                      <Progress value={region.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="mt-6 bg-gradient-earth text-white border-0">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-lg mb-2">Global Network</h4>
                <p className="text-white/90 text-sm mb-4">
                  Part of a growing international network of sustainable regions
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">25</div>
                    <div className="text-xs text-white/80">Regions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-xs text-white/80">Countries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">180K</div>
                    <div className="text-xs text-white/80">Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SDG Goals Progress */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-primary" />
              UN SDG Contributions
            </h3>
            
            <div className="space-y-4 mb-6">
              {sdgGoals.map((goal, index) => (
                <div key={goal.goal} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <goal.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{goal.goal}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-success" />
                  Sustainability Recognition
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">UN Global Compact Member</span>
                    <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carbon Neutral Platform</span>
                    <Badge className="bg-success/10 text-success border-success/20">Certified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ISO 14001 Environmental</span>
                    <Badge className="bg-success/10 text-success border-success/20">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold text-foreground mb-2">Get Your Impact Report</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download detailed analytics of your personal and regional impact
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-gradient-primary hover:shadow-glow transition-smooth">
                    Download Personal Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Regional Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-nature border-0 shadow-glow">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Ready to Amplify Your Impact?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of individuals, businesses, and organizations making a real difference. 
                Every action counts towards a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth px-8">
                  Start Making Impact
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 px-8">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
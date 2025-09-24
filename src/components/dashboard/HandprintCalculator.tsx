import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Minus,
  TrendingUp,
  TreePine,
  Zap,
  Droplets,
  Recycle,
  Users,
  Calculator,
  Target,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface HandprintData {
  category: string;
  positiveImpact: number;
  negativeImpact: number;
  netImpact: number;
  icon: JSX.Element;
  color: string;
  actions: string[];
}

const HandprintCalculator = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("energy");

  const handprintData: HandprintData[] = [
    {
      category: "Energy",
      positiveImpact: 156.8,
      negativeImpact: 89.2,
      netImpact: 67.6,
      icon: <Zap className="w-5 h-5" />,
      color: "text-yellow-600 bg-yellow-100",
      actions: [
        "Solar panel installation (+45 kg CO₂)",
        "LED bulb replacements (+12 kg CO₂)",
        "Energy audit completion (+8 kg CO₂)",
        "Smart thermostat usage (+2.6 kg CO₂)"
      ]
    },
    {
      category: "Transport", 
      positiveImpact: 234.5,
      negativeImpact: 187.3,
      netImpact: 47.2,
      icon: <TreePine className="w-5 h-5" />,
      color: "text-green-600 bg-green-100",
      actions: [
        "Bike commuting (+89 kg CO₂)",
        "EV car sharing promotion (+67 kg CO₂)",
        "Public transit advocacy (+45 kg CO₂)",
        "Walking meetings (+33.5 kg CO₂)"
      ]
    },
    {
      category: "Water",
      positiveImpact: 89.3,
      negativeImpact: 34.7,
      netImpact: 54.6,
      icon: <Droplets className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-100",
      actions: [
        "Rainwater harvesting system (+34 kg CO₂)",
        "Greywater recycling (+23 kg CO₂)",
        "Leak detection program (+18.3 kg CO₂)",
        "Water conservation education (+14 kg CO₂)"
      ]
    },
    {
      category: "Waste",
      positiveImpact: 123.7,
      negativeImpact: 56.4,
      netImpact: 67.3,
      icon: <Recycle className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-100",
      actions: [
        "Community composting setup (+56 kg CO₂)",
        "Plastic-free initiatives (+34.7 kg CO₂)",
        "Repair cafe organization (+23 kg CO₂)",
        "Zero-waste workshops (+10 kg CO₂)"
      ]
    }
  ];

  const totalPositiveImpact = handprintData.reduce((sum, item) => sum + item.positiveImpact, 0);
  const totalNegativeImpact = handprintData.reduce((sum, item) => sum + item.negativeImpact, 0);
  const totalNetImpact = totalPositiveImpact - totalNegativeImpact;

  const selectedData = handprintData.find(item => item.category.toLowerCase() === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Plus className="w-6 h-6 text-emerald-600" />
            <span>Carbon Handprint Calculator</span>
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </CardTitle>
          <CardDescription className="text-lg">
            Track your positive environmental impact, not just your footprint
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Positive Impact</p>
                <p className="text-2xl font-bold text-green-800">+{totalPositiveImpact.toFixed(1)} kg</p>
                <p className="text-xs text-green-600">CO₂ equivalent saved/offset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Minus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Carbon Footprint</p>
                <p className="text-2xl font-bold text-orange-800">{totalNegativeImpact.toFixed(1)} kg</p>
                <p className="text-xs text-orange-600">CO₂ equivalent emitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Net Impact</p>
                <p className="text-2xl font-bold text-emerald-800">+{totalNetImpact.toFixed(1)} kg</p>
                <p className="text-xs text-emerald-600">Total positive contribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {handprintData.map((category) => (
          <Button
            key={category.category}
            variant={selectedCategory === category.category.toLowerCase() ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.category.toLowerCase())}
            className="flex items-center space-x-2"
          >
            {category.icon}
            <span>{category.category}</span>
            <Badge variant="secondary" className={category.color}>
              +{category.netImpact.toFixed(1)}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Detailed View */}
      {selectedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impact Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {selectedData.icon}
                <span>{selectedData.category} Impact</span>
              </CardTitle>
              <CardDescription>
                Your positive contributions vs. consumption in {selectedData.category.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Positive Impact</span>
                  <span className="font-medium text-green-600">+{selectedData.positiveImpact} kg CO₂</span>
                </div>
                <Progress value={85} className="bg-green-100" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Carbon Footprint</span>
                  <span className="font-medium text-orange-600">{selectedData.negativeImpact} kg CO₂</span>
                </div>
                <Progress value={45} className="bg-orange-100" />
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">Net Impact</span>
                  <span className="text-lg font-bold text-emerald-800">+{selectedData.netImpact} kg CO₂</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  Your positive contribution to the environment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Your Positive Actions</span>
              </CardTitle>
              <CardDescription>
                Recent actions contributing to your handprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedData.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-card border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="flex-1 text-sm">{action}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Add New Action
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Community Impact</span>
          </CardTitle>
          <CardDescription>
            See how your handprint compares to the community average
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalNetImpact.toFixed(0)} kg</p>
              <p className="text-sm text-muted-foreground">Your Net Impact</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-muted-foreground">127 kg</p>
              <p className="text-sm text-muted-foreground">Community Average</p>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <p className="text-2xl font-bold text-green-600">+{(totalNetImpact - 127).toFixed(0)} kg</p>
              <p className="text-sm text-green-600">Above Average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandprintCalculator;
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Calculator, 
  Leaf, 
  Car, 
  Lightbulb, 
  Droplets, 
  Recycle,
  TrendingUp,
  Target,
  Award,
  Calendar
} from 'lucide-react';

interface HandprintData {
  transport: number;
  energy: number;
  waste: number;
  water: number;
  community: number;
  totalCo2Saved: number;
  treesEquivalent: number;
  rank: string;
}

const HandprintCalculator = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'trends' | 'goals'>('calculator');
  const [handprint, setHandprint] = useState<HandprintData>({
    transport: 0,
    energy: 0, 
    waste: 0,
    water: 0,
    community: 0,
    totalCo2Saved: 0,
    treesEquivalent: 0,
    rank: 'Kezdő'
  });

  const [inputs, setInputs] = useState({
    bikeKm: '',
    publicTransportKm: '',
    energySaved: '',
    wasteRecycled: '',
    waterSaved: '',
    communityHours: ''
  });

  const calculateHandprint = () => {
    // Transport impact (kg CO2)
    const bikeImpact = parseFloat(inputs.bikeKm) * 0.21; // Saved vs car
    const publicTransportImpact = parseFloat(inputs.publicTransportKm) * 0.15;
    const transport = bikeImpact + publicTransportImpact;

    // Energy impact (kg CO2) 
    const energy = parseFloat(inputs.energySaved) * 0.4; // kWh to CO2

    // Waste impact (kg CO2)
    const waste = parseFloat(inputs.wasteRecycled) * 2.1; // Recycling benefit

    // Water impact (kg CO2)
    const water = parseFloat(inputs.waterSaved) * 0.0004; // Liters to CO2

    // Community impact (multiplier effect)
    const communityMultiplier = parseFloat(inputs.communityHours) * 5;
    const community = (transport + energy + waste + water) * (communityMultiplier / 100);

    const totalCo2Saved = transport + energy + waste + water + community;
    const treesEquivalent = Math.round(totalCo2Saved / 22); // 1 tree = ~22kg CO2/year

    let rank = 'Kezdő';
    if (totalCo2Saved > 1000) rank = 'Fenntarthatósági Hős';
    else if (totalCo2Saved > 500) rank = 'Környezeti Bajnok';
    else if (totalCo2Saved > 200) rank = 'Zöld Aktivista';
    else if (totalCo2Saved > 50) rank = 'Öko Harcos';

    setHandprint({
      transport: Math.round(transport),
      energy: Math.round(energy),
      waste: Math.round(waste), 
      water: Math.round(water),
      community: Math.round(community),
      totalCo2Saved: Math.round(totalCo2Saved),
      treesEquivalent,
      rank
    });
  };

  useEffect(() => {
    calculateHandprint();
  }, [inputs]);

  const getRankColor = (rank: string) => {
    switch(rank) {
      case 'Fenntarthatósági Hős': return 'bg-accent/20 text-accent border-accent/30';
      case 'Környezeti Bajnok': return 'bg-success/20 text-success border-success/30';
      case 'Zöld Aktivista': return 'bg-primary/20 text-primary border-primary/30';
      case 'Öko Harcos': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const personalizationTips = [
    "Eddigi aktivitásaid alapján: Fokozd a biciklizést heti 2 nappal 🚴‍♂️",
    "A profilod szerint: Próbálkozz házi komposztálással 🌱",
    "Lokációd alapján: Csatlakozz a helyi környezetvédelmi csoporthoz 🌍",
    "Érdeklődésed szerint: Részt vehetsz zöld tech meetupokon 💡"
  ];

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span>Kéznyom Számító & Perszonalizáció</span>
            </div>
            <Badge className={getRankColor(handprint.rank)}>
              {handprint.rank}
            </Badge>
          </CardTitle>
          <div className="flex space-x-2">
            {[
              { id: 'calculator', label: 'Számító', icon: Calculator },
              { id: 'trends', label: 'Trendek', icon: TrendingUp },
              { id: 'goals', label: 'Célok', icon: Target }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-1"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {activeTab === 'calculator' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Havi Aktivitásaid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  Biciklizés (km/hó)
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={inputs.bikeKm}
                  onChange={(e) => setInputs(prev => ({...prev, bikeKm: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  Tömegközlekedés autó helyett (km/hó)
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={inputs.publicTransportKm}
                  onChange={(e) => setInputs(prev => ({...prev, publicTransportKm: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-warning" />
                  Energia megtakarítás (kWh/hó)
                </label>
                <Input
                  type="number"
                  placeholder="30"
                  value={inputs.energySaved}
                  onChange={(e) => setInputs(prev => ({...prev, energySaved: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Recycle className="w-4 h-4 mr-2 text-success" />
                  Újrahasznosítás (kg/hó)
                </label>
                <Input
                  type="number"
                  placeholder="15"
                  value={inputs.wasteRecycled}
                  onChange={(e) => setInputs(prev => ({...prev, wasteRecycled: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Droplets className="w-4 h-4 mr-2 text-info" />
                  Víz megtakarítás (liter/hó)
                </label>
                <Input
                  type="number"
                  placeholder="500"
                  value={inputs.waterSaved}
                  onChange={(e) => setInputs(prev => ({...prev, waterSaved: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Award className="w-4 h-4 mr-2 text-accent" />
                  Közösségi aktivizmus (óra/hó)
                </label>
                <Input
                  type="number"
                  placeholder="8"
                  value={inputs.communityHours}
                  onChange={(e) => setInputs(prev => ({...prev, communityHours: e.target.value}))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-success" />
                Pozitív Környezeti Kéznyomod
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Impact */}
              <div className="text-center bg-gradient-to-r from-success/10 to-primary/10 p-6 rounded-lg border border-success/20">
                <div className="text-3xl font-bold text-success mb-2">
                  {handprint.totalCo2Saved} kg CO₂
                </div>
                <div className="text-sm text-muted-foreground mb-2">megtakarítva havonta</div>
                <div className="text-lg font-medium text-primary">
                  🌳 {handprint.treesEquivalent} fa egyenérték
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                {[
                  { label: 'Közlekedés', value: handprint.transport, icon: Car, color: 'text-primary' },
                  { label: 'Energia', value: handprint.energy, icon: Lightbulb, color: 'text-warning' },
                  { label: 'Hulladék', value: handprint.waste, icon: Recycle, color: 'text-success' },
                  { label: 'Víz', value: handprint.water, icon: Droplets, color: 'text-info' },
                  { label: 'Közösségi hatás', value: handprint.community, icon: Award, color: 'text-accent' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-medium">{item.value} kg CO₂</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle>Havi Trendek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">+23%</div>
                  <div className="text-sm text-muted-foreground">CO₂ megtakarítás növekedés</div>
                </div>
                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">12 nap</div>
                  <div className="text-sm text-muted-foreground">Sorozatos fenntartható nap</div>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">Ranglétra #47</div>
                  <div className="text-sm text-muted-foreground">Helyi rangsorban</div>
                </div>
              </div>

              {/* Personalized Tips */}
              <div>
                <h4 className="font-semibold mb-3">🎯 Személyre Szabott Tippek</h4>
                <div className="grid gap-2">
                  {personalizationTips.map((tip, index) => (
                    <div key={index} className="p-3 bg-card/50 rounded-lg border border-border text-sm">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'goals' && (
        <Card>
          <CardHeader>
            <CardTitle>Fenntarthatósági Célok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {[
                { label: 'Havi 500 kg CO₂ megtakarítás', progress: 68, current: 340, target: 500 },
                { label: 'Környezeti Bajnok rang elérése', progress: 45, current: 340, target: 750 },
                { label: '5 kihívás teljesítése', progress: 80, current: 4, target: 5 },
                { label: '20 fa egyenérték elérése', progress: 75, current: 15, target: 20 }
              ].map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{goal.label}</span>
                    <span className="text-muted-foreground">{goal.current}/{goal.target}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">🏆 Következő Mérföldkő</h4>
              <div className="bg-gradient-to-r from-primary/10 to-success/10 p-4 rounded-lg">
                <div className="font-medium mb-1">Környezeti Bajnok rang</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Még 410 kg CO₂ megtakarítás szükséges
                </div>
                <div className="text-xs text-primary">
                  Becsült idő: 3 hét az eddigi tempóban
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HandprintCalculator;
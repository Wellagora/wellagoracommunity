import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Calendar,
  Building2,
  Users,
  Briefcase,
  TrendingDown
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
  activitiesCount: number;
  totalPoints: number;
}

const HandprintCalculator = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const isOrganization = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);
  
  const [activeTab, setActiveTab] = useState<'calculator' | 'trends' | 'goals'>('calculator');
  const [handprint, setHandprint] = useState<HandprintData>({
    transport: 0,
    energy: 0, 
    waste: 0,
    water: 0,
    community: 0,
    totalCo2Saved: 0,
    treesEquivalent: 0,
    rank: t('handprint.beginner'),
    activitiesCount: 0,
    totalPoints: 0
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

    let rank = t('handprint.beginner');
    if (totalCo2Saved > 1000) rank = t('handprint.sustainability_hero');
    else if (totalCo2Saved > 500) rank = t('handprint.environmental_champion');
    else if (totalCo2Saved > 200) rank = t('handprint.green_activist');
    else if (totalCo2Saved > 50) rank = t('handprint.eco_warrior');

    setHandprint({
      transport: Math.round(transport),
      energy: Math.round(energy),
      waste: Math.round(waste), 
      water: Math.round(water),
      community: Math.round(community),
      totalCo2Saved: Math.round(totalCo2Saved),
      treesEquivalent,
      rank,
      activitiesCount: Math.round((transport + energy + waste + water) / 10),
      totalPoints: Math.round(totalCo2Saved * 2)
    });
  };

  useEffect(() => {
    calculateHandprint();
  }, [inputs]);

  const getRankColor = (rank: string) => {
    if (rank === t('handprint.sustainability_hero')) return 'bg-accent/20 text-accent border-accent/30';
    if (rank === t('handprint.environmental_champion')) return 'bg-success/20 text-success border-success/30';
    if (rank === t('handprint.green_activist')) return 'bg-primary/20 text-primary border-primary/30';
    if (rank === t('handprint.eco_warrior')) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-muted/20 text-muted-foreground border-muted/30';
  };

  const personalizationTips = [
    t('handprint.bike_tip'),
    t('handprint.compost_tip'),
    t('handprint.community_tip'),
    t('handprint.tech_tip')
  ];

  const regionalTips = [
    t('handprint.sponsor_local_challenge'),
    t('handprint.partnerships_3_ngo'),
    t('handprint.media_opportunity'),
    t('handprint.organize_green_office')
  ];

  // Regional Impact Hub view for organizations
  if (isOrganization) {
    return (
      <div className="space-y-6">
        {/* Header with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>{t('handprint.regional_impact_calculator')}</span>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('handprint.organizational_rank')}
              </Badge>
            </CardTitle>
            <div className="flex space-x-2">
              {[
                { id: 'calculator', label: t('handprint.impact_meter'), icon: Calculator },
                { id: 'trends', label: t('handprint.regional_trends'), icon: TrendingUp },
                { id: 'goals', label: t('handprint.initiatives'), icon: Target }
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
            {/* Regional Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('handprint.monthly_activities')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    {t('handprint.activated_citizens')}
                  </label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={inputs.bikeKm}
                    onChange={(e) => setInputs(prev => ({...prev, bikeKm: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-accent" />
                    {t('handprint.sponsored_challenges')}
                  </label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={inputs.publicTransportKm}
                    onChange={(e) => setInputs(prev => ({...prev, publicTransportKm: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-success" />
                    {t('handprint.corporate_initiatives')}
                  </label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={inputs.energySaved}
                    onChange={(e) => setInputs(prev => ({...prev, energySaved: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Award className="w-4 h-4 mr-2 text-warning" />
                    {t('handprint.partnerships_ngo')}
                  </label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={inputs.wasteRecycled}
                    onChange={(e) => setInputs(prev => ({...prev, wasteRecycled: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-info" />
                    {t('handprint.media_appearances')}
                  </label>
                  <Input
                    type="number"
                    placeholder="4"
                    value={inputs.waterSaved}
                    onChange={(e) => setInputs(prev => ({...prev, waterSaved: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Recycle className="w-4 h-4 mr-2 text-success" />
                    {t('handprint.co2_reduction_goal')}
                  </label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={inputs.communityHours}
                    onChange={(e) => setInputs(prev => ({...prev, communityHours: e.target.value}))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Regional Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  {t('handprint.regional_impact_summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Total Regional Impact */}
                <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {handprint.totalCo2Saved * 10} kg CO₂
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{t('handprint.regional_impact_monthly')}</div>
                  <div className="text-lg font-medium text-accent">
                    🌍 {Math.round(handprint.activitiesCount * 8.5)} {t('handprint.activated_citizens_count')}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  {[
                    { label: t('handprint.direct_corporate_impact'), value: handprint.transport * 3, icon: Building2, color: 'text-primary' },
                    { label: t('handprint.sponsored_challenges_impact'), value: handprint.energy * 4, icon: Award, color: 'text-warning' },
                    { label: t('handprint.community_multiplier'), value: handprint.community * 5, icon: Users, color: 'text-success' },
                    { label: t('handprint.partnership_impact'), value: handprint.waste * 2, icon: Briefcase, color: 'text-accent' }
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

                {/* Impact Score */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{t('handprint.regional_impact_score')}</span>
                    <span className="text-2xl font-bold text-primary">{handprint.totalPoints * 3}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('handprint.top_5_region')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trends' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('handprint.regional_opportunities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">+47%</div>
                    <div className="text-sm text-muted-foreground">{t('handprint.regional_participation_grows')}</div>
                  </div>
                  <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                    <div className="text-2xl font-bold text-success">8 {t('dashboard.partners')}</div>
                    <div className="text-sm text-muted-foreground">{t('handprint.active_collaborations')}</div>
                  </div>
                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                    <div className="text-2xl font-bold text-warning">#1 {t('handprint.company_rank')}</div>
                    <div className="text-sm text-muted-foreground">{t('handprint.local_sustainability_ranking')}</div>
                  </div>
                </div>

                {/* Regional Opportunities */}
                <div>
                  <h4 className="font-semibold mb-3">🎯 {t('handprint.regional_opportunities_title')}</h4>
                  <div className="grid gap-2">
                    {regionalTips.map((tip, index) => (
                      <div key={index} className="p-3 bg-card/50 rounded-lg border border-border text-sm">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional Map Insight */}
                <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                    {t('handprint.map_insights')}
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {t('handprint.map_insights_desc')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'goals' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('handprint.organizational_initiatives')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { label: t('handprint.q1_co2_reduction'), progress: 68, current: '6.8t', target: '10t' },
                  { label: t('handprint.activate_500_citizens'), progress: 72, current: 360, target: 500 },
                  { label: t('handprint.launch_10_challenges'), progress: 50, current: 5, target: 10 },
                  { label: t('handprint.build_5_partnerships'), progress: 80, current: 4, target: 5 }
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
                <h4 className="font-semibold mb-3">🏆 {t('handprint.next_milestone')}</h4>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                  <div className="font-medium mb-1">{t('handprint.sustainability_award')}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('handprint.milestone_requirements')}
                  </div>
                  <div className="text-xs text-primary">
                    {t('handprint.estimated_achievement')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Personal handprint calculator for citizens
  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span>{t('handprint.calculator_title')}</span>
            </div>
            <Badge className={getRankColor(handprint.rank)}>
              {handprint.rank}
            </Badge>
          </CardTitle>
          <div className="flex space-x-2">
            {[
              { id: 'calculator', label: t('handprint.calculator_tab'), icon: Calculator },
              { id: 'trends', label: t('handprint.trends_tab'), icon: TrendingUp },
              { id: 'goals', label: t('handprint.goals_tab'), icon: Target }
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
              <CardTitle>{t('handprint.your_activities')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Car className="w-4 h-4 mr-2 text-primary" />
                  {t('handprint.bike_km')}
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
                  {t('handprint.public_transport_km')}
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
                  {t('handprint.energy_saved_kwh')}
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
                  {t('handprint.waste_recycled_kg')}
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
                  {t('handprint.water_saved_liters')}
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
                  {t('handprint.community_hours')}
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
                {t('handprint.your_handprint')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Impact */}
              <div className="text-center bg-gradient-to-r from-success/10 to-primary/10 p-6 rounded-lg border border-success/20">
                <div className="text-3xl font-bold text-success mb-2">
                  {handprint.totalCo2Saved} kg CO₂
                </div>
                <div className="text-sm text-muted-foreground mb-2">{t('handprint.kg_co2_monthly')}</div>
                <div className="text-lg font-medium text-primary">
                  🌳 {handprint.treesEquivalent} {t('handprint.trees_planted')}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                {[
                  { label: t('handprint.transport'), value: handprint.transport, icon: Car, color: 'text-primary' },
                  { label: t('handprint.energy'), value: handprint.energy, icon: Lightbulb, color: 'text-warning' },
                  { label: t('handprint.waste'), value: handprint.waste, icon: Recycle, color: 'text-success' },
                  { label: t('handprint.water'), value: handprint.water, icon: Droplets, color: 'text-info' },
                  { label: t('handprint.community_impact'), value: handprint.community, icon: Award, color: 'text-accent' }
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
            <CardTitle>{t('handprint.track_progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">+23%</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.co2_saved')} {t('dashboard.monthly_growth')}</div>
                </div>
                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">12 {t('dashboard.days')}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.current_streak')}</div>
                </div>
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">{t('challenges.view_leaderboard')} #47</div>
                  <div className="text-sm text-muted-foreground">{t('handprint.local_sustainability_ranking')}</div>
                </div>
              </div>

              {/* Personalized Tips */}
              <div>
                <h4 className="font-semibold mb-3">🎯 {t('handprint.personalized_insights')}</h4>
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
            <CardTitle>{t('handprint.your_goals')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {[
                { label: t('handprint.q1_goal'), progress: 68, current: 340, target: 500 },
                { label: t('handprint.reach_green_activist'), progress: 45, current: 340, target: 750 },
                { label: t('handprint.complete_5_challenges'), progress: 80, current: 4, target: 5 },
                { label: t('common.trees') + ' 20', progress: 75, current: 15, target: 20 }
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
              <h4 className="font-semibold mb-3">🏆 {t('handprint.next_badge')}</h4>
              <div className="bg-gradient-to-r from-primary/10 to-success/10 p-4 rounded-lg">
                <div className="font-medium mb-1">{t('handprint.eco_warrior_badge')}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {t('handprint.badge_requirements')}
                </div>
                <div className="text-xs text-primary">
                  {t('handprint.estimated_achievement')}
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
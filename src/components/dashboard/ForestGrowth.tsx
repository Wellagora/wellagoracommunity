import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TreePine, Leaf, Flower, Sprout, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface ForestData {
  treesEquivalent: number;
  totalCo2Saved: number;
  level: number;
  nextLevelProgress: number;
}

const ForestGrowth = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [forestData, setForestData] = useState<ForestData>({
    treesEquivalent: 0,
    totalCo2Saved: 0,
    level: 1,
    nextLevelProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadForestData();
    }
  }, [user]);

  const loadForestData = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: activities, error } = await supabase
        .from('sustainability_activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startOfMonth.toISOString());

      if (error) throw error;

      const totalCo2 = activities?.reduce((sum, act) => sum + (act.impact_amount || 0), 0) || 0;
      const treesEquivalent = Math.round(totalCo2 / 21.77);
      const level = Math.floor(treesEquivalent / 10) + 1;
      const nextLevelProgress = ((treesEquivalent % 10) / 10) * 100;

      setForestData({
        treesEquivalent,
        totalCo2Saved: Math.round(totalCo2 * 10) / 10,
        level,
        nextLevelProgress
      });
    } catch (error) {
      console.error('Forest data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlantElements = () => {
    const elements = [];
    const trees = Math.min(forestData.treesEquivalent, 50); // max 50 fát jelenítünk meg
    
    // Fák
    for (let i = 0; i < Math.min(trees, 20); i++) {
      const left = (i * 5 + Math.random() * 3) % 95;
      const bottom = Math.random() * 60 + 10;
      const size = Math.random() * 1.5 + 1;
      const delay = Math.random() * 2;
      
      elements.push(
        <div
          key={`tree-${i}`}
          className="absolute transition-all duration-1000 ease-out animate-fade-in"
          style={{
            left: `${left}%`,
            bottom: `${bottom}%`,
            animationDelay: `${delay}s`,
            transform: `scale(${size})`
          }}
        >
          <TreePine 
            className="text-info drop-shadow-lg" 
            size={24 + Math.random() * 16}
            strokeWidth={2.5}
          />
        </div>
      );
    }
    
    // Cserjék
    const bushes = Math.min(Math.floor(trees * 0.8), 30);
    for (let i = 0; i < bushes; i++) {
      const left = (i * 3.5 + Math.random() * 5) % 95;
      const bottom = Math.random() * 50 + 5;
      const size = Math.random() * 0.8 + 0.6;
      const delay = Math.random() * 2.5;
      
      elements.push(
        <div
          key={`bush-${i}`}
          className="absolute transition-all duration-1000 ease-out animate-fade-in"
          style={{
            left: `${left}%`,
            bottom: `${bottom}%`,
            animationDelay: `${delay}s`,
            transform: `scale(${size})`
          }}
        >
          <Sprout 
            className="text-accent drop-shadow-md" 
            size={16 + Math.random() * 8}
            strokeWidth={2}
          />
        </div>
      );
    }
    
    // Virágok
    const flowers = Math.min(Math.floor(trees * 0.6), 40);
    for (let i = 0; i < flowers; i++) {
      const left = (i * 2.5 + Math.random() * 7) % 95;
      const bottom = Math.random() * 40 + 5;
      const colors = ['text-pink-500', 'text-yellow-400', 'text-purple-400', 'text-red-400', 'text-blue-400'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 3;
      
      elements.push(
        <div
          key={`flower-${i}`}
          className="absolute transition-all duration-1000 ease-out animate-fade-in"
          style={{
            left: `${left}%`,
            bottom: `${bottom}%`,
            animationDelay: `${delay}s`
          }}
        >
          <Flower 
            className={`${color} drop-shadow-md`} 
            size={12 + Math.random() * 8}
            strokeWidth={2}
          />
        </div>
      );
    }
    
    return elements;
  };

  if (loading) {
    return (
      <Card className="bg-glass border-accent/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-primary/30 rounded w-1/2"></div>
            <div className="h-48 bg-primary/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-glass border-accent/20 hover:shadow-premium transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-heading text-foreground flex items-center gap-2">
            <Leaf className="w-6 h-6 text-accent" />
            {t('dashboard.my_forest_growth')}
          </CardTitle>
          <Badge className="bg-gradient-vibrant text-white border-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('dashboard.level')} {forestData.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Forest Visualization - Elegant Deep Blue Glass */}
        <div className="relative bg-gradient-to-b from-primary/30 via-primary/20 to-primary/10 rounded-2xl border border-accent/20 overflow-hidden backdrop-blur-sm"
             style={{ height: '280px' }}>
          {/* Elegant blue atmospheric background */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent"></div>
          
          {/* Soft bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-accent/30 to-transparent"></div>
          
          {/* Növények */}
          {forestData.treesEquivalent === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3 px-4">
                <Sprout className="w-16 h-16 text-accent/50 mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">
                  {t('dashboard.start_planting')}
                </p>
              </div>
            </div>
          ) : (
            getPlantElements()
          )}
          
          {/* Elegant blue sparkle */}
          {forestData.treesEquivalent > 5 && (
            <div className="absolute top-4 right-4 text-accent animate-pulse">
              <Sparkles size={32} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Stats - Elegant Deep Blue Glass Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-glass rounded-xl p-3 border border-accent/20">
            <div className="text-3xl font-bold text-accent flex items-center justify-center gap-2">
              <TreePine className="w-7 h-7" />
              {forestData.treesEquivalent}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              {t('dashboard.trees_planted')}
            </div>
          </div>
          
          <div className="bg-glass rounded-xl p-3 border border-accent/20">
            <div className="text-2xl font-bold text-accent text-center">
              {forestData.totalCo2Saved}
              <span className="text-sm ml-1">kg</span>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              CO₂ {t('handprint.saved')}
            </div>
          </div>
        </div>

        {/* Progress to Next Level - Elegant Blue Styling */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">
              {t('dashboard.next_level_progress')}
            </span>
            <span className="text-accent font-bold">
              {Math.round(forestData.nextLevelProgress)}%
            </span>
          </div>
          <Progress 
            value={forestData.nextLevelProgress} 
            className="h-3 bg-primary/30"
          />
          <p className="text-xs text-muted-foreground text-center">
            {10 - (forestData.treesEquivalent % 10)} {t('dashboard.more_trees_next_level')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForestGrowth;

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
            className="text-green-700 dark:text-green-400 drop-shadow-lg" 
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
            className="text-green-600 dark:text-green-500 drop-shadow-md" 
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
      <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-green-200 dark:bg-green-800 rounded w-1/2"></div>
            <div className="h-48 bg-green-200 dark:bg-green-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            {t('dashboard.my_forest_growth')}
          </CardTitle>
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('dashboard.level')} {forestData.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Forest Visualization */}
        <div className="relative bg-gradient-to-b from-sky-200/50 via-green-100/30 to-green-200/50 dark:from-sky-900/30 dark:via-green-900/20 dark:to-green-800/30 rounded-2xl border-2 border-green-300/50 dark:border-green-700/50 overflow-hidden"
             style={{ height: '280px' }}>
          {/* Égbolt háttér */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200/70 to-transparent dark:from-sky-900/50"></div>
          
          {/* Fű talaj */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-600/40 to-transparent dark:from-green-800/40"></div>
          
          {/* Növények */}
          {forestData.treesEquivalent === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3 px-4">
                <Sprout className="w-16 h-16 text-green-400/50 dark:text-green-600/50 mx-auto" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  {t('dashboard.start_planting')}
                </p>
              </div>
            </div>
          ) : (
            getPlantElements()
          )}
          
          {/* Napsugarak */}
          {forestData.treesEquivalent > 5 && (
            <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">
              <Sparkles size={32} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-green-950/30 rounded-xl p-3 border border-green-300/50 dark:border-green-700/50">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
              <TreePine className="w-7 h-7" />
              {forestData.treesEquivalent}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 text-center mt-1">
              {t('dashboard.trees_planted')}
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-green-950/30 rounded-xl p-3 border border-green-300/50 dark:border-green-700/50">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 text-center">
              {forestData.totalCo2Saved}
              <span className="text-sm ml-1">kg</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-1">
              CO₂ {t('handprint.saved')}
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 dark:text-green-300 font-medium">
              {t('dashboard.next_level_progress')}
            </span>
            <span className="text-green-600 dark:text-green-400 font-bold">
              {Math.round(forestData.nextLevelProgress)}%
            </span>
          </div>
          <Progress 
            value={forestData.nextLevelProgress} 
            className="h-3 bg-green-200/50 dark:bg-green-900/30"
          />
          <p className="text-xs text-green-600 dark:text-green-400 text-center">
            {10 - (forestData.treesEquivalent % 10)} {t('dashboard.more_trees_next_level')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForestGrowth;

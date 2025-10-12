import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Leaf, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  Car,
  Utensils,
  Trash2,
  Droplet,
  TreePine
} from 'lucide-react';

interface HandprintData {
  totalCo2Saved: number;
  treesEquivalent: number;
  pointsEarned: number;
  rank: string;
  categoryBreakdown: {
    energy: number;
    transport: number;
    food: number;
    waste: number;
    water: number;
    other: number;
  };
  challengesCompleted: number;
  currentStreak: number;
  multiplier: number;
}

const HandprintCalculator = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [handprint, setHandprint] = useState<HandprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (user) {
      loadHandprintData();
    }
  }, [user]);

  const loadHandprintData = async () => {
    try {
      setLoading(true);

      // Calculate handprint from sustainability_activities
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: activities, error } = await supabase
        .from('sustainability_activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startOfMonth.toISOString());

      if (error) throw error;

      if (!activities || activities.length === 0) {
        setHandprint({
          totalCo2Saved: 0,
          treesEquivalent: 0,
          pointsEarned: 0,
          rank: 'Kezdő',
          categoryBreakdown: {
            energy: 0,
            transport: 0,
            food: 0,
            waste: 0,
            water: 0,
            other: 0
          },
          challengesCompleted: 0,
          currentStreak: 0,
          multiplier: 1.0
        });
        setLoading(false);
        return;
      }

      // Calculate totals
      const totalCo2 = activities.reduce((sum, act) => sum + (act.impact_amount || 0), 0);
      const totalPoints = activities.reduce((sum, act) => sum + (act.points_earned || 0), 0);
      
      // Calculate category breakdown
      const breakdown = activities.reduce((acc, act) => {
        const category = act.activity_type.split('_')[0]; // energy, transport, etc.
        if (!acc[category as keyof typeof acc]) {
          acc.other = (acc.other || 0) + (act.impact_amount || 0);
        } else {
          acc[category as keyof typeof acc] += act.impact_amount || 0;
        }
        return acc;
      }, {
        energy: 0,
        transport: 0,
        food: 0,
        waste: 0,
        water: 0,
        other: 0
      });

      // Calculate rank based on CO2 saved
      let rank = t('handprint.rank.beginner');
      if (totalCo2 > 1000) rank = t('handprint.rank.master');
      else if (totalCo2 > 500) rank = t('handprint.rank.advanced');
      else if (totalCo2 > 200) rank = t('handprint.rank.experienced');
      else if (totalCo2 > 50) rank = t('handprint.rank.developing');

      // Trees equivalent (1 tree absorbs ~21.77 kg CO2/year)
      const treesEquivalent = Math.round(totalCo2 / 21.77);

      // Calculate streak (consecutive days with activities)
      const uniqueDays = [...new Set(activities.map(a => a.date))].sort();
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = uniqueDays.length - 1; i >= 0; i--) {
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(uniqueDays[i]).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= currentStreak + 1) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate multiplier (community effect, sharing bonus)
      const multiplier = 1.0 + (currentStreak * 0.1) + (activities.length * 0.05);

      setHandprint({
        totalCo2Saved: Math.round(totalCo2 * 10) / 10,
        treesEquivalent,
        pointsEarned: totalPoints,
        rank,
        categoryBreakdown: breakdown,
        challengesCompleted: activities.length,
        currentStreak,
        multiplier: Math.round(multiplier * 10) / 10
      });

    } catch (error) {
      console.error('Error loading handprint:', error);
      toast({
        title: t('common.error'),
        description: t('handprint.error_loading'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    setCalculating(true);
    await loadHandprintData();
    setCalculating(false);
    toast({
      title: t('handprint.recalculated'),
      description: t('handprint.data_updated'),
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      energy: Zap,
      transport: Car,
      food: Utensils,
      waste: Trash2,
      water: Droplet,
      other: Leaf
    };
    return icons[category] || Leaf;
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'Kezdő': 'bg-gray-500',
      'Fejlődő': 'bg-green-500',
      'Tapasztalt': 'bg-blue-500',
      'Haladó': 'bg-purple-500',
      'Mester': 'bg-yellow-500'
    };
    return colors[rank] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!handprint) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">{t('handprint.no_data')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Leaf className="w-8 h-8 text-primary" />
                {t('handprint.title')}
              </CardTitle>
              <CardDescription className="mt-2">
                {t('handprint.subtitle')}
              </CardDescription>
            </div>
            <Badge className={`${getRankColor(handprint.rank)} text-white text-lg px-4 py-2`}>
              <Award className="w-5 h-5 mr-2" />
              {handprint.rank}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <Leaf className="w-5 h-5" />
                <span className="text-sm font-medium">{t('handprint.co2_saved')}</span>
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {handprint.totalCo2Saved} kg
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <TreePine className="w-5 h-5" />
                <span className="text-sm font-medium">{t('handprint.trees_equivalent')}</span>
              </div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {handprint.treesEquivalent} {t('common.trees')}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">{t('handprint.points')}</span>
              </div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {handprint.pointsEarned}
              </div>
            </div>
          </div>

          {/* Multiplier & Streak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('handprint.community_multiplier')}</span>
                <Badge variant="outline">{handprint.multiplier}x</Badge>
              </div>
              <Progress value={Math.min((handprint.multiplier - 1) * 50, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {t('handprint.multiplier_description')}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('handprint.current_streak')}</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  🔥 {handprint.currentStreak} {t('handprint.days')}
                </Badge>
              </div>
              <Progress value={Math.min(handprint.currentStreak * 10, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {t('handprint.streak_active')}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('handprint.category_breakdown')}
            </h4>
            <div className="space-y-3">
              {Object.entries(handprint.categoryBreakdown).map(([category, value]) => {
                if (value === 0) return null;
                const Icon = getCategoryIcon(category);
                const percentage = (value / handprint.totalCo2Saved) * 100;
                
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{category}</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(value)} kg CO₂</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={recalculate} 
              disabled={calculating}
              className="flex-1"
            >
              {calculating ? t('handprint.calculating') : t('handprint.recalculate')}
            </Button>
            <Button variant="outline" className="flex-1">
              {t('handprint.details')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('handprint.what_is')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('handprint.description')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandprintCalculator;

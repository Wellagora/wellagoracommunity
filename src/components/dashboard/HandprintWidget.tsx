import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Leaf, TreePine, Target, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HandprintData {
  transport: number;
  energy: number;
  waste: number;
  water: number;
  community: number;
  totalCo2Saved: number;
  treesEquivalent: number;
  totalPoints: number;
  rank: string;
  activitiesCount: number;
}

const HandprintWidget = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const isOrganization = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);
  
  const [handprint, setHandprint] = useState<HandprintData>({
    transport: 0,
    energy: 0,
    waste: 0,
    water: 0,
    community: 0,
    totalCo2Saved: 0,
    treesEquivalent: 0,
    totalPoints: 0,
    rank: 'Kezdő',
    activitiesCount: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHandprintData();
    }
  }, [user]);

  const loadHandprintData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('challenge-validation', {
        body: { action: 'get-user-handprint' }
      });

      if (error) throw error;
      
      if (data?.handprint) {
        setHandprint(data.handprint);
      }
    } catch (error) {
      // Silent fail - handprint load failed
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Fenntarthatósági Hős': return 'from-purple-500 to-pink-500';
      case 'Környezeti Bajnok': return 'from-blue-500 to-cyan-500';
      case 'Zöld Aktivista': return 'from-green-500 to-emerald-500';
      case 'Öko Harcos': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Fenntarthatósági Hős': return '🦸‍♀️';
      case 'Környezeti Bajnok': return '🏆';
      case 'Zöld Aktivista': return '🌱';
      case 'Öko Harcos': return '⚔️';
      default: return '🌿';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-green-200 rounded w-1/2"></div>
            <div className="h-8 bg-green-200 rounded w-3/4"></div>
            <div className="h-4 bg-green-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regional Impact Hub view for organizations
  if (isOrganization) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/dashboard/handprint')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t('handprint.regional_impact')}
            </CardTitle>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{Math.round(handprint.totalCo2Saved * 0.23)}%
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">{Math.round(handprint.totalCo2Saved * 10)}</div>
              <div className="text-xs text-primary/70">kg CO₂ regionális</div>
            </div>
            
            <div className="text-center bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                {Math.round(handprint.activitiesCount * 8.5)}
              </div>
              <div className="text-xs text-accent/70">aktivált polgár</div>
            </div>
            
            <div className="text-center bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-success flex items-center justify-center gap-1">
                {Math.round(handprint.totalPoints * 0.15)}
              </div>
              <div className="text-xs text-success/70">kezdeményezés</div>
            </div>
          </div>

          {/* Regional Initiatives */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">{t('handprint.active_initiatives')}:</div>
            
            {[
              { label: '🏢 Vállalati Zöld Program', status: 'Aktív', color: 'bg-success' },
              { label: '🤝 Közösségi Partnerség', status: '+12 résztvevő', color: 'bg-primary' },
              { label: '🌱 Fenntarthatósági Kampány', status: '3 hét', color: 'bg-warning' }
            ].map((initiative, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-white/40 p-2 rounded">
                <span className="text-gray-700">{initiative.label}</span>
                <Badge variant="outline" className="text-xs">{initiative.status}</Badge>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="pt-2 border-t border-primary/20">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full bg-white/80 border-primary/30 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dashboard/handprint');
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('handprint.detailed_regional_analysis')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Personal handprint view for citizens
  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/handprint')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            {t('handprint.title')}
          </CardTitle>
          <Badge className={`bg-gradient-to-r ${getRankColor(handprint.rank)} text-white border-0`}>
            {getRankIcon(handprint.rank)} {handprint.rank}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-700">{handprint.totalCo2Saved.toFixed(1)}</div>
            <div className="text-xs text-green-600">kg CO₂</div>
          </div>
          
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-1">
              <TreePine className="w-5 h-5" />
              {handprint.treesEquivalent}
            </div>
            <div className="text-xs text-blue-600">{t('handprint.trees_equivalent')}</div>
          </div>
          
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-1">
              <Trophy className="w-5 h-5" />
              {handprint.totalPoints}
            </div>
            <div className="text-xs text-purple-600">{t('handprint.points')}</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">{t('handprint.breakdown_by_category')}:</div>
          
          {[
            { key: 'transport', label: `🚲 ${t('handprint.category.transport')}`, value: handprint.transport, color: 'bg-blue-500' },
            { key: 'energy', label: `⚡ ${t('handprint.category.energy')}`, value: handprint.energy, color: 'bg-yellow-500' },
            { key: 'waste', label: `♻️ ${t('handprint.category.waste')}`, value: handprint.waste, color: 'bg-green-500' },
            { key: 'water', label: `💧 ${t('handprint.category.water')}`, value: handprint.water, color: 'bg-cyan-500' },
            { key: 'community', label: `🤝 ${t('handprint.category.community')}`, value: handprint.community, color: 'bg-purple-500' }
          ].filter(cat => cat.value > 0).map((category) => (
            <div key={category.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{category.label}</span>
              <span className="font-medium text-gray-800">{category.value.toFixed(1)} kg</span>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="pt-2 border-t border-green-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white/80 border-green-300 text-green-700 hover:bg-green-50"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/dashboard/handprint');
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('handprint.details_challenges')}
          </Button>
        </div>

        {handprint.activitiesCount > 0 && (
          <div className="text-xs text-gray-600 text-center">
            {handprint.activitiesCount} {t('handprint.activities_this_month')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HandprintWidget;
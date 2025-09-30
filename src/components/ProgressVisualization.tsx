import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TreePine, 
  Zap, 
  Droplets, 
  Recycle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Flame
} from "lucide-react";
import progressImage from "@/assets/progress-celebration.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const ProgressVisualization = () => {
  const { t } = useLanguage();
  
  const impact = {
    co2Saved: 156.8,
    treesEquivalent: 23,
    waterSaved: 1245,
    wasteReduced: 89,
    streak: 23,
    level: 12
  };

  return (
    <div className="space-y-6">
      {/* Hero Impact Card - Story-driven */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-success/10 via-primary/5 to-background border-success/30">
        <div className="absolute inset-0 opacity-5">
          <img 
            src={progressImage} 
            alt="Progress visualization" 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="text-center space-y-6">
            {/* Main Impact Visualization */}
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-success to-primary rounded-full mb-4 shadow-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-heading font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent mb-2">
                {t('dashboard.your_positive_impact')}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('dashboard.impact_story')}
              </p>
            </div>

            {/* Key Metrics - Visual & Simple */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-success/10 backdrop-blur-sm rounded-2xl p-4 border border-success/20 hover:scale-105 transition-transform">
                <TreePine className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-3xl font-bold text-success">{impact.treesEquivalent}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('dashboard.trees_planted')}</div>
              </div>
              
              <div className="bg-primary/10 backdrop-blur-sm rounded-2xl p-4 border border-primary/20 hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{impact.co2Saved}<span className="text-sm">kg</span></div>
                <div className="text-xs text-muted-foreground mt-1">{t('dashboard.co2_prevented')}</div>
              </div>
              
              <div className="bg-accent/10 backdrop-blur-sm rounded-2xl p-4 border border-accent/20 hover:scale-105 transition-transform">
                <Droplets className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">{impact.waterSaved}<span className="text-sm">L</span></div>
                <div className="text-xs text-muted-foreground mt-1">{t('dashboard.water_conserved')}</div>
              </div>
              
              <div className="bg-warning/10 backdrop-blur-sm rounded-2xl p-4 border border-warning/20 hover:scale-105 transition-transform">
                <Flame className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-3xl font-bold text-warning">{impact.streak}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('dashboard.day_streak')}</div>
              </div>
            </div>

            {/* Progress to Next Level */}
            <div className="bg-glass backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {impact.level}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">{t('dashboard.level')} {impact.level}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.sustainability_hero')}</div>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <Progress value={68} className="h-3 mb-2" />
              <p className="text-xs text-muted-foreground text-center">
                {t('dashboard.almost_next_level')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Achievements */}
      <Card className="bg-gradient-to-br from-warning/5 to-success/5 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-success" />
            {t('dashboard.recent_wins')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-xl p-4 border border-success/20 text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🌱</div>
              <div className="text-sm font-medium text-foreground">{t('dashboard.first_steps')}</div>
              <Badge className="mt-2 bg-success text-white text-xs">{t('dashboard.completed')}</Badge>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-medium text-foreground">{t('dashboard.energy_saver')}</div>
              <Badge className="mt-2 bg-primary text-white text-xs">{t('dashboard.completed')}</Badge>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-sm font-medium text-foreground">{t('dashboard.water_guardian')}</div>
              <Badge className="mt-2 bg-accent text-white text-xs">{t('dashboard.completed')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Impact - Simplified */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mb-2">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                45,600<span className="text-2xl">kg</span>
              </div>
              <p className="text-muted-foreground mt-1">{t('dashboard.community_co2_saved')}</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('dashboard.together_stronger')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressVisualization;

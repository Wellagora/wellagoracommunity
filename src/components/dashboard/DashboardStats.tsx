import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Trophy, Target, Users } from "lucide-react";

interface StatItem {
  icon: string;
  value: string;
  label: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

interface DashboardStatsProps {
  variant?: "citizen" | "organization";
  stats?: StatItem[];
}

export const DashboardStats = memo(({ 
  variant = "organization",
  stats
}: DashboardStatsProps) => {
  const { t } = useLanguage();

  // Default stats if none provided
  const defaultStats: StatItem[] = variant === "citizen" 
    ? [
        { icon: "🎯", value: "1,247", label: t('dashboard.points'), trend: { value: "+15%", positive: true } },
        { icon: "🏆", value: "8", label: t('dashboard.active_challenges'), trend: { value: "+3", positive: true } },
        { icon: "👥", value: "#42", label: t('dashboard.community_rank'), trend: { value: "↑12", positive: true } }
      ]
    : [
        { icon: "🎯", value: "+4", label: t('dashboard.new_initiatives') },
        { icon: "👥", value: "+842", label: t('dashboard.new_participants') },
        { icon: "🌱", value: "+12.3t", label: t('dashboard.co2_saved') }
      ];

  const displayStats = stats || defaultStats;

  if (variant === "citizen") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {displayStats.map((stat, index) => (
          <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{stat.icon}</div>
                {stat.trend && (
                  <Badge 
                    variant={stat.trend.positive ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend.value}
                  </Badge>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Organization variant with quarterly goals
  return (
    <Card className="bg-gradient-to-r from-primary/5 via-card to-accent/5 mb-6 sm:mb-8">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">{t('dashboard.monthly_regional_progress')}</h3>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-card rounded-xl">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Quarterly Goals */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('dashboard.quarterly_co2_goal')}</span>
              <span className="text-sm font-medium">45.6 / 60t</span>
            </div>
            <Progress value={76} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('dashboard.community_reach_goal')}</span>
              <span className="text-sm font-medium">2,847 / 5,000</span>
            </div>
            <Progress value={57} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('dashboard.new_partnerships')}</span>
              <span className="text-sm font-medium">8 / 10</span>
            </div>
            <Progress value={80} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DashboardStats.displayName = "DashboardStats";

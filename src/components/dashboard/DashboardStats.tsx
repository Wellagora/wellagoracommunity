import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

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

  // Default stats — placeholder values until real tracking is implemented
  const defaultStats: StatItem[] = variant === "citizen"
    ? [
        { icon: "🎯", value: "0", label: t('dashboard.points') },
        { icon: "🏆", value: "0", label: t('dashboard.active_challenges') },
        { icon: "👥", value: "—", label: t('dashboard.community_rank') }
      ]
    : [
        { icon: "🎯", value: "—", label: t('dashboard.new_initiatives') },
        { icon: "👥", value: "—", label: t('dashboard.new_participants') },
        { icon: "🌱", value: "—", label: t('dashboard.co2_saved') }
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

  // Organization variant — clean without fake quarterly goals
  return (
    <Card className="bg-gradient-to-r from-primary/5 via-card to-accent/5 mb-6 sm:mb-8">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">{t('dashboard.monthly_regional_progress')}</h3>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-card rounded-xl">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

DashboardStats.displayName = "DashboardStats";

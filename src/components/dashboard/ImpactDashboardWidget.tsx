import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingUp, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useImpactSummary } from "@/hooks/useImpactSummary";
import { formatDistanceToNow } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

const categoryIcons: Record<string, string> = {
  community: "👥",
  transport: "🚗",
  energy: "⚡",
  food: "🥗",
  waste: "♻️",
  other: "🌍"
};

const categoryColors: Record<string, string> = {
  community: "bg-primary/10 text-primary",
  transport: "bg-blue-500/10 text-blue-600",
  energy: "bg-yellow-500/10 text-yellow-600",
  food: "bg-green-500/10 text-green-600",
  waste: "bg-orange-500/10 text-orange-600",
  other: "bg-muted text-muted-foreground"
};

export const ImpactDashboardWidget = memo(() => {
  const { t, language } = useLanguage();
  const { summary, loading } = useImpactSummary();

  const getLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-success/5 to-primary/5 border-success/20">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-success" />
        </CardContent>
      </Card>
    );
  }

  const totalCo2 = summary?.total_co2_kg || 0;
  const categories = summary?.categories || {};
  const recentEntries = summary?.recent_entries || [];

  return (
    <Card className="bg-gradient-to-br from-success/5 to-primary/5 border-success/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="w-5 h-5 text-success" />
          {t("impact.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main CO2 stat */}
        <div className="text-center py-4 bg-success/10 rounded-xl">
          <div className="text-4xl font-bold text-success mb-1">
            {totalCo2.toFixed(1)} <span className="text-lg">kg</span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {t("impact.total_co2")}
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(categories).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {t("impact.categories")}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(([category, value]) => (
                <Badge 
                  key={category} 
                  variant="outline"
                  className={categoryColors[category] || categoryColors.other}
                >
                  {categoryIcons[category] || "🌍"} {category}: {(value as number).toFixed(1)}kg
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent entries */}
        {recentEntries.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t("impact.recent_actions")}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentEntries.slice(0, 3).map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-2 bg-card/50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[entry.category] || "🌍"}</span>
                    <span className="truncate max-w-[150px]">
                      {entry.title || entry.action_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-success font-medium">
                      +{entry.impact_kg_co2.toFixed(1)}kg
                    </span>
                    <span className="text-xs">
                      {formatDistanceToNow(new Date(entry.created_at), { 
                        addSuffix: true, 
                        locale: getLocale() 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalCo2 === 0 && recentEntries.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("impact.no_entries_yet")}</p>
          </div>
        )}

        {/* View full report button */}
        <Button 
          variant="outline" 
          className="w-full border-success/30 hover:bg-success/10"
          size="sm"
        >
          {t("impact.view_full_report")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
});

ImpactDashboardWidget.displayName = "ImpactDashboardWidget";

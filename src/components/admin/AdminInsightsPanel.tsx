import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertCircle, MessageSquare, Filter, Info } from "lucide-react";
import { useAdminInsights } from "@/hooks/useAdminInsights";
import { groupSignalsByTopic } from "@/hooks/useCommunityInsights";
import { cn } from "@/lib/utils";

interface AdminInsightsPanelProps {
  defaultWeeksBack?: number;
}

/**
 * Admin Insights Panel — content-gap mapping + emerging topics for admin/operator.
 *
 * Mutatja az ÖSSZES kategória aggregált témáit, kiemelve azokat amelyekre nincs program.
 * Care+DNA tanulság aktivációja:
 *   - Strukturális anonimitás (k≥3) — get_admin_insights SECURITY DEFINER
 *   - Tényközlő tone — "ezen a héten 12 user kérdezte X témát" — opció: meghívni egy creator-t
 *   - Zero-state érdemi kontextus
 */
const AdminInsightsPanel = ({ defaultWeeksBack = 4 }: AdminInsightsPanelProps) => {
  const { t } = useLanguage();
  const [weeksBack, setWeeksBack] = useState(defaultWeeksBack);
  const [onlyGaps, setOnlyGaps] = useState(false);

  const { data: signals, isLoading, error } = useAdminInsights({ weeksBack, onlyContentGaps: onlyGaps });
  const grouped = useMemo(() => groupSignalsByTopic(signals || []), [signals]);

  // Loading
  if (isLoading) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {t("admin_insights.title") || "Admin: Emerging Topics"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error) {
    return (
      <Card className="border-[0.5px] border-red-200 bg-red-50/30">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">
              {t("admin_insights.error_title") || "Nem sikerült betölteni az insights-okat"}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {t("admin_insights.error_desc") ||
                "Ellenőrizd, hogy a 20260508_wellbot_insights.sql migration lefutott-e a Supabase projecten."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty
  if (!grouped || grouped.length === 0) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {t("admin_insights.title") || "Admin: Emerging Topics"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              {t("admin_insights.empty_title") || "Még nincs elég jel az aggregátumban"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("admin_insights.empty_desc") ||
                "A WellBot-kérdések még nem értek el k≥3 küszöböt egyetlen témán sem. Ez normál az indulás első heteiben — a heti aggregátor vasárnap éjjel fut."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stats
  const contentGapCount = grouped.filter((g) => !g.has_existing_program).length;
  const totalQuestions = grouped.reduce((sum, g) => sum + g.total_questions, 0);

  return (
    <Card className="border-[0.5px] border-black/5 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              {t("admin_insights.title") || "Admin: Emerging Topics"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {grouped.length} {t("admin_insights.topics") || "téma"}
              {" · "}
              <span className="text-amber-700">{contentGapCount} content-gap</span>
              {" · "}
              {totalQuestions} {t("admin_insights.questions") || "kérdés"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-50/80 border-orange-200 text-orange-900 text-xs">
              {t("admin_insights.k_threshold_label") || "k≥3 anonimitás"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex gap-1 bg-muted/50 rounded-md p-1">
            {[2, 4, 8, 12].map((w) => (
              <button
                key={w}
                onClick={() => setWeeksBack(w)}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm font-medium transition-colors",
                  weeksBack === w
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {w}w
              </button>
            ))}
          </div>
          <Button
            variant={onlyGaps ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyGaps(!onlyGaps)}
            className="gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            {onlyGaps
              ? t("admin_insights.showing_gaps") || "Csak content-gap"
              : t("admin_insights.show_only_gaps") || "Csak content-gap"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {grouped.map((row) => (
            <div
              key={row.topic_slug}
              className={cn(
                "flex items-center justify-between gap-3 py-3 px-4 rounded-lg border transition-colors",
                !row.has_existing_program
                  ? "border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/50"
                  : "border-black/5 hover:border-black/10 hover:bg-muted/30"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground truncate">
                    {row.topic_label}
                  </span>
                  {row.category_slug && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {row.category_slug}
                    </Badge>
                  )}
                  {!row.has_existing_program && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 border-amber-300 text-amber-900 text-[10px] font-medium"
                    >
                      {t("admin_insights.content_gap") || "Content-gap"}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {row.total_questions} {t("admin_insights.questions_label") || "kérdés"}
                  {" · "}
                  {row.total_unique_users}+ {t("admin_insights.users_label") || "user"}
                  {" · "}
                  {row.weeks_active} {t("admin_insights.weeks_label") || "hét aktív"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-black/5">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
            <p className="leading-relaxed">
              {t("admin_insights.footer_note") ||
                "A WellBot-kérdésekből aggregált adatok, k≥3 küszöbbel. A content-gap jelzés azt jelzi, hogy egy témára még nincs publikált program — ezeket creator-meghívással lehet betölteni."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInsightsPanel;

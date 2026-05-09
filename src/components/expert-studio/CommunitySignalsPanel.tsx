import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MessageSquare, Plus, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useCommunityInsights, groupSignalsByTopic } from "@/hooks/useCommunityInsights";

interface CommunitySignalsPanelProps {
  creatorId: string;
  weeksBack?: number;
}

/**
 * Community Signals Panel — Creator-oldali insights view.
 *
 * Mutatja a creator saját kategóriáiba érkező WellBot-kérdéseket aggregálva.
 * Care+DNA tanulság konkrét aktivációja:
 *   - Strukturális anonimitás (k≥3) — get_creator_insights SECURITY DEFINER
 *   - Ténymegállapító tone — nincs "Szuper!", nincs "Ne add fel"
 *   - Zero-state érdemi kontextus — "indulási szakasz" magyarázat
 *   - Forrás-hivatkozás — minden szám a WellBot-konverzációkból, k≥3-mal
 */
const CommunitySignalsPanel = ({ creatorId, weeksBack = 4 }: CommunitySignalsPanelProps) => {
  const { t, language } = useLanguage();
  const { data: signals, isLoading, error } = useCommunityInsights({ creatorId, weeksBack });

  const grouped = useMemo(() => groupSignalsByTopic(signals || []), [signals]);

  // -- Loading state ---------------------------------------------------------
  if (isLoading) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {t("insights.title") || "Közösségi jelek"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // -- Error state -----------------------------------------------------------
  if (error) {
    return (
      <Card className="border-[0.5px] border-red-200 shadow-sm bg-red-50/30">
        <CardContent className="pt-6">
          <p className="text-sm text-red-900">
            {t("insights.error") || "Nem sikerült betölteni a közösségi jeleket. Kérlek próbáld újra később."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // -- Empty / early-stage state --------------------------------------------
  if (!grouped || grouped.length === 0) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            {t("insights.title") || "Közösségi jelek"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              {t("insights.empty_title") || "Még nincs elég jel a szakterületeden"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("insights.empty_desc") ||
                "Az indulási szakaszban tartunk — a WellBot kérdés-aggregátumai akkor jelennek meg, ha legalább 3 különböző felhasználó kérdezett ugyanarról. Nézz vissza a következő héten."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // -- Main content: signals list -------------------------------------------
  return (
    <Card className="border-[0.5px] border-black/5 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              {t("insights.title") || "Közösségi jelek"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {t("insights.subtitle_with_weeks", { weeks: weeksBack }) ||
                `Az utóbbi ${weeksBack} hét a saját szakterületeden`}
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50/80 border-orange-200 text-orange-900 text-xs">
            {t("insights.k_threshold_label") || "k≥3 anonimitás"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {grouped.map((row) => (
            <div
              key={row.topic_slug}
              className="flex items-center justify-between gap-3 py-3 px-4 rounded-lg border border-black/5 hover:border-orange-200/70 hover:bg-orange-50/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground truncate">
                    {row.topic_label}
                  </span>
                  {!row.has_existing_program && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50/80 border-amber-200 text-amber-900 text-[10px] font-normal"
                    >
                      {t("insights.no_program_yet") || "Még nincs program"}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("insights.signal_summary", {
                    questions: row.total_questions,
                    users: row.total_unique_users,
                    weeks: row.weeks_active,
                  }) ||
                    `${row.total_questions} kérdés · ${row.total_unique_users}+ user · ${row.weeks_active} hét`}
                </div>
              </div>
              {!row.has_existing_program && (
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link to="/expert-studio/programs/new">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t("insights.create_program") || "Új program"}
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note — context for the creator */}
        <div className="mt-6 pt-4 border-t border-black/5">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
            <p className="leading-relaxed">
              {t("insights.footer_note") ||
                "A WellBot-kérdésekből aggregált jelek. Csak a saját szakterületedre szűkítve, és csak akkor látható egy téma, ha legalább 3 különböző felhasználó kérdezett. Egyéni felhasználói adat soha nem érhető el itt."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunitySignalsPanel;

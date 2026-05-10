import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, Sparkles, Lightbulb } from "lucide-react";

/**
 * CommunitySignalsWidget — kis "mi mozog a közösségben" panel a /community oldal tetejére.
 *
 * Care+DNA tanulság aktiváció:
 *   - Zero-state érdemi tartalom: ha még nincs kérdés, magyaráz, nem üres.
 *   - Ténymegállapító tone: "X kérdés érkezett az utóbbi 7 napban."
 *   - Nincs felkiáltó, nincs marketing-szöveg.
 *
 * Adatforrás: community_posts ahol post_type = 'question', utolsó 7 nap.
 */

interface QuestionSignal {
  id: string;
  content: string;
  post_type: string;
  created_at: string;
  comments_count: number | null;
  likes_count: number | null;
  author_first_name: string | null;
  author_avatar_url: string | null;
}

const ICON_BY_TYPE: Record<string, typeof HelpCircle> = {
  question: HelpCircle,
  tip: Lightbulb,
  success_story: Sparkles,
  general: MessageSquare,
};

const COLOR_BY_TYPE: Record<string, string> = {
  question: "bg-blue-100 text-blue-700 border-blue-200",
  tip: "bg-purple-100 text-purple-700 border-purple-200",
  success_story: "bg-amber-100 text-amber-700 border-amber-200",
  general: "bg-slate-100 text-slate-700 border-slate-200",
};

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

const timeAgo = (iso: string, language: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (language === "hu") {
    if (minutes < 60) return `${minutes} perce`;
    if (hours < 24) return `${hours} órája`;
    return `${days} napja`;
  }
  if (language === "de") {
    if (minutes < 60) return `vor ${minutes} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${days} T.`;
  }
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const CommunitySignalsWidget = () => {
  const { language, t } = useLanguage();
  const [signals, setSignals] = useState<QuestionSignal[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Top 3 frissesség alapján — kérdés-típusok prioritáson
        const { data, error } = await supabase
          .from("community_posts")
          .select(
            `
            id, content, post_type, created_at, comments_count, likes_count,
            author:profiles!author_id(first_name, avatar_url)
          `
          )
          .in("post_type", ["question", "tip", "success_story"])
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        if (cancelled) return;

        const mapped: QuestionSignal[] = (data || []).map((row: any) => ({
          id: row.id,
          content: row.content,
          post_type: row.post_type,
          created_at: row.created_at,
          comments_count: row.comments_count,
          likes_count: row.likes_count,
          author_first_name: row.author?.first_name || null,
          author_avatar_url: row.author?.avatar_url || null,
        }));

        // Összes kérdés count az utolsó 7 napban (a számhoz)
        const { count } = await supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true })
          .eq("post_type", "question")
          .gte("created_at", sevenDaysAgo.toISOString());

        if (cancelled) return;
        setSignals(mapped);
        setTotalQuestions(count || 0);
      } catch (err) {
        // Tábla még nincs / RLS probléma — silent fallback
        console.warn("[CommunitySignalsWidget] fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm bg-white">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Empty state — érdemi kontextus, nem csak "üres"
  if (signals.length === 0) {
    return (
      <Card className="border-[0.5px] border-black/5 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">
                {t("community_signals.empty_title") || "Csendes a fal"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("community_signals.empty_desc") ||
                  "Még nincs friss kérdés vagy tipp az utolsó 7 napból. Tedd fel az elsőt — a közösség itt szokta megosztani, ami foglalkoztatja."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[0.5px] border-black/5 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              {t("community_signals.title") || "Mi mozog a közösségben"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("community_signals.subtitle_with_count", { count: totalQuestions }) ||
                `${totalQuestions} kérdés az utolsó 7 napban`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {signals.map((signal) => {
            const Icon = ICON_BY_TYPE[signal.post_type] || MessageSquare;
            const colorClass = COLOR_BY_TYPE[signal.post_type] || COLOR_BY_TYPE.general;
            return (
              <div
                key={signal.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-black/5 hover:border-orange-200/70 hover:bg-orange-50/30 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {truncate(signal.content, 140)}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {signal.author_first_name && (
                      <span>{signal.author_first_name}</span>
                    )}
                    <span>{timeAgo(signal.created_at, language)}</span>
                    {signal.comments_count !== null && signal.comments_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {signal.comments_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunitySignalsWidget;

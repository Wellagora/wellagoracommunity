import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Wellbot Insights — Community Signals for Creators.
 *
 * Az aggregált témák a get_creator_insights() SECURITY DEFINER függvényből jönnek.
 * Privacy-réteg: a függvény k≥3 küszöbbel, csak a creator saját kategóriáira szűr.
 * Egyéni felhasználói adat soha nem érhető el ezen a hook-on keresztül.
 */

export interface CommunitySignal {
  week_start: string;
  topic_label: string;
  topic_slug: string;
  category_slug: string | null;
  question_count: number;
  unique_user_count: number;
  has_existing_program: boolean;
}

interface UseCommunityInsightsOptions {
  creatorId: string | null | undefined;
  weeksBack?: number;
}

export function useCommunityInsights({ creatorId, weeksBack = 4 }: UseCommunityInsightsOptions) {
  return useQuery({
    queryKey: ['community-insights', creatorId, weeksBack],
    queryFn: async (): Promise<CommunitySignal[]> => {
      if (!creatorId) return [];

      const { data, error } = await supabase.rpc('get_creator_insights', {
        _creator_id: creatorId,
        _weeks_back: weeksBack,
      });

      if (error) {
        // Ha a függvény még nincs deployolva (pl. migration nem futott le)
        if (error.code === '42883' || error.message?.includes('get_creator_insights')) {
          console.warn('[useCommunityInsights] get_creator_insights() not yet deployed — returning empty list');
          return [];
        }
        throw error;
      }

      return (data as CommunitySignal[]) || [];
    },
    enabled: Boolean(creatorId),
    staleTime: 30 * 60 * 1000, // 30 perc — a heti aggregátum úgyis ritkán változik
  });
}

/**
 * Csoportosítja a jeleket téma szerint, az utolsó X hét összesítésével.
 * Hasznosabb listázás, mint a heti darabolás.
 */
export function groupSignalsByTopic(signals: CommunitySignal[]): Array<{
  topic_slug: string;
  topic_label: string;
  category_slug: string | null;
  total_questions: number;
  total_unique_users: number;
  has_existing_program: boolean;
  weeks_active: number;
}> {
  const map = new Map<string, {
    topic_slug: string;
    topic_label: string;
    category_slug: string | null;
    total_questions: number;
    weeks: Set<string>;
    has_existing_program: boolean;
  }>();

  for (const s of signals) {
    const existing = map.get(s.topic_slug);
    if (existing) {
      existing.total_questions += s.question_count;
      existing.weeks.add(s.week_start);
      existing.has_existing_program = existing.has_existing_program || s.has_existing_program;
    } else {
      map.set(s.topic_slug, {
        topic_slug: s.topic_slug,
        topic_label: s.topic_label,
        category_slug: s.category_slug,
        total_questions: s.question_count,
        weeks: new Set([s.week_start]),
        has_existing_program: s.has_existing_program,
      });
    }
  }

  // Approximation: visszahasználjuk a max unique_user_count-ot
  const userCounts = new Map<string, number>();
  for (const s of signals) {
    const cur = userCounts.get(s.topic_slug) || 0;
    if (s.unique_user_count > cur) userCounts.set(s.topic_slug, s.unique_user_count);
  }

  return Array.from(map.values())
    .map((g) => ({
      topic_slug: g.topic_slug,
      topic_label: g.topic_label,
      category_slug: g.category_slug,
      total_questions: g.total_questions,
      total_unique_users: userCounts.get(g.topic_slug) || 0,
      has_existing_program: g.has_existing_program,
      weeks_active: g.weeks.size,
    }))
    .sort((a, b) => b.total_questions - a.total_questions);
}

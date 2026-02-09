import { supabase } from '@/integrations/supabase/client';
import { createNotification } from './notificationService';

interface ExpertStats {
  programCount: number;
  totalParticipants: number;
  avgRating: number;
  hasPaidProgram: boolean;
}

async function getExpertStats(expertId: string): Promise<ExpertStats> {
  const { data: programs } = await supabase
    .from('expert_contents')
    .select('id, price_huf, current_participants')
    .eq('creator_id', expertId)
    .eq('is_published', true);

  const contentIds = (programs || []).map(p => p.id);
  let reviews: any[] = [];
  if (contentIds.length > 0) {
    const { data: reviewData } = await supabase
      .from('content_reviews')
      .select('rating')
      .in('content_id', contentIds);
    reviews = reviewData || [];
  }

  const programCount = programs?.length || 0;
  const totalParticipants = programs?.reduce((sum, p) => sum + ((p as any).current_participants || 0), 0) || 0;
  const avgRating = reviews.length ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0;
  const hasPaidProgram = programs?.some(p => (p.price_huf || 0) > 0) || false;

  return { programCount, totalParticipants, avgRating, hasPaidProgram };
}

export async function checkAndSendNudges(expertId: string) {
  const stats = await getExpertStats(expertId);

  // Nudge 1: Ready for paid (3+ free programs, 20+ participants, 4.0+ rating, no paid yet)
  if (
    stats.programCount >= 3 &&
    stats.totalParticipants >= 20 &&
    stats.avgRating >= 4.0 &&
    !stats.hasPaidProgram
  ) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', expertId)
      .eq('type', 'nudge_ready_for_paid')
      .limit(1);

    if (!existing || existing.length === 0) {
      await createNotification({
        userId: expertId,
        type: 'nudge_ready_for_paid',
        title: 'Érett vagy fizetős programra!',
        message: `${stats.programCount} programod van, ${stats.totalParticipants} résztvevővel és ${stats.avgRating.toFixed(1)} értékeléssel. Ideje elindítani az első fizetős programodat!`,
        data: { ...stats, nudgeType: 'ready_for_paid' },
      });
    }
  }

  // Nudge 2: Program almost full (80%+ capacity)
  const { data: almostFull } = await supabase
    .from('expert_contents')
    .select('id, title, current_participants, max_capacity')
    .eq('creator_id', expertId)
    .eq('is_published', true)
    .not('max_capacity', 'is', null);

  for (const program of almostFull || []) {
    const currentParticipants = (program as any).current_participants || 0;
    if (program.max_capacity && currentParticipants >= program.max_capacity * 0.8) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', expertId)
        .eq('type', 'nudge_almost_full')
        .limit(1);

      if (!existing || existing.length === 0) {
        await createNotification({
          userId: expertId,
          type: 'nudge_almost_full',
          title: 'Programod hamarosan betelik!',
          message: `"${program.title}" — ${currentParticipants}/${program.max_capacity} hely foglalt. Fontold meg magasabb árat a következő alkalomra!`,
          data: { programId: program.id, nudgeType: 'almost_full' },
        });
      }
    }
  }
}

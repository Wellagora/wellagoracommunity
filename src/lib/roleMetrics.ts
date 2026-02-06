import { supabase } from '@/integrations/supabase/client';

export interface ExpertMetrics {
  type: 'expert';
  avgRating: string;
  reviewCount: number;
  monthlyRevenue: number;
}

export interface SponsorMetrics {
  type: 'sponsor';
  supportedMembers: number;
}

export interface MemberMetrics {
  type: 'member';
  wellpoints: number;
}

export type RoleMetrics = ExpertMetrics | SponsorMetrics | MemberMetrics;

export async function getExpertMetrics(userId: string): Promise<Omit<ExpertMetrics, 'type'>> {
  // Get average rating and review count from content_reviews table
  const { data: reviews } = await supabase
    .from('content_reviews')
    .select('rating')
    .eq('user_id', userId) as { data: any[] | null };
  
  const avgRating = reviews?.length 
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const reviewCount = reviews?.length || 0;

  // Get monthly revenue from transactions
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('expert_id', userId)
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString()) as { data: any[] | null };
  
  // Calculate 80% of revenue (expert share)
  const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
  const expertRevenue = Math.round(totalRevenue * 0.8);

  return { avgRating, reviewCount, monthlyRevenue: expertRevenue };
}

export async function getSponsorMetrics(userId: string): Promise<Omit<SponsorMetrics, 'type'>> {
  // Use the SAME query as SponsorDashboardPage.tsx - get people reached from sponsored_seats_used
  const { data: contentSponsorships } = await supabase
    .from('content_sponsorships')
    .select('sponsored_seats_used, is_active')
    .eq('sponsor_id', userId) as { data: any[] | null };

  // Calculate people reached from sponsored_seats_used (same logic as dashboard)
  const supportedMembers = (contentSponsorships || [])
    .filter((s: any) => s.is_active !== false)
    .reduce((sum: number, s: any) => sum + (s.sponsored_seats_used || 0), 0);

  return { supportedMembers };
}

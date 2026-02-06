import { supabase } from '@/integrations/supabase/client';

// Shared query key for WellPoints balance across all components
export const WELLPOINTS_QUERY_KEY = (userId: string) => ['wellpoints', userId];

// Shared query key for user profile/streak data
export const STREAK_QUERY_KEY = (userId: string) => ['profile', userId];

export const POINT_VALUES = {
  post_created: 5,
  comment_added: 3,
  like_given: 1,
  like_received: 2,
  program_completed: 50,
  lesson_completed: 10,
  review_submitted: 20,
  daily_login: 2,
  referral_bonus: 100,
  voucher_redeemed: 25,
  event_attended: 15,
  profile_completed: 30,
  first_post: 10,
  streak_bonus: 5
} as const;

export type PointAction = keyof typeof POINT_VALUES;

export async function awardPoints(
  userId: string,
  action: PointAction,
  description?: string,
  referenceId?: string,
  referenceType?: string
): Promise<number> {
  const amount = POINT_VALUES[action];
  
  const { error } = await supabase.from('wellpoints_ledger').insert({
    user_id: userId,
    amount,
    action,
    description,
    reference_id: referenceId,
    reference_type: referenceType
  });
  
  if (error) throw error;
  return amount;
}

export async function getUserBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('profiles')
    .select('wellpoints_balance')
    .eq('id', userId)
    .single();
  return data?.wellpoints_balance || 0;
}

export async function getPointsHistory(userId: string, limit = 20) {
  const { data } = await supabase
    .from('wellpoints_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  action: PointAction;
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export interface StreakResult {
  streak: number;
  isNewDay: boolean;
  bonusAwarded: boolean;
}

export async function updateStreak(userId: string): Promise<StreakResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('id', userId)
    .single();

  const today = new Date().toISOString().split('T')[0];
  const lastActivity = profile?.last_activity_date;
  
  let newStreak = 1;
  let isNewDay = true;
  let bonusAwarded = false;

  if (lastActivity === today) {
    // Already active today, no change
    return { streak: profile?.current_streak || 0, isNewDay: false, bonusAwarded: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (lastActivity === yesterday) {
    // Consecutive day - increment streak
    newStreak = (profile?.current_streak || 0) + 1;
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, profile?.longest_streak || 0),
      last_activity_date: today
    })
    .eq('id', userId);

  // Award streak bonus at milestones: 3, 7, 14, 30 days
  const STREAK_MILESTONES = [3, 7, 14, 30];
  if (STREAK_MILESTONES.includes(newStreak)) {
    const bonusPoints = newStreak * 5; // 15, 35, 70, 150 points
    await awardPoints(userId, 'streak_bonus', `${newStreak} napos sorozat bónusz!`, null, 'streak');
    bonusAwarded = true;
  }

  return { streak: newStreak, isNewDay: true, bonusAwarded };
}

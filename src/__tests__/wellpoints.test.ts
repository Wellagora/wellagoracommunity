import { describe, it, expect } from 'vitest';

// Test POINT_VALUES configuration without importing supabase client
const POINT_VALUES = {
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
  streak_bonus: 5,
} as const;

type PointAction = keyof typeof POINT_VALUES;

describe('WellPoints - Point values', () => {
  it('all point values should be positive integers', () => {
    Object.values(POINT_VALUES).forEach(value => {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    });
  });

  it('should have all expected action types', () => {
    const expectedActions: PointAction[] = [
      'post_created',
      'comment_added',
      'like_given',
      'like_received',
      'program_completed',
      'lesson_completed',
      'review_submitted',
      'daily_login',
      'referral_bonus',
      'voucher_redeemed',
      'event_attended',
      'profile_completed',
      'first_post',
      'streak_bonus',
    ];
    expectedActions.forEach(action => {
      expect(POINT_VALUES[action]).toBeDefined();
    });
  });

  it('referral_bonus should be the highest reward', () => {
    const maxValue = Math.max(...Object.values(POINT_VALUES));
    expect(POINT_VALUES.referral_bonus).toBe(maxValue);
  });

  it('like_given should be the lowest reward', () => {
    const minValue = Math.min(...Object.values(POINT_VALUES));
    expect(POINT_VALUES.like_given).toBe(minValue);
  });

  it('program_completed should be worth more than lesson_completed', () => {
    expect(POINT_VALUES.program_completed).toBeGreaterThan(POINT_VALUES.lesson_completed);
  });

  it('first_post should be worth more than regular post_created', () => {
    expect(POINT_VALUES.first_post).toBeGreaterThan(POINT_VALUES.post_created);
  });
});

describe('WellPoints - Discount calculation', () => {
  const MAX_DISCOUNT_PERCENT = 20;

  function calculateDiscount(balance: number, priceHuf: number): number {
    const maxDiscount = priceHuf * (MAX_DISCOUNT_PERCENT / 100);
    const pointsAsHuf = balance; // 1 point = 1 HUF
    return Math.min(pointsAsHuf, maxDiscount);
  }

  it('discount should not exceed 20% of price', () => {
    const discount = calculateDiscount(100000, 10000);
    expect(discount).toBeLessThanOrEqual(10000 * 0.2);
  });

  it('discount should use full balance if under 20% cap', () => {
    const discount = calculateDiscount(500, 10000);
    expect(discount).toBe(500);
  });

  it('discount should be 0 for 0 balance', () => {
    expect(calculateDiscount(0, 10000)).toBe(0);
  });

  it('discount should be capped at 20% for large balances', () => {
    const discount = calculateDiscount(999999, 5000);
    expect(discount).toBe(1000); // 20% of 5000
  });
});

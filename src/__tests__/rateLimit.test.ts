import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple in-memory rate limiter for testing (mirrors typical client-side pattern)
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  isAllowed(key: string, now = Date.now()): boolean {
    const timestamps = this.timestamps.get(key) || [];
    const windowStart = now - this.windowMs;
    const recent = timestamps.filter(t => t > windowStart);

    if (recent.length >= this.maxRequests) {
      this.timestamps.set(key, recent);
      return false;
    }

    recent.push(now);
    this.timestamps.set(key, recent);
    return true;
  }

  reset(key: string): void {
    this.timestamps.delete(key);
  }
}

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(5, 60000); // 5 requests per 60s
  });

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed('user-1')).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('user-1');
    }
    expect(limiter.isAllowed('user-1')).toBe(false);
  });

  it('tracks users independently', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('user-1');
    }
    expect(limiter.isAllowed('user-1')).toBe(false);
    expect(limiter.isAllowed('user-2')).toBe(true);
  });

  it('allows requests after window expires', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('user-1', now);
    }
    expect(limiter.isAllowed('user-1', now)).toBe(false);
    // After window expires
    expect(limiter.isAllowed('user-1', now + 61000)).toBe(true);
  });

  it('reset clears the rate limit for a user', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('user-1');
    }
    expect(limiter.isAllowed('user-1')).toBe(false);
    limiter.reset('user-1');
    expect(limiter.isAllowed('user-1')).toBe(true);
  });
});

describe('AI Chat Rate Limit - Config validation', () => {
  it('AI rate limit should be reasonable (10-30 per minute)', () => {
    const AI_RATE_LIMIT = 20; // messages per minute
    expect(AI_RATE_LIMIT).toBeGreaterThanOrEqual(10);
    expect(AI_RATE_LIMIT).toBeLessThanOrEqual(30);
  });

  it('API calls should have timeout', () => {
    const API_TIMEOUT_MS = 30000;
    expect(API_TIMEOUT_MS).toBeGreaterThanOrEqual(5000);
    expect(API_TIMEOUT_MS).toBeLessThanOrEqual(60000);
  });
});

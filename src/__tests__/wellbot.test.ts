import { describe, it, expect } from 'vitest';

describe('WellBot role routing', () => {
  const getRole = (role: string) => {
    switch(role) {
      case 'expert':
      case 'creator':
        return 'expert_coach';
      case 'sponsor':
      case 'business':
      case 'government':
      case 'ngo':
        return 'sponsor_advisor';
      case 'member':
      default:
        return 'member_helper';
    }
  };

  it('should route expert to coach', () => {
    expect(getRole('expert')).toBe('expert_coach');
  });

  it('should route creator (legacy) to coach', () => {
    expect(getRole('creator')).toBe('expert_coach');
  });

  it('should route sponsor to advisor', () => {
    expect(getRole('sponsor')).toBe('sponsor_advisor');
  });

  it('should route member to helper', () => {
    expect(getRole('member')).toBe('member_helper');
  });

  it('should default unknown roles to helper', () => {
    expect(getRole('unknown')).toBe('member_helper');
    expect(getRole('')).toBe('member_helper');
  });
});

describe('Expert context generation', () => {
  it('should identify new expert (0-2 programs)', () => {
    const programCount = 1;
    const level = programCount <= 2 ? 'new' : programCount <= 5 ? 'building' : 'advanced';
    expect(level).toBe('new');
  });

  it('should identify building expert (3-5 programs)', () => {
    const programCount = 4;
    const level = programCount <= 2 ? 'new' : programCount <= 5 ? 'building' : 'advanced';
    expect(level).toBe('building');
  });

  it('should identify advanced expert (5+ programs)', () => {
    const programCount = 8;
    const level = programCount <= 2 ? 'new' : programCount <= 5 ? 'building' : 'advanced';
    expect(level).toBe('advanced');
  });

  it('should calculate average rating correctly', () => {
    const ratings = [5, 4, 5, 4, 5];
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    expect(avg).toBe(4.6);
  });

  it('should handle no reviews', () => {
    const ratings: number[] = [];
    const avg = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : null;
    expect(avg).toBeNull();
  });
});

describe('Expert coaching logic', () => {
  it('new expert should get free program advice', () => {
    const programCount = 0;
    const hasPaid = false;
    const advice = programCount < 2 && !hasPaid ? 'suggest_free_first' : 'suggest_pricing';
    expect(advice).toBe('suggest_free_first');
  });

  it('expert with good ratings should get pricing advice', () => {
    const programCount = 4;
    const avgRating = 4.5;
    const totalParticipants = 47;
    const readyForPaid = programCount >= 3 && avgRating >= 4.0 && totalParticipants >= 20;
    expect(readyForPaid).toBe(true);
  });

  it('expert with low engagement should build community first', () => {
    const programCount = 3;
    const avgRating = 3.2;
    const totalParticipants = 5;
    const readyForPaid = programCount >= 3 && avgRating >= 4.0 && totalParticipants >= 20;
    expect(readyForPaid).toBe(false);
  });
});

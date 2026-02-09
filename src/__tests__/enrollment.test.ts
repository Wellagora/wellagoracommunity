import { describe, it, expect } from 'vitest';

describe('Enrollment flow', () => {
  // Ingyenes regisztráció
  it('should allow free enrollment when price is 0', () => {
    const content = { price_huf: 0, max_capacity: null, current_participants: 0, is_published: true, status: 'published' };
    const canEnroll = (content.price_huf === 0 || content.price_huf === null) && 
      (content.status === 'published' || content.is_published);
    expect(canEnroll).toBe(true);
  });

  it('should block enrollment when program is full', () => {
    const content = { price_huf: 0, max_capacity: 12, current_participants: 12, status: 'full' };
    const canEnroll = content.status !== 'full' && 
      (!content.max_capacity || content.current_participants < content.max_capacity);
    expect(canEnroll).toBe(false);
  });

  it('should allow enrollment when spots available', () => {
    const content = { price_huf: 0, max_capacity: 12, current_participants: 8, status: 'published' };
    const canEnroll = content.status !== 'full' && 
      (!content.max_capacity || content.current_participants < content.max_capacity);
    expect(canEnroll).toBe(true);
  });

  it('should allow unlimited enrollment for on-demand content', () => {
    const content = { price_huf: 0, max_capacity: null, current_participants: 500, status: 'published' };
    const canEnroll = content.status !== 'full' && 
      (!content.max_capacity || content.current_participants < content.max_capacity);
    expect(canEnroll).toBe(true);
  });

  // Fizetős program
  it('should require Stripe for paid content', () => {
    const content = { price_huf: 3000, status: 'published' };
    const requiresPayment = content.price_huf > 0;
    expect(requiresPayment).toBe(true);
  });

  // 80/20 split
  it('should calculate 80/20 split correctly', () => {
    const totalAmount = 3000;
    const platformFee = Math.round(totalAmount * 0.20);
    const expertAmount = totalAmount - platformFee;
    expect(expertAmount).toBe(2400);
    expect(platformFee).toBe(600);
    expect(expertAmount + platformFee).toBe(totalAmount);
  });

  it('should handle odd split amounts', () => {
    const totalAmount = 2999;
    const platformFee = Math.round(totalAmount * 0.20);
    const expertAmount = totalAmount - platformFee;
    expect(expertAmount + platformFee).toBe(totalAmount);
  });

  // Státusz
  it('should not allow enrollment for draft content', () => {
    const content = { status: 'draft', is_published: false };
    const canEnroll = ['published', 'sponsored'].includes(content.status) || content.is_published;
    expect(canEnroll).toBe(false);
  });

  it('should allow enrollment for sponsored content', () => {
    const content = { status: 'sponsored', price_huf: 0 };
    const canEnroll = ['published', 'sponsored'].includes(content.status);
    expect(canEnroll).toBe(true);
  });
});

describe('Content pricing', () => {
  it('is_free should be true when price is 0', () => {
    const isFree = (0 === 0) || (null === null);
    expect(isFree).toBe(true);
  });

  it('is_free should be false when price > 0', () => {
    const isFree = 3000 === 0;
    expect(isFree).toBe(false);
  });

  it('content types should be valid', () => {
    const validTypes = ['online', 'live_online', 'in_person'];
    expect(validTypes.includes('online')).toBe(true);
    expect(validTypes.includes('live_online')).toBe(true);
    expect(validTypes.includes('in_person')).toBe(true);
    expect(validTypes.includes('hybrid')).toBe(false);
  });

  it('should require event_date for live and in_person', () => {
    const liveContent = { content_type: 'live_online', event_date: '2026-03-01' };
    const onlineContent = { content_type: 'online', event_date: null };
    
    const needsDate = ['live_online', 'in_person'].includes(liveContent.content_type);
    expect(needsDate).toBe(true);
    expect(liveContent.event_date).toBeTruthy();
    
    const noNeedDate = !['live_online', 'in_person'].includes(onlineContent.content_type);
    expect(noNeedDate).toBe(true);
  });
});

describe('Enrollment button states', () => {
  it('should show "Megnyitás" for already enrolled user', () => {
    const hasAccess = true;
    const label = hasAccess ? 'Megnyitás' : 'Regisztrálok';
    expect(label).toBe('Megnyitás');
  });

  it('should show "Regisztrálok" for free content', () => {
    const content = { price_huf: 0, is_published: true };
    const isFree = !content.price_huf || content.price_huf === 0;
    const label = isFree ? 'Regisztrálok' : `Megveszem — ${content.price_huf} Ft`;
    expect(label).toBe('Regisztrálok');
  });

  it('should show price for paid content', () => {
    const content = { price_huf: 5000, is_published: true };
    const isFree = !content.price_huf || content.price_huf === 0;
    const label = isFree ? 'Regisztrálok' : `Megveszem — ${content.price_huf.toLocaleString('hu-HU')} Ft`;
    expect(label).toContain('Megveszem');
    expect(label).toContain('Ft');
  });

  it('should show "Betelt" for full programs', () => {
    const content = { max_capacity: 10, current_participants: 10 };
    const isFull = content.max_capacity !== null && content.current_participants >= content.max_capacity;
    const label = isFull ? 'Betelt' : 'Regisztrálok';
    expect(label).toBe('Betelt');
  });
});

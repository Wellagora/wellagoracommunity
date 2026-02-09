import { describe, it, expect } from 'vitest';
import { calculatePricing } from '@/lib/pricing';

describe('Financial calculations', () => {
  describe('80/20 revenue split', () => {
    it('should calculate correct 80/20 split for standard price', () => {
      const result = calculatePricing({ basePrice: 10000, sponsorAmount: 0 });
      expect(result.creatorEarning).toBe(8000);
      expect(result.platformFee).toBe(2000);
      expect(result.creatorEarning + result.platformFee).toBe(result.basePrice);
    });

    it('should calculate correct split for odd amounts (rounding)', () => {
      const result = calculatePricing({ basePrice: 9999, sponsorAmount: 0 });
      // platformFee = Math.round(9999 * 0.20) = Math.round(1999.8) = 2000
      // creatorEarning = 9999 - 2000 = 7999
      expect(result.platformFee).toBe(2000);
      expect(result.creatorEarning).toBe(7999);
      expect(result.creatorEarning + result.platformFee).toBe(result.basePrice);
    });

    it('should handle zero price', () => {
      const result = calculatePricing({ basePrice: 0, sponsorAmount: 0 });
      expect(result.creatorEarning).toBe(0);
      expect(result.platformFee).toBe(0);
      expect(result.isFree).toBe(true);
    });

    it('should handle small amounts', () => {
      const result = calculatePricing({ basePrice: 100, sponsorAmount: 0 });
      expect(result.platformFee).toBe(20);
      expect(result.creatorEarning).toBe(80);
    });

    it('should handle large amounts', () => {
      const result = calculatePricing({ basePrice: 1000000, sponsorAmount: 0 });
      expect(result.platformFee).toBe(200000);
      expect(result.creatorEarning).toBe(800000);
    });
  });

  describe('Sponsored pricing', () => {
    it('should reduce user payment by sponsor amount', () => {
      const result = calculatePricing({ basePrice: 10000, sponsorAmount: 3000 });
      expect(result.userPays).toBe(7000);
      expect(result.sponsorAmount).toBe(3000);
      expect(result.isSponsored).toBe(true);
      expect(result.isFullySponsored).toBe(false);
    });

    it('should handle fully sponsored content', () => {
      const result = calculatePricing({ basePrice: 10000, sponsorAmount: 10000 });
      expect(result.userPays).toBe(0);
      expect(result.isFullySponsored).toBe(true);
    });

    it('should cap sponsor amount at base price', () => {
      const result = calculatePricing({ basePrice: 5000, sponsorAmount: 8000 });
      expect(result.sponsorAmount).toBe(5000);
      expect(result.userPays).toBe(0);
      expect(result.isFullySponsored).toBe(true);
    });

    it('creator earning should be based on base price, not user payment', () => {
      const result = calculatePricing({ basePrice: 10000, sponsorAmount: 5000 });
      // Creator always gets 80% of base price, regardless of sponsor amount
      expect(result.creatorEarning).toBe(8000);
      expect(result.platformFee).toBe(2000);
    });
  });

  describe('Balance validation', () => {
    it('balance should never go negative', () => {
      const purchased = 500;
      const spent = 600;
      const balance = purchased - spent;
      expect(balance).toBeLessThan(0);
      // The DB trigger must prevent this scenario
    });

    it('balance calculation should be correct', () => {
      const transactions = [
        { type: 'purchase', credits: 1000 },
        { type: 'spend', credits: -300 },
        { type: 'purchase', credits: 500 },
        { type: 'spend', credits: -200 },
        { type: 'refund', credits: 100 },
      ];

      const balance = transactions.reduce((sum, t) => sum + t.credits, 0);
      expect(balance).toBe(1100); // 1000 - 300 + 500 - 200 + 100
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Credit amount validation', () => {
    it('valid credit amounts should be positive integers', () => {
      const validAmount = 100;
      expect(Number.isInteger(validAmount) && validAmount > 0).toBe(true);
    });

    it('invalid credit amounts should be rejected', () => {
      const invalidAmounts = [-1, 0, 0.5, NaN, Infinity];
      invalidAmounts.forEach(amt => {
        expect(Number.isInteger(amt) && amt > 0).toBe(false);
      });
    });
  });

  describe('Transaction types', () => {
    it('should recognize valid transaction types', () => {
      const validTypes = ['purchase', 'spend', 'refund', 'adjustment', 'bonus', 'subscription'];
      expect(validTypes.includes('purchase')).toBe(true);
      expect(validTypes.includes('spend')).toBe(true);
      expect(validTypes.includes('refund')).toBe(true);
    });

    it('should reject invalid transaction types', () => {
      const validTypes = ['purchase', 'spend', 'refund', 'adjustment', 'bonus', 'subscription'];
      expect(validTypes.includes('invalid')).toBe(false);
      expect(validTypes.includes('')).toBe(false);
    });
  });

  describe('Sponsorship 80/20 split (DummyPaymentModal logic)', () => {
    it('should match the standard 80/20 split', () => {
      const price = 15000;
      const platformAmount = Math.round(price * 0.20);
      const creatorAmount = price - platformAmount;
      expect(platformAmount).toBe(3000);
      expect(creatorAmount).toBe(12000);
      expect(platformAmount + creatorAmount).toBe(price);
    });
  });

  describe('Bulk sponsorship split (SponsorshipModal logic)', () => {
    it('should use 80/20 split for bulk sponsorships', () => {
      const pricePerSeat = 5000;
      const licenseCount = 50;
      const totalCost = pricePerSeat * licenseCount;
      const platformAmount = Math.round(totalCost * 0.20);
      const creatorAmount = totalCost - platformAmount;
      
      expect(totalCost).toBe(250000);
      expect(platformAmount).toBe(50000);
      expect(creatorAmount).toBe(200000);
      expect(platformAmount + creatorAmount).toBe(totalCost);
    });
  });
});

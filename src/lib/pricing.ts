export interface PricingInput {
  basePrice: number;
  sponsorAmount: number;
  platformFeePercent?: number;
  /** Founding Expert flag — 0% platform fee forever (max 5 experts) */
  isFoundingExpert?: boolean;
}

export interface PricingOutput {
  basePrice: number;
  sponsorAmount: number;
  userPays: number;
  creatorEarning: number;
  platformFee: number;
  /** Effective platform fee percentage (0% for founding experts, 20% default) */
  effectiveFeePercent: number;
  isFree: boolean;
  isSponsored: boolean;
  isFullySponsored: boolean;
  isFoundingExpert: boolean;
}

export function calculatePricing(input: PricingInput): PricingOutput {
  const { basePrice, sponsorAmount, platformFeePercent = 20, isFoundingExpert = false } = input;

  const effectiveSponsorAmount = Math.min(sponsorAmount, basePrice);
  const userPays = Math.max(0, basePrice - effectiveSponsorAmount);

  // Founding Experts get 0% platform fee — they keep 100% of revenue
  const effectiveFeePercent = isFoundingExpert ? 0 : platformFeePercent;
  const platformFee = Math.round(basePrice * (effectiveFeePercent / 100));
  const creatorEarning = basePrice - platformFee;

  return {
    basePrice,
    sponsorAmount: effectiveSponsorAmount,
    userPays,
    creatorEarning,
    platformFee,
    effectiveFeePercent,
    isFree: basePrice === 0,
    isSponsored: effectiveSponsorAmount > 0,
    isFullySponsored: effectiveSponsorAmount >= basePrice,
    isFoundingExpert,
  };
}

export function formatPrice(amount: number, currency: string = 'HUF'): string {
  if (currency === 'HUF') {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  }
  return `${amount.toLocaleString('hu-HU')} ${currency}`;
}

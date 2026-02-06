export interface PricingInput {
  basePrice: number;
  sponsorAmount: number;
  platformFeePercent?: number;
}

export interface PricingOutput {
  basePrice: number;
  sponsorAmount: number;
  userPays: number;
  creatorEarning: number;
  platformFee: number;
  isFree: boolean;
  isSponsored: boolean;
  isFullySponsored: boolean;
}

export function calculatePricing(input: PricingInput): PricingOutput {
  const { basePrice, sponsorAmount, platformFeePercent = 20 } = input;
  
  const effectiveSponsorAmount = Math.min(sponsorAmount, basePrice);
  const userPays = Math.max(0, basePrice - effectiveSponsorAmount);
  
  const platformFee = Math.round(basePrice * (platformFeePercent / 100));
  const creatorEarning = basePrice - platformFee;
  
  return {
    basePrice,
    sponsorAmount: effectiveSponsorAmount,
    userPays,
    creatorEarning,
    platformFee,
    isFree: basePrice === 0,
    isSponsored: effectiveSponsorAmount > 0,
    isFullySponsored: effectiveSponsorAmount >= basePrice,
  };
}

export function formatPrice(amount: number, currency: string = 'HUF'): string {
  if (currency === 'HUF') {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  }
  return `${amount.toLocaleString('hu-HU')} ${currency}`;
}

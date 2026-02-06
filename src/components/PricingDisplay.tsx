import React from 'react';
import { PricingOutput, formatPrice } from '@/lib/pricing';

interface PricingDisplayProps {
  pricing: PricingOutput;
  sponsorName?: string;
  sponsorLogoUrl?: string;
  variant?: 'card' | 'detail' | 'modal';
}

export function PricingDisplay({ 
  pricing, 
  sponsorName, 
  sponsorLogoUrl,
  variant = 'card' 
}: PricingDisplayProps) {
  
  if (pricing.isFree) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-sm">
        INGYENES
      </span>
    );
  }
  
  if (pricing.isSponsored) {
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-500">
          Alapár: {formatPrice(pricing.basePrice)}
        </div>
        <div className="text-sm text-emerald-600 font-medium flex items-center gap-1">
          <span>Támogatás: {formatPrice(pricing.sponsorAmount)}</span>
          {sponsorLogoUrl ? (
            <img src={sponsorLogoUrl} alt={sponsorName} className="h-4 inline-block" />
          ) : sponsorName ? (
            <span className="text-gray-500">— {sponsorName}</span>
          ) : null}
        </div>
        <div className={`font-bold text-gray-900 ${variant === 'modal' ? 'text-2xl' : 'text-lg'}`}>
          Fizetendő: {pricing.isFullySponsored ? (
            <span className="text-green-600">INGYENES</span>
          ) : (
            formatPrice(pricing.userPays)
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`font-bold text-gray-900 ${variant === 'modal' ? 'text-2xl' : 'text-lg'}`}>
      {formatPrice(pricing.basePrice)}
    </div>
  );
}

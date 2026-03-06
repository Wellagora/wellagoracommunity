/**
 * Stripe integration utilities
 * All Stripe UI is hidden when VITE_STRIPE_ENABLED=false
 */

export const isStripeEnabled = (): boolean => {
  return import.meta.env.VITE_STRIPE_ENABLED === 'true';
};

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

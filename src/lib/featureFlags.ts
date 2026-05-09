/**
 * Feature flags — központi konfig.
 *
 * Sprint 14 (2026-05-08): MVP v2 community-first pivot.
 * A pénzügyi modellt és a Carbon Handprint feature-t feature-flag-en hidden-be tesszük.
 * A kód NEM kerül törlésre — csak a UI-ban nem jelenik meg.
 *
 * Visszakapcsolás: ENV-változót `true`-ra állítva (.env vagy GitHub Secrets).
 *
 * Default-ok ENV-hiány esetén:
 *  - financial: false (community-first phase)
 *  - carbonHandprint: false (módszertan-fejlesztés alatt)
 *  - communityFeed: true (új közösségi feed mindig látható)
 *  - directMessages: false (DM nincs MVP-ben)
 */

const readBool = (key: string, defaultValue: boolean): boolean => {
  // Vite import.meta.env access — typed as any for safety in Deno-edge files
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const raw = env[key];
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  return raw === 'true' || raw === true || raw === '1' || raw === 1;
};

export const FEATURES = {
  /**
   * Pénzügyi modell: Stripe checkout, sponsor-mechanika, voucher-rendszer, expert payouts.
   * Pre-launch / community-first fázisban kikapcsolva.
   * Ha bekapcsolod, akkor a sponsor dashboardok, payouts route-ok, voucher-UI, TÁMOGATOTT badge újra megjelennek.
   */
  financial: readBool('VITE_FEATURE_FINANCIAL_MODEL', false),

  /**
   * Carbon Handprint feature (HandprintPage + Calculator).
   * Hidden, mert a módszertan még nincs kész.
   */
  carbonHandprint: readBool('VITE_FEATURE_CARBON_HANDPRINT', false),

  /**
   * Közösségi feed kérdés-feltétel UI a /community oldalon.
   * Sprint 15-ben épül ki, default `true` mert a community-first fázis ezt akarja kiemelni.
   */
  communityFeed: readBool('VITE_FEATURE_COMMUNITY_FEED', true),

  /**
   * Tag-tag közvetlen üzenet (DM). Most nincs benne, csak feed/komment van.
   */
  directMessages: readBool('VITE_FEATURE_DIRECT_MESSAGES', false),

  /**
   * WellBot Insights for Creators panel.
   * Default `true`, mert a backend kész és a creator-flow-ba beépül.
   */
  creatorInsights: readBool('VITE_FEATURE_CREATOR_INSIGHTS', true),
} as const;

export type FeatureName = keyof typeof FEATURES;

/**
 * Kényelmi alias-ok, hogy a hívási hely olvashatóbb legyen.
 */
export const isFinancialEnabled = (): boolean => FEATURES.financial;
export const isCarbonHandprintEnabled = (): boolean => FEATURES.carbonHandprint;
export const isCommunityFeedEnabled = (): boolean => FEATURES.communityFeed;
export const isDirectMessagesEnabled = (): boolean => FEATURES.directMessages;
export const isCreatorInsightsEnabled = (): boolean => FEATURES.creatorInsights;

/**
 * Egy helyen olvashatod ki: pl. `if (isFeatureOn('financial')) { ... }`
 */
export function isFeatureOn(name: FeatureName): boolean {
  return FEATURES[name];
}

/**
 * Dev-only: console.log a feature-flag állapotokat induláskor.
 * Csak development build-ben fut.
 */
if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
  // eslint-disable-next-line no-console
  console.log('[featureFlags]', FEATURES);
}

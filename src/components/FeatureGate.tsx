import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { FeatureName, isFeatureOn } from '@/lib/featureFlags';

interface FeatureGateProps {
  /** A feature flag neve a featureFlags.ts FEATURES object-jából. */
  feature: FeatureName;

  /** Mit renderelünk, ha a feature ON. */
  children: ReactNode;

  /** Hová redirect-eljünk, ha a feature OFF. Default: '/' (homepage). */
  fallback?: string;

  /**
   * Ha `true`, a redirect helyett egyszerűen `null`-t renderelünk.
   * Hasznos pl. egy nav-link-nél, ami csak eltűnik, nem redirect-el.
   */
  hideOnly?: boolean;
}

/**
 * Route-szintű feature flag gate.
 *
 * Példa:
 *   <Route
 *     path="/sponsor-dashboard"
 *     element={<FeatureGate feature="financial"><SponsorDashboardPage /></FeatureGate>}
 *   />
 *
 * Komponens-szinten (pl. nav-link rejtésére):
 *   <FeatureGate feature="financial" hideOnly>
 *     <NavLink to="/sponsor-dashboard">Sponsor Dashboard</NavLink>
 *   </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = '/', hideOnly = false }: FeatureGateProps) {
  if (!isFeatureOn(feature)) {
    return hideOnly ? null : <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}

export default FeatureGate;

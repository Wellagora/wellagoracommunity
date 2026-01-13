import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/AnalyticsService';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { user, isDemoMode } = useAuth();

  useEffect(() => {
    // Update demo mode status
    analytics.setDemoMode(isDemoMode);

    // Track page view on every route change
    analytics.pageView(
      location.pathname + location.search,
      document.title,
      user?.id
    );
  }, [location.pathname, location.search, user?.id, isDemoMode]);

  // This component doesn't render anything
  return null;
};

export default AnalyticsTracker;

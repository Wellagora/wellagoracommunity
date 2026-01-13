import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/AnalyticsService';
import type { Json } from '@/integrations/supabase/types';

export const useAnalytics = () => {
  const { user, isDemoMode } = useAuth();

  // Set demo mode on analytics service
  analytics.setDemoMode(isDemoMode);

  const track = useCallback((
    eventName: string, 
    metadata: Record<string, Json> = {}
  ) => {
    return analytics.track(eventName, metadata, user?.id);
  }, [user?.id]);

  return {
    track,
    // Expose convenience methods with user ID auto-attached
    pageView: (path: string, title?: string) => 
      analytics.pageView(path, title, user?.id),
    signUp: (method: string) => 
      analytics.signUp(method, user?.id),
    login: (method: string) => 
      analytics.login(method, user?.id),
    logout: () => 
      analytics.logout(user?.id),
    voucherView: (programId: string, programTitle: string) => 
      analytics.voucherView(programId, programTitle, user?.id),
    voucherClaimStart: (programId: string) => 
      analytics.voucherClaimStart(programId, user?.id),
    voucherClaimComplete: (programId: string) => 
      analytics.voucherClaimComplete(programId, user?.id),
    programView: (programId: string, programTitle: string) => 
      analytics.programView(programId, programTitle, user?.id),
    programSearch: (query: string, resultsCount: number) => 
      analytics.programSearch(query, resultsCount, user?.id),
    wellbotOpen: () => 
      analytics.wellbotOpen(user?.id),
    wellbotMessage: () => 
      analytics.wellbotMessage(user?.id),
    feedLike: (postId: string) => 
      analytics.feedLike(postId, user?.id),
    feedComment: (postId: string) => 
      analytics.feedComment(postId, user?.id),
    feedbackOpen: () => 
      analytics.feedbackOpen(user?.id),
    feedbackSubmit: (type: string) => 
      analytics.feedbackSubmit(type, user?.id),
    languageChange: (lang: string) => 
      analytics.languageChange(lang, user?.id),
  };
};

export default useAnalytics;

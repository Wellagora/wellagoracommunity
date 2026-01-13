import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private isDemoMode: boolean = false;

  private constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Session ID management - resets on tab close
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('wa_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('wa_session_id', sessionId);
    }
    return sessionId;
  }

  // Detect device type
  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Set demo mode (call from AuthContext)
  setDemoMode(isDemoMode: boolean) {
    this.isDemoMode = isDemoMode;
  }

  // Main tracking function
  async track(
    eventName: string, 
    metadata: Record<string, Json> = {},
    userId?: string
  ): Promise<void> {
    const eventData = {
      session_id: this.sessionId,
      user_id: userId || null,
      event_name: eventName,
      page_path: window.location.pathname,
      metadata: metadata as Json,
      device_type: this.getDeviceType(),
    };

    // Demo mode: log to console instead of DB
    if (this.isDemoMode) {
      console.log('[Analytics - Demo]', eventName, eventData);
      return;
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert([eventData]);

      if (error) {
        console.error('[Analytics] Insert error:', error);
      }
    } catch (error) {
      console.error('[Analytics] Track error:', error);
    }
  }

  // Convenience methods for common events
  pageView(pagePath: string, pageTitle?: string, userId?: string) {
    return this.track('page_view', { page_title: pageTitle || null }, userId);
  }

  // Auth events
  signUp(method: string, userId?: string) {
    return this.track('sign_up', { method }, userId);
  }

  login(method: string, userId?: string) {
    return this.track('login', { method }, userId);
  }

  logout(userId?: string) {
    return this.track('logout', {}, userId);
  }

  // Voucher events
  voucherView(programId: string, programTitle: string, userId?: string) {
    return this.track('voucher_view', { program_id: programId, program_title: programTitle }, userId);
  }

  voucherClaimStart(programId: string, userId?: string) {
    return this.track('voucher_claim_start', { program_id: programId }, userId);
  }

  voucherClaimComplete(programId: string, userId?: string) {
    return this.track('voucher_claim_complete', { program_id: programId }, userId);
  }

  voucherRedeem(voucherId: string, userId?: string) {
    return this.track('voucher_redeem', { voucher_id: voucherId }, userId);
  }

  // Program events
  programView(programId: string, programTitle: string, userId?: string) {
    return this.track('program_view', { program_id: programId, program_title: programTitle }, userId);
  }

  programSearch(query: string, resultsCount: number, userId?: string) {
    return this.track('program_search', { query, results_count: resultsCount }, userId);
  }

  // WellBot events
  wellbotOpen(userId?: string) {
    return this.track('wellbot_open', {}, userId);
  }

  wellbotMessage(userId?: string) {
    return this.track('wellbot_message', {}, userId);
  }

  // Feed events
  feedLike(postId: string, userId?: string) {
    return this.track('feed_like', { post_id: postId }, userId);
  }

  feedComment(postId: string, userId?: string) {
    return this.track('feed_comment', { post_id: postId }, userId);
  }

  // Feedback events
  feedbackOpen(userId?: string) {
    return this.track('feedback_open', {}, userId);
  }

  feedbackSubmit(type: string, userId?: string) {
    return this.track('feedback_submit', { type }, userId);
  }

  // Settings events
  languageChange(lang: string, userId?: string) {
    return this.track('language_change', { language: lang }, userId);
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
export default AnalyticsService;

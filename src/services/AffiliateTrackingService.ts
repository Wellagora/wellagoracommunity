import { supabase } from "@/integrations/supabase/client";

/**
 * Global Affiliate Tracking Service
 * Tracks clicks on partner offers and affiliate links across the platform
 */
export const AffiliateTrackingService = {
  /**
   * Track a click on an affiliate link
   */
  async trackAffiliateClick(linkId: string): Promise<void> {
    try {
      // Get current click count and increment
      const { data: link } = await supabase
        .from('affiliate_links')
        .select('click_count')
        .eq('id', linkId)
        .single();
      
      await supabase
        .from('affiliate_links')
        .update({ click_count: (link?.click_count || 0) + 1 })
        .eq('id', linkId);

      // Log analytics event
      await this.logAnalyticsEvent('affiliate_link_click', {
        link_id: linkId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  },

  /**
   * Track a partner offer view
   */
  async trackOfferView(partnerId: string, offerId: string): Promise<void> {
    try {
      await this.logAnalyticsEvent('partner_offer_view', {
        partner_id: partnerId,
        offer_id: offerId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking offer view:', error);
    }
  },

  /**
   * Track membership card scan (QR code used in store)
   */
  async trackMembershipScan(memberNumber: string, partnerId?: string): Promise<void> {
    try {
      await this.logAnalyticsEvent('membership_card_scan', {
        member_number: memberNumber,
        partner_id: partnerId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking membership scan:', error);
    }
  },

  /**
   * Get affiliate performance stats for an expert
   */
  async getExpertAffiliateStats(expertId: string): Promise<{
    totalClicks: number;
    activeLinks: number;
    totalCommission: number;
  }> {
    try {
      const { data: links, error } = await supabase
        .from('affiliate_links')
        .select('click_count, is_active, commission_rate')
        .eq('expert_id', expertId);

      if (error) throw error;

      const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0;
      const activeLinks = links?.filter(link => link.is_active).length || 0;
      const totalCommission = 0; // Would be calculated from actual sales data

      return { totalClicks, activeLinks, totalCommission };
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      return { totalClicks: 0, activeLinks: 0, totalCommission: 0 };
    }
  },

  /**
   * Log an analytics event
   */
  async logAnalyticsEvent(eventName: string, metadata: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get or create session ID
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }

      await supabase.from('analytics_events').insert({
        event_name: eventName,
        session_id: sessionId,
        user_id: user?.id || null,
        metadata,
        page_path: window.location.pathname,
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
      });
    } catch (error) {
      // Silently fail for analytics
      // Analytics event failed
    }
  },

  /**
   * Get partner offer click-through rate
   */
  async getPartnerStats(partnerSlug: string): Promise<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
  }> {
    // This would query analytics_events in production
    return {
      totalViews: 0,
      totalClicks: 0,
      ctr: 0
    };
  }
};

export default AffiliateTrackingService;

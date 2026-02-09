import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Notification Triggers for WellAgora Platform
 * 
 * These functions trigger automated notifications and emails for key platform events:
 * 1. New user registration
 * 2. Successful purchase (organic or sponsored)
 * 3. Sponsorship quota alerts (90% usage)
 */

interface UserRegistrationData {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

interface PurchaseData {
  userId: string;
  userEmail: string;
  userName?: string;
  programTitle: string;
  programId: string;
  originalPrice: number;
  finalPrice: number;
  sponsorName?: string;
  sponsorContribution?: number;
  isSponsored: boolean;
}

interface SponsorshipQuotaData {
  expertId: string;
  expertEmail: string;
  expertName?: string;
  programTitle: string;
  programId: string;
  sponsorName: string;
  totalLicenses: number;
  usedLicenses: number;
}

export const notificationTriggers = {
  /**
   * Trigger welcome notification and email for new user registration
   */
  async onUserRegistration(data: UserRegistrationData) {
    try {
      logger.debug('Triggering welcome notification', data, 'NotificationTrigger');

      const { data: result, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          user_id: data.userId,
          email: data.email,
          name: data.name,
          role: data.role || 'citizen',
          language: 'hu'
        }
      });

      if (error) {
        logger.error('Failed to send welcome email', error, 'NotificationTrigger');
        return { success: false, error };
      }

      logger.debug('Welcome notification sent successfully', result, 'NotificationTrigger');
      return { success: true, data: result };
    } catch (error) {
      logger.error('Error in onUserRegistration trigger', error, 'NotificationTrigger');
      return { success: false, error };
    }
  },

  /**
   * Trigger purchase confirmation notification and email
   */
  async onPurchaseComplete(data: PurchaseData) {
    try {
      logger.debug('Triggering purchase confirmation', data, 'NotificationTrigger');

      const { data: result, error } = await supabase.functions.invoke('send-purchase-confirmation', {
        body: {
          user_id: data.userId,
          user_email: data.userEmail,
          user_name: data.userName,
          program_title: data.programTitle,
          program_id: data.programId,
          original_price: data.originalPrice,
          final_price: data.finalPrice,
          sponsor_name: data.sponsorName,
          sponsor_contribution: data.sponsorContribution,
          is_sponsored: data.isSponsored,
          language: 'hu'
        }
      });

      if (error) {
        logger.error('Failed to send purchase confirmation', error, 'NotificationTrigger');
        return { success: false, error };
      }

      // Also check if we need to alert the expert about sponsorship quota
      if (data.isSponsored) {
        await this.checkSponsorshipQuota(data.programId);
      }

      logger.debug('Purchase confirmation sent successfully', result, 'NotificationTrigger');
      return { success: true, data: result };
    } catch (error) {
      logger.error('Error in onPurchaseComplete trigger', error, 'NotificationTrigger');
      return { success: false, error };
    }
  },

  /**
   * Check sponsorship quota and send alert if usage >= 90%
   */
  async checkSponsorshipQuota(programId: string) {
    try {
      // Get program and sponsorship details
      const { data: program, error: programError } = await supabase
        .from('expert_contents')
        .select(`
          id,
          title,
          creator_id,
          total_licenses,
          used_licenses,
          profiles!expert_contents_creator_id_fkey (
            id,
            display_name,
            email
          )
        `)
        .eq('id', programId)
        .single();

      if (programError || !program) {
        logger.error('Failed to fetch program for quota check', programError, 'NotificationTrigger');
        return;
      }

      // Get sponsorship info
      const { data: sponsorship } = await supabase
        .from('content_sponsorships')
        .select(`
          sponsor_id,
          total_licenses,
          used_licenses,
          sponsors (
            name
          )
        `)
        .eq('content_id', programId)
        .eq('is_active', true)
        .single();

      if (!sponsorship || !sponsorship.sponsors) {
        return; // No active sponsorship
      }

      const totalLicenses = sponsorship.total_licenses || program.total_licenses || 0;
      const usedLicenses = sponsorship.used_licenses || program.used_licenses || 0;
      
      if (totalLicenses === 0) return;

      const usagePercentage = Math.round((usedLicenses / totalLicenses) * 100);

      // Alert at 90% usage
      if (usagePercentage >= 90) {
        const expertProfile = program.profiles as any;
        const sponsorData = sponsorship.sponsors as any;
        
        if (expertProfile?.email) {
          await this.sendSponsorshipAlert({
            expertId: program.creator_id!,
            expertEmail: expertProfile.email,
            expertName: expertProfile.display_name,
            programTitle: program.title,
            programId: program.id,
            sponsorName: sponsorData?.name || 'Szponzor',
            totalLicenses,
            usedLicenses
          });
        }
      }
    } catch (error) {
      logger.error('Error checking sponsorship quota', error, 'NotificationTrigger');
    }
  },

  /**
   * Send sponsorship quota alert to expert
   */
  async sendSponsorshipAlert(data: SponsorshipQuotaData) {
    try {
      const usagePercentage = Math.round((data.usedLicenses / data.totalLicenses) * 100);
      
      logger.debug('Triggering sponsorship alert', { ...data, usagePercentage }, 'NotificationTrigger');

      const { data: result, error } = await supabase.functions.invoke('send-sponsorship-alert', {
        body: {
          expert_id: data.expertId,
          expert_email: data.expertEmail,
          expert_name: data.expertName,
          program_title: data.programTitle,
          program_id: data.programId,
          sponsor_name: data.sponsorName,
          total_licenses: data.totalLicenses,
          used_licenses: data.usedLicenses,
          usage_percentage: usagePercentage,
          language: 'hu'
        }
      });

      if (error) {
        logger.error('Failed to send sponsorship alert', error, 'NotificationTrigger');
        return { success: false, error };
      }

      logger.debug('Sponsorship alert sent successfully', result, 'NotificationTrigger');
      return { success: true, data: result };
    } catch (error) {
      logger.error('Error in sendSponsorshipAlert', error, 'NotificationTrigger');
      return { success: false, error };
    }
  },

  /**
   * Create a simple in-app notification without email
   */
  async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: 'milestone' | 'community' | 'reminder' | 'admin' = 'community',
    actionUrl?: string,
    metadata?: Record<string, any>
  ) {
    const categoryMap: Record<string, string> = {
      milestone: 'community',
      community: 'community',
      reminder: 'program',
      admin: 'system',
    };

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          category: categoryMap[type] || 'general',
          priority: 'medium',
          action_url: actionUrl,
          channels: ['in_app'],
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create in-app notification', error, 'NotificationTrigger');
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Error creating in-app notification', error, 'NotificationTrigger');
      return { success: false, error };
    }
  }
};

export default notificationTriggers;

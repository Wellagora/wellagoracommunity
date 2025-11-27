import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'milestone' | 'community' | 'reminder' | 'admin';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const notificationService = {
  /**
   * Send a notification to a user
   */
  async send(params: SendNotificationParams) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          action_url: params.actionUrl,
          metadata: params.metadata
        }
      });

      if (error) throw error;

      console.log('Notification sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error };
    }
  },

  /**
   * Send milestone notification (program completion, level up, achievement)
   */
  async sendMilestone(userId: string, title: string, message: string, actionUrl?: string) {
    return this.send({
      userId,
      title,
      message,
      type: 'milestone',
      actionUrl
    });
  },

  /**
   * Send community notification (new comment, team invitation, regional update)
   */
  async sendCommunity(userId: string, title: string, message: string, actionUrl?: string) {
    return this.send({
      userId,
      title,
      message,
      type: 'community',
      actionUrl
    });
  },

  /**
   * Send reminder notification (program deadline, engagement prompt)
   */
  async sendReminder(userId: string, title: string, message: string, actionUrl?: string) {
    return this.send({
      userId,
      title,
      message,
      type: 'reminder',
      actionUrl
    });
  },

  /**
   * Send admin notification (announcement, sponsorship confirmation)
   */
  async sendAdmin(userId: string, title: string, message: string, actionUrl?: string) {
    return this.send({
      userId,
      title,
      message,
      type: 'admin',
      actionUrl
    });
  }
};
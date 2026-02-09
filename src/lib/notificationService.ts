import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

type NotificationCategory = 'general' | 'program' | 'payment' | 'community' | 'system' | 'sponsor';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
type NotificationChannel = 'in_app' | 'push' | 'email';

interface CreateNotificationParams {
  userId: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedType?: string;
  relatedId?: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

export const notificationService = {
  /**
   * Create a notification with full spec payload
   */
  async create(params: CreateNotificationParams) {
    try {
      const channels = params.channels || ['in_app'];

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          category: params.category,
          priority: params.priority,
          title: params.title,
          message: params.message,
          icon: params.icon,
          image_url: params.imageUrl,
          action_url: params.actionUrl,
          action_label: params.actionLabel,
          related_type: params.relatedType,
          related_id: params.relatedId,
          channels,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // If push channel requested, invoke edge function
      if (channels.includes('push')) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: params.userId,
            title: params.title,
            message: params.message,
            type: params.type,
            action_url: params.actionUrl,
            metadata: params.metadata,
          }
        }).catch(err => logger.error('Push send failed', err, 'Notification'));
      }

      logger.debug('Notification created', data, 'Notification');
      return { success: true, data };
    } catch (error) {
      logger.error('Failed to create notification', error, 'Notification');
      return { success: false, error };
    }
  },

  /**
   * Program signup notification → Expert
   */
  async onProgramSignup(expertId: string, userName: string, programTitle: string, programId: string, current: number, max: number) {
    return this.create({
      userId: expertId,
      type: 'program_signup',
      category: 'program',
      priority: 'high',
      title: '🙋 Új jelentkező!',
      message: `${userName} jelentkezett a "${programTitle}" programodra (${current}/${max})`,
      icon: '🙋',
      actionUrl: `/expert-studio/programs/${programId}`,
      actionLabel: 'Részletek',
      relatedType: 'program',
      relatedId: programId,
      channels: ['in_app', 'push', 'email'],
    });
  },

  /**
   * Payment received notification → Expert
   */
  async onPaymentReceived(expertId: string, amount: number, programTitle: string) {
    return this.create({
      userId: expertId,
      type: 'payment_received',
      category: 'payment',
      priority: 'high',
      title: '💰 Kifizetés érkezett!',
      message: `${amount} Ft a "${programTitle}" programért`,
      icon: '💰',
      actionUrl: '/expert-studio?tab=business',
      channels: ['in_app', 'email'],
    });
  },

  /**
   * Sponsored program available → Member
   */
  async onSponsoredProgramAvailable(memberId: string, programTitle: string, sponsorName: string, programId: string) {
    return this.create({
      userId: memberId,
      type: 'sponsored_program',
      category: 'sponsor',
      priority: 'high',
      title: '🎁 Ingyenes program!',
      message: `${sponsorName} támogatásával: ${programTitle}`,
      icon: '🎁',
      actionUrl: `/piacter/${programId}`,
      actionLabel: 'Megtekintés',
      relatedType: 'program',
      relatedId: programId,
      channels: ['in_app', 'push', 'email'],
    });
  },

  /**
   * Event reminder (24h before) → Attendee
   */
  async onEventReminder(attendeeId: string, eventTitle: string, eventId: string, time: string, location: string) {
    return this.create({
      userId: attendeeId,
      type: 'event_reminder_24h',
      category: 'program',
      priority: 'high',
      title: '📅 Holnap!',
      message: `"${eventTitle}" — ${time}, ${location}`,
      icon: '📅',
      actionUrl: `/esemenyek/${eventId}`,
      actionLabel: 'Részletek',
      relatedType: 'event',
      relatedId: eventId,
      channels: ['in_app', 'push', 'email'],
    });
  },

  /**
   * Review received → Expert
   */
  async onReviewReceived(expertId: string, reviewerName: string, stars: number, comment: string, programId: string) {
    return this.create({
      userId: expertId,
      type: 'review_received',
      category: 'community',
      priority: 'medium',
      title: `⭐ ${stars} csillagos értékelés`,
      message: `"${comment}" — ${reviewerName}`,
      icon: '⭐',
      actionUrl: `/expert-studio/programs/${programId}`,
      relatedType: 'program',
      relatedId: programId,
      channels: ['in_app', 'push'],
    });
  },

  /**
   * Low credit alert → Sponsor
   */
  async onLowCredit(sponsorId: string, remaining: number, percentage: number) {
    return this.create({
      userId: sponsorId,
      type: 'low_credit',
      category: 'sponsor',
      priority: 'high',
      title: '⚠️ Alacsony kredit!',
      message: `${remaining} Ft maradt (${percentage}%). Töltsd fel!`,
      icon: '⚠️',
      actionUrl: '/sponsor-hub',
      channels: ['in_app', 'email'],
    });
  },

  /**
   * Simple in-app notification (backwards compatible)
   */
  async send(params: { userId: string; title: string; message: string; type: string; actionUrl?: string; metadata?: Record<string, any> }) {
    return this.create({
      userId: params.userId,
      type: params.type,
      category: 'general',
      priority: 'medium',
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      metadata: params.metadata,
      channels: ['in_app'],
    });
  },
};
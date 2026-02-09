import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type NotificationCategory = 'general' | 'program' | 'payment' | 'community' | 'system' | 'sponsor';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon?: string;
  image_url?: string;
  action_url?: string;
  action_label?: string;
  related_type?: string;
  related_id?: string;
  read: boolean;
  read_at?: string;
  is_archived: boolean;
  channels: string[];
  created_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = (data || []).map(n => ({
        ...n,
        category: n.category || 'general',
        priority: n.priority || 'medium',
        is_archived: n.is_archived || false,
        channels: n.channels || ['in_app'],
      })) as Notification[];

      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: now })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: now })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const removed = prev.find(n => n.id === notificationId);
        if (removed && !removed.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const archived = prev.find(n => n.id === notificationId);
        if (archived && !archived.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribeToPush = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This would be your VAPID public key in production
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrPcBBnelTd94z0W5cs5C6p9I-9f5kqRHLzNzQjLBMWtfNgp1-8'
        )
      });

      const subscriptionJson = subscription.toJSON();

      // Store subscription in database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || ''
        });

      if (error) throw error;

      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications"
      });
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not enable push notifications",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${data.user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.png'
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    subscribeToPush,
    refetch: fetchNotifications
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
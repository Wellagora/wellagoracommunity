import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications';

// VAPID public key — set in .env as VITE_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrPcBBnelTd94z0W5cs5C6p9I-9f5kqRHLzNzQjLBMWtfNgp1-8';

// Platform detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isInStandaloneMode = typeof window !== 'undefined' && 
  (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
const isPWA = isInStandaloneMode;

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) {
    const match = ua.match(/Android.*;\s*(.*?)\s*Build/);
    return match ? match[1] : 'Android';
  }
  if (/Mac/.test(ua)) return 'Mac Desktop';
  if (/Windows/.test(ua)) return 'Windows Desktop';
  return 'Unknown Device';
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { markAsRead, refetch } = useNotifications();

  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 'PushManager' in window;

  const [permission, setPermission] = useState<PushPermissionState>(
    isSupported ? (Notification.permission as PushPermissionState) : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already subscribed on mount
  useEffect(() => {
    if (!isSupported || !user) return;
    
    checkSubscription();
  }, [user, isSupported]);

  // Listen for service worker messages (notification clicks, badge updates)
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        const { url, notificationId } = event.data;
        if (notificationId) {
          markAsRead(notificationId);
        }
        if (url) {
          navigate(url);
        }
      }
      if (event.data?.type === 'BADGE_UPDATE') {
        refetch();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [navigate, markAsRead, refetch, isSupported]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      // Silent failure
    }
  };

  // Request permission (contextual — call this from UI prompts)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    // iOS Safari without PWA: can't do push
    if (isIOS && !isPWA) {
      return false;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      
      if (result === 'granted') {
        await subscribeToPush();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, user]);

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || '';
      const auth = subscriptionJson.keys?.auth || '';

      // Store in Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: p256dh,
          auth_key: auth,
          device_name: getDeviceName(),
          is_active: true,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (!error) {
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Failed to subscribe to push:', err);
    }
  };

  // Unsubscribe
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Deactivate in DB
        if (user) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }
      
      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe from push:', err);
    }
  };

  // Update app badge count (Android PWA)
  const updateBadge = useCallback(async (count: number) => {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch {
        // Badge API not available
      }
    }
  }, []);

  return {
    isSupported,
    isIOS,
    isAndroid,
    isPWA,
    needsIOSInstall: isIOS && !isPWA,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    unsubscribe,
    updateBadge,
  };
}

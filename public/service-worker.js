// WellAgora Service Worker — Push Notifications + Offline Support

// ============================================================
// Install & Activate
// ============================================================
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ============================================================
// Push Event — Display notification
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'WellAgora', message: event.data.text() };
  }

  const options = {
    body: data.message || data.body || 'Új értesítés a WellAgora-ból',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    image: data.imageUrl || undefined,
    vibrate: [200, 100, 200],
    tag: data.type || 'default',
    renotify: true,
    requireInteraction: data.priority === 'high' || data.priority === 'critical',
    data: {
      url: data.actionUrl || data.url || '/',
      notificationId: data.id || data.notificationId,
    },
    actions: [
      { action: 'open', title: data.actionLabel || 'Megtekintés' },
      { action: 'dismiss', title: 'Elutasítás' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WellAgora', options)
  );

  // Update app badge (Android)
  if (navigator.setAppBadge) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((windowClients) => {
        // Tell clients to update badge count
        windowClients.forEach((client) => {
          client.postMessage({ type: 'BADGE_UPDATE' });
        });
      })
    );
  }
});

// ============================================================
// Notification Click — Navigate to action URL
// ============================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's an open WellAgora window, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: url,
              notificationId: notificationId,
            });
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================================
// Notification Close (dismiss)
// ============================================================
self.addEventListener('notificationclose', (event) => {
  // Optionally track dismissed notifications
});
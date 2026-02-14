import { precacheAndRoute } from 'workbox-precaching';

// This line is required for the plugin to inject the file caching list
precacheAndRoute(self.__WB_MANIFEST);

// 1. Listen for the Push Notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Update', body: 'Check COTD now!' };

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Handle what happens when the student clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
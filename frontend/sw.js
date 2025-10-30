self.addEventListener('push', event => {
  if (!event.data) return;

  console.log("PUSH NOTIFICATION>>>> ", event);

  const data = event.data.json();
  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: '/eapc-logo.svg',
    badge: '/eapc-logo.svg', // optional
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); // optional
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: 'images/icon-192x192.png'
    };
    event.waitUntil(self.registration.showNotification('Напоминание', options));
});
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // ✅ నీ కొత్త API Key ఇక్కడ పెట్టాలి (ఎందుకంటే SW లో .env డైరెక్ట్ గా పనిచేయదు)
  apiKey: "AIzaSyCv9C1pRLHtL3CWfntatnK3GsuUqjKiAzU",
  authDomain: "sudara-2f28e.firebaseapp.com",
  projectId: "sudara-2f28e",
  storageBucket: "sudara-2f28e.firebasestorage.app",
  messagingSenderId: "106294827558",
  // ✅ నీ కొత్త App ID ఇక్కడ అప్‌డేట్ చేశాను రాజు!
  appId: "1:106294827558:web:49cf698d11b0e5ba91a4e7"
});

const messaging = firebase.messaging();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// --- బ్యాక్‌గ్రౌండ్‌ మెసేజ్ వచ్చినప్పుడు ---
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);

  const restaurantName = payload.data?.ownerName || "Sudara Hub";
  const notificationTitle = `${restaurantName}: ${payload.notification.title}`;
  
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/SUDAR.png',
    badge: '/SUDAR.png',
    tag: 'sudara-alert',
    data: {
      url: payload.data?.click_action || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- నోటిఫికేషన్ క్లిక్ చేసినప్పుడు ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
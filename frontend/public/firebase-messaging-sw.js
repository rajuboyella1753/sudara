// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyADRgryLc0cNL-QiWEQhB0SsbfbA_PNKfI",
  authDomain: "sudara-2f28e.firebaseapp.com",
  projectId: "sudara-2f28e",
  storageBucket: "sudara-2f28e.firebasestorage.app",
  messagingSenderId: "106294827558",
  appId: "1:106294827558:web:35ffb17d4c75b7cf91a4e7"
});

const messaging = firebase.messaging();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// --- బ్యాక్‌గ్రౌండ్‌ మెసేజ్ వచ్చినప్పుడు ---
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);

  // 1. సర్వర్ నుండి వచ్చే ఓనర్ పేరును ఇక్కడ పట్టుకోవాలి (మనం పంపిన 'data' లో ఉంటుంది)
  const restaurantName = payload.data?.ownerName || "Sudara Hub";
  
  // 2. టైటిల్‌ను మార్చుదాం (e.g. "Hotel Name: Offer Title")
  const notificationTitle = `${restaurantName}: ${payload.notification.title}`;
  
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/SUDAR.png',
    badge: '/SUDAR.png', // ఫోన్ నోటిఫికేషన్ బార్ లో కనిపించే చిన్న ఐకాన్
    tag: 'sudara-alert', // డూప్లికేట్ నోటిఫికేషన్లు రాకుండా ఆపుతుంది
    data: {
      url: payload.data?.click_action || '/' // క్లిక్ చేస్తే ఎక్కడికి వెళ్లాలో ఆ లింక్
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- నోటిఫికేషన్ క్లిక్ చేసినప్పుడు సైట్ ఓపెన్ అవ్వడానికి ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // నోటిఫికేషన్ క్లోజ్ చేయడం
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // సైట్ ఆల్రెడీ ఓపెన్ ఉంటే దాన్ని ఫోకస్ చేయి, లేకపోతే కొత్త ట్యాబ్ ఓపెన్ చేయి
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
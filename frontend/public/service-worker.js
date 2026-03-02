const CACHE_NAME = "sudara-hub-v2"; // 👈 వెర్షన్ v2 కి మార్చు రాజు!
const urlsToCache = [
  "/",
  "/index.html",
  "/SUDAResize1.png",
  "/SUDAResize2.png"
];

// 🛠️ 1. Install - పాత వర్కర్ కోసం ఆగకుండా వెంటనే యాక్టివేట్ అవ్వమని చెబుతున్నాం
self.addEventListener("install", (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🚀 2. Fetch Resources - "Network-First" స్ట్రాటజీ
// మొబైల్స్ లో వైట్ స్క్రీన్ రాకుండా ఉండటానికి ఇదే పక్కా మెడిసిన్!
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // నెట్ ఉంటే కొత్త ఫైల్ ని క్యాచీలో అప్‌డేట్ చేస్తుంది
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // నెట్ లేకపోతే మాత్రమే సేవ్ చేసిన పాత ఫైల్స్ ఇస్తుంది
        return caches.match(event.request);
      })
  );
});

// 🧹 3. Activate - పాత క్యాచీని (v1) పూర్తిగా క్లీన్ చేస్తుంది
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Cleaning old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // అన్ని ట్యాబ్స్ పైన వెంటనే కంట్రోల్ తీసుకుంటుంది
});
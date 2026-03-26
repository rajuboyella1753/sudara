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

// service-worker.js fetch block
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 🚀 RAJU CRITICAL FIX: API calls (Update/Post) ni asalu cache cheyaku
  if (url.includes("/api/owner/update") || event.request.method !== "GET") {
    return; // Server ki direct ga pampu
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
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
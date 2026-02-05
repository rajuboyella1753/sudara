import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: "sudara-2f28e.firebaseapp.com",
  projectId: "sudara-2f28e",
  storageBucket: "sudara-2f28e.firebasestorage.app",
  messagingSenderId: "106294827558",
  appId: "1:106294827558:web:49cf698d11b0e5ba91a4e7" 
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const VAPID_KEY = "BFbpfrQHChE0vhRbRY1jw88hL-0MIomXmYy-mMJiqWbNTkRRP_dlj183dV3AG0-P2-DnED2wDY2GqPk7Yjf7fGc";

export const requestForToken = async () => {
  try {
    // 1. నోటిఫికేషన్ పర్మిషన్ అడగడం
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("Permission not granted ❌");
      return null;
    }

    // 2. సర్వీస్ వర్కర్ రిజిస్ట్రేషన్ మరియు రెడీ అయ్యే వరకు ఆగడం
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const serviceWorkerReady = await navigator.serviceWorker.ready;

    console.log("Service Worker is now Active & Ready! 🚀");

    // 3. టోకెన్ తీసుకోవడం
    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerReady 
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (err) {
    console.log("Detailed Token Error:", err);
    return null;
  }
};
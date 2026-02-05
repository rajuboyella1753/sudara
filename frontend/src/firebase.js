import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyADRgryLc0cNL-QiWEQhB0SsbfbA_PNKfI",
  authDomain: "sudara-2f28e.firebaseapp.com",
  projectId: "sudara-2f28e",
  storageBucket: "sudara-2f28e.firebasestorage.app",
  messagingSenderId: "106294827558",
  appId: "1:106294827558:web:35ffb17d4c75b7cf91a4e7"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BFbpfrQHChE0vhRbRY1jw88hL-0MIomXmYy-mMJiqWbNTkRRP_dlj183dV3AG0-P2-DnED2wDY2GqPk7Yjf7fGc";

export const requestForToken = async () => {
  try {

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("Permission not granted ❌");
      return null;
    }
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const serviceWorkerReady = await navigator.serviceWorker.ready;

    console.log("Service Worker is now Active & Ready! 🚀");

    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerReady 
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {

    console.log("Detailed Token Error:", err);
    return null;
  }
};
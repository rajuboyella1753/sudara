import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 🚀 Service Worker Registration - ఇది ఇక్కడ ఉండాలి రాజు
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ PWA: Service Worker Registered!', reg))
      .catch(err => console.log('❌ PWA: Service Worker Failed!', err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
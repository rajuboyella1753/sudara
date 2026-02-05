import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin"; 
import { createRequire } from "module"; 

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json"); 

dotenv.config();
const app = express();

// --- 1. Firebase Initialization ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- 2. JSON & Payload Limits ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. CORS Configuration (Smart Logic) ---
// ఇక్కడ మనం NODE_ENV ని చెక్ చేస్తున్నాం
if (process.env.NODE_ENV !== 'production') {
  // ✅ ఇది నీ లోకల్ కంప్యూటర్‌లో మాత్రమే రన్ అవుతుంది
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  console.log("🛠️ CORS enabled for Local Development");
} else {
  // ✅ AWS సర్వర్‌లో ఉన్నప్పుడు ఇది రన్ అవుతుంది
  console.log("🌐 Production Mode: CORS handled by Nginx");
}

// --- 4. Routes ---
app.use("/api/owner", ownerRoutes);
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Sudhara Server is Running...");
});

// --- 5. MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected & Firebase Admin Ready"))
  .catch((err) => console.log("❌ Error:", err));

const PORT = process.env.PORT || 5000;

// ✅ ఇక్కడ '0.0.0.0' యాడ్ చేశాం, ఇది AWS లో రిక్వెస్ట్‌లను స్వీకరించడానికి అవసరం
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
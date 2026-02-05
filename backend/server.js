import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin"; // ✅ Added
import { createRequire } from "module"; // ✅ Added to handle JSON import
import ownerRoutes from "./routes/ownerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json"); // ✅ నీ JSON ఫైల్

dotenv.config();
const app = express();

// --- 1. Firebase Initialization ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- 2. JSON & Payload Limits ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://sudara.in',
  'https://api.sudara.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
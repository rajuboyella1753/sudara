import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ownerRoutes from "./routes/ownerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();
const app = express();

// --- 1. JSON & Payload Limits ---
// Base64 ఇమేజ్ అప్‌లోడ్స్ కోసం ఈ లిమిట్స్ అవసరం
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. CORS Configuration (Fixed) ---
const allowedOrigins = [
  'http://localhost:5173',  // Local Vite Development
  'https://sudara.in',       // Main Production Domain
  'https://api.sudara.in'    // Subdomain for API
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman లేదా ఇతర టూల్స్ కోసం !origin ని అలౌ చేస్తున్నాం
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true, // Frontend withCredentials: true కి ఇది ముఖ్యం
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- 3. Routes ---
app.use("/api/owner", ownerRoutes);
app.use("/api/items", itemRoutes);

// --- 4. Health Check (Deployment కి హెల్ప్ అవుతుంది) ---
app.get("/", (req, res) => {
  res.send("🚀 Sudhara Server is Running...");
});

// --- 5. MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sudhara Server running on port ${PORT}`);
  console.log(`🌍 Allowed Origins: ${allowedOrigins.join(", ")}`);
});
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin"; 
import { createRequire } from "module"; 
// 🎯 1. Socket.io మరియు HTTP ని ఇంపోర్ట్ చెయ్
import { Server } from "socket.io";
import http from "http";
import cron from 'node-cron';
import Owner from './models/Owner.js';
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json"); 
import ownerRoutes from "./routes/ownerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import orderRoutes from './routes/orderRoutes.js';
import testDriveRoutes from './routes/testDriveRoutes.js';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
const app = express();

// 🎯 2. HTTP సర్వర్ ని క్రియేట్ చేయాలి (Socket.io కోసం ఇది తప్పనిసరి)
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://sudara.in", "https://www.sudara.in", "http://localhost:5173"], 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // 👈 ఇది యాడ్ చెయ్, కనెక్షన్ స్పీడ్ పెరుగుతుంది
});

// 🎯 4. ఆర్డర్ రూట్స్ లో వాడుకోవడానికి io ని app లో సెట్ చెయ్
app.set("socketio", io);

// --- Firebase Initialization ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// if (process.env.NODE_ENV !== 'production') {
//   app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
//   }));
//   console.log("🛠️ CORS enabled for Local Development");
// } else {
//   console.log("🌐 Production Mode: CORS handled by Nginx");
// }
app.use(cors({
  origin: ["https://sudara.in", "https://www.sudara.in", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// 🎯 5. Socket.io కనెక్షన్ హ్యాండ్లింగ్
io.on("connection", (socket) => {
  // ఓనర్ లాగిన్ అవ్వగానే తన రూమ్ లో జాయిన్ చేస్తాం
  socket.on("join_owner_room", (ownerId) => {
    socket.join(ownerId);
    console.log(`Owner ${ownerId} joined their real-time room 🏠`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected ❌");
  });
});
cron.schedule('5 0 * * *', async () => {
  try {
    const owners = await Owner.find({});
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getDate()}/${yesterday.getMonth() + 1}/${yesterday.getFullYear()}`;
    const mKey = `${yesterday.getMonth() + 1}-${yesterday.getFullYear()}`;

    for (let owner of owners) {
      // ఇక్కడ .get() బదులు ఆబ్జెక్ట్ బ్రాకెట్ నొటేషన్ వాడాలి
      const dailyData = owner.analytics.daily[yKey]; 
      
      if (dailyData) {
        await Owner.findByIdAndUpdate(owner._id, {
          $inc: { [`analytics.monthly.${mKey}.revenue`]: dailyData.daily_revenue || 0 }
        });
        await Owner.findByIdAndUpdate(owner._id, { $unset: { [`analytics.daily.${yKey}`]: "" } });
      }
    }
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});
cron.schedule('0 0 1 * *', async () => {
  try {
    await Owner.updateMany({}, {
      $set: {
        "analytics.daily": {},
        "analytics.kitchen_entry": 0,
        "analytics.pre_order_click": 0,
        "analytics.post_order_click": 0,
        "analytics.call_click": 0,
        "analytics.daily_revenue": 0,
        "analytics.cash_sales": 0,
        "analytics.upi_sales": 0,
        "analytics.total_orders": 0,
        "analytics.food_clicks": {} 
      }
    });
    console.log("Monthly Analytics Reset Successfully!");
  } catch (err) {
    console.error("Reset Error:", err);
  }
});
app.use("/api/owner", ownerRoutes);
app.use("/api/items", itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', testDriveRoutes);
app.get("/", (req, res) => {
  res.send("🚀 Sudhara Server is Running with Real-time Support...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected & Socket.io Ready"))
  .catch((err) => console.log("❌ Error:", err));

const PORT = process.env.PORT || 5000;

// 🎯 6. ముఖ్యం: app.listen బదులు server.listen వాడాలి రాజు!
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
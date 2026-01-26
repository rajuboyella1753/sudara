import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    category: String,
    profileImage: { type: String, default: "" },
    phone: String,
    district: { type: String, default: "Tirupati" },
    collegeName: { type: String, default: "General" }, 
    hotelImage: { type: String, default: "" },
    isStoreOpen: { type: Boolean, default: true },
    busyStatus: { type: String, enum: ['Low', 'Medium', 'High','Free', 'Normal', 'Busy'], default: 'Low' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: "" },

    // ✨ NEW STARTUP FEATURES (Adding these now)
    // హోటల్ లోపల ఫోటోల గ్యాలరీ కోసం (Base64 strings array)
    interiorImages: { type: [String], default: [] }, 
    
    // ఓనర్ యొక్క పర్సనల్ UPI QR ఇమేజ్ కోసం
    upiQR: { type: String, default: "" },

    // 🔥 RANKING & USER COUNT
    numberOfReviews: { type: Number, default: 0 }, 
    totalRatings: { type: Number, default: 0 }, 
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Owner", ownerSchema);
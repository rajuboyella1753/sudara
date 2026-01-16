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

    // 🔥 NEW SPICY FEATURES: RANKING & USER COUNT
    // ఎంతమంది యూజర్స్ రేటింగ్ ఇచ్చారో ఈ కౌంట్ చెప్తుంది
    numberOfReviews: { type: Number, default: 0 }, 
    
    // అన్ని రేటింగ్స్ యొక్క మొత్తం (Stars sum)
    totalRatings: { type: Number, default: 0 }, 
    
    // సగటు రేటింగ్ (దీని బేస్ మీద మనం ర్యాంక్ ఇస్తాం)
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Owner", ownerSchema);
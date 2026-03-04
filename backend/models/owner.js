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
    busyStatus: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Free', 'Normal', 'Busy'], 
        default: 'Low' 
    },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: "" },

    // ✨ NEW STARTUP FEATURES
    interiorImages: { type: [String], default: [] },
    upiQR: { type: String, default: "" }, 
    upiID: { type: String, default: "" }, 

    // 🚀 కొత్త ఫీచర్: ఆ రోజు స్పెషల్ ఐటమ్ మెసేజ్
    todaySpecial: { type: String, default: "" }, 
    specialTimestamp: { type: Date, default: Date.now },
    tableCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },

    // 🔥 RANKING & USER COUNT
    numberOfReviews: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviews: [
      {
        comment: { type: String, required: true },
        rating: { type: Number, default: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ అనలిటిక్స్ ఫీల్డ్
    analytics: {
      type: Map,
      of: {
        kitchen_entry: { type: Number, default: 0 },
        pre_order_click: { type: Number, default: 0 },
        post_order_click: { type: Number, default: 0 },
        call_click: { type: Number, default: 0 },
        food_clicks: { type: Map, of: Number } 
      },
      default: {},
    },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Owner", ownerSchema);
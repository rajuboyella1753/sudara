import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    category: String,
    profileImage: { type: String, default: "" },
    phone: String, // Calling Number
    whatsappNumber: { type: String, default: "" }, // 🆕 WhatsApp
    upiNumber: { type: String, default: "" }, // 🆕 PhonePe/GPay Number
    state: { type: String, default: "Andhra Pradesh" }, // 🆕 State
    district: { type: String, default: "Tirupati" },
    collegeName: { type: String, default: "General" }, // Landmark / Area
    hotelImage: { type: String, default: "" },
    isStoreOpen: { type: Boolean, default: true },
    busyStatus: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Free', 'Normal', 'Busy'], 
        default: 'Low' 
    },
    foodType: { 
    type: String, 
    enum: ['Veg', 'Non-Veg', 'Both'], 
    default: 'Both' 
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

    nextBillingDate: { type: Date },      
    billingStatus: { type: String, default: "Unpaid" }, 
    planType: { type: String, enum: ["basic", "premium"], default: "basic" },
    pendingMonthsCount: { type: Number, default: 0 },
    paymentReceipt: { type: String, default: "" }, 
    requestedPlanDuration: { type: Number, default: 30 },
    gstPercentage: { type: Number, default: 5 }, 
    extraCharges: { type: Number, default: 0 },
    reviews: [
      {
        comment: { type: String, required: true },
        rating: { type: Number, default: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    analytics: {
  type: Map,
  of: new mongoose.Schema({
    kitchen_entry: { type: Number, default: 0 },
    pre_order_click: { type: Number, default: 0 },
    post_order_click: { type: Number, default: 0 },
    call_click: { type: Number, default: 0 },
    daily_revenue: { type: Number, default: 0 },
    cash_sales: { type: Number, default: 0 },  // 🎯 ఇవి కొత్తగా యాడ్ చెయ్
    upi_sales: { type: Number, default: 0 },   // 🎯 ఇవి కొత్తగా యాడ్ చెయ్
    total_orders: { type: Number, default: 0 },
    food_clicks: { type: Map, of: Number },
    daily: { type: Map, of: Object },   // ఇది 15 రోజులు మాత్రమే ఉంటుంది
    monthly: { type: Map, of: Object }
  }, { _id: false }), // ఇక్కడ _id: false పెడితే ప్రతి డేట్ కి ఐడి రాకుండా క్లీన్ గా ఉంటుంది
  default: {}
},
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);
const Owner = mongoose.models.Owner || mongoose.model("Owner", ownerSchema);
export default Owner;
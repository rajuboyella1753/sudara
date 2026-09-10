import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    name: String,
    ownerName: { type: String, required: true },
    email: { type: String, unique: true },
    password: String,
    
    // 1. అన్ని కేటగిరీలు ఇక్కడ ఉన్నాయి, trim: true యాడ్ చేశాం
    category: { 
      type: String, 
      required: true,
      trim: true,
      enum: [
        'Restaurant', 
        'Electronics', 
        'Clothing', 
        'Grocery', 
        'Services', 
        'Automobile', 
        'Furniture', 
        'General'
      ], 
      default: 'Restaurant' 
    },

    profileImage: { type: String, default: "" },
    fssaiNumber: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    phone: String,
    whatsappNumber: { type: String, default: "" },
    upiNumber: { type: String, default: "" },
    state: { type: String, default: "Andhra Pradesh" },
    district: { type: String, default: "Tirupati" },
    collegeName: { type: String, default: "General" },
    hotelImage: { type: String, default: "" },
    isStoreOpen: { type: Boolean, default: true },
    busyStatus: { 
      type: String, 
      enum: ['Low', 'Medium', 'High', 'Free', 'Normal', 'Busy'], 
      default: 'Low' 
    },

    // 2. ఫుడ్ టైప్ ఖాళీగా ఉన్నా ఎర్రర్ రాకుండా '' యాడ్ చేశాం
    foodType: { 
      type: String, 
      enum: ['Veg', 'Non-Veg', 'Both', ''], 
      default: '' 
    },

    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: "" },

    interiorImages: { type: [String], default: [] },
    upiQR: { type: String, default: "" }, 
    upiID: { type: String, default: "" }, 

    todaySpecial: { type: String, default: "" }, 
    specialTimestamp: { type: Date, default: Date.now },
    tableCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isPreBookEnabled: { type: Boolean, default: true },

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
        cash_sales: { type: Number, default: 0 }, 
        upi_sales: { type: Number, default: 0 },  
        total_orders: { type: Number, default: 0 },
        food_clicks: { type: Map, of: Number },
        daily: { type: Map, of: Object },  
        monthly: { type: Map, of: Object }
      }, { _id: false }), 
      default: {}
    },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// పాత స్కీమా మెమరీలో స్టక్ అవ్వకుండా ఈ లైన్ ముఖ్యం:
delete mongoose.models.Owner;
const Owner = mongoose.model("Owner", ownerSchema);

export default Owner;
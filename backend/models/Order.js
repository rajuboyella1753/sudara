import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  customerName: String,
  customerPhone: String,
  tableNo: String,
  items: [String],
  totalAmount: Number,
  advancePaid: Number,
  txnId: String,
  arrivalTime: String,
  // 🎯 'Express-Route' ని enum లో యాడ్ చేశాను
  orderType: { type: String, enum: ['Pre-book', 'Post-book', 'Express-Route'] }, 
  status: { 
        type: String, 
        enum: ["Pending", "Accepted", "Preparing", "Served"], 
        default: "Pending" 
    },
  
  // 🚀 కొత్త ఫీచర్ కోసం కావాల్సిన అదనపు ఫీల్డ్స్
  sudaraId: { type: String, unique: true, sparse: true }, // 6-digit ID
  travelDuration: Number, // నిమిషాల్లో
  prepTime: { type: Number, default: 20 }, 
  scheduledStartTime: Date, // వంట మొదలుపెట్టాల్సిన టైమ్
  isDelayed: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
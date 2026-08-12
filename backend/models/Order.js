import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  customerName: String,
  customerPhone: String,
  
  // 🎯 మార్పు 1: tableNo - ఇది Post-book కి చాలా ముఖ్యం
  tableNo: { type: String, default: "PRE" }, 
  
  items: [String],
  totalAmount: Number,
  advancePaid: Number,
  txnId: String,
  subTotal: Number,
  gstAmount: Number,
  extraCharges: Number,
  peopleCount: { type: Number, default: 1 },
  arrivalTime: { 
  type: String, 
  required: false 
},
  
  orderType: { 
  type: String, 
  enum: ['Pre-book', 'Post-book', 'Express-Route', 'Counter', 'Online-Order', 'Store-Direct-Order'], 
  required: true 
},
  customerAddress: { type: String },
 status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Preparing", "Shipping", "Out for Delivery", "Delivered", "Served"], 
    default: "Pending" 
  },
 
 deliveryType: { 
    type: String, 
    enum: ['Take Away', 'Book at Restaurant', 'Store Delivery', 'Store Home Delivery', 'None'], // 👈 నాన్-రెస్టారెంట్ స్టోర్ టైప్స్ ని ఇక్కడ యాడ్ చేశాం రాజు!
    default: 'None' 
  },
  

  sudaraId: { type: String, unique: true, sparse: true }, 

  travelDuration: Number, 
  prepTime: { type: Number, default: 20 }, 
  scheduledStartTime: Date, 
  isDelayed: { type: Boolean, default: false },

  paymentMode: { 
    type: String, 
    enum: ['CASH', 'UPI', 'PENDING', 'CASH ON DELIVERY / DIRECT'], 
    default: 'CASH' 
  },

  createdAt: { type: Date, default: Date.now , expires: 86400} 
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
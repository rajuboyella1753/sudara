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
  arrivalTime: String,
  
  orderType: { 
    type: String, 
    enum: ['Pre-book', 'Post-book', 'Express-Route'],
    required: true // ఇది ఉంటేనే మనం ఐడిలు సరిగ్గా జనరేట్ చేయగలం
  }, 
  
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Preparing", "Served"], 
    default: "Pending" 
  },
  
  // 🎯 మార్పు 2: sudaraId - ఇక్కడ 'unique: true' జాగ్రత్త!
  // నువ్వు అన్నీ డిలీట్ చేస్తున్నావు కాబట్టి 'sparse: true' ఉండటం మంచిది.
  sudaraId: { type: String, unique: true, sparse: true }, 

  travelDuration: Number, 
  prepTime: { type: Number, default: 20 }, 
  scheduledStartTime: Date, 
  isDelayed: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
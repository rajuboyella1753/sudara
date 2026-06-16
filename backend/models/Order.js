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
  peopleCount: { type: Number, default: 1 },
  arrivalTime: { 
  type: String, 
  required: false 
},
  
  orderType: { 
    type: String, 
    enum: ['Pre-book', 'Post-book', 'Express-Route','Counter'],
    required: true // ఇది ఉంటేనే మనం ఐడిలు సరిగ్గా జనరేట్ చేయగలం
  }, 
  
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Preparing", "Served"], 
    default: "Pending" 
  },
  // నీ ఆర్డర్ స్కీమా లోపల ఇవి యాడ్ చెయ్ మచ్చా:
  deliveryType: { 
    type: String, 
    enum: ['Take Away', 'Book at Restaurant', 'None'], 
    default: 'None' 
  },
  
  // 🎯 మార్పు 2: sudaraId - ఇక్కడ 'unique: true' జాగ్రత్త!
  // నువ్వు అన్నీ డిలీట్ చేస్తున్నావు కాబట్టి 'sparse: true' ఉండటం మంచిది.
  sudaraId: { type: String, unique: true, sparse: true }, 

  travelDuration: Number, 
  prepTime: { type: Number, default: 20 }, 
  scheduledStartTime: Date, 
  isDelayed: { type: Boolean, default: false },
  // నీ స్కీమాలో ఈ ఫీల్డ్ ని యాడ్ చెయ్:
  paymentMode: { 
    type: String, 
    enum: ['CASH', 'UPI', 'PENDING'], 
    default: 'CASH' 
  },

  createdAt: { type: Date, default: Date.now , expires: 86400} // ఆర్డర్ 24 గంటల తర్వాత ఆటోమేటిక్ గా డిలీట్ అవుతుంది
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
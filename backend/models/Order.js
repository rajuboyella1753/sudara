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
  orderType: { type: String, enum: ['Pre-book', 'Post-book'] },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order; // ESM లో ఇలా ఎక్స్‌పోర్ట్ చేయాలి
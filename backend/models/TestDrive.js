import mongoose from 'mongoose';

const testDriveSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  vehicleName: { type: String, required: true },
  testDriveDate: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now, expires: 86400 }
});

const TestDrive = mongoose.model('TestDrive', testDriveSchema);

export default TestDrive;
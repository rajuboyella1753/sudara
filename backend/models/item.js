import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true, 
    default: "General"
  },
  subCategory: { type: String, default: "General" },
  description: { type: String, default: "" }, 
  image: { type: String, required: false },
  isAvailable: { type: Boolean, default: true }, 
  
  // 🚗 ఆటోమొబైల్ & ఇతర కేటగిరీల కోసం ఎక్స్ట్రా ఫీల్డ్స్ డేటాబేస్ లో సేవ్ అవ్వడానికి:
  mileageOrRange: { type: String, default: "" },
  fuelType: { type: String, default: "" },
  material: { type: String, default: "" }, // ఫర్నిచర్ కోసం

  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
}, { timestamps: true });

itemSchema.index({ ownerId: 1 });
export default mongoose.model("Item", itemSchema);
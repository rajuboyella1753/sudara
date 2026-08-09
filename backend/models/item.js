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
  
  // 🎯 ఇది చాలా ముఖ్యం: ఇది మాస్టర్ ఐటమ్స్ కాదా అని గుర్తించడానికి
  isMaster: { type: Boolean, default: false },

  mileageOrRange: { type: String, default: "" },
  fuelType: { type: String, default: "" },
  material: { type: String, default: "" }, 

  // ownerId ఇప్పుడు మాస్టర్ ఐటమ్స్ కోసం required కాకుండా ఉండాలి (required: false)
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Owner", 
    required: function() { return !this.isMaster; } // మాస్టర్ ఐటమ్ అయితే ownerId అవసరం లేదు
  },
}, { timestamps: true });

itemSchema.index({ ownerId: 1 });
itemSchema.index({ isMaster: 1, category: 1 }); // స్పీడ్ కోసం ఇండెక్సింగ్

export default mongoose.model("Item", itemSchema);
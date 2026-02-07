import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { 
    type: String, 
    required: true,
    enum: ["Biryanis", "Starters", "Breads", "Sea Food", "Soups", "Noodles", "Gravys", "Rice"]
  },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }, 
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
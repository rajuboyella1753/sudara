import express from "express";
import Item from "../models/item.js";
import { upload } from '../config/uploadMiddleware.js';
import Order from "../models/Order.js";
const router = express.Router();

router.post("/add", upload.single('image'), async (req, res) => {
  try {
    console.log("📥 --- ITEM ADD API HIT ---");
    console.log("📦 Request Body Data:", req.body);
    console.log("📸 Request File:", req.file);

    const { name, price, subCategory, ownerId, category, description, isAvailable } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is missing!" });
    }

    if (!name || !price) {
      return res.status(400).json({ message: "Name and Price are required!" });
    }

    const imageUrl = req.file ? req.file.path : "";

    // boolean విలువను సరిగ్గా పార్స్ చేయడం
    const parsedAvailability = isAvailable === 'true' || isAvailable === true;

    const newItem = await Item.create({
      name,
      price: Number(price),
      category: category || "Electronics",
      subCategory: subCategory || "Mobiles",
      description: description || "",
      isAvailable: parsedAvailability,
      ownerId,
      image: imageUrl
    });

    console.log("✅ Item successfully saved with ID:", newItem._id);
    return res.status(201).json(newItem);

  } catch (err) {
    console.error("❌ CRITICAL ERROR IN /items/add:", err.message);
    console.error("Full Error Details:", err); // అసలైన ఎర్రర్ టెర్మినల్‌లో చూడటానికి
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: err.message 
    });
  }
});

/* 2. GET ALL ITEMS */
router.get("/all", async (req, res) => {
  try {
    const items = await Item.find().populate("ownerId", "name phone category isStoreOpen");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* 3. UPDATE FULL ITEM 🔥 */
router.put("/update/:id", upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, subCategory, description, isAvailable } = req.body; 
    
    let updateData = { 
      name, 
      price: Number(price), 
      category, 
      subCategory,
      description: description || "",
      isAvailable: isAvailable === 'true' || isAvailable === true
    };
    
    if (req.file) {
      updateData.image = req.file.path; 
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    
    console.log("✅ Item updated successfully:", updatedItem._id);
    res.json(updatedItem);
    
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Failed to update item", details: err.message });
  }
});

/* 4. UPDATE AVAILABILITY (Sold Out toggle కోసం) */
router.put("/update-availability/:id", async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item availability" });
  }
});

/* 5. DELETE ITEM */
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    
    console.log("🗑️ Item deleted");
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});
/* 6. GET ITEMS BY OWNER ID (Corrected for Ultra Speed) */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const items = await Item.find({ ownerId })
      .select("name price category subCategory description image isAvailable ownerId") // 👈 ఇక్కడ 'description' యాడ్ చెయ్యి
      .lean();
      
    console.log("Fetched Items for Owner:", items.length);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
});
router.get("/sales-report/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // ఈరోజు తేదీని సెట్ చేస్తున్నాం
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({ 
      restaurantId: ownerId, // నీ స్కీమాలో 'restaurantId' అని ఉంది
      createdAt: { $gte: startOfDay } 
    });

    // డేటాను లెక్కించడం
    const report = orders.reduce((acc, order) => {
      acc.totalOrders += 1;
      acc.grandTotal += (order.totalAmount || 0);
      
      if (order.paymentMode === 'CASH') acc.cashSales += (order.totalAmount || 0);
      else if (order.paymentMode === 'UPI') acc.onlineSales += (order.totalAmount || 0);
      
      return acc;
    }, { totalOrders: 0, cashSales: 0, onlineSales: 0, grandTotal: 0 });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Report generation failed" });
  }
});
export default router;
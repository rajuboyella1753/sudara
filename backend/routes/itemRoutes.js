import express from "express";
import Item from "../models/item.js";
import { upload } from '../config/uploadMiddleware.js';
const router = express.Router();

router.post("/add", upload.single('image'), async (req, res) => {
  try {
    console.log("📥 Item Add Request Received!");
    
    // 1. డేటాను విడివిడిగా తీసుకో (ఇది సేఫ్ మెథడ్)
    const { name, price, subCategory, ownerId } = req.body;
    let { category } = req.body;

    // 2. ఒకవేళ కేటగిరీ రాకపోతే లేదా ఖాళీగా ఉంటే 'General' సెట్ చెయ్
    if (!category || category === "") {
        category = "General";
    }

    // 3. క్లౌడినరీ లింక్ (Image Upload)
    const imageUrl = req.file ? req.file.path : ""; 
    
    // 4. ఐటమ్ క్రియేషన్ (ఇప్పుడు పక్కాగా డేటా వెళ్తుంది)
    const newItem = await Item.create({ 
      name, 
      price, 
      category, 
      subCategory, 
      ownerId,
      image: imageUrl 
    });
    
    console.log("✅ Item saved in DB:", newItem._id);
    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ SERVER-SIDE ERROR:", err); 
    // ఎర్రర్ మెసేజ్ క్లియర్ గా పంపుతున్నాం
    res.status(500).json({ 
        message: "Server Error during creation", 
        details: err.message 
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
    // 1. ఫామ్ నుండి డేటాను తీసుకుంటున్నాం
    const { name, price, category, subCategory } = req.body; 
    
    // 2. అప్‌డేట్ చేయాల్సిన డేటాను ఒక ఆబ్జెక్ట్ లో పెట్టుకుంటున్నాం
    let updateData = { 
      name, 
      price, 
      category, 
      subCategory 
    };
    
    // 3. ఒకవేళ కొత్త ఇమేజ్ ఫైల్ అప్‌లోడ్ అయితేనే, దాన్ని `updateData` కి యాడ్ చేస్తున్నాం
    if (req.file) {
      updateData.image = req.file.path; 
    }
    
    // 4. డేటాబేస్ అప్‌డేట్ (new: true అంటే అప్‌డేట్ అయిన లేటెస్ట్ డేటాను రిటర్న్ చేస్తుంది)
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // 5. ఐటమ్ దొరక్కపోతే ఎర్రర్
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
    
    // ఇక్కడ సెలెక్ట్ చేసేటప్పుడు అన్ని ఫీల్డ్స్ పక్కాగా ఉంచు
    const items = await Item.find({ ownerId })
      .select("name price category subCategory image isAvailable ownerId") 
      .lean();
      
    console.log("Fetched Items for Owner:", items.length); // ఎన్ని ఐటమ్స్ వస్తున్నాయో ఇక్కడ టెర్మినల్ లో చూడు
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
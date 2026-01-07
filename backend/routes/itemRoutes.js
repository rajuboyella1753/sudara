import express from "express";
import Item from "../models/item.js";

const router = express.Router();

/* 1. ADD NEW ITEM */
router.post("/add", async (req, res) => {
  try {
    const { name, price, category, image, ownerId } = req.body;

    console.log("Adding item for Owner:", ownerId);

    if (image && image.length > 10 * 1024 * 1024) { // 10MB limit (మనం ఫ్రంటెండ్‌లో ఆప్టిమైజ్ చేస్తున్నాం కాబట్టి ఇది సేఫ్)
       return res.status(400).json({ message: "Image is too large!" });
    }

    const newItem = await Item.create({ name, price, category, image, ownerId });
    
    console.log("✅ Item saved successfully");
    res.status(201).json(newItem);
  } catch (err) {
    console.error("MongoDB Save Error:", err.message);
    res.status(500).json({ error: "Database Error", details: err.message });
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

/* 3. UPDATE FULL ITEM (Edit Feature కోసం) 🔥 */
router.put("/update/:id", async (req, res) => {
  try {
    const { name, price, category, image } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price, category, image },
      { new: true } // ఇది అప్‌డేట్ అయిన కొత్త డేటాని రిటర్న్ చేస్తుంది
    );
    
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    
    console.log("✅ Item updated successfully");
    res.json(updatedItem);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Failed to update item" });
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

export default router;
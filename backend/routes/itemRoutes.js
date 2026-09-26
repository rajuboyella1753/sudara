import express from "express";
import Item from "../models/item.js";
import Owner from "../models/owner.js";
import { upload } from '../config/uploadMiddleware.js';
import Order from "../models/Order.js";
const router = express.Router();

router.post("/add", upload.single('image'), async (req, res) => {
  try {
    console.log("📥 --- ITEM ADD API HIT ---");
    console.log("📦 Request Body Data:", req.body);
    console.log("📸 Request File:", req.file);

    // 💡 ఇక్కడ mileageOrRange, fuelType, material లను కూడా రిసీవ్ చేసుకోవాలి
    const { 
      name, 
      price, 
      subCategory, 
      ownerId, 
      category, 
      description, 
      isAvailable, 
      mileageOrRange, 
      downPayment, estimatedEMI, requiredSalary,
      fuelType, 
      material 
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is missing!" });
    }

    if (!name || !price) {
      return res.status(400).json({ message: "Name and Price are required!" });
    }

    const imageUrl = req.file ? req.file.path : "";
    const parsedAvailability = isAvailable === 'true' || isAvailable === true;

    const newItem = await Item.create({
      name,
      price: Number(price),
      category: category || "General",
      subCategory: subCategory || "General",
      description: description || "",
      isAvailable: parsedAvailability,
      ownerId,
      image: imageUrl,
      downPayment: downPayment || "",       // 👈 సేవ్ చేస్తున్నాం
      estimatedEMI: estimatedEMI || "",     // 👈 సేవ్ చేస్తున్నాం
      requiredSalary: requiredSalary || "",
      // 🎯 డేటాబేస్ లో పర్ఫెక్ట్ గా సేవ్ అయ్యేలా ఇక్కడ యాడ్ చేయాలి
      mileageOrRange: mileageOrRange || "",
      fuelType: fuelType || "",
      material: material || ""
    });

    console.log("✅ Item successfully saved with ID:", newItem._id);
    return res.status(201).json(newItem);

  } catch (err) {
    console.error("❌ CRITICAL ERROR IN /items/add:", err.message);
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
    const { 
      name, 
      price, 
      category, 
      subCategory, 
      description, 
      isAvailable, 
      mileageOrRange, 
      fuelType, 
      downPayment, estimatedEMI, requiredSalary,
      material 
    } = req.body; 
    
    let updateData = { 
      name, 
      price: Number(price), 
      category, 
      subCategory,
      description: description || "",
      isAvailable: isAvailable === 'true' || isAvailable === true,
      mileageOrRange: mileageOrRange || "",
      fuelType: fuelType || "",
      downPayment,
      estimatedEMI,
      requiredSalary,
      material: material || ""
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
      .select("name price category subCategory description image isAvailable ownerId mileageOrRange fuelType material downPayment estimatedEMI requiredSalary") // 👈 ఇక్కడ 'description' యాడ్ చెయ్యి
      .lean();
      console.log("🔍 Backend Sending Items with Description:", items.map(i => ({ name: i.name, desc: i.description })));
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
router.get("/master-catalog", async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {}; // తాత్కాలికంగా isMaster ని తీసేయండి

    if (category && category !== "All") {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }  

    const masterItems = await Item.find(filter); 
    console.log(`🔍 Total items found for ${category}:`, masterItems.length);
    res.status(200).json(masterItems);
  } catch (err) {
    console.error("Master catalog fetch error:", err.message);
    res.status(500).json({ message: "Master catalog fetch failed" });
  }
});
// ======================================================
// 🍽️ RESTAURANT MASTER CATALOG - DEBUG VERSION
// Existing master-catalog ni touch cheyyakunda separate route
// ======================================================

router.get("/restaurant-master-catalog", async (req, res) => {
  try {
    const { ownerId } = req.query;

    console.log("\n");
    console.log("==================================================");
    console.log("🍽️ RESTAURANT MASTER CATALOG REQUEST");
    console.log("==================================================");

    console.log("📥 Query ownerId:", ownerId);
    console.log("📥 Query ownerId type:", typeof ownerId);

    // --------------------------------------------------
    // STEP 1: ALL OWNERS
    // --------------------------------------------------

    const allOwners = await Owner.find({})
      .select("_id name ownerName category")
      .lean();

    console.log("\n");
    console.log("👥 STEP 1 - TOTAL OWNERS:", allOwners.length);

    if (allOwners.length === 0) {
      console.log("❌ NO OWNERS FOUND IN DATABASE");
    }

    allOwners.forEach((owner, index) => {
      console.log(`👤 OWNER ${index + 1}:`, {
        id: String(owner._id),
        name: owner.ownerName || owner.name,
        category: owner.category,
        categoryType: typeof owner.category
      });
    });

    // --------------------------------------------------
    // STEP 2: RESTAURANT OWNERS
    // --------------------------------------------------

    const restaurantOwners = allOwners.filter((owner) => {
      const category = String(owner.category || "")
        .trim()
        .toLowerCase();

      return category === "restaurant";
    });

    console.log("\n");
    console.log(
      "🍽️ STEP 2 - RESTAURANT OWNERS:",
      restaurantOwners.length
    );

    restaurantOwners.forEach((owner, index) => {
      console.log(`🍽️ RESTAURANT OWNER ${index + 1}:`, {
        id: String(owner._id),
        name: owner.ownerName || owner.name,
        category: owner.category
      });
    });

    if (restaurantOwners.length === 0) {
      console.log(
        "❌ STOP: DATABASE LO RESTAURANT CATEGORY OWNER DORAKALEDU"
      );

      return res.status(200).json([]);
    }

    // --------------------------------------------------
    // STEP 3: RESTAURANT OWNER IDs
    // --------------------------------------------------

    const restaurantOwnerIds = restaurantOwners.map(
      (owner) => owner._id
    );

    console.log("\n");
    console.log("🆔 STEP 3 - RESTAURANT OWNER IDS:");

    restaurantOwnerIds.forEach((id) => {
      console.log("   →", String(id));
    });

    // --------------------------------------------------
    // STEP 4: FIND ITEMS BELONGING TO RESTAURANT OWNERS
    // --------------------------------------------------

    const restaurantItems = await Item.find({
      ownerId: {
        $in: restaurantOwnerIds
      }
    })
      .populate(
        "ownerId",
        "_id name ownerName category"
      )
      .lean();

    console.log("\n");
    console.log(
      "🍛 STEP 4 - RESTAURANT ITEMS FOUND:",
      restaurantItems.length
    );

    if (restaurantItems.length === 0) {
      console.log(
        "❌ RESTAURANT OWNERS UNNARU KANI VALLA ITEMS DATABASE LO LEVU"
      );

      // Extra check:
      console.log("\n🔎 CHECKING ALL ITEMS:");

      const allItems = await Item.find({})
        .select("_id name price category subCategory ownerId")
        .lean();

      console.log(
        "📦 TOTAL ITEMS IN DATABASE:",
        allItems.length
      );

      allItems.forEach((item, index) => {
        console.log(`📦 ITEM ${index + 1}:`, {
          id: String(item._id),
          name: item.name,
          price: item.price,
          category: item.category,
          subCategory: item.subCategory,
          ownerId: item.ownerId
            ? String(item.ownerId)
            : null
        });
      });
    }

    // --------------------------------------------------
    // STEP 5: PRINT EVERY RESTAURANT ITEM
    // --------------------------------------------------

    restaurantItems.forEach((item, index) => {
      console.log(`🍽️ ITEM ${index + 1}:`, {
        id: String(item._id),
        name: item.name,
        price: item.price,
        itemCategory: item.category,
        subCategory: item.subCategory,

        ownerId: item.ownerId
          ? String(item.ownerId._id)
          : null,

        ownerName: item.ownerId
          ? item.ownerId.ownerName || item.ownerId.name
          : null,

        ownerCategory: item.ownerId
          ? item.ownerId.category
          : null
      });
    });

    // --------------------------------------------------
    // STEP 6: REMOVE CURRENT OWNER
    // --------------------------------------------------

    const finalItems = restaurantItems.filter((item) => {
      if (!ownerId) return true;

      const itemOwnerId = item.ownerId?._id;

      return String(itemOwnerId) !== String(ownerId);
    });

    console.log("\n");
    console.log(
      "🚫 CURRENT OWNER EXCLUDED:",
      ownerId
    );

    console.log(
      "✅ STEP 6 - FINAL ITEMS TO FRONTEND:",
      finalItems.length
    );

    finalItems.forEach((item, index) => {
      console.log(`✅ FINAL ITEM ${index + 1}:`, {
        id: String(item._id),
        name: item.name,
        price: item.price,
        owner: item.ownerId
          ? item.ownerId.ownerName || item.ownerId.name
          : null
      });
    });

    console.log("\n");
    console.log("📤 SENDING ITEMS TO FRONTEND...");
    console.log("📤 RESPONSE COUNT:", finalItems.length);
    console.log("==================================================");
    console.log("\n");

    return res.status(200).json(finalItems);

  } catch (err) {

    console.log("\n");
    console.log("==================================================");
    console.log("❌ RESTAURANT MASTER CATALOG ERROR");
    console.log("==================================================");

    console.error(err);

    console.log("Message:", err.message);
    console.log("Stack:", err.stack);

    console.log("==================================================");
    console.log("\n");

    return res.status(500).json({
      success: false,
      message: "Restaurant master catalog fetch failed",
      error: err.message
    });
  }
});
/* 7. ADD ITEM FROM MASTER CATALOG */
router.post("/add-from-master", async (req, res) => {
  try {
    const { ownerId, name, category, subCategory, price, material, description, image, isAvailable } = req.body;

    if (!ownerId || !name || !price) {
      return res.status(400).json({ message: "Owner ID, Name and Price are required!" });
    }

    const newItem = await Item.create({
      ownerId,
      name,
      category: category || "General",
      subCategory: subCategory || "General",
      price: Number(price),
      material: material || "",
      description: description || "",
      image: image || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    console.log("✅ Item added from master catalog with ID:", newItem._id);
    return res.status(201).json(newItem);

  } catch (err) {
    console.error("❌ Error in /items/add-from-master:", err.message);
    return res.status(500).json({ message: "Failed to add item from master catalog", details: err.message });
  }
});
// 📊 Universal Price Comparison Route (ఏ ఐటమ్‌కైనా పనిచేస్తుంది)
router.get("/compare", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Item name is required" });
    }

    // ఆటోమొబైల్స్ మాత్రమే అని కాకుండా, అన్ని కేటగిరీల ఐటమ్స్ వచ్చేలా క్వెరీ
    const similarItems = await Item.find({ 
      name: { $regex: new RegExp(name, "i") } 
    }).populate('ownerId', 'name address phone state district collegeName');

    const comparisonResults = similarItems.map(item => {
      const ownerObj = item.ownerId || {};
      const locationParts = [ownerObj.collegeName, ownerObj.district, ownerObj.state].filter(Boolean);
      const fullLocation = locationParts.length > 0 ? locationParts.join(", ") : (ownerObj.address || "Local Area");

      return {
        ownerId: ownerObj._id,
        showroomName: ownerObj.name || "Local Store",
        location: fullLocation,
        price: item.price,
        category: item.category || "General",
        benefits: item.description || "Standard Support",
        isAvailable: item.isAvailable !== false
      };
    });

    res.status(200).json(comparisonResults);
  } catch (err) {
    console.error("Comparison Error:", err);
    res.status(500).json({ message: "Failed to compare prices" });
  }
});
export default router;
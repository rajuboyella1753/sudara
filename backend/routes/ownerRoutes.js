import express from "express";
import Owner from "../models/Owner.js";
import Item from "../models/item.js";
import admin from "firebase-admin";
import { upload } from '../config/uploadMiddleware.js';
import { uploadImage } from '../utils/imageUpload.js';
import mongoose from "mongoose";
const router = express.Router();


router.get("/colleges", async (req, res) => {
  try {
    const colleges = await Owner.distinct("collegeName");
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ message: "Error fetching colleges" });
  }
});


router.get("/all-owners", async (req, res) => {
  try {
    
    const owners = await Owner.find({ isApproved: true })
      .select("name hotelImage collegeName isStoreOpen latitude longitude category averageRating isApproved foodType state district")
      .lean();
    
    console.log(`✅ Approved Owners Found: ${owners.length}`);
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, whatsappNumber, upiNumber, state, district, collegeName } = req.body;
    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Owner already exists" });

    const owner = await Owner.create({ 
      name, email, password, phone, 
      whatsappNumber: whatsappNumber || phone, 
      upiNumber: upiNumber || phone,
      state: state || "Andhra Pradesh",
      district: district || "Tirupati", 
      collegeName: collegeName || "General",
      isApproved: false 
    });
    res.status(201).json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin-all-owners", async (req, res) => {
  try {
    const owners = await Owner.find({}) 
    
    .select("name hotelImage collegeName isStoreOpen category averageRating isApproved phone upiID analytics state district createdAt nextBillingDate billingStatus pendingMonthsCount planType paymentReceipt requestedPlanDuration")
    .lean();
    
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners for admin" });
  }
});

router.get("/districts", async (req, res) => {
  try {
   
    const { state } = req.query;

    let filterCondition = {};
    if (state) {
     
      filterCondition.state = state;
    }

   
    const districts = await Owner.distinct("district", filterCondition);
    
    res.status(200).json(districts);
  } catch (err) {
    console.error("Districts query error:", err);
    res.status(500).json({ message: "Error fetching filtered districts" });
  }
}); 

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    // 🎯 Admin Login Check
    if (email === "telugubiblequiz959@gmail.com" && password === "Raju1753@s") {
      return res.json({ 
        success: true, 
        isAdmin: true, 
        message: "Welcome Admin BSR!" 
      });
    }

    
    const owner = await Owner.findOne({ email, password }).lean();

    if (!owner) {
      return res.status(401).json({ message: "Invalid Email or Password ❌" });
    }



 
    if (owner.isApproved === false) {
      return res.status(403).json({ message: "Account pending admin approval... ⏳" });
    }

    res.json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/approve-owner/:id", async (req, res) => {
  try {
    const { isApproved } = req.body;
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, { isApproved: isApproved }, { new: true });
    res.json({ success: true, owner: updatedOwner });
  } catch (err) {
    res.status(500).json({ message: "Approval update failed" });
  }
});

router.delete("/delete-owner/:id", async (req, res) => {
  try {
    const ownerId = req.params.id;


    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Invalid Owner ID Matrix!" });
    }

 
    const targetObjectId = new mongoose.Types.ObjectId(ownerId);

  
    await Item.deleteMany({ ownerId: targetObjectId }); 

  
    const deletedOwner = await Owner.findByIdAndDelete(targetObjectId); 


    if (!deletedOwner) {
      return res.status(404).json({ success: false, message: "Owner not found in Matrix!" });
    }

 
    res.json({ success: true, message: "Owner and all assets erased completely! 🧹" });

  } catch (err) {
    console.error("DANGER DELETE ERROR:", err); 
    res.status(500).json({ success: false, message: "Delete failed completely" });
  }
});

router.put("/direct-reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

   
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "This email is not registered in our Hub! ❌" });
    }

   
    owner.password = newPassword;
    await owner.save();

    res.json({ success: true, message: "Password updated successfully! Access Restored ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error during reset." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json(owner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updatePayload = { ...req.body };

  
    if (updatePayload.todaySpecial) {
      updatePayload.specialTimestamp = new Date();
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    console.log(`✅ Owner ${id} Profile Updated Successfully! (GST: ${updatedOwner.gstPercentage}%, Extra: ₹${updatedOwner.extraCharges})`);
    res.status(200).json(updatedOwner); 
  } catch (err) {
    console.error("Update Error ❌:", err);
    res.status(500).json({ message: "Server error during update", error: err.message });
  }
});

router.put("/add-interior-images/:id", async (req, res) => {
  try {
    const { images } = req.body; 
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { $push: { interiorImages: { $each: images } } },
      { new: true }
    );
    res.json(updatedOwner);
  } catch (err) {
    res.status(500).json({ message: "Failed to add images" });
  }
});


router.put("/remove-interior-image/:id", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { $pull: { interiorImages: imageUrl } }, 
      { new: true }
    );
    res.json(updatedOwner);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove image" });
  }
});
router.put("/update-status/:id", async (req, res) => {
  try {
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, { isStoreOpen: req.body.isStoreOpen }, { new: true });
    res.json(updatedOwner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/rate-restaurant/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    const owner = await Owner.findById(req.params.id);
    const newNumberOfReviews = (owner.numberOfReviews || 0) + 1;
    const newTotalRatings = (owner.totalRatings || 0) + rating;
    const newAverageRating = (newTotalRatings / newNumberOfReviews).toFixed(1);
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, { numberOfReviews: newNumberOfReviews, totalRatings: newTotalRatings, averageRating: parseFloat(newAverageRating) }, { new: true });
    res.json({ success: true, averageRating: updatedOwner.averageRating, numberOfReviews: updatedOwner.numberOfReviews });
  } catch (err) {
    res.status(500).json({ message: "Rating failed" });
  }
});

router.post("/review/:id", async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    owner.reviews.unshift({ comment, rating: rating || 5 });
    const totalRating = owner.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    owner.averageRating = totalRating / owner.reviews.length;
    await owner.save();
    res.status(200).json({ success: true, message: "Review added!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/track-analytics/:id", async (req, res) => {
  const { id } = req.params;
  const { action, date } = req.body; 
  try {
    const updateField = `analytics.${date}.${action}`;
    
    await Owner.findByIdAndUpdate(id, {
      $inc: { [updateField]: 1 }
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Tracking Error:", err);
    res.status(500).json({ message: "Error tracking data" });
  }
});
router.put("/track-sales/:id", async (req, res) => {
  const { date, amount, items, paymentMode } = req.body;
  console.log("DEBUG: Received Payment Mode:", paymentMode);
  try {
    const updatePath = `analytics.${date}`;
    
 
    const modeKey = (paymentMode || 'CASH').toLowerCase() === 'cash' ? 'cash_sales' : 'upi_sales';

    let itemUpdates = {};
    if (items && Array.isArray(items)) {
        items.forEach(itemStr => {
           const itemName = itemStr.includes(' x ') ? itemStr.split(' x ')[1].trim() : itemStr;
           itemUpdates[`${updatePath}.food_clicks.${itemName}`] = 1;
        });
    }

   
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, {
      $inc: { 
        [`${updatePath}.daily_revenue`]: amount,
        [`${updatePath}.${modeKey}`]: amount, 
        [`${updatePath}.total_orders`]: 1, 
        ...itemUpdates 
      }
    }, { new: true });

    res.status(200).json(updatedOwner);
  } catch (err) {
    console.error("Sales tracking failed:", err);
    res.status(500).json({ message: "Sales tracking failed", error: err.message });
  }
});

router.post("/save-fcm-token-general", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

   
    await Owner.findOneAndUpdate(
      { email: "telugubiblequiz959@gmail.com" }, 
      { $addToSet: { fcmTokens: token } },
      { upsert: true } 
    );

    console.log("✅ Token Saved to Database!");
    res.status(200).json({ success: true, message: "Token saved successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/broadcast-to-all", async (req, res) => {
  try {
    const { title, body } = req.body;
    
   
    const adminUser = await Owner.findOne({ email: "telugubiblequiz959@gmail.com" });
    
    if (!adminUser || !adminUser.fcmTokens || adminUser.fcmTokens.length === 0) {
      return res.status(404).json({ success: false, message: "No subscribers found" });
    }


    const uniqueTokens = [...new Set(adminUser.fcmTokens)].filter(t => t && t.length > 10);

    
const messages = uniqueTokens.filter(token => token && token.length > 10).map(token => ({
  token: token,
  notification: {
    title: title || "Sudara Hub Update",
    body: body || "Check out new updates!"
  },
 
  data: {
    url: "https://sudara.in"
  },
 
  webpush: {
    fcm_options: {
      link: "https://sudara.in"
    }
  }
}));

   
    const response = await admin.messaging().sendEach(messages);
    
    console.log(`✅ Sent: ${response.successCount}, ❌ Failed: ${response.failureCount}`);

    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(uniqueTokens[idx]);
        }
      });

      if (failedTokens.length > 0) {
        await Owner.findOneAndUpdate(
          { email: "telugubiblequiz959@gmail.com" },
          { $pull: { fcmTokens: { $in: failedTokens } } }
        );
      }
    }

    res.status(200).json({ 
      success: true, 
      sentCount: response.successCount, 
      failedCount: response.failureCount 
    });

  } catch (err) {
    console.error("Broadcast Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post("/save-fcm-token/:ownerId", async (req, res) => {
  try {
    const { token } = req.body;
    const { ownerId } = req.params;
    if (!token) return res.status(400).json({ message: "Token is required" });

    await Owner.findByIdAndUpdate(ownerId, {
      $addToSet: { fcmTokens: token }
    });
    res.status(200).json({ success: true, message: "Token saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/send-broadcast/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { title, body } = req.body;

    const owner = await Owner.findById(ownerId);
    if (!owner || owner.fcmTokens.length === 0) {
      return res.status(404).json({ message: "No subscribers found" });
    }

    const message = {
      notification: { title, body },
      tokens: owner.fcmTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    res.status(200).json({ success: true, sentCount: response.successCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update-billing/:id", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    // 🎯 రాజు ప్లాన్: పెయిడ్ కొట్టిన రోజు (ఈరోజు) నుండి కరెక్ట్ గా 30 రోజులు ముందుకు డేట్ లాక్!
    let newBillingDate = new Date();
    newBillingDate.setDate(newBillingDate.getDate() + 30);

    owner.nextBillingDate = newBillingDate;
    owner.billingStatus = "Paid";
    owner.pendingMonthsCount = 0; // ఎలాంటి పాత బాకీలు ఉండవు

    await owner.save();

    console.log(`\n=====================================`);
    console.log(`🛡️ SUDARA FRESH BILLING RESTORED`);
    console.log(`Hotel: ${owner.name}`);
    console.log(`New 30 Days Cycle Started From Today!`);
    console.log(`Next Due Date: ${owner.nextBillingDate.toLocaleDateString('en-GB')}`);
    console.log(`=====================================\n`);

    return res.json({ success: true, owner });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
/* ================= 🚀 11. UPDATE PLAN TYPE (Admin Only) ================= */
router.put("/update-plan/:id", async (req, res) => {
  try {
    const { planType } = req.body;
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id, 
      { planType: planType }, 
      { new: true }
    );
    res.json({ success: true, owner: updatedOwner });
  } catch (err) {
    res.status(500).json({ success: false, message: "Plan update failed" });
  }
});
/* ================= 👑 12. SUBSCRIPTION APPROVAL (Admin Only - Plan B) ================= */
router.put("/admin/approve-subscription/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const ownerData = await Owner.findById(id);
    if (!ownerData) return res.status(404).json({ success: false, message: "Owner not found" });

    // 🎯 పక్కాగా 30 లేదా 90 మాత్రమే తీసుకోవాలి
    const daysToAdd = [30, 90].includes(Number(ownerData.requestedPlanDuration)) 
                      ? Number(ownerData.requestedPlanDuration) 
                      : 30; 
    
    // పాత ఎక్స్‌పైరీ డేట్ ఉంటే దాని నుండి, లేదంటే ఈరోజు నుండి యాడ్ చెయ్
    let newBillingDate = ownerData.nextBillingDate && new Date(ownerData.nextBillingDate) > new Date() 
      ? new Date(ownerData.nextBillingDate) 
      : new Date();
      
    newBillingDate.setDate(newBillingDate.getDate() + daysToAdd);

    const approvedOwner = await Owner.findByIdAndUpdate(
      id,
      {
        $set: {
          billingStatus: "Active",
          nextBillingDate: newBillingDate,
          paymentReceipt: "", 
          requestedPlanDuration: 0 // అప్రూవ్ అయ్యాక క్లియర్ చెయ్
        }
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Subscription Approved! ✅", owner: approvedOwner });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approval runtime error", error: err.message });
  }
});

// 🚀 అడ్మిన్ తప్పుడు రిసిప్ట్ అని రిజెక్ట్ కొడితే రన్ అయ్యే రూట్ రాజు
router.put("/admin/reject-subscription/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ఓనర్ ఫేక్/తప్పుడు స్క్రీన్‌షాట్ పంపితే... రిసిప్ట్ ని డిలీట్ చేసి పాత బాకీ స్టేటస్ కి మార్చేస్తాం
    const rejectedOwner = await Owner.findByIdAndUpdate(
      id,
      {
        $set: {
          billingStatus: "Expired", // లేదా "Unpaid"
          paymentReceipt: "" // తప్పుడు స్క్రీన్‌షాట్ ని క్లియర్ చేస్తాం
        }
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Subscription Rejected & Cleared! ❌", owner: rejectedOwner });
  } catch (err) {
    res.status(500).json({ success: false, message: "Rejection runtime error", error: err.message });
  }
});
router.post('/update-profile-pic/:id', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded!" });
    }

    // 1. క్లౌడినరీకి పంపి, URL తెచ్చుకోవడం
    const imageUrl = await uploadImage(req.file.path);
    
    // 2. ఇప్పుడు ఈ URL ని నీ MongoDB లో సేవ్ చెయ్
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id, 
      { hotelImage: imageUrl }, 
      { new: true }
    );
    
    res.json({ success: true, message: "Image uploaded!", url: imageUrl, owner: updatedOwner });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});
router.get('/admin/daily-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: "$orderType", count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
export default router;
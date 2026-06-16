import express from "express";
import Owner from "../models/Owner.js";
import Item from "../models/item.js";
import admin from "firebase-admin";
import { upload } from '../config/uploadMiddleware.js'; // ఇందాక క్రియేట్ చేసిన ఫైల్
import { uploadImage } from '../utils/imageUpload.js';
import mongoose from "mongoose";
const router = express.Router();

/* ================= 1. GET UNIQUE COLLEGES ================= */
router.get("/colleges", async (req, res) => {
  try {
    const colleges = await Owner.distinct("collegeName");
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ message: "Error fetching colleges" });
  }
});

/* ================= 2. GET ALL OWNERS (Ultra Optimized) ================= */
router.get("/all-owners", async (req, res) => {
  try {
    // ✅ ఇక్కడ hotelImage ని యాడ్ చేశాను, ఇప్పుడు ఫ్రంటెండ్ కి ఫోటోలు వెళ్తాయి
    const owners = await Owner.find({ isApproved: true })
      .select("name hotelImage collegeName isStoreOpen latitude longitude category averageRating isApproved foodType state district")
      .lean();
    
    console.log(`✅ Approved Owners Found: ${owners.length}`);
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners" });
  }
});
/* ================= 3. REGISTER (Fixed Safety) ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, whatsappNumber, upiNumber, state, district, collegeName } = req.body;
    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Owner already exists" });

    const owner = await Owner.create({ 
      name, email, password, phone, 
      whatsappNumber: whatsappNumber || phone, // If empty, use phone
      upiNumber: upiNumber || phone,
      state: state || "Andhra Pradesh",
      district: district || "Tirupati", 
      collegeName: collegeName || "General", // Using this for Landmark
      isApproved: false 
    });
    res.status(201).json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/* ================= 2. ADMIN GET ALL OWNERS (RAJU FIXED SELECT) ================= */
router.get("/admin-all-owners", async (req, res) => {
  try {
    const owners = await Owner.find({}) 
    // 🎯 రాజు ఫిక్స్: సెలెక్ట్ లోపల nextBillingDate, billingStatus, pendingMonthsCount యాడ్ చేసాను!
    .select("name hotelImage collegeName isStoreOpen category averageRating isApproved phone upiID analytics state district createdAt nextBillingDate billingStatus pendingMonthsCount planType paymentReceipt requestedPlanDuration")
    .lean();
    
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners for admin" });
  }
});
/* ================= GET UNIQUE DISTRICTS ================= */
// బ్యాకెండ్ రూట్: /api/owner/districts
router.get("/districts", async (req, res) => {
  try {
    // 🚀 1. ఫ్రంటెండ్ నుండి క్వెరీ పారామీటర్ ద్వారా వచ్చే స్టేట్ (E.g., ?state=Andhra Pradesh)
    const { state } = req.query;

    let filterCondition = {};
    if (state) {
      // ఒకవేళ స్టేట్ వస్తే, కేవలం ఆ స్టేట్ కి సంబంధించిన డాక్యుమెంట్స్ లోనే వెతుకుతుంది రాజు
      filterCondition.state = state;
    }

    // 🚀 2. ఇక్కడ ట్విస్ట్: ఫిల్టర్ కండిషన్ ని 'distinct' లోపల రెండవ పారామీటర్ గా పంపాలి!
    const districts = await Owner.distinct("district", filterCondition);
    
    res.status(200).json(districts);
  } catch (err) {
    console.error("Districts query error:", err);
    res.status(500).json({ message: "Error fetching filtered districts" });
  }
}); 
/* ================= 4. LOGIN (Updated for District) ================= */
router.post("/login", async (req, res) => {
  try {
    // 1. 🛑 district ని ఇక్కడ నుండి తీసేయ్ రాజు, కేవలం email, password చాలు
    const { email, password } = req.body;

    // 🎯 Admin Login Check
    if (email === "telugubiblequiz959@gmail.com" && password === "Raju1753@s") {
      return res.json({ 
        success: true, 
        isAdmin: true, 
        message: "Welcome Admin BSR!" 
      });
    }

    // 🎯 Email & Password తో ఓనర్ ని వెతకాలి
    const owner = await Owner.findOne({ email, password }).lean();

    if (!owner) {
      return res.status(401).json({ message: "Invalid Email or Password ❌" });
    }

    // 🛑 2. ఈ కింద ఉన్న DISTRICT చెక్ చేసే ఇఫ్ కండిషన్ మొత్తాన్ని డిలీట్ లేదా కామెంట్ చేసేయ్ రాజు!
    // =========================================================================
    // if (owner.district !== district) {
    //   return res.status(401).json({ 
    //     message: "Wrong District Selected! ⚠️",
    //     registeredDistrict: owner.district 
    //   });
    // }
    // =========================================================================

    // 🎯 Approval Check
    if (owner.isApproved === false) {
      return res.status(403).json({ message: "Account pending admin approval... ⏳" });
    }

    res.json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/* ================= 5. APPROVE OWNER (Admin Only) ================= */
router.put("/approve-owner/:id", async (req, res) => {
  try {
    const { isApproved } = req.body;
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, { isApproved: isApproved }, { new: true });
    res.json({ success: true, owner: updatedOwner });
  } catch (err) {
    res.status(500).json({ message: "Approval update failed" });
  }
});
/* ================= DELETE OWNER & THEIR ITEMS ================= */
router.delete("/delete-owner/:id", async (req, res) => {
  try {
    const ownerId = req.params.id;

    // 🎯 1. సేఫ్టీ చెక్: పంపిన ఐడీ అసలు వాలిడ్ మోంగో ఐడీ కాదా అని చెక్ చేయడం రాజు
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Invalid Owner ID Matrix!" });
    }

    // 🎯 2. కన్వర్షన్: స్ట్రింగ్ ఐడీని పక్కాగా మోంగో ఆబ్జెక్ట్ ఐడీ కింద మారుస్తున్నాం
    const targetObjectId = new mongoose.Types.ObjectId(ownerId);

    // 🎯 3. ఫస్ట్ ఓనర్ కి సంబంధించిన అన్ని ఫుడ్ ఐటమ్స్ & ఇమేజెస్ క్లీన్ అవుతాయి
    await Item.deleteMany({ ownerId: targetObjectId }); 

    // 🎯 4. ఆ తర్వాతే ఓనర్ ప్రొఫైల్ ని డిలీట్ చేస్తున్నాం
    const deletedOwner = await Owner.findByIdAndDelete(targetObjectId); 

    // 🎯 5. ఒకవేళ ఆ ఐడీతో ఓనర్ ఆల్రెడీ లేకపోతే సేఫ్టీ రెస్పాన్స్ రాజు
    if (!deletedOwner) {
      return res.status(404).json({ success: false, message: "Owner not found in Matrix!" });
    }

    // 🔥 అంతా పక్కాగా జరిగితేనే సక్సెస్ రెస్పాన్స్ వెళ్తుంది
    res.json({ success: true, message: "Owner and all assets erased completely! 🧹" });

  } catch (err) {
    console.error("DANGER DELETE ERROR:", err); // సర్వర్ లాగ్స్ లో ఎర్రర్ చూడటానికి రాజు
    res.status(500).json({ success: false, message: "Delete failed completely" });
  }
});
/* ================= 🚀 DIRECT PASSWORD RESET (NO OTP) ================= */
router.put("/direct-reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 1. Email register అయి ఉందో లేదో చెక్ చేయి
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "This email is not registered in our Hub! ❌" });
    }

    // 2. నేరుగా పాస్‌వర్డ్ అప్డేట్ చేసేయ్
    owner.password = newPassword;
    await owner.save();

    res.json({ success: true, message: "Password updated successfully! Access Restored ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error during reset." });
  }
});
/* ================= 6. GET SINGLE OWNER ================= */
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

    // 🎯 1. todaySpecial ఉంటే టైమ్‌స్టాంప్ యాడ్ చేయడం
    if (updatePayload.todaySpecial) {
      updatePayload.specialTimestamp = new Date();
    }

    // 🎯 2. రాజు బుల్లెట్ ప్రూఫ్ లాక్:
    // ఎప్పుడైనా అప్‌డేట్ చేసేటప్పుడు పాత డేటా పోకుండా, కొత్త డేటా మాత్రమే అప్‌డేట్ అవ్వడానికి 
    // పక్కాగా మోంగూస్ లో $set వాడటం వంద శాతం సేఫ్ రాజు!
    const updatedOwner = await Owner.findByIdAndUpdate(
      id,
      { $set: updatePayload }, // 👈 ఇక్కడ $set లోపల పేలోడ్ పెట్టడం వల్ల పాత డేటా ఓవర్‌రైట్ అవ్వదు!
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
/* ================= ADD INTERIOR IMAGES ================= */
router.put("/add-interior-images/:id", async (req, res) => {
  try {
    const { images } = req.body; // Array of URLs
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { $push: { interiorImages: { $each: images } } }, // కొత్త ఫోటోలను Array లోకి పుష్ చేస్తుంది
      { new: true }
    );
    res.json(updatedOwner);
  } catch (err) {
    res.status(500).json({ message: "Failed to add images" });
  }
});

/* ================= REMOVE SPECIFIC INTERIOR IMAGE ================= */
router.put("/remove-interior-image/:id", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { $pull: { interiorImages: imageUrl } }, // ఆ ఇమేజ్ URL ని Array నుండి తీసేస్తుంది
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

/* ================= 8. RATINGS & REVIEWS ================= */
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

/* ================= 9. ANALYTICS TRACKING (Date Wise) ================= */
router.put("/track-analytics/:id", async (req, res) => {
  const { id } = req.params;
  const { action, date } = req.body; // action లో 'pre_order_click' లేదా 'post_order_click' వస్తాయి
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
    
    // 🎯 పేమెంట్ మోడ్ కీస్ పక్కాగా
    const modeKey = (paymentMode || 'CASH').toLowerCase() === 'cash' ? 'cash_sales' : 'upi_sales';

    let itemUpdates = {};
    if (items && Array.isArray(items)) {
        items.forEach(itemStr => {
           const itemName = itemStr.includes(' x ') ? itemStr.split(' x ')[1].trim() : itemStr;
           itemUpdates[`${updatePath}.food_clicks.${itemName}`] = 1;
        });
    }

    // 🚀 ఇక్కడ `total_orders` ని కూడా $inc లో యాడ్ చేశాను
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, {
      $inc: { 
        [`${updatePath}.daily_revenue`]: amount,
        [`${updatePath}.${modeKey}`]: amount, 
        [`${updatePath}.total_orders`]: 1, // 👈 ఆర్డర్ కౌంట్ ఇక్కడే పెరుగుతుంది
        ...itemUpdates 
      }
    }, { new: true });

    res.status(200).json(updatedOwner);
  } catch (err) {
    console.error("Sales tracking failed:", err);
    res.status(500).json({ message: "Sales tracking failed", error: err.message });
  }
});
/* ================= 10. GENERAL NOTIFICATIONS (రాజు కోసం) ================= */

// ఫ్రంటెండ్ నుండి వచ్చే జనరల్ టోకెన్ ని సేవ్ చేయడానికి
router.post("/save-fcm-token-general", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    // నీ అడ్మిన్ ఈమెయిల్ తో ఉన్న రికార్డులో ఈ టోకెన్ ని సేవ్ చేస్తున్నాం రాజు
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
    
    // 🎯 1. Admin record nundi tokens tise logic (Same as yours)
    const adminUser = await Owner.findOne({ email: "telugubiblequiz959@gmail.com" });
    
    if (!adminUser || !adminUser.fcmTokens || adminUser.fcmTokens.length === 0) {
      return res.status(404).json({ success: false, message: "No subscribers found" });
    }

    // 2. Tokens cleaning (Same as yours)
    const uniqueTokens = [...new Set(adminUser.fcmTokens)].filter(t => t && t.length > 10);

    // 🚀 ఫిల్టర్ చేసి, మొబైల్ & వెబ్ రెండింటికీ పని చేసేలా మెసేజ్ ఆబ్జెక్ట్
const messages = uniqueTokens.filter(token => token && token.length > 10).map(token => ({
  token: token,
  notification: {
    title: title || "Sudara Hub Update",
    body: body || "Check out new updates!"
  },
  // 📱 Mobile & Web రెండింటికీ డేటా వెళ్తుంది
  data: {
    url: "https://sudara.in"
  },
  // 🛡️ Web specific redirect (ఇది ఉంటే వెబ్ బ్రౌజర్ క్లిక్ చేసినప్పుడు ఆటోమేటిక్ గా వెబ్‌సైట్ ఓపెన్ అవుతుంది)
  webpush: {
    fcm_options: {
      link: "https://sudara.in"
    }
  }
}));

    // 4. Firebase send (Same as yours)
    const response = await admin.messaging().sendEach(messages);
    
    console.log(`✅ Sent: ${response.successCount}, ❌ Failed: ${response.failureCount}`);

    // 5. Failed tokens cleaning (Same as yours)
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

// నీ పాత ఓనర్ స్పెసిఫిక్ రూట్స్
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
// 🚀 రాజు అల్టిమేట్ పెయిడ్-ఓన్లీ బిల్లింగ్ API
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
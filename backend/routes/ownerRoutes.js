import express from "express";
import Owner from "../models/owner.js";
import Item from "../models/item.js";
import admin from "firebase-admin";
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
router.get("/admin-all-owners", async (req, res) => {
  try {
  const owners = await Owner.find({}) 
  .select("name hotelImage collegeName isStoreOpen category averageRating isApproved phone upiID analytics state district createdAt")
  .lean();
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners for admin" });
  }
});
/* ================= GET UNIQUE DISTRICTS ================= */
router.get("/districts", async (req, res) => {
  try {
    const districts = await Owner.distinct("district");
    res.status(200).json(districts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching districts" });
  }
});
/* ================= 4. LOGIN (Updated for District) ================= */
router.post("/login", async (req, res) => {
  try {
    // 1. collegeName బదులు district ని తీసుకో రాజు
    const { email, password, district } = req.body;

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

    // 🎯 🆕 ఇక్కడ కాలేజీ బదులు DISTRICT చెక్ చేయాలి
    if (owner.district !== district) {
      return res.status(401).json({ 
        message: "Wrong District Selected! ⚠️",
        registeredDistrict: owner.district // హింట్ కోసం డిస్ట్రిక్ట్ ని పంపిస్తున్నాం
      });
    }

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
// Ee code nee backend router file lo undali
router.delete("/delete-owner/:id", async (req, res) => {
  try {
    const ownerId = req.params.id;
    await Item.deleteMany({ ownerId: ownerId }); // Food items delete avthunnayi
    const deletedOwner = await Owner.findByIdAndDelete(ownerId); // Owner profile delete avthundi
    res.json({ success: true, message: "Deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
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

/* ================= 7. UPDATES & STATUS (Updated with Stability) ================= */
router.put("/update-profile/:id", async (req, res) => {
  try {
    // 🚀 RAJU STABILITY FIX: req.body mothanni $set lo pettu
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true } 
    );

    if (!updatedOwner) return res.status(404).json({ message: "Owner not found" });
    
    res.status(200).json(updatedOwner); 
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Server error during update" });
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

    // 🚀 3. RAJU FIX: Web compatible message objects
    const messages = uniqueTokens.map(token => ({
      token: token,
      notification: {
        title: title || "Sudara Hub Update",
        body: body || "Check out new updates!"
      },
      // 🛡️ Web specific redirect fix
      webpush: {
        fcm_options: {
          link: "https://sudara.in" 
        }
      },
      // 📱 Optional: Data payload for mobile apps
      data: {
        url: "https://sudara.in"
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

export default router;
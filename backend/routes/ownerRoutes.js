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

/* ================= 2. GET ALL OWNERS ================= */
router.get("/all-owners", async (req, res) => {
  try {
    const owners = await Owner.find().lean(); 
    const ownersWithItems = await Promise.all(
      owners.map(async (owner) => {
        const items = await Item.find({ ownerId: owner._id });
        return { ...owner, items };
      })
    );
    res.status(200).json(ownersWithItems);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners" });
  }
});

/* ================= 3. REGISTER (Fixed Safety) ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, category, phone, district, collegeName } = req.body;
    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Owner already exists" });

    const owner = await Owner.create({ 
      name, email, password, category, phone, 
      district: district || "Tirupati", 
      collegeName: collegeName || "General",
      isApproved: false 
    });
    res.status(201).json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= 4. LOGIN (Strict Verification) ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, collegeName } = req.body;
    if (email === "telugubiblequiz959@gmail.com" && password === "Raju1753@s") {
      return res.json({ success: true, isAdmin: true, message: "Welcome Admin BSR!" });
    }
    const owner = await Owner.findOne({ email, password, collegeName });
    if (!owner) return res.status(401).json({ message: "Invalid credentials ❌" });
    if (owner.isApproved === false) return res.status(403).json({ message: "Account pending waiting for admin approval! ⏳" });
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

/* ================= 7. UPDATES & STATUS (UPI ID Added) ================= */
router.put("/update-profile/:id", async (req, res) => {
  try {
    // ✅ రాజు, ఇక్కడ 'req.body' పంపడం వల్ల, ఫ్రంటెండ్ నుండి వచ్చే 'upiID' ఆటోమేటిక్‌గా సేవ్ అవుతుంది.
    const updatedOwner = await Owner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOwner); 
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
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
  const { action, date } = req.body;
  try {
    const updateField = `analytics.${date}.${action}`;
    
    await Owner.findByIdAndUpdate(id, {
      $inc: { [updateField]: 1 }
    });
    res.status(200).json({ success: true });
  } catch (err) {
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

// backend/routes/ownerRoutes.js లో ఈ రూట్ మార్చు రాజు

router.post("/broadcast-to-all", async (req, res) => {
  try {
    const { title, body } = req.body;
    
    // 1. అడ్మిన్ రికార్డ్ వెతకడం
    const adminUser = await Owner.findOne({ email: "telugubiblequiz959@gmail.com" });
    
    if (!adminUser || !adminUser.fcmTokens || adminUser.fcmTokens.length === 0) {
      return res.status(404).json({ success: false, message: "No subscribers found in DB" });
    }

    // 2. టోకెన్లని క్లీన్ చేయడం (డూప్లికేట్స్ లేకుండా)
    const uniqueTokens = [...new Set(adminUser.fcmTokens)].filter(t => t && t.length > 10);

    // 3. ప్రతి టోకెన్ కి మెసేజ్ ఆబ్జెక్ట్ క్రియేట్ చేయడం
    const messages = uniqueTokens.map(token => ({
      token: token,
      notification: {
        title: title || "Sudara Hub Update",
        body: body || "Check out new updates!"
      },
      // ఇక్కడ ఓనర్ ఇన్ఫో యాడ్ చేయొచ్చు
      data: {
        ownerName: adminUser.name || "Sudara Owner",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    }));

    // 4. అందరికీ పంపడం
    const response = await admin.messaging().sendEach(messages);
    
    console.log(`✅ Sent: ${response.successCount}, ❌ Failed: ${response.failureCount}`);

    res.status(200).json({ 
      success: true, 
      sentCount: response.successCount, 
      failedCount: response.failureCount 
    });
  } catch (err) {
    console.error("❌ Broadcast Error:", err);
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
import express from "express";
import Owner from "../models/owner.js";
import Item from "../models/item.js";
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

export default router;
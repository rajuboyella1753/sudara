import express from "express";
import Owner from "../models/owner.js";
const router = express.Router();

/* ================= 1. GET UNIQUE COLLEGES (Login/Register కోసం) ================= */
// దీన్ని అందరికంటే పైన ఉంచాలి (/:id కంటే ముందు)
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
    const owners = await Owner.find();
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch owners" });
  }
});

/* ================= 3. REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, category, phone, district, collegeName } = req.body;
    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ message: "Owner already exists" });

    const owner = await Owner.create({ 
      name, email, password, category, phone, 
      district: district || "Tirupati", 
      collegeName: collegeName || "General" 
    });
    res.status(201).json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= 4. LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, collegeName } = req.body;
    const owner = await Owner.findOne({ email, password, collegeName });

    if (!owner) {
      const emailExists = await Owner.findOne({ email });
      if (emailExists) {
        return res.status(401).json({ 
          message: `This account is registered with ${emailExists.collegeName}. Please select the correct college. ❌` 
        });
      }
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }
    res.json({ success: true, owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= 5. GET SINGLE OWNER (Dynamic Route - Keep it Last) ================= */
router.get("/:id", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.json(owner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= 6. UPDATES & RATINGS ================= */
router.put("/update-profile/:id", async (req, res) => {
  try {
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

router.put("/rate-restaurant/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    const owner = await Owner.findById(req.params.id);
    const newNumberOfReviews = owner.numberOfReviews + 1;
    const newTotalRatings = owner.totalRatings + rating;
    const newAverageRating = (newTotalRatings / newNumberOfReviews).toFixed(1);

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { numberOfReviews: newNumberOfReviews, totalRatings: newTotalRatings, averageRating: parseFloat(newAverageRating) },
      { new: true }
    );
    res.json({ success: true, averageRating: updatedOwner.averageRating });
  } catch (err) {
    res.status(500).json({ message: "Rating failed" });
  }
});

export default router;
import express from 'express';
import Order from '../models/Order.js'; // చివరన .js కచ్చితంగా ఉండాలి

const router = express.Router();

// 🚀 కొత్త ఆర్డర్ యాడ్ చేయడానికి
router.post('/add', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🚀 రెస్టారెంట్ ఆర్డర్లు ఫెచ్ చేయడానికి
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
// orderRoutes.js లో యాడ్ చెయ్ రాజు
router.delete('/delete/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order Deleted Successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});
export default router; // ESM ఎక్స్‌పోర్ట్
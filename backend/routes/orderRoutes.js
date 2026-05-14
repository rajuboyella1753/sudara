import express from 'express';
import Order from '../models/Order.js'; // చివరన .js కచ్చితంగా ఉండాలి
import { processVoiceOrder } from './aiController.js';
const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const orderData = { ...req.body };

    // 💡 'Express-Route' అయితే మాత్రమే ఈ స్పెషల్ లాజిక్ రన్ అవుతుంది
    if (orderData.orderType === 'Express-Route') {
      // 1. 6-Digit Sudara ID జనరేట్ చేయడం
      orderData.sudaraId = "SDR" + crypto.randomInt(100, 999);

      // 2. వంట మొదలుపెట్టాల్సిన టైమ్ లెక్కించడం
      const startTime = new Date();
      const waitMinutes = (orderData.travelDuration || 0) - (orderData.prepTime || 20);
      startTime.setMinutes(startTime.getMinutes() + (waitMinutes > 0 ? waitMinutes : 0));
      orderData.scheduledStartTime = startTime;
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    const io = req.app.get("socketio"); 
    if (io) {
      const targetId = (savedOrder.restaurantId || savedOrder.ownerId).toString();
      console.log("📢 Sending order to room:", targetId);
      
      // సాకెట్ ద్వారా డేటా పంపేటప్పుడు sudaraId కూడా వెళ్తుంది
      io.to(targetId).emit("new_order_received", savedOrder);
    }
    
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json(err);
  }
});

// 🚀 కొత్త రూట్: కస్టమర్ టైమ్ అడ్జస్ట్ చేయడానికి (దీన్ని కొత్తగా యాడ్ చెయ్)
router.put('/update-time/:id', async (req, res) => {
  try {
    const { additionalMinutes } = req.body;
    const order = await Order.findById(req.params.id);

    if (order && order.status === 'Pending') {
      const newStartTime = new Date(order.scheduledStartTime);
      newStartTime.setMinutes(newStartTime.getMinutes() + additionalMinutes);

      order.scheduledStartTime = newStartTime;
      order.isDelayed = true;
      await order.save();

      // ఓనర్ కి సాకెట్ ద్వారా అప్‌డేట్ పంపడం
      const io = req.app.get("socketio");
      if (io) {
        io.to(order.restaurantId.toString()).emit("order_delayed", {
          orderId: order._id,
          newTime: newStartTime,
          sudaraId: order.sudaraId
        });
      }
      res.status(200).json(order);
    } else {
      res.status(400).json({ message: "Cannot update time now" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
router.post('/process-voice', processVoiceOrder);
// 🚀 రెస్టారెంట్ ఆర్డర్లు ఫెచ్ చేయడానికి
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/update-status/:id", async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status Updated" });
});

// 2. ఐడి ద్వారా ఆర్డర్ వివరాలు (Customer side)
router.get("/status/:sdrId", async (req, res) => {
    const order = await Order.findOne({ sudaraId: req.params.sdrId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
});
// orderRoutes.js లో యాడ్ చెయ్ రాజు
router.delete("/delete/:id", async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted" });
});
// SDR ID ద్వారా స్టేటస్ ని పంపే API
router.get("/status/:sdrId", async (req, res) => {
  try {
    const order = await Order.findOne({ sudaraId: req.params.sdrId });
    if (!order) return res.status(404).json({ message: "Not Found" });
    
    // కేవలం స్టేటస్ మాత్రమే పంపిస్తున్నాం
    res.json({ status: order.status }); 
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
export default router; // ESM ఎక్స్‌పోర్ట్
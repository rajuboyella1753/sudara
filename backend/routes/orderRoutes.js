import express from 'express';
import Order from '../models/Order.js'; // చివరన .js కచ్చితంగా ఉండాలి
import { processVoiceOrder } from './aiController.js';
const router = express.Router();

// 🚀 రాజు అల్టిమేట్ ఆల్-ఇన్-వన్ ఆర్డర్ క్రియేషన్ API
router.post("/add", async (req, res) => {
  try {
    const orderData = { ...req.body };

    // 1. ఎక్స్‌ప్రెస్ రూట్ కి ఐడి & టైమ్ కాలిక్యులేషన్ లాజిక్
    if (orderData.orderType === 'Express-Route') {
      orderData.sudaraId = "SDR" + Math.floor(100 + Math.random() * 900);

      const startTime = new Date();
      const waitMinutes = (orderData.travelDuration || 0) - (orderData.prepTime || 20);
      startTime.setMinutes(startTime.getMinutes() + (waitMinutes > 0 ? waitMinutes : 0));
      orderData.scheduledStartTime = startTime;
    }

    // 2. ఒకవేళ ఫ్రంటెండ్ నుండి sudaraId రాకపోతే (లైక్ Post-book / Instant ఆర్డర్స్ కోసం)
    if (!orderData.sudaraId) {
      const prefix = orderData.orderType === 'Post-book' ? "TAB" : "SDR";
      orderData.sudaraId = prefix + Math.floor(100 + Math.random() * 900);
    }

    // 3. ఆర్డర్ ని డేటాబేస్ లో సేవ్ చేయడం (ఇందులో deliveryType ఆటోమేటిక్ గా సేవ్ అవుతుంది రాజు!)
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    // 4. సాకెట్ నోటిఫికేషన్ - ఓనర్ కి రియల్ టైమ్ లో సౌండ్ సిగ్నల్ వెళ్తుంది
    const io = req.app.get("socketio"); 
    if (io) {
      const targetId = (savedOrder.restaurantId || savedOrder.ownerId || "").toString();
      if (targetId) {
        console.log("📢 Transmitting order to live merchant room:", targetId);
        io.to(targetId).emit("new_order_received", savedOrder);
      }
    }
    
    // 5. సక్సెస్ రెస్పాన్స్ - ఫ్రంటెండ్ ఐడి ని వాడుకోవడానికి వీలుగా!
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order Transmission Error ❌:", err);
    res.status(500).json({ message: err.message || "Order Sync Failed" });
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
// 🎯 ఓనర్ స్టేటస్ అప్‌డేట్ రూట్ - ఇక్కడ మార్పు చెయ్ రాజు
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    // 💡 ఒకవేళ స్టేటస్ 'Served' కాకపోతే (Accepted/Preparing అయితే)
    if (status !== "Served") {
      await Order.findByIdAndUpdate(req.params.id, { status });
      return res.json({ message: "Status Updated to " + status });
    }

    // 🎯 స్టేటస్ 'Served' అయితే - సేల్స్ కి యాడ్ చేసి డిలీట్ చేయాలి
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order Not Found" });

    // నోట్: ఇక్కడ మనం ఆర్డర్ ని డిలీట్ చేస్తున్నాం. 
    // కానీ అమౌంట్ ని సేల్స్ మ్యాట్రిక్స్ లోకి పంపే బాధ్యత ఫ్రంటెండ్ లోని 'handleServed' కి ఇచ్చాం.
    // బ్యాకెండ్ లో కేవలం డిలీట్ చేస్తే చాలు.
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Served & Removed from Live Feed" });

  } catch (err) {
    res.status(500).json({ error: "Update Failed" });
  }
});

router.get("/status/:sdrId", async (req, res) => {
  try {
    // SDR158 లేదా TAB123 ఏదైనా సరే ఇక్కడ వెతుకుతుంది
    const order = await Order.findOne({ sudaraId: req.params.sdrId.toUpperCase() });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or already Served!" });
    }

    // కస్టమర్ కి కావాల్సిన ముఖ్యంమైన వివరాలు మాత్రమే పంపిస్తున్నాం
    res.json({ 
      customerName: order.customerName,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount
    }); 
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router; 
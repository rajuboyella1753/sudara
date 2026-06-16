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
      io.emit("order_placed", savedOrder);
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
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order Not Found" });

    // డేటా అప్‌డేట్ చెయ్
    order.status = status;
    await order.save();

    // ఒకవేళ Served అయితే - డిలీట్ చెయ్
    if (status === "Served") {
       await Order.findByIdAndDelete(req.params.id);
       return res.json({ message: "Order Served & Removed" });
    }

    res.json({ message: "Status Updated", order });
  } catch (err) {
    console.error("Server Side Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/status/:sdrId", async (req, res) => {
  try {
    // SDR158 లేదా TAB123 ఏదైనా సరే ఇక్కడ వెతుకుతుంది
    const order = await Order.findOne({ sudaraId: req.params.sdrId.toUpperCase() });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or already Served!" });
    }

    // 🎯 రాజు ఫిక్స్: ఇక్కడ 'orderType: order.orderType' కూడా రిటర్న్ చేస్తున్నాం రాజు!
    res.json({ 
      customerName: order.customerName,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      tableNo: order.tableNo,
      orderType: order.orderType 
    }); 
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
// 🚀 రాజు మ్యాజిక్: ఓనర్ ప్రీ-బుకింగ్ ఆర్డర్ కి టేబుల్ అసైన్ చేయడానికి రూట్
router.put('/assign-table/:id', async (req, res) => {
  try {
    const { tableNo } = req.body;
    
    // 1. డేటాబేస్ లో ఆర్డర్ ని వెతకడం
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. టేబుల్ నంబర్ ని అప్‌డేట్ చేయడం
    order.tableNo = tableNo;
    await order.save();

    // 3. సాకెట్ (Socket.io) ద్వారా కస్టమర్ కి రియల్ టైమ్ సిగ్నల్ పంపడం
    const io = req.app.get("socketio");
    if (io && order.sudaraId) {
      console.log(`📡 Emitting table_assigned to customer room: ${order.sudaraId}`);
      io.to(order.sudaraId).emit("table_assigned", { 
        tableNo: tableNo, 
        message: `Your Table #${tableNo} is Ready! 🪑` 
      });
    }

    // 4. సక్సెస్ రెస్పాన్స్ పంపడం
    res.status(200).json(order);
  } catch (err) {
    console.error("Table Assign Error ❌:", err);
    res.status(500).json({ message: "Failed to assign table", error: err.message });
  }
});
router.get('/reports/today/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const orders = await Order.find({
      restaurantId,
      createdAt: { $gte: startOfDay }
    });

    const report = orders.reduce((acc, order) => {
      acc.totalOrders += 1;
      acc.totalSales += (order.totalAmount || 0);
      
      if (order.paymentMode === 'CASH') acc.cashSales += (order.totalAmount || 0);
      else if (order.paymentMode === 'UPI') acc.upiSales += (order.totalAmount || 0);
      
      return acc;
    }, { totalOrders: 0, totalSales: 0, cashSales: 0, upiSales: 0 });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
});
// 🎯 ADMIN: Daily Stats (ఇది యాడ్ చెయ్)
router.get('/admin/daily-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: "$orderType", count: { $sum: 1 } } }
    ]);
    
    // ఫలితాన్ని కన్సోల్ లో కూడా చూడు, అప్పుడు నీకు డేటా వస్తుందో లేదో తెలుస్తుంది
    res.json(stats);
  } catch (err) {
    console.error("Admin Stats Error ❌:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
export default router; 
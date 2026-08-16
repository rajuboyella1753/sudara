import express from 'express';
import TestDrive from '../models/TestDrive.js';

const router = express.Router();

// 🚀 Test Drive బుక్ చేయడానికి API రౌట్
router.post('/test-drive/add', async (req, res) => {
  try {
    const { restaurantId, customerName, customerPhone, vehicleName, testDriveDate } = req.body;

    if (!restaurantId || !customerName || !customerPhone || !vehicleName || !testDriveDate) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newTestDrive = await TestDrive.create({
      restaurantId,
      customerName,
      customerPhone,
      vehicleName,
      testDriveDate
    });

    // 🚀 ఇక్కడ 'socketio' అని కరెక్ట్ కీ వాడాలి (server.js లో సెట్ చేసినట్లు)
    const io = req.app.get('socketio'); 
    if (io) {
      io.to(restaurantId).emit("new_test_drive", newTestDrive);
      console.log(`🔔 Live socket emitted 'new_test_drive' to room: ${restaurantId}`);
    }

    console.log("✅ Test Drive Booked Successfully:", newTestDrive._id);
    return res.status(201).json({ message: "Test Drive booked successfully!", data: newTestDrive });

  } catch (err) {
    console.error("❌ Test Drive Error:", err.message);
    return res.status(500).json({ message: "Failed to book test drive", error: err.message });
  }
});

// 🚀 షోరూమ్ ఓనర్‌కి సంబంధించిన అన్ని టెస్ట్ డ్రైవ్ బుకింగ్స్ ఫెచ్ చేయడం
router.get('/test-drive/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const testDrives = await TestDrive.find({ restaurantId: ownerId }).sort({ createdAt: -1 });
    return res.status(200).json(testDrives);
  } catch (err) {
    console.error("❌ Fetch Test Drives Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch test drives", error: err.message });
  }
});

// 🚀 టెస్ట్ డ్రైవ్ స్టేటస్ 'Accepted' కి మార్చడానికి API రౌట్
router.put('/test-drive/accept/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDrive = await TestDrive.findByIdAndUpdate(
      id, 
      { status: "Accepted" }, 
      { new: true }
    );
    
    if (!updatedDrive) {
      return res.status(404).json({ message: "Test drive request not found!" });
    }

    return res.status(200).json({ message: "Test drive accepted successfully!", data: updatedDrive });
  } catch (err) {
    console.error("❌ Accept Test Drive Error:", err.message);
    return res.status(500).json({ message: "Failed to accept test drive", error: err.message });
  }
});

// 🚀 టెస్ట్ డ్రైవ్ రిక్వెస్ట్‌ని డేటాబేస్ నుండి తొలగించడానికి API రౌట్
router.delete('/test-drive/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDrive = await TestDrive.findByIdAndDelete(id);
    
    if (!deletedDrive) {
      return res.status(404).json({ message: "Test drive request not found!" });
    }

    return res.status(200).json({ message: "Test drive deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Test Drive Error:", err.message);
    return res.status(500).json({ message: "Failed to delete test drive", error: err.message });
  }
});

export default router;
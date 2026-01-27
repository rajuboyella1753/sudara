# ☄️ SUDARA.in (Sudara Hub)

[![React](https://img.shields.io/badge/Frontend-React.js-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Empowering Students with Hyper-Local Food Discovery.** > Sudara Hub is a full-stack ecosystem designed to bridge the gap between campus students and local food vendors through real-time data and smart search capabilities.

---

## 📖 Project Vision
Campus life is fast-paced. **SUDARA** eliminates the "Food Uncertainty" factor by providing students with instant access to live hotel statuses, digital menus, and smart location-based discovery. We aim to digitize local campus businesses while giving students mental freedom to focus on what matters: their studies.

---

## 🔥 Smart Features

### 🎓 For Students (The Discovery Suite)
- **Smart Global Search:** Search for specific dishes (e.g., "Biryani") and instantly see which restaurants have them **Available** right now.
- **Dynamic Availability:** Real-time filters that hide "Sold Out" items to ensure you never crave what you can't have.
- **Live Rush Indicator:** View "Low, Medium, High" rush statuses set by owners to plan your visit.
- **Precision Distance:** Integrated GPS logic (Haversine Formula) to show exactly how many KMs a hub is from your current location.
- **One-Tap Pre-Order:** Integrated UPI QR system and direct call triggers for seamless ordering.

### 💼 For Hotel Owners (The Control Center)
- **Digital Kitchen Menu:** A robust dashboard to Add, Edit, or Delete menu items instantly.
- **Inventory Toggle:** One-click "Live/Sold Out" switch for every dish to manage student expectations.
- **Ambience Gallery:** Personal space to upload interior photos and UPI QR codes for digital branding.
- **Live Status Control:** Toggle "Open/Closed" and "Rush Level" to manage crowd flow.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js (Hooks), Tailwind CSS, Framer Motion (Animations) |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js (RESTful API Design) |
| **Database** | MongoDB (Mongoose Schemas with Lean Queries) |
| **Optimization**| Canvas-based Image Compression, Conditional Rendering |

---

## 📦 Project Structure

```text
SUDARA/
├── frontend/             # React.js Client Application
│   ├── src/
│   │   ├── api/          # Axios configuration & Base URL
│   │   ├── components/   # Reusable UI (Navbar, Footer, Modals)
│   │   ├── pages/        # Core Views (Home, Profile, Dashboard)
│   │   └── App.js        # Route Controller (React Router v6)
├── backend/              # Node.js Express Server
│   ├── models/           # Mongoose Schemas (Owner, Item)
│   ├── routes/           # API Endpoints (Owner Routes, Item Routes)
│   └── server.js         # Entry Point & Middleware setup
└── README.md             # Project Documentation
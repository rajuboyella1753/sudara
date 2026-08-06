import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerRegister from "./pages/OwnerRegister";
import OwnerDashboard from "./pages/OwnerDashboard";
import ElectronicsDashboard from "./pages/ElectronicsDashboard";
import ClothingDashboard from "./pages/ClothingDashboard";
import GroceryDashboard from "./pages/GroceryDashboard";
import RestaurantProfile from "./pages/RestaurantProfile";
import About from "./pages/AboutUs"; 
import Contact from "./pages/Contact";
import Terms from "./components/Terms";
// import Maintenance from "./pages/Maintenance";
import AdminDashboard from "./pages/Admin";
import HowItWorks from "./pages/HowItWorks";
import AutomobileDashboard from "./pages/AutomobileDashboard"; 
import FurnitureDashboard from "./pages/FurnitureDashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/" element={<Maintenance />} /> */}
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/owner" element={<OwnerLogin />} />
        <Route path="/owner/register" element={<OwnerRegister />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/restaurant/:id" element={<RestaurantProfile />} />
        <Route path="/store/:id" element={<RestaurantProfile />} />
        <Route path="/owner/electronics-dashboard" element={<ElectronicsDashboard />} />
        <Route path="/owner/clothing-dashboard" element={<ClothingDashboard />} />
        <Route path="/owner/grocery-dashboard" element={<GroceryDashboard />} />
        <Route path="/automobile/dashboard" element={<AutomobileDashboard />} />
        <Route path="/furniture/dashboard" element={<FurnitureDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/sudara-admin-control" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

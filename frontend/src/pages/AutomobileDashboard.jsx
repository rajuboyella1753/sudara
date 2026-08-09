import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from 'qrcode';
import imageCompression from 'browser-image-compression';
import { 
  Car, Bike, Zap, Plus, Trash2, Edit3, Download, Menu,
  Power, LogOut, Package, X, UploadCloud, Settings, Image as ImageIcon, Search, Key, MapPin
} from "lucide-react";

export default function AutomobileDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [products, setProducts] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [isMasterModal, setIsMasterModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isSettingsModal, setIsSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [activeTab, setActiveTab] = useState("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [testDrives, setTestDrives] = useState([]);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState("premium");
  const [planDuration, setPlanDuration] = useState(30);
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const SUDARA_UPI_ID = "boyella.r@ptyes";
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    subCategory: "Bikes",
    price: "",
    mileageOrRange: "45 kmpl",
    fuelType: "Petrol",
    description: "",
    isAvailable: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [storeSettings, setStoreSettings] = useState({
    name: "",
    phone: "",
    upiNumber: "",
    address: "",
    fssaiNumber: "",
    gstNumber: "",
    latitude: "",
    longitude: ""
  });
  const [storeImageFile, setStoreImageFile] = useState(null);
  const [storeImagePreview, setStoreImagePreview] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("owner"));
    if (!stored) {
      navigate("/owner");
      return;
    }
    setOwner(stored);
    setStoreSettings({
      name: stored.name || "",
      phone: stored.phone || "",
      upiNumber: stored.upiNumber || stored.phone || "",
      address: stored.address || "",
      fssaiNumber: stored.fssaiNumber || "",
      gstNumber: stored.gstNumber || "",
      latitude: stored.latitude || "",
      longitude: stored.longitude || ""
    });
    setStoreImagePreview(stored.image || "");
    fetchProducts(stored._id);
    fetchMasterCatalog();
    fetchTestDrives(stored._id);
  }, [navigate]);

  const fetchProducts = async (ownerId) => {
    try {
      const res = await api.get(`/items/owner/${ownerId}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch vehicles");
    }
  };
const fetchTestDrives = async (ownerId) => {
    try {
      const res = await api.get(`/orders/test-drive/owner/${ownerId}`);
      setTestDrives(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch test drives");
    }
  };
  const fetchMasterCatalog = async () => {
    try {
      const res = await api.get(`/items/master-catalog?category=Automobile`);
      setMasterCatalog(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Master catalog fetch fallback");
    }
  };

  const handleToggleStore = async () => {
    try {
      const updatedStatus = !owner.isStoreOpen;
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: updatedStatus });
      setOwner({ ...owner, isStoreOpen: res.data.isStoreOpen });
      localStorage.setItem("owner", JSON.stringify({ ...owner, isStoreOpen: res.data.isStoreOpen }));
    } catch (err) {
      alert("స్టేటస్ అప్‌డేట్ కాలేదు / Status update failed");
    }
  };
const calculatedAmount = useMemo(() => {
    const baseRate = selectedPlanType === "premium" ? 499 : 299;
    const months = planDuration === 90 ? 3 : 1;
    return baseRate * months;
  }, [selectedPlanType, planDuration]);

  // రోజుల కౌంట్‌డౌన్ లాజిక్
  const daysRemaining = useMemo(() => {
    if (!owner?.nextBillingDate) return 0;
    const today = new Date();
    const expiry = new Date(owner.nextBillingDate);
    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays < 0 ? 0 : differenceInDays;
  }, [owner]);
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // 💡 ఇక్కడ మనం కంప్రెషన్ చేస్తున్నాం
    const options = {
      maxSizeMB: 0.3, // మాక్సిమం 300KB వరకు
      maxWidthOrHeight: 800, // వెడల్పు లేదా ఎత్తు 800px మించకుండా
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    
    // ఇప్పుడు కంప్రెస్ అయిన ఫైల్‌ని స్టేట్‌లో సెట్ చెయ్
    setImageFile(compressedFile);
    setImagePreview(URL.createObjectURL(compressedFile));
    
  } catch (error) {
    console.error("Image compression error:", error);
    // ఒకవేళ కంప్రెషన్ ఫెయిల్ అయితే ఒరిజినల్ ఫైల్ తీసుకుంటుంది
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }
};

  const handleStoreImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoreImageFile(file);
      setStoreImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", storeSettings.name);
      formData.append("phone", storeSettings.phone);
      formData.append("upiNumber", storeSettings.upiNumber);
      formData.append("address", storeSettings.address);
      formData.append("fssaiNumber", storeSettings.fssaiNumber);
      formData.append("gstNumber", storeSettings.gstNumber);
      formData.append("latitude", storeSettings.latitude);
      formData.append("longitude", storeSettings.longitude);

      if (storeImageFile) {
        formData.append("image", storeImageFile);
      }

      const res = await api.put(`/owner/update/${owner._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedOwner = res.data.owner || { ...owner, ...storeSettings, image: storeImagePreview };
      setOwner(updatedOwner);
      localStorage.setItem("owner", JSON.stringify(updatedOwner));
      setIsSettingsModal(false);
      alert("షోరూమ్ సెట్టింగ్స్ విజయవంతంగా సేవ్ అయ్యాయి! / Showroom settings updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "సెట్టింగ్స్ అప్‌డేట్ చేయడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

const handleAddVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ownerId", owner._id);
      formData.append("name", newVehicle.name);
      formData.append("category", "Automobile"); // 👈 ఖచ్చితంగా "Automobile" ఉండాలి
      formData.append("subCategory", newVehicle.subCategory);
      formData.append("price", Number(newVehicle.price)); // నంబర్‌గా మార్చడం మంచిది
      formData.append("mileageOrRange", newVehicle.mileageOrRange || "");
      formData.append("fuelType", newVehicle.fuelType || "Petrol");
      formData.append("description", newVehicle.description || "");
      formData.append("isAvailable", String(newVehicle.isAvailable)); // స్ట్రింగ్‌గా పంపిస్తే బ్యాక్‌ఎండ్‌లో ఈజీగా పార్സ് అవుతుంది
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      console.log("🚀 Sending Vehicle Payload...");

      const response = await api.post("/items/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("✅ Vehicle Added Successfully:", response.data);

      setIsAddModal(false);
      setNewVehicle({ 
        name: "", 
        subCategory: "Bikes", 
        price: "", 
        mileageOrRange: "", 
        fuelType: "Petrol", 
        description: "", 
        isAvailable: true 
      });
      setImageFile(null);
      setImagePreview("");
      fetchProducts(owner._id);
      fetchMasterCatalog();
    } catch (err) {
      console.error("❌ Add Vehicle Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "వెహికల్ యాడ్ అవ్వడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromMaster = async (masterItem) => {
    try {
      setLoading(true);
      const payload = {
        ownerId: owner._id,
        name: masterItem.name,
        category: "Automobile",
        subCategory: masterItem.subCategory || "Bikes",
        price: masterItem.price || 85000,
        mileageOrRange: masterItem.mileageOrRange || "50 kmpl",
        fuelType: masterItem.fuelType || "Petrol",
        description: masterItem.description || "Verified Automobile Model",
        image: masterItem.image || "",
        isAvailable: true
      };

      await api.post("/items/add-from-master", payload);
      fetchProducts(owner._id);
      alert(`"${masterItem.name}" మీ షోరూమ్‌కి విజయవంతంగా జోడించబడింది! ✅`);
    } catch (err) {
      alert("మాస్టర్ క్యాటలాగ్ నుండి ఇంపోర్ట్ అవ్వడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("category", "Automobile");
      formData.append("subCategory", editingItem.subCategory);
      formData.append("price", editingItem.price);
      formData.append("mileageOrRange", editingItem.mileageOrRange || "");
      formData.append("fuelType", editingItem.fuelType || "Petrol");
      formData.append("description", editingItem.description || "");
      formData.append("isAvailable", editingItem.isAvailable);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.put(`/items/update/${editingItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setIsEditModal(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview("");
      fetchProducts(owner._id);
    } catch (err) {
      alert("అప్‌డేట్ చేయడం విఫలమైంది.");
    } finally {
      setLoading(false);
    }
  };
const handleAcceptTestDrive = async (driveId) => {
    try {
      await api.put(`/orders/test-drive/accept/${driveId}`);
      // లోకల్ స్టేట్ అప్‌డేట్ చేసి వెంటనే స్క్రీన్ మీద మారేలా చేయడం
      setTestDrives(testDrives.map(d => d._id === driveId ? { ...d, status: "Accepted" } : d));
      alert("టెస్ట్ డ్రైవ్ అంగీకరించబడింది! ✅ కస్టమర్‌కి కాల్ చేయండి.");
    } catch (err) {
      alert("స్టేటస్ అప్‌డేట్ చేయడం విఫలమైంది. ❌");
    }
  };
  const handleDeleteTestDrive = async (driveId) => {
    if (!window.confirm("ఈ టెస్ట్ డ్రైవ్ రికార్డును తొలగించాలనుకుంటున్నారా? / Delete this record?")) return;
    try {
      await api.delete(`/orders/test-drive/delete/${driveId}`);
      // లోకల్ స్టేట్ నుండి కూడా ఆ ఐటమ్‌ని తీసేయడం
      setTestDrives(testDrives.filter(d => d._id !== driveId));
      alert("టెస్ట్ డ్రైవ్ విజయవంతంగా తొలగించబడింది! 🗑️");
    } catch (err) {
      alert("తొలగించడం విఫలమైంది. ❌");
    }
  };
  const getUniversalDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
  const downloadQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(`https://sudara.in/restaurant/${owner?._id}`, {
        width: 550,
        margin: 1,
        errorCorrectionLevel: 'H'
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1200;
      canvas.height = 1900; 

      ctx.fillStyle = "#0F172A"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#1E293B");
      gradient.addColorStop(1, "#334155");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 400);
      ctx.quadraticCurveTo(canvas.width / 2, 480, 0, 400);
      ctx.fill();

      const storeName = owner?.name?.toUpperCase() || "AUTOMOBILE SHOWROOM";
      let fontSize = 90;
      if (storeName.length > 15) fontSize = 70;
      if (storeName.length > 20) fontSize = 55;

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(storeName, canvas.width / 2, 230, 1000);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText("బైక్స్, కార్లు & ఈవీల షోరూమ్ / AUTOMOBILE SHOWROOM", canvas.width / 2, 320);

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 60;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(250, 480, 700, 700, 60); 
      ctx.fill();
      ctx.restore();

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 325, 555, 550, 550);

        ctx.fillStyle = "#F59E0B";
        ctx.font = "bold 45px sans-serif";
        ctx.fillText("టెస్ట్ డ్రైవ్ లేదా ఆఫర్స్ కోసం స్కాన్ చేయండి", canvas.width / 2, 1260); 

        const pathText = "SCAN ➔ BROWSE ➔ TEST DRIVE ➔ GET QUOTE";
        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText(pathText, canvas.width / 2, 1330);

        const steps = [
            "1. మీ ఫోన్ కెమెరాతో క్యూఆర్ కోడ్ స్కాన్ చేయండి",
            "2. లైవ్ బైక్స్, కార్లు & ఆన్-రోడ్ ధరలు చూడండి",
            "3. నేరుగా కాల్ చేసి టెస్ట్ డ్రైవ్ బుక్ చేసుకోండి"
        ];
        ctx.font = "600 36px sans-serif";
        steps.forEach((text, i) => {
            const barY = 1400 + (i * 90);
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            ctx.beginPath();
            ctx.roundRect(200, barY, 800, 70, 15);
            ctx.fill();
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(text, canvas.width / 2, barY + 45);
        });

        ctx.fillStyle = "#FACC15"; 
        ctx.font = "italic bold 30px sans-serif";
        ctx.fillText("💡 ఫోన్‌పే / UPI నంబర్: " + (owner?.upiNumber || owner?.phone || "నాట్ సెట్"), canvas.width / 2, 1725);

        ctx.textAlign = "center";
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#475569"; 
        ctx.fillText("POWERED BY ", canvas.width / 2 - 190, 1830);
             
        ctx.fillStyle = "#F59E0B"; 
        ctx.fillText("SUDARA HUB", canvas.width / 2 + 30, 1830);
             
        ctx.fillStyle = "#475569";
        ctx.fillText(" • sudara.in", canvas.width / 2 + 220, 1830);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `${owner?.name || "Showroom"}_Automobile_Poster.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    } catch (err) {
      console.error("QR Generation Error:", err);
      alert("QR కోడ్ లోడ్ అవ్వడంలో లోపం.");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const nextStatus = !item.isAvailable;
      await api.put(`/items/update-availability/${item._id}`, { isAvailable: nextStatus });
      setProducts(products.map(p => p._id === item._id ? { ...p, isAvailable: nextStatus } : p));
    } catch (err) {
      alert("స్టాక్ స్టేటస్ అప్‌డేట్ అవ్వలేదు");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ఈ వెహికల్‌ని తొలగించాలనుకుంటున్నారా? / Remove this vehicle?")) return;
    try {
      await api.delete(`/items/delete/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("తొలగించడం విఫలమైంది.");
    }
  };

  const filteredProducts = products.filter(item => {
    if (selectedCategoryTab === "All") return true;
    return item.subCategory?.toLowerCase() === selectedCategoryTab.toLowerCase();
  });

  if (!owner) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100">
      
      {/* 🤫 HIDDEN QR CANVAS */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={180} level="H" />
      </div>

      {/* 👑 NAVBAR */}
<nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 sm:px-6 lg:px-12 py-3 flex justify-between items-center shadow-xs w-full">
  
  {/* 👈 లెఫ్ట్ సైక్షన్: మెనూ బటన్ మరియు లోగో/ఇమేజ్ */}
  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-1">
    <button 
      onClick={() => setIsSidebarOpen(true)}
      className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shrink-0"
      title="Open Hub Menu"
    >
      <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>

    <div className="flex items-center gap-2 min-w-0">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden bg-amber-50 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
        {(owner?.image || owner?.hotelImage) ? (
          <img src={owner.image || owner.hotelImage} alt={owner.name} className="w-full h-full object-cover" />
        ) : (
          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
        )}
      </div>

      {/* 🏷️ పేరు మరియు సబ్‌స్క్రిప్షన్ రోజులు (డబుల్ డిస్‌ప్లే పోయేలా సింగిల్ బ్లాక్ లో సెట్ చేశాం) */}
      <div className="min-w-0 flex flex-col justify-center">
        <h1 className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 truncate max-w-[110px] xs:max-w-[140px] sm:max-w-xs leading-tight">
          {owner.name}
        </h1>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <p className="text-[7px] sm:text-[8px] font-extrabold uppercase text-amber-600 tracking-widest truncate">Automobile Hub</p>
          {daysRemaining > 0 ? (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[7px] font-black px-1.5 py-0.2 rounded uppercase shrink-0">
              ⏳ {daysRemaining}D Left
            </span>
          ) : (
            <button 
              onClick={() => setIsRenewalModalOpen(true)} 
              className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.2 rounded uppercase animate-bounce shrink-0"
            >
              ⚠️ Renew
            </button>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* 👉 రైట్ సైక్షన్: ఆన్/ఆఫ్ బటన్, సెట్టింగ్స్ మరియు లాగౌట్ */}
  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
    <button 
      onClick={handleToggleStore}
      className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider transition-all shadow-xs ${owner.isStoreOpen ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}
    >
      <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
      <span className="hidden xs:inline">{owner.isStoreOpen ? 'Online' : 'Offline'}</span>
      <span className="xs:hidden">{owner.isStoreOpen ? 'Open' : 'Close'}</span>
    </button>

    {/* <button 
      onClick={() => setIsSettingsModal(true)}
      className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
      title="Showroom Settings"
    >
      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button> */}

    <button 
      onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }}
      className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
      title="Sign Out"
    >
      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </button>
  </div>
</nav>

      {/* 📦 MAIN CONTENT */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        
        {activeTab === "inventory" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">షోరూమ్ ఇన్వెంటరీ / Showroom Catalog</h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">బైక్స్, కార్లు, ఈవీలు & ధరల మేనేజ్‌మెంట్</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button 
                  onClick={() => setIsMasterModal(true)}
                  className="flex-1 sm:flex-none bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 sm:px-5 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> మాస్టర్ నుండి తెచ్చుకోండి / Import
                </button>
                <button 
                  onClick={() => setIsAddModal(true)}
                  className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white px-5 sm:px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md shadow-amber-100 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" /> కొత్త వెహికల్ / Add Vehicle
                </button>
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2.5 w-max">
                {[
                  { label: "అన్నీ / All", icon: Package, key: "All" },
                  { label: "బైక్స్ / Bikes", icon: Bike, key: "Bikes" },
                  { label: "కార్లు / Cars", icon: Car, key: "Cars" },
                  { label: "ఎలక్ట్రిక్ (EV)", icon: Zap, key: "EV" },
                  { label: "ఆటోస్ / Autos", icon: Package, key: "Autos" }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedCategoryTab(tab.key)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xs shrink-0 ${selectedCategoryTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-3">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">వెహికల్స్ ఏవీ లేవు / No Vehicles Found</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">పైన ఉన్న 'Import from Master' లేదా 'Add New Vehicle' ద్వారా జోడించండి.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((item) => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={item._id} 
                    className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="w-full h-48 sm:h-52 bg-slate-100 overflow-hidden relative flex items-center justify-center p-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain drop-shadow-sm" />
                        ) : (
                          <Car className="w-10 h-10 text-slate-300" />
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {item.subCategory || "Vehicle"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight truncate">{item.name}</h3>
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">{item.fuelType || "Petrol"}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">మైలేజ్/రేంజ్: <span className="text-slate-700 font-black">{item.mileageOrRange || "N/A"}</span></p>
                        <div className="pt-2">
                          <span className="text-base font-black text-amber-600">₹{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all ${item.isAvailable !== false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                      >
                        {item.isAvailable !== false ? 'షోరూమ్‌లో ఉంది / Available' : 'అందుబాటులో లేదు / Out of Stock'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => { setEditingItem(item); setImagePreview(item.image); setIsEditModal(true); }} 
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="సవరించు / Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(item._id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="తొలగించు / Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      {activeTab === "testDrives" && (
  <div className="space-y-6 animate-in fade-in zoom-in duration-500">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">టెస్ట్ డ్రైవ్ బుకింగ్స్ / Test Drive Requests</h2>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">కస్టమర్లు బుక్ చేసిన వెహికల్ టెస్ట్ డ్రైవ్ వివరాలు</p>
      </div>
      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-4 py-2 rounded-xl">
        Total Requests: {testDrives.length}
      </span>
    </div>

    {testDrives.length === 0 ? (
      <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-3">
        <Car className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">టెస్ట్ డ్రైవ్ రిక్వెస్ట్స్ ఏవీ లేవు / No Test Drives Yet</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase">కస్టమర్లు మీ వెహికల్స్‌కి టెస్ట్ డ్రైవ్ బుక్ చేసినప్పుడు ఇక్కడ కనిపిస్తాయి.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {testDrives.map((drive) => (
  <div key={drive._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
          🚗 {drive.vehicleName}
        </span>
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${drive.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {drive.status || "Pending"}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-black uppercase text-slate-900">{drive.customerName}</h3>
        <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
          📞 <a href={`tel:${drive.customerPhone}`} className="underline">{drive.customerPhone}</a>
        </p>
      </div>

      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs font-bold text-slate-600">
  <p className="flex justify-between">
    <span className="text-slate-400 uppercase text-[9px]">టెస్ట్ డ్రైవ్ తేదీ:</span> 
    <span className="text-slate-900">
      {drive.testDriveDate ? drive.testDriveDate.split('-').reverse().join('/') : ''}
    </span>
  </p>
</div>
    </div>

    <div className="pt-3 border-t border-slate-100 flex gap-2">
      {/* Accept Button */}
      {drive.status !== "Accepted" ? (
        <button 
          onClick={() => handleAcceptTestDrive(drive._id)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-wider text-center transition-all shadow-sm active:scale-95"
        >
          Accept ✅
        </button>
      ) : (
        <span className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-wider text-center border border-emerald-200">
          Accepted ✓
        </span>
      )}

      {/* Call Button */}
      <a 
        href={`tel:${drive.customerPhone}`} 
        className="flex-1 bg-slate-900 hover:bg-amber-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-wider text-center transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
      >
        Call 📞
      </a>
      <button 
    onClick={() => handleDeleteTestDrive(drive._id)}
    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-3 rounded-xl font-black uppercase text-[10px] tracking-wider text-center transition-all shadow-sm active:scale-95"
    title="Complete & Delete"
  >
    🗑️
  </button>
    </div>
  </div>
))}
      </div>
    )}
  </div>
)}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <h2 className="text-4xl font-black italic uppercase text-slate-900">
              షోరూమ్ ప్రొఫైల్<br/><span className="text-amber-600">& వెరిఫికేషన్ సర్టిఫికెట్</span>
            </h2>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden w-full">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-lg shrink-0 mx-auto sm:mx-0">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight italic">సుడరా ఆటోమొబైల్ పార్ట్‌నర్ / Verified Showroom</h4>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest">Active</span>
                    </div>
                    <p className="text-slate-400 text-[11px] md:text-xs mt-1 max-w-2xl font-medium leading-relaxed uppercase tracking-wider">
                      మీ అధికారిక ఆటోమొబైల్ షోరూమ్ సర్టిఫికెట్‌ను డౌన్‌లోడ్ చేసుకోండి.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const name = owner?.name || "SUDARA SHOWROOM";
                      const district = owner?.district || "LOCAL";
                      const state = owner?.state || "ANDHRA PRADESH";
                      const certificateId = `SUDARA-AUTO-2026-${(owner?._id || "HUBSOT").toString().slice(-6).toUpperCase()}`;
                      const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

                      const htmlContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;600;800&display=swap');
                          @page { size: A4 landscape; margin: 0; }
                          body { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
                          .container { width: 297mm; height: 210mm; padding: 14mm; box-sizing: border-box; position: relative; background: #ffffff; }
                          .outer-border { width: 269mm; height: 182mm; border: 4px solid #1e3a8a; padding: 4mm; box-sizing: border-box; position: relative; }
                          .inner-border { width: 100%; height: 100%; border: 2px solid #d97706; padding: 12mm; box-sizing: border-box; position: relative; text-align: center; background: #fafaf9; }
                          .header .title { font-family: 'Cinzel', serif; font-size: 34pt; font-weight: 800; color: #1e3a8a; text-transform: uppercase; margin: 0; }
                          .header .subtitle { font-size: 8.5pt; font-weight: 800; letter-spacing: 0.45em; color: #d97706; text-transform: uppercase; margin: 3mm 0 0 0; }
                          .cert-label { font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; color: #64748b; text-transform: uppercase; margin-top: 8mm; }
                          .present { font-size: 12pt; font-style: italic; color: #475569; margin-top: 3mm; font-family: 'Georgia', serif; }
                          .hub-name { font-family: 'Cinzel', serif; font-size: 26pt; font-weight: 800; color: #1e1b4b; margin: 4mm auto; border-bottom: 2px dashed #cbd5e1; display: inline-block; padding-bottom: 2mm; min-width: 170mm; }
                          .location { font-size: 9.5pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 1mm; }
                          .location span { color: #1e3a8a; font-weight: 800; }
                          .desc { font-size: 10.5pt; line-height: 1.6; color: #334155; max-width: 215mm; margin: 6mm auto 0 auto; text-align: center; font-weight: 500; }
                          .footer { position: absolute; bottom: 12mm; width: 90%; left: 5%; }
                          .meta { float: left; text-align: left; font-size: 8.5pt; color: #475569; line-height: 1.6; font-weight: 600; }
                          .badge { display: inline-block; text-align: center; margin-top: -4mm; }
                          .badge-icon { font-size: 32pt; }
                          .badge-text { font-size: 7.5pt; font-weight: 800; color: #1e3a8a; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1mm; }
                          .sig-block { float: right; text-align: right; }
                          .sig-stamp { font-family: 'Courier New', monospace; font-size: 13pt; font-weight: 900; color: #16a34a; background: rgba(22, 163, 74, 0.08); padding: 2px 8px; border: 1.5px dashed #16a34a; border-radius: 4px; display: inline-block; transform: rotate(-2deg); }
                          .sig-line { width: 52mm; border-top: 1.5px solid #475569; margin: 3mm 0 2mm auto; }
                          .sig-text { font-size: 8pt; color: #475569; font-weight: 600; }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <div class="outer-border">
                            <div class="inner-border">
                              <div class="header">
                                <div class="title">Sudara Hub</div>
                                <div class="subtitle">Hyperlocal Automobile Showrooms Ecosystem</div>
                              </div>
                              <div class="cert-label">Certificate of Verification (ధృవీకరణ పత్రం)</div>
                              <div class="present">This establishment is officially recognized as an authorized hyperlocal automobile showroom partner</div>
                              <div class="hub-name">${name}</div>
                              <div class="location">Region: <span>${district} District, ${state}</span></div>
                              <div class="desc">
                                This verification certifies that this automobile showroom has successfully integrated into the Sudara Network ecosystem for direct neighborhood commerce and vehicle inquiries.
                              </div>
                              <div class="footer">
                                <div class="meta">
                                  <strong>ID:</strong> ${certificateId}<br>
                                  <strong>Issued:</strong> ${issueDate}<br>
                                  <strong>UPI Pay:</strong> ${owner?.upiNumber || owner?.phone || "N/A"}<br>
                                  <strong>Status:</strong> Active & Verified
                                </div>
                                <div class="badge">
                                  <div class="badge-icon">🛡️</div>
                                  <div class="badge-text">Verified Partner</div>
                                </div>
                                <div class="sig-block">
                                  <div class="sig-stamp">✓ OVT_Verified</div>
                                  <div class="sig-line"></div>
                                  <div class="sig-text"><strong>Owner Verifying Team (OVT)</strong></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <script>
                          window.onload = function() { window.print(); };
                        </script>
                      </body>
                      </html>
                      `;

                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(htmlContent);
                        win.document.close();
                      } else {
                        alert("పాప్-అప్ బ్లాక్ చేయబడింది! దయచేసి అనుమతించండి / Popup blocked!");
                      }
                    } catch (err) {
                      alert("సర్టిఫికెట్ జనరేట్ అవ్వడంలో లోపం!");
                    }
                  }}
                  className="w-full lg:w-auto bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <span>సర్టిఫికెట్ డౌన్‌లోడ్ / Download Certificate</span>
                  <span className="text-xs">⬇️</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-12 py-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sudara Automobile Hub &copy; 2026 • డిజిటల్ ఇండియా హైపర్‌కలోకల్ నెట్‌వర్క్
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">క్లౌడ్ సింక్రనైజ్డ్ / Cloud Synced</span>
          </div>
        </div>
      </footer>

      {/* MASTER CATALOG MODAL */}
      <AnimatePresence>
        {isMasterModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 max-h-[85vh] flex flex-col">
              <button onClick={() => setIsMasterModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-slate-100 p-2 rounded-full text-slate-600"><X className="w-5 h-5"/></button>
              
              <div className="mb-4 pr-8">
                <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">గ్లోబల్ మాస్టర్ వెహికల్స్ కేటలాగ్</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ఇప్పటికే నెట్‌వర్క్‌లో ఉన్న మోడళ్లను ఎంచుకోండి / Select Pre-loaded Vehicles</p>
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="వెహికల్ వెతకండి (ఉదా: Activa, Nexon, Pulsar)... / Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {masterCatalog.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">మోడల్స్ ఏవీ కనుగొనబడలేదు. కొత్తవి జోడించండి!</div>
                ) : (
                  masterCatalog
                    .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((mItem) => (
                      <div key={mItem._id || mItem.name} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-all">
                        <div className="flex items-center gap-3">
                          <img src={mItem.image || "https://ui-avatars.com/api/?name=" + mItem.name} className="w-12 h-12 object-contain bg-white rounded-xl p-1 border" alt="" />
                          <div>
                            <h4 className="font-black uppercase text-xs text-slate-900">{mItem.name}</h4>
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">{mItem.subCategory || "Bikes"}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddFromMaster(mItem)}
                          className="bg-slate-900 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                        >
                          + షోరూమ్‌కి జోడించు / Add
                        </button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence> 
        {isSettingsModal && ( 
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs pt-16 sm:pt-20"> 
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative border border-slate-200 max-h-[85vh] overflow-y-auto scrollbar-custom" > 
              <button onClick={() => setIsSettingsModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all" > <X className="w-4 h-4"/> </button> 
              <div className="mb-5 sm:mb-6 pr-8"> 
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">షోరూమ్ సెట్టింగ్స్ & పేమెంట్ హబ్ / Settings</h3> 
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">లాగిన్ వివరాలు, ఫోన్‌పే నంబర్, జీపీఎస్ లొకేషన్ & ఇమేజ్</p> 
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> లాగిన్ వివరాలు / Login Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">ఇమెయిల్ (Login ID)</label>
                      <input type="text" disabled value={owner.email || ""} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">పాస్‌వర్డ్ / Password</label>
                      <input type="text" disabled value={owner.password || "••••••••"} className="w-full bg-slate-200/60 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">షోరూమ్ పేరు / Showroom Name</label>
                  <input type="text" required value={storeSettings.name} onChange={(e)=>setStoreSettings({...storeSettings, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఫోన్ నంబర్ / Phone Number</label>
                    <input type="text" value={storeSettings.phone} onChange={(e)=>setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-amber-600 block mb-1 font-black">ఫోన్‌పే / UPI నంబర్ (Payment ID)</label>
                    <input type="text" placeholder="e.g. 9876543210 / UPI ID" value={storeSettings.upiNumber} onChange={(e)=>setStoreSettings({...storeSettings, upiNumber: e.target.value})} className="w-full bg-amber-50/50 border border-amber-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 text-amber-900" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ట్రేడ్ లైసెన్స్ / License No</label>
                    <input type="text" value={storeSettings.fssaiNumber} onChange={(e)=>setStoreSettings({...storeSettings, fssaiNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">GST నంబర్ / GST Number</label>
                    <input type="text" value={storeSettings.gstNumber} onChange={(e)=>setStoreSettings({...storeSettings, gstNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">షోరూమ్ అడ్రస్ / Showroom Address</label>
                  <input type="text" value={storeSettings.address} onChange={(e)=>setStoreSettings({...storeSettings, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">షోరూమ్ ఫోటో / Showroom Banner Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleStoreImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {storeImagePreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={storeImagePreview} alt="Store Preview" className="w-12 h-12 object-cover rounded-lg border" />
                        <span className="text-[10px] font-black text-amber-600 uppercase">ఫోటో మార్చండి ✅ / Change Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-amber-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">షోరూమ్ ఫోటో అప్‌లోడ్ చేయండి / Upload Banner</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> జీపీఎస్ లొకేషన్ / GPS Coordinates
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setStoreSettings({
                                ...storeSettings,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                              });
                              alert("లొకేషన్ విజయవంతంగా క్యాప్చర్ చేయబడింది! 📍");
                            },
                            (error) => { alert("లొకేషన్ పొందడం విఫలమైంది."); }
                          );
                        } else {
                          alert("లొకేషన్ సపోర్ట్ చేయదు");
                        }
                      }}
                      className="text-[9px] font-black uppercase bg-amber-600 text-white px-3 py-1.5 rounded-xl shadow-sm hover:bg-amber-700 transition-all"
                    >
                      📍 నా లొకేషన్ తీసుకోండి / Capture GPS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">లాటిట్యూడ్ / Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.latitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, latitude: e.target.value})} 
                        placeholder="e.g. 13.6288"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-amber-600" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">లాంగిట్యూడ్ / Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={storeSettings.longitude || ""} 
                        onChange={(e)=>setStoreSettings({...storeSettings, longitude: e.target.value})} 
                        placeholder="e.g. 79.4192"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-amber-600" 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                  {loading ? "సేవ్ అవుతోంది..." : "సెట్టింగ్స్ సేవ్ చేయి / Save Settings"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD VEHICLE MODAL */}
    <AnimatePresence>
      {isAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto my-auto text-slate-900">
            <button onClick={() => setIsAddModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700 z-10"><X className="w-5 h-5"/></button>
            
            <div className="mb-5 sm:mb-6">
              <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">కొత్త వెహికల్ జోడించు / Add Vehicle</h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">షోరూమ్ కేటలాగ్‌లో కొత్త బైక్ లేదా కార్‌ని చేర్చండి</p>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">వెహికల్ పేరు / Vehicle Name</label>
                <input type="text" required placeholder="e.g. Honda Activa 6G / Tata Nexon EV" value={newVehicle.name} onChange={(e)=>setNewVehicle({...newVehicle, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 text-slate-900" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">రకం / Type</label>
                  <select value={newVehicle.subCategory} onChange={(e)=>setNewVehicle({...newVehicle, subCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 cursor-pointer text-slate-900">
                    <option value="Bikes">బైక్స్ / Bikes</option>
                    <option value="Cars">కార్లు / Cars</option>
                    <option value="EV">ఎలక్ట్రిక్ (EV)</option>
                    <option value="Autos">ఆటోస్ / Autos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ధర (₹) / On-Road Price</label>
                  <input type="text" required placeholder="95000" value={newVehicle.price} onChange={(e)=>setNewVehicle({...newVehicle, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">మైలేజ్ / రేంజ్ / Mileage/Range</label>
                  <input type="text" placeholder="e.g. 50 kmpl or 312 km/charge" value={newVehicle.mileageOrRange} onChange={(e)=>setNewVehicle({...newVehicle, mileageOrRange: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 text-slate-900" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఇంధన రకం / Fuel Type</label>
                  <select value={newVehicle.fuelType} onChange={(e)=>setNewVehicle({...newVehicle, fuelType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 cursor-pointer text-slate-900">
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric (EV)</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఫోటో / Vehicle Image</label>
                <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  {imagePreview ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                      <span className="text-[10px] font-black text-amber-600 uppercase">ఫోటో ఎంపికైంది ✅</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud className="w-5 h-5 text-amber-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">ఫోటో అప్‌లోడ్ చేయండి / Browse</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">వివరాలు / Description</label>
                <textarea placeholder="ఫీచర్స్, ఇంజిన్ కెపాసిటీ లేదా ఆఫర్స్ రాయండి..." value={newVehicle.description} onChange={(e)=>setNewVehicle({...newVehicle, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-xs outline-none focus:border-amber-600 h-20 resize-none text-slate-900"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                {loading ? "ప్రచురిస్తోంది..." : "ప్రచురించు / Publish Vehicle"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* EDIT VEHICLE MODAL */}
      <AnimatePresence>
        {isEditModal && editingItem && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
              
              <div className="mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">వెహికల్ సవరించు / Edit Vehicle</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">వెహికల్ వివరాలను అప్‌డేట్ చేయండి</p>
              </div>

              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">వెహికల్ పేరు / Vehicle Name</label>
                  <input type="text" required value={editingItem.name} onChange={(e)=>setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">రకం / Type</label>
                    <select value={editingItem.subCategory} onChange={(e)=>setEditingItem({...editingItem, subCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 cursor-pointer">
                      <option value="Bikes">బైక్స్</option>
                      <option value="Cars">కార్లు</option>
                      <option value="EV">ఎలక్ట్రిక్ (EV)</option>
                      <option value="Autos">ఆటోస్</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ధర (₹) / Price</label>
                    <input type="text" required value={editingItem.price} onChange={(e)=>setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">మైలేజ్ / రేంజ్</label>
                    <input type="text" value={editingItem.mileageOrRange || ""} onChange={(e)=>setEditingItem({...editingItem, mileageOrRange: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఇంధన రకం</label>
                    <select value={editingItem.fuelType || "Petrol"} onChange={(e)=>setEditingItem({...editingItem, fuelType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-amber-600 cursor-pointer">
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">ఫోటో అప్‌డేట్ / Update Image</label>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <div className="flex items-center justify-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-10 h-10 object-contain rounded-lg" />
                      <span className="text-[10px] font-black text-amber-600 uppercase">ఫోటో మార్చు / Change Image</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">వివరాలు / Description</label>
                  <textarea value={editingItem.description || ""} onChange={(e)=>setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-xs outline-none focus:border-amber-600 h-20 resize-none"></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-300">
                  {loading ? "సేవ్ అవుతోంది..." : "మార్పులు సేవ్ చేయి / Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
{/* 👑 సబ్‌స్క్రిప్షన్ రెనెవల్ మోడల్ */}
      <AnimatePresence>
        {isRenewalModalOpen && (
          <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl p-6 md:p-10 rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button type="button" onClick={() => setIsRenewalModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
              
              <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter mb-2 border-l-8 border-orange-500 pl-6">
                Sudara Node <span className="text-orange-600">Subscription Renewal</span>
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-8 pl-8">Direct Peer-to-Peer Settlement</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <p className="text-xs font-black uppercase text-slate-500">1. ప్లాన్ సెలెక్షన్ & యూపీఐ కాపీ</p>
                  
                  <div className="flex bg-slate-100 p-1 rounded-xl border shadow-inner">
                    <button type="button" onClick={() => setSelectedPlanType("basic")} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPlanType === "basic" ? "bg-slate-900 text-white shadow-md" : "text-slate-500"}`}>Basic (₹299/Mo)</button>
                    <button type="button" onClick={() => setSelectedPlanType("premium")} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPlanType === "premium" ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}>Premium (₹499/Mo)</button>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl border shadow-inner">
                    <button type="button" onClick={() => setPlanDuration(30)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${planDuration === 30 ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-400"}`}>30 Days (1 Month)</button>
                    <button type="button" onClick={() => setPlanDuration(90)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${planDuration === 90 ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-400"}`}>90 Days (3 Months)</button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Official UPI ID</p>
                      <p className="font-black text-slate-700 text-xs mt-1.5 tracking-wide">{SUDARA_UPI_ID}</p>
                    </div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(SUDARA_UPI_ID); alert("UPI ID Copied!"); }} className="p-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase px-4 py-1.5">
                      Copy UPI ID
                    </button>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
                    <div>
                      <p className="text-[8px] font-black uppercase opacity-50 tracking-widest leading-none">Total Payable Amount</p>
                      <p className="text-3xl font-black italic tracking-tighter text-emerald-400 mt-2">₹{calculatedAmount}</p>
                    </div>
                    <a href={`upi://pay?pa=${SUDARA_UPI_ID}&pn=Sudara%20Hub&am=${calculatedAmount}&cu=INR`} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest text-white shadow-lg">
                      Pay Now
                    </a>
                  </div>
                </div>

                <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border">
                  <p className="text-xs font-black uppercase text-slate-500">2. రసీదు సమర్పణ (Payment Verification)</p>
                  
                  <div className="border-2 border-dashed border-slate-300 bg-white p-6 rounded-2xl text-center relative">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (event) => setUploadedReceipt(event.target.result);
                      }
                    }} />
                    {uploadedReceipt ? (
                      <span className="text-[10px] font-black uppercase text-emerald-600">Screenshot Attached ✅</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-400">Upload Payment Screenshot</span>
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={async () => {
                      if (!uploadedReceipt) return alert("దయచేసి స్క్రీన్‌షాట్ అప్‌లోడ్ చేయండి!");
                      try {
                        await api.put(`/owner/update-profile/${owner._id}`, {
                          paymentReceipt: uploadedReceipt,
                          billingStatus: "Pending Verification"
                        });
                        alert("Receipt Sent to Admin! ✅");
                        setIsRenewalModalOpen(false);
                      } catch (err) { alert("Failed"); }
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-lg"
                  >
                    I Have Paid
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* SIDEBAR DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[110] flex justify-start bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ x: "-100%", opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "-100%", opacity: 0 }} 
              className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 italic">షోరూమ్ మెనూ / Hub Menu</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all">
                    <X className="w-5 h-5"/>
                  </button>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => { setActiveTab("inventory"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Package className="w-4 h-4 text-amber-600" /> వెహికల్స్ ఇన్వెంటరీ / Inventory
                  </button>
                  <button 
  onClick={() => { setActiveTab("testDrives"); setIsSidebarOpen(false); }}
  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
>
  <div className="flex items-center gap-3">
    <Car className="w-4 h-4 text-amber-600" /> టెస్ట్ డ్రైవ్ రిక్వెస్ట్స్ / Test Drives
  </div>
  {testDrives.length > 0 && (
    <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-full">
      {testDrives.length}
    </span>
  )}
</button>
                  <button 
                    onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-amber-600" /> సర్టిఫికెట్ & ప్రొఫైల్ / Profile
                  </button>

                  <button 
                    onClick={() => { downloadQRCode(); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Download className="w-4 h-4 text-amber-600" /> క్యూఆర్ పోస్టర్ డౌన్‌లోడ్ / QR Poster
                  </button>

                  <button 
                    onClick={() => { setIsSettingsModal(true); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border border-slate-100 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-amber-600" /> షోరూమ్ సెట్టింగ్స్ / Settings
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sudara Automobile Hub Node • డిజిటల్ ఇండియా</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
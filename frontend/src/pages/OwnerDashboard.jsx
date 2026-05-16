import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { 
  Compass, UtensilsCrossed, Plus, Search, X, Bell, 
  Settings, LogOut, Image as ImageIcon, MapPin, 
  Menu, Power, Calendar, PhoneCall, BarChart3, Star, Send, QrCode, Download, Camera, ShieldCheck, CheckCircle2, Trash2
} from "lucide-react"; 
import { QRCodeCanvas } from "qrcode.react";
// ✅ Correct Path: pages నుండి బయటకి వచ్చి (..), api ఫోల్డర్ లోకి వెళ్ళాలి
import { socket } from "../api/api-base";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]); // Integrated orders feature
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState("dashboard"); // Tab switching
  const [isMenuOpen, setIsMenuOpen] = useState(false);         
  const [isAddingItem, setIsAddingItem] = useState(false);     
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [isShowingMatrix, setIsShowingMatrix] = useState(false); 

  const [sending, setSending] = useState(false);
  const [todayMsg, setTodayMsg] = useState(""); 

  // Profile Form (First Code Fields + New Schema Fields)
  const [profileForm, setProfileForm] = useState({ 
    name: "", email: "", password: "", category: "", phone: "", whatsappNumber: "", upiNumber: "", upiID: "",
    state: "", district: "", collegeName: "", hotelImage: "", address: "", tableCount: 0, foodType: "Both",
    interiorImages: [], latitude: 0, longitude: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All"); 
  const [subCategoryFilter, setSubCategoryFilter] = useState("All"); 
  const [editItemId, setEditItemId] = useState(null);
  
  // Analytics States (First Code Original)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState("daily");

  const [form, setForm] = useState({ 
    name: "", price: "", discountPrice: "", image: "", category: "Veg", subCategory: "Biryanis" 
  });

  const [isOtherSub, setIsOtherSub] = useState(false);
  const [customSub, setCustomSub] = useState("");
  const [isAlertActive, setIsAlertActive] = useState(() => {
  return localStorage.getItem("sudara_alert_status") === "active";
});
  const defaultMenuOptions = ["Biryanis", "Starters", "Breads", "Egg Items", "Sea Food", "Soups", "Noodles", "Gravys", "Rice", "Tiffins"];
  
  const allCategories = useMemo(() => {
    const uploadedCats = [...new Set((items || []).map(i => i.subCategory))].filter(Boolean);
    return [...new Set([...defaultMenuOptions, ...uploadedCats])];
  }, [items]);

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("owner"));
  if (!stored) {
    navigate("/owner");
    return;
  }

  // 🎯 ఇక్కడ fetchData ని కాల్ చేయాలి రాజు! అప్పుడే డేటా వస్తుంది, లోడింగ్ ఆగుతుంది.
  fetchData(stored._id); 

  // కనెక్ట్ అవ్వగానే రూమ్ జాయిన్ అవ్వడం
  const onConnect = () => {
    socket.emit("join_owner_room", stored._id);
  };

  const onNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    if (localStorage.getItem("sudara_alert_status") === "active") {
      const audio = new Audio("/order-beep.mp3");
      audio.play().catch(e => console.log("Sound error"));
    }
  };

  socket.on("connect", onConnect);
  socket.on("new_order_received", onNewOrder);

  socket.on("reconnect", () => {
    socket.emit("join_owner_room", stored._id);
  });

  socket.on("order_delayed", (data) => {
  setOrders((prev) => 
    prev.map((order) => 
      order._id === data.orderId 
        ? { ...order, scheduledStartTime: data.newTime, isDelayed: true } 
        : order
    )
  );
    const audio = new Audio("/delay-beep.mp3");
      audio.play().catch(e => console.log("Sound error"));
    });
  return () => {
    socket.off("connect", onConnect);
    socket.off("new_order_received", onNewOrder);
  };
}, []); // ఇక్కడ ఒకసారి మాత్రమే రన్ అవుతుంది

const fetchData = async (id) => {
  try {
    setLoading(true);
    const [oRes, iRes, ordRes] = await Promise.all([
      api.get(`/owner/${id}`).catch(() => ({ data: null })), // empty object బదులు null
      api.get(`/items/owner/${id}`).catch(() => ({ data: [] })),
      api.get(`/orders/restaurant/${id}`).catch(() => ({ data: [] }))
    ]);

    if (oRes.data) {
      setOwner(oRes.data);
      setTodayMsg(oRes.data.todaySpecial || "");
      setProfileForm({ ...oRes.data });
    }
    
    setItems(iRes.data || []);
    setOrders(ordRes.data || []);

  } catch (err) {
    console.error("General Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

  // --- Logic Functions (First Code Original) ---
  const optimizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image(); img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800; let w = img.width, h = img.height;
        if (w > MAX) { h *= MAX / w; w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/jpeg", 0.7)); 
      };
    };
  };

  // 📸 Restaurant Image Handler (New Feature)
  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) optimizeImage(file, (base64) => setProfileForm({ ...profileForm, hotelImage: base64 }));
  };

  const handleItemImage = (e) => {
    const file = e.target.files[0];
    if (file) optimizeImage(file, (base64) => setForm({ ...form, image: base64 }));
    e.target.value = ""; 
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setProfileForm(p => ({ ...p, latitude, longitude }));
        alert(`Location Locked! ✅`);
      }, null, { enableHighAccuracy: true });
    }
  };

  const handleUpdateSpecial = async () => {
    if (!todayMsg.trim()) return alert("Enter message!");
    setSending(true);
    try {
      const res = await api.put(`/owner/update-profile/${owner._id}`, { ...profileForm, todaySpecial: todayMsg, specialTimestamp: new Date() });
      setOwner(res.data);
      alert("Announcement Published! 🍲");
    } catch (err) { alert("Fail"); }
    finally { setSending(false); }
  };

  const toggleShopStatus = async () => {
    try {
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: !owner.isStoreOpen });
      setOwner(res.data);
      localStorage.setItem("owner", JSON.stringify(res.data));
    } catch (err) { alert("Status Update Failed"); }
  };
const updateOrderStatus = async (orderId, newStatus) => {
  // 🎯 ఒకవేళ పొరపాటున ఇక్కడ Served అని వస్తే, దాన్ని handleServed కి పంపేయాలి
  if (newStatus === "Served") {
    const order = orders.find(o => o._id === orderId);
    return handleServed(order);
  }

  try {
    await api.put(`/orders/update-status/${orderId}`, { status: newStatus });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  } catch (err) {
    alert("Status update failed! ❌");
  }
};
const handleServed = async (orderObj) => {
  if (!window.confirm("Mark as Served? Amount will be added to your permanent Sales Matrix.")) return;
  
  const d = new Date();
  const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  const foodUpdates = {};
  orderObj.items.forEach(itemString => {
    const itemName = itemString.includes(' x ') ? itemString.split(' x ')[1] : itemString;
    foodUpdates[`analytics.${dayKey}.food_clicks.${itemName}`] = 1;
  });

  try {
    // 🚀 Step 1: Revenue & Food Clicks అప్‌డేట్ ($inc తో)
    await api.put(`/owner/update-profile/${owner._id}`, {
      $inc: { 
        [`analytics.${dayKey}.daily_revenue`]: Number(orderObj.totalAmount),
        ...foodUpdates
      }
    });

    // 🚀 Step 2: Order Status ని 'Served' గా మార్చడం
    await api.put(`/orders/update-status/${orderObj._id}`, { status: "Served" });
    
    // 🚀 Step 3: UI నుండి కార్డుని తీసేయడం
    setOrders(prev => prev.filter(o => o._id !== orderObj._id));
    
    // 🚀 Step 4: లేటెస్ట్ రెవెన్యూ నంబర్ కోసం మళ్ళీ డేటా ఫెచ్ చేయడం
    await fetchData(owner._id); 
    
    alert("Sales Logged & Order Completed! ✅");
  } catch (err) { 
    console.error("Served Error:", err);
    alert("Action failed! Check Console."); 
  }
};

const filteredOrders = useMemo(() => {
  return orders.filter(order => {
    // 1. సెర్చ్ టర్మ్ ని క్లీన్ చేస్తున్నాం (స్పేస్ లు తీసేసి చిన్న అక్షరాల్లోకి మారుస్తాం)
    const s = searchTerm.toLowerCase().trim();

    // 2. ప్రతి ఫీల్డ్ ని సేఫ్ గా చెక్ చేస్తున్నాం (ఒకవేళ డేటా లేకపోయినా ఎర్రర్ రాకుండా)
    const nameMatch = (order.customerName || "").toLowerCase().includes(s);
    const txnMatch = (order.txnId || "").toLowerCase().includes(s);
    
    // 🎯 నువ్వు అడిగిన టైప్ మ్యాచ్ (Pre-book / Post-book అని సెర్చ్ చేయడానికి)
    const typeMatch = (order.orderType || "").toLowerCase().includes(s);
    
    // 🎯 SDR / TAB ఐడి కోసం సెర్చ్ లాజిక్
    const idMatch = (order.sudaraId || "").toLowerCase().includes(s); 

    // 3. ఇందులో ఏ ఒక్కటి మ్యాచ్ అయినా ఆ ఆర్డర్ కార్డు కనిపిస్తుంది
    return nameMatch || txnMatch || typeMatch || idMatch;
  });
}, [orders, searchTerm]);

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    const finalSub = form.subCategory === "Others" ? customSub : form.subCategory;
    setSending(true);
    try {
      const payload = { ...form, subCategory: finalSub, ownerId: owner._id };
      if (isEditingItem) {
        const res = await api.put(`/items/update/${editItemId}`, payload);
        setItems(prev => prev.map(it => it._id === editItemId ? res.data : it));
      } else {
        const res = await api.post("/items/add", payload);
        setItems(prev => [res.data, ...prev]);
      }
      setIsEditingItem(false); setIsAddingItem(false);
      setForm({ name: "", price: "", image: "", category: "Veg", subCategory: "Biryanis" });
      setCustomSub(""); setIsOtherSub(false);
      alert("Success! 🚀");
    } catch (err) { alert("Error!"); }
    finally { setSending(false); }
  };
const handleInteriorUploads = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setSending(true);
  try {
    const base64Images = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          optimizeImage(file, (base64) => resolve(base64));
        });
      })
    );

    // Backend లో నువ్వు రాసిన "/add-interior-images/:id" రూట్ కి డేటా పంపడం
    const res = await api.put(`/owner/add-interior-images/${owner._id}`, { 
      images: base64Images 
    });

    setOwner(res.data); // DB నుండి వచ్చిన అప్‌డేటెడ్ డేటాని సెట్ చేయడం
    setProfileForm({ ...res.data });
    alert("Interior Matrix Updated! 📸");
  } catch (err) {
    // console.error("Upload failed", err);
    alert("Upload Error");
  } finally {
    setSending(false);
  }
};
const removeInteriorImage = async (imageUrl) => {
  if (!window.confirm("Remove this image from interior?")) return;
  
  try {
    const res = await api.put(`/owner/remove-interior-image/${owner._id}`, { imageUrl });
    setOwner(res.data);
    setProfileForm({ ...res.data });
  } catch (err) {
    alert("Remove failed");
  }
};
  const getOwnerRangeStats = () => {
    if (!owner?.analytics) return { hits: 0, preOrders: 0, postOrders: 0, calls: 0, totalFoodClicks: 0 };
    const analyticsObj = owner.analytics instanceof Map ? Object.fromEntries(owner.analytics) : owner.analytics;
    let stats = { hits: 0, preOrders: 0, postOrders: 0, calls: 0, totalFoodClicks: 0 };
    let start = new Date(startDate); let end = new Date(endDate); let current = new Date(start);
    while (current <= end) {
      const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`; 
      const dayData = analyticsObj[dKey] || {};
      stats.hits += Number(dayData.kitchen_entry || 0);
      stats.preOrders += Number(dayData.pre_order_click || 0);
      stats.postOrders += Number(dayData.post_order_click || 0);
      stats.calls += Number(dayData.call_click || 0);
      current.setDate(current.getDate() + 1);
    }
    return stats;
  };

const downloadQRCode = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrCanvas = document.getElementById("qr-gen");
    
    canvas.width = 1200; 
    canvas.height = 1900; // కొంచెం హైట్ పెంచాను స్పేసింగ్ కోసం

    // 1. Background - Premium Dark
    ctx.fillStyle = "#0F172A"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Header Section
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

    // 3. Digital Menu Titles
    // 3. Hotel Name - Responsive Logic
    const hotelName = owner?.name?.toUpperCase() || "SUDARA HUB";
    
    // పేరు పొడవును బట్టి ఫాంట్ సైజు సెట్ చేయడం
    let fontSize = 90; 
    if (hotelName.length > 15) fontSize = 70;
    if (hotelName.length > 20) fontSize = 55;
    if (hotelName.length > 25) fontSize = 45;

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${fontSize}px sans-serif`; 
    
    // పేరు మరీ పెద్దదైతే పక్కలకు వెళ్లకుండా గరిష్టంగా 1000px వెడల్పులో ఫిట్ చేస్తుంది
    ctx.fillText(hotelName, canvas.width / 2, 230, 1000); 

    // Sub-title spacing
    ctx.fillStyle = "#FACC15"; 
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("PREMIUM DIGITAL MENU", canvas.width / 2, 320);

    // 4. QR Code Container (White Box)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 60;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(250, 480, 700, 700, 60); 
    ctx.fill();
    ctx.restore();

    // Draw QR Code
    ctx.drawImage(qrCanvas, 325, 555, 550, 550);

    // 5. Order Path Flow (New Feature)
    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 45px sans-serif";
    ctx.fillText("HOW TO ORDER", canvas.width / 2, 1280);

    // Path Logic: Scan > Select > Info > Order
    const pathText = "SCAN ➔ SELECT ITEMS ➔ POST-BOOK ➔ PLACE ORDER";
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText(pathText, canvas.width / 2, 1360);

    // 6. Professional Steps
    const steps = [
        "1. Open Camera or Scanner", 
        "2. Choose your favorite dishes", 
        "3. Enter details and tap 'Order'"
    ];

    ctx.font = "600 38px sans-serif";
    steps.forEach((text, i) => {
        const barY = 1430 + (i * 90);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.roundRect(200, barY, 800, 70, 15);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(text, canvas.width / 2, barY + 45);
    });

    // 7. Pre-book Message (New Feature)
    ctx.fillStyle = "#38BDF8"; // Light Blue
    ctx.font = "italic bold 32px sans-serif";
    ctx.fillText("💡 Try Pre-booking items before you arrive at our Restaurant!", canvas.width / 2, 1750);

    // 8. Footer Branding
    ctx.fillStyle = "#475569";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("POWERED BY SUDARA HUB • sudara.in", canvas.width / 2, 1840);

    // 9. Download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png", 1.0);
    link.download = `${owner?.name || "Hub"}_Poster.png`;
    link.click();
};

  const filteredItems = items.filter(i => {
    const s = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const c = categoryFilter === "All" || i.category === categoryFilter;
    const sc = subCategoryFilter === "All" || i.subCategory === subCategoryFilter;
    return s && c && sc;
  });


  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-slate-100 lg:hidden rounded-xl"><Menu className="w-6 h-6 text-slate-700" /></button>
            <div className="flex items-center gap-3">
              <img src={owner?.hotelImage || "https://via.placeholder.com/50"} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md" alt="Logo" />
              <div className="hidden sm:block">
                <h1 className="font-black text-xs uppercase italic tracking-tighter text-slate-900 leading-none">{owner?.name}</h1>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dashboard</p>
              </div>
            </div>
            {/* Tab Navigation Integration */}
            <div className="hidden md:flex items-center gap-6 border-l ml-6 pl-6">
           <button 
    onClick={() => setActiveTab("dashboard")} 
    className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
  >
    Menu
  </button>

  {/* Orders Tab */}
  <button 
    onClick={() => setActiveTab("live-orders")} 
    className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "live-orders" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-400 hover:text-slate-600"}`}
  >
    Orders ({orders.length})
  </button>

  {/* Sales Tab */}
  <button 
    onClick={() => setActiveTab("sales-report")} 
    className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "sales-report" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
  >
    Sales
  </button>
  <button 
    onClick={() => setActiveTab("profile")} 
    className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "profile" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
  >
    Login Details
  </button>

  
  
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => setIsShowingMatrix(true)} className="hidden lg:flex items-center gap-2 px-4 py-2 font-black uppercase italic text-[9px] text-blue-600"><BarChart3 className="w-4 h-4" /> Matrix</button>
            <button onClick={() => setIsEditingProfile(true)} className="hidden lg:flex items-center gap-2 px-4 py-2 font-black uppercase italic text-[9px] text-slate-600"><Settings className="w-4 h-4" /> Settings</button>
            <button onClick={toggleShopStatus} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border italic shadow-sm transition-all ${owner?.isStoreOpen ? 'bg-white border-red-200 text-red-500' : 'bg-emerald-500 border-emerald-600 text-white'}`}>
                {owner?.isStoreOpen ? 'End Service' : 'Go Live'}
            </button>
            <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="bg-slate-900 text-white p-2.5 rounded-xl active:scale-95 transition-all"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        
        {/* PAGE 1: MENU MANAGEMENT (Dashboard) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Special Section */}
            {/* <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Today's Special Entry..." value={todayMsg} onChange={e => setTodayMsg(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-400 shadow-inner" />
              <button onClick={handleUpdateSpecial} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Send className="w-4 h-4" /> {sending ? '...' : 'Publish'}</button>
            </section> */}

            {/* QR Poster Section (Original Design) */}
            <section className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="z-10 text-center md:text-left">
                <h3 className="text-xl md:text-3xl font-black uppercase italic text-white tracking-tighter mb-4">{owner?.name} <span className="text-blue-500">Poster</span></h3>
                <button onClick={downloadQRCode} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest flex items-center gap-3 shadow-xl active:scale-95 transition-all"><Download className="w-4 h-4" /> Download QR Poster</button>
              </div>
              <div className="relative p-4 bg-white rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={150} level="H" />
              </div>
            </section>
{/* ఒకవేళ యాక్టివేట్ అవ్వకపోతేనే ఈ బటన్ కనిపిస్తుంది */}
{!isAlertActive && (
  <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-200">
    <p className="text-xs font-bold text-orange-700 mb-2">
      ⚠️ ఆర్డర్ సౌండ్స్ రావాలంటే ఒక్కసారి యాక్టివేట్ చేయండి!
    </p>
    <button 
      onClick={() => {
        const a = new Audio("/order-beep.mp3");
        a.play().then(() => {
          a.pause();
          setIsAlertActive(true);
          localStorage.setItem("sudara_alert_status", "active");
          alert("Alerts Activated! 🚀");
        }).catch(() => alert("బ్రౌజర్ పర్మిషన్ ఇవ్వండి!"));
      }}
      className="bg-orange-600 text-white px-6 py-2 rounded-lg text-xs font-black"
    >
      ACTIVATE NOW
    </button>
  </div>
)}
            {/* Menu Header & Grid */}
            <section className="space-y-8">
              <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Kitchen<br/><span className="text-blue-600">Dashboard</span></h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search dish..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-[11px] font-bold outline-none shadow-sm" />
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                      {["All", "Veg", "Non-Veg"].map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setSubCategoryFilter("All")} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === "All" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border-slate-200"}`}>All Menu</button>
                    {allCategories.map(sub => (
                      <button key={sub} onClick={() => setSubCategoryFilter(sub)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === sub ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border-slate-200"}`}>{sub}</button>
                    ))}
                  </div>
                </div>
              </header>


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map(i => (
                  <div key={i._id} className={`bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-xl transition-all group ${!i.isAvailable && 'opacity-60'}`}>
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50">
                      <img src={i.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full border-2 border-white/50 backdrop-blur-md text-[8px] font-black uppercase text-white ${i.category === 'Veg' ? 'bg-emerald-500' : 'bg-red-500'}`}>{i.category}</div>
                    </div>
                    <div className="flex flex-col flex-1 px-1">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg mb-2 self-start italic">{i.subCategory}</span>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <h4 className="font-black uppercase text-xs text-slate-800 italic tracking-tight flex-1 leading-tight">{i.name}</h4>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">₹{i.price}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <button onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(items.map(it => it._id === i._id ? res.data : it)))} className={`py-3 rounded-2xl text-[8px] font-black uppercase border transition-all ${i.isAvailable ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-red-600 border-red-100 bg-red-50'}`}>{i.isAvailable ? 'Live' : 'Sold'}</button>
                        <button onClick={() => { setForm({ ...i }); setIsOtherSub(false); setEditItemId(i._id); setIsEditingItem(true); }} className="bg-slate-50 text-slate-600 py-3 rounded-2xl text-[8px] font-black uppercase border border-slate-100 transition-all">Edit</button>
                        <button onClick={async () => { if(window.confirm("Remove item?")) { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(it => it._id !== i._id)); } }} className="bg-red-50 text-red-500 py-3 rounded-2xl text-[8px] font-black uppercase border border-red-100"><Trash2 className="w-3 h-3 mx-auto"/></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsAddingItem(true)} className="aspect-square border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-500 bg-white shadow-sm transition-all"><Plus className="w-10 h-10"/><span className="font-black uppercase italic text-[10px]">Add Dish</span></button>
              </div>
            </section>
          </div>
        )}

{/* PAGE 2: LIVE ORDERS (Responsive Grid UI) */}
{activeTab === "live-orders" && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <h2 className="text-4xl font-black italic uppercase text-slate-900">
      Live<br/><span className="text-orange-500">Orders Feed</span>
    </h2>
    
    <div className="relative max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="text" 
        placeholder="Search by Name, Type (Pre/Post) or Txn ID..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-xs font-bold outline-none shadow-sm focus:border-orange-400 transition-all"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredOrders.length === 0 ? (
        <div className="col-span-full p-20 text-center text-slate-300 font-black uppercase italic bg-white rounded-[2.5rem] border border-dashed">
          {searchTerm ? "No matching results found ❌" : "No Active Orders"}
        </div>
      ) : (
        filteredOrders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all relative overflow-hidden">
            
            {/* 🏷️ NEW: Order Type Ribbon (Pre/Post Order/Express) */}
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase italic text-white ${order.orderType === 'Pre-Order' ? 'bg-purple-600' : order.orderType === 'Express-Route' ? 'bg-blue-600' : 'bg-orange-500'}`}>
              {order.orderType || 'Post-Order'}
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
  <div>
    <p className="font-black uppercase italic text-lg text-slate-900 leading-tight">
      {order.customerName}
    </p>
    {order.sudaraId && (
    <div className="mt-1 flex gap-2 items-center">
      <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded border border-blue-200 uppercase italic">
        ID: {order.sudaraId}
      </span>
      {/* ఆర్డర్ టైప్ ని బట్టి చిన్న ట్యాగ్ */}
      <span className="text-[8px] font-bold text-slate-400 uppercase italic">
        ({order.orderType})
      </span>
    </div>
  )}
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {new Date(order.createdAt).toLocaleTimeString()}
    </p>
    {order.orderType === "Pre-book" && (
    <p className="text-[10px] font-black text-orange-600 uppercase mt-1 italic">
      🚗 Coming in: {order.arrivalTime} Mins
    </p>
  )}
    {/* 🎯 Sudara ID ఇక్కడ యాడ్ చేస్తున్నాం రాజు */}
    {order.sudaraId && (
      <div className="mt-1">
        <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black px-2 py-0.5 rounded border border-yellow-200 uppercase italic">
          ID: {order.sudaraId}
        </span>
      </div>
    )}
  </div>

  <div className="bg-blue-50 px-4 py-2 rounded-2xl text-center">
    <p className="text-[8px] font-black text-blue-400 uppercase leading-none">Table</p>
    <p className="text-xl font-black text-blue-600 leading-none mt-1"># {order.tableNo || "PRE"}</p>
  </div>
</div>

              {/* Items List */}
              {/* 🎯 ఐటమ్స్ లిస్ట్ కి ఈ క్లాసెస్ యాడ్ చెయ్ రాజు */}
<div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-hide p-1">
  {order.items.map((it, idx) => (
    <span key={idx} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-slate-100 italic shrink-0">
      {it}
    </span>
  ))}
</div>

              {/* 🕒 EXPRESS ROUTE TIMER & DELAY ALERT */}
              {order.orderType === 'Express-Route' && (
                <div className={`mt-3 p-3 rounded-2xl border ${order.isDelayed ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${order.isDelayed ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <p className="text-[9px] font-black uppercase text-slate-500">
                      {order.isDelayed ? '⚠️ CUSTOMER DELAYED' : '🕒 EXPRESS START TIME'}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1 tracking-tight">
                    {new Date(order.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              )}

              {order.txnId && (
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mb-4 mt-4">
                  <p className="text-[8px] font-black text-emerald-400 uppercase">Transaction ID</p>
                  <p className="text-[10px] font-bold text-emerald-700 break-all">{order.txnId}</p>
                </div>
              )}
            </div>

{/* 🎯 రాజు, ఇక్కడ అమౌంట్ పక్కన ఉన్న పాత బటన్ తీసేసి ఈ కొత్త సెక్షన్ పెట్టు */}
<div className="pt-4 border-t border-slate-50 flex flex-col gap-4">
  
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Total Amount</p>
      <p className="text-2xl font-black text-slate-900 mt-1 tracking-tighter">₹{order.totalAmount}</p>
    </div>
    {/* స్టేటస్ ని బట్టి రంగు మారుతుంది */}
    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase italic ${order.status === 'Preparing' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
      {order.status || 'Pending'}
    </div>
  </div>

  <div className="flex gap-2">
    <button 
      onClick={() => updateOrderStatus(order._id, "Accepted")}
      className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-md active:scale-95 transition-all"
    >
      Accept
    </button>

    <button 
      onClick={() => updateOrderStatus(order._id, "Preparing")}
      className="flex-1 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-md active:scale-95 transition-all"
    >
      Preparing
    </button>

    <button 
  onClick={() => handleServed(order)}
  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all"
>
  Served ✅
</button>
  </div>
</div>

          </div>
        ))
      )}

    </div>
  </motion.div>
)}
{/* PAGE 4: OWNER PROFILE DETAILS */}
{activeTab === "profile" && (
  <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
    <h2 className="text-4xl font-black italic uppercase text-slate-900">
      Owner<br/><span className="text-purple-600">Profile Matrix</span>
    </h2>

<div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden w-full">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shrink-0 mx-auto sm:mx-0">
            <span className="text-xl">🛡️</span>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight italic">Sudara Trust & Verification</h4>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest">Active</span>
            </div>
            <p className="text-slate-400 text-[11px] md:text-xs mt-1 max-w-2xl font-medium leading-relaxed uppercase tracking-wider">
              Your establishment is officially verified within the Sudara Network. Download your official partner certificate to enhance merchant credibility and showcase community trust.
            </p>
          </div>
        </div>

        <button
          type="button"
onClick={() => {
  try {
    console.log("--- 🚀 SUDARA PREMIUM FRONTEND CERTIFICATE GENERATION ---");
    
    // 1. ఓనర్ డేటా వేరియబుల్స్ (డైనమిక్)
    const name = owner?.name || "SUDARA PARTNER";
    const district = owner?.district || "LOCAL";
    const state = owner?.state || "ANDHRA PRADESH";
    
    const certificateId = `SUDARA-2026-${(owner?._id || "HUBSOT").toString().slice(-6).toUpperCase()}`;
    const issueDate = owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    // 2. రాయల్ గోల్డ్ & బ్లూ మిక్స్డ్ ప్రొఫెషనల్ HTML డిజైన్
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;600;800&display=swap');
        
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
        
        /* మెయిన్ కంటైనర్ & రాయల్ బోర్డర్ */
        .container { width: 297mm; height: 210mm; padding: 14mm; box-sizing: border-box; position: relative; background: #ffffff; }
        .outer-border { width: 269mm; height: 182mm; border: 4px solid #1e3a8a; padding: 4mm; box-sizing: border-box; position: relative; }
        .inner-border { width: 100%; height: 100%; border: 2px solid #b45309; padding: 12mm; box-sizing: border-box; position: relative; text-align: center; background: #fafaf9; }
        
        /* కార్నర్ డెకరేషన్స్ */
        .corner { position: absolute; width: 16px; height: 16px; border: 4px solid #b45309; }
        .top-left { top: -4px; left: -4px; border-right: none; border-bottom: none; }
        .top-right { top: -4px; right: -4px; border-left: none; border-bottom: none; }
        .bottom-left { bottom: -4px; left: -4px; border-right: none; border-top: none; }
        .bottom-right { bottom: -4px; right: -4px; border-left: none; border-top: none; }
        
        /* బ్రాండింగ్ హెడర్ */
        .header .title { font-family: 'Cinzel', serif; font-size: 34pt; font-weight: 800; letter-spacing: 0.12em; color: #1e3a8a; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .header .subtitle { font-family: 'Montserrat', sans-serif; font-size: 8.5pt; font-weight: 800; letter-spacing: 0.45em; color: #b45309; text-transform: uppercase; margin: 3mm 0 0 0; }
        
        .cert-label { font-family: 'Montserrat', sans-serif; font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; color: #64748b; text-transform: uppercase; margin-top: 8mm; }
        .present { font-size: 12pt; font-style: italic; color: #475569; margin-top: 3mm; font-family: 'Georgia', serif; }
        
        /* ప్రొఫెషనల్ హబ్ నేమ్ */
        .hub-name { font-family: 'Cinzel', serif; font-size: 26pt; font-weight: 800; color: #1e1b4b; margin: 4mm auto; border-bottom: 2px dashed #cbd5e1; display: inline-block; padding-bottom: 2mm; min-width: 170mm; }
        
        .location { font-family: 'Montserrat', sans-serif; font-size: 9.5pt; font-weight: 700; color: #475569; text-transform: uppercase; tracking: 0.05em; margin-top: 1mm; }
        .location span { color: #1e3a8a; font-weight: 800; }
        
        /* లీగల్ టెక్స్ట్ */
        .desc { font-family: 'Montserrat', sans-serif; font-size: 10.5pt; line-height: 1.6; color: #334155; max-width: 215mm; margin: 6mm auto 0 auto; text-align: center; font-weight: 500; }
        
        /* ఫుటర్ ఏరియా */
        .footer { position: absolute; bottom: 12mm; width: 90%; left: 5%; }
        .meta { float: left; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8.5pt; color: #475569; line-height: 1.6; font-weight: 600; }
        .meta strong { color: #0f172a; }
        
        .badge { display: inline-block; text-align: center; margin-top: -4mm; }
        .badge-icon { font-size: 32pt; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1)); }
        .badge-text { font-family: 'Montserrat', sans-serif; font-size: 7.5pt; font-weight: 800; color: #1e3a8a; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1mm; }
        
        .sig-block { float: right; text-align: right; }
        .sig-stamp { font-family: 'Courier New', monospace; font-size: 13pt; font-weight: 900; color: #16a34a; margin-bottom: 1mm; font-style: italic; letter-spacing: -0.5px; background: rgba(22, 163, 74, 0.08); padding: 2px 8px; border: 1.5px dashed #16a34a; border-radius: 4px; display: inline-block; transform: rotate(-2deg); }
        .sig-line { width: 52mm; border-top: 1.5px solid #475569; margin: 3mm 0 2mm auto; }
        .sig-text { font-family: 'Montserrat', sans-serif; font-size: 8pt; color: #475569; line-height: 1.4; font-weight: 600; }
        .sig-text strong { color: #0f172a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="outer-border">
          <div class="inner-border">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>

            <div class="header">
              <div class="title">Sudara Hub</div>
              <div class="subtitle">Hyperlocal Discovery Network</div>
            </div>
            
            <div class="cert-label">Certificate of Excellence</div>
            <div class="present">This establishment is officially recognized and verified as an elite partner</div>
            
            <div class="hub-name">${name}</div>
            <div class="location">Region: <span>${district} District, ${state}</span></div>
            
            <div class="desc">
              This verification certifies that the aforementioned establishment has successfully integrated into the Sudara Network ecosystem. It has demonstrated unwavering compliance with premium quality benchmarks, live matrix synchronization protocols, real-time catalog accuracy, and local neighborhood dining service excellence.
            </div>
            
            <div class="footer">
              <div class="meta">
                <div style="width: 48mm; border-top: 1.5px solid #64748b; margin-bottom: 2.5mm;"></div>
                <strong>Certificate ID:</strong> ${certificateId}<br>
                <strong>Issue Date:</strong> ${issueDate}<br>
                <strong>Status:</strong> Active & Verified
              </div>
              
              <div class="badge">
                <div class="badge-icon">🛡️</div>
                <div class="badge-text">Verified Partner</div>
              </div>
              
              <div class="sig-block">
                <div class="sig-stamp">✓ OVT_Verified</div>
                <div class="sig-line"></div>
                <div class="sig-text">
                  <strong>Owner Verifying Team (OVT)</strong><br>
                  Sudara Trust & Safety Compliance
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    // 3. ఐఫ్రేమ్ మెకానిజం ద్వారా పక్కాగా ప్రింట్ చేయడం
    const oldFrame = document.getElementById('sudara-cert-iframe');
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'sudara-cert-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px'; 
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document || iframe.contentDocument;
    iframeDoc.open();
    iframeDoc.write(htmlContent); 
    iframeDoc.close();

    const checkAndPrint = () => {
      const isContentReady = iframeDoc.body && iframeDoc.body.innerHTML.trim().length > 0;
      if (isContentReady) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        setTimeout(checkAndPrint, 50);
      }
    };

    checkAndPrint();

  } catch (err) {
    console.error(err);
    alert("Something went wrong with local generation, Raju!");
  }
}}
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] active:scale-95 transition-all duration-300 shrink-0 flex items-center justify-center gap-2"
        >
          <span>Download Certificate</span>
          <span className="text-xs">⬇️</span>
        </button>
      </div>
    </div>

    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl"></div>

      {/* Profile Image & Name */}
      <div className="flex flex-col items-center gap-4 border-b pb-6">
        <img 
          src={owner?.hotelImage || "https://via.placeholder.com/150"} 
          className="w-24 h-24 rounded-[2rem] object-cover border-4 border-purple-50 shadow-lg" 
          alt="Owner"
        />
        <div className="text-center">
          <h3 className="text-2xl font-black uppercase italic text-slate-900">{owner?.name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Owner</p>
        </div>
      </div>

      {/* Credential Fields */}
      <div className="space-y-4">
        {/* Email Field */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registered Email</p>
          <p className="font-bold text-slate-700">{owner?.email}</p>
        </div>

        {/* Password Field - ఇక్కడ ఒక చిన్న ట్రిక్! */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Secret Access Key (Password)</p>
          <div className="flex justify-between items-center">
             <p className="font-bold text-slate-700 tracking-tighter">
               {/* పాస్‌వర్డ్ ని డైరెక్ట్ గా చూపించకుండా ఇలా పెడితే బాగుంటుంది రాజు */}
               ••••••••••••
             </p>
             <button 
               onClick={() => alert(`నీ పాస్‌వర్డ్: ${owner?.password}`)}
               className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-all"
             >
               See Password
             </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">Category</p>
          <p className="text-xs font-black uppercase italic text-slate-700">{owner?.category || 'General'}</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[8px] font-black text-slate-400 uppercase">Status</p>
          <p className="text-xs font-black uppercase italic text-emerald-600">Active Node</p>
        </div>
      </div>
    </div>

    {/* Security Note */}
    <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 flex items-center gap-4 text-purple-700">
      <ShieldCheck className="w-6 h-6 shrink-0" />
      <p className="text-[10px] font-black uppercase italic">Protocol: Keep your credentials confidential. SUDARA never asks for passwords via call.</p>
    </div>
  </div>
)}
        {/* PAGE 3: SALES REPORT */}
{activeTab === "sales-report" && (
   <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <h2 className="text-4xl font-black italic uppercase text-slate-900">Sales<br/><span className="text-emerald-500">Matrix</span></h2>
      
      {/* ఇక్కడ నుండి రీప్లేస్ చెయ్ రాజు 👇 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
{/* 1. రెవెన్యూ బాక్స్ */}
<div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
  <p className="text-[10px] font-black uppercase opacity-40 mb-2 italic tracking-widest">Revenue (Today)</p>
  <p className="text-6xl font-black italic tracking-tighter text-emerald-400">
    ₹{(() => {
      const d = new Date();
      const k1 = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const k2 = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

      const analytics = owner?.analytics || {};
      
      // 🚀 రాజు, ఇక్కడ మ్యాప్ ని ఆబ్జెక్ట్ గా మారుస్తున్నాం
      const dataObj = analytics instanceof Map ? Object.fromEntries(analytics) : analytics;
      
      const dayData = dataObj[k1] || dataObj[k2] || {};
      const final = dayData._doc || dayData;

      // 🎯 కన్సోల్ లో ప్రింట్ చేస్తున్నాం రాజు, Inspect లో చూడు!
      console.log("--- SUDARA DEBUG ---");
      console.log("Trying Keys:", { k1, k2 });
      console.log("Full Analytics Object:", dataObj);
      console.log("Found Data for Today:", final);
      console.log("Daily Revenue Value:", final?.daily_revenue);
      console.log("--------------------");

      return Number(final?.daily_revenue || 0);
    })()}
  </p>
  <BarChart3 className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 -rotate-12" />
</div>

        {/* 2. ట్రెండింగ్ డిష్ బాక్స్ */}
        <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase opacity-40 mb-2 italic tracking-widest">Trending Dish</p>
          <p className="text-2xl font-black italic uppercase leading-tight">
             {(() => {
                const dayKey = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
                // మ్యాప్ డేటా కోసం సేఫ్ చెక్
                const dayData = owner?.analytics instanceof Map ? owner.analytics.get(dayKey) : owner?.analytics?.[dayKey];
                const foodMap = dayData?.food_clicks || {};
                const top = Object.entries(foodMap).sort((a,b) => b[1]-a[1])[0];
                return top ? top[0] : "No Data Yet";
             })()}
          </p>
          <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 -rotate-12 fill-current" />
        </div>

        {/* 3. ఆర్డర్స్ కౌంట్ బాక్స్ */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic tracking-widest">Live Feed Count</p>
          <p className="text-6xl font-black italic tracking-tighter text-slate-900">{orders.length}</p>
        </div>

      </div>
      {/* ఇక్కడి వరకు 👆 */}

      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4 text-emerald-700">
        <ShieldCheck className="w-6 h-6 shrink-0" />
        <p className="text-[10px] font-black uppercase italic">Protocol: Data auto-purged every 15 days for speed optimization.</p>
      </div>
   </div>
)}
      </main>

      {/* MODALS - NO FEATURES REMOVED, RESTAURANT IMAGE ADDED */}
      <AnimatePresence>
        
        {/* MOBILE MENU */}
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col p-6 lg:hidden">
              <div className="flex justify-between items-center mb-10 border-b pb-4"><span className="font-black italic uppercase text-blue-600">Hub Menu</span><button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-6 h-6"/></button></div>
              <div className="flex flex-col gap-4">
                <button onClick={() => { setActiveTab("dashboard"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50'}`}><UtensilsCrossed className="w-5 h-5" /> Menu Management</button>
                <button onClick={() => { setActiveTab("live-orders"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'live-orders' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50'}`}><Bell className="w-5 h-5" /> Live Orders</button>
                <button onClick={() => { setActiveTab("sales-report"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'sales-report' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50'}`}><BarChart3 className="w-5 h-5" /> Sales Report</button>
                <button 
  onClick={() => { setActiveTab("profile"); setIsMenuOpen(false); }} 
  className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'bg-slate-50 text-slate-600'}`}
>
  <Settings className="w-5 h-5" /> Login Details & Verified Certificate
</button>
                <hr className="my-4" />
                <button onClick={() => { setIsMenuOpen(false); setIsShowingMatrix(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs"><BarChart3 className="w-5 h-5" /> Analytics Matrix</button>
                <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs border border-slate-100"><Settings className="w-5 h-5" /> Hub Settings</button>
                <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </motion.div>
          </>
        )}
{/* SETTINGS MODAL - FULL MATRIX CONFIGURATION */}
{isEditingProfile && (
  <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden">
      
      <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-xl font-black italic uppercase text-slate-900">Hub Configuration</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Profile Matrix</p>
        </div>
        <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
      </div>
      
      <form onSubmit={async (e) => { 
          e.preventDefault(); 
          setSending(true); 
          try { 
            const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); 
            setOwner(res.data); 
            localStorage.setItem("owner", JSON.stringify(res.data)); 
            setIsEditingProfile(false); 
            alert("Matrix Synchronized! ✅"); 
          } catch(e){ alert("Transmission Error"); } 
          finally { setSending(false); }
        }} 
        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide"
      >

        {/* 🖼️ INTERIOR & BANNER IMAGES SECTION */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 italic">Visual Assets (Banner & Interior)</label>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Banner Image */}
            <div className="relative flex-shrink-0">
              <img src={profileForm.hotelImage || "https://via.placeholder.com/150"} className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500" />
              <label className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg">
                <Camera className="w-3 h-3" /><input type="file" className="hidden" onChange={handleProfileImage} />
              </label>
              <p className="text-[8px] text-center mt-1 font-bold uppercase">Main Banner</p>
            </div>

            {/* Interior Images Display */}
            {profileForm.interiorImages?.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img src={img} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100" />
                <button type="button" onClick={() => {
                  const newImgs = profileForm.interiorImages.filter((_, i) => i !== idx);
                  setProfileForm({...profileForm, interiorImages: newImgs});
                }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3"/></button>
              </div>
            ))}
            
            {/* Add More Interior Button */}
            <label className="w-24 h-24 flex-shrink-0 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
              <Plus className="w-6 h-6 text-slate-400" />
              <span className="text-[7px] font-black uppercase mt-1">Add Interior</span>
              <input type="file" multiple className="hidden" onChange={handleInteriorUploads} />
            </label>
          </div>
        </div>

        {/* ⚡ STATUS & QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem]">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400">Hub Occupancy</label>
            <select value={profileForm.busyStatus} onChange={e=>setProfileForm({...profileForm, busyStatus: e.target.value})} className="w-full bg-white p-3 rounded-xl text-xs font-bold border outline-none">
              {['Low', 'Medium', 'High', 'Free', 'Normal', 'Busy'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400">Total Tables</label>
            <input type="number" value={profileForm.tableCount} onChange={e=>setProfileForm({...profileForm, tableCount: e.target.value})} className="w-full bg-white p-3 rounded-xl text-xs font-bold border outline-none" />
          </div>
        </div>

        {/* 📢 TODAY'S SPECIAL MESSAGE */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-blue-500 italic">🔥 Today's Special Broadcast</label>
          <input type="text" placeholder="E.g., Fresh Dum Biryani available now!" value={profileForm.todaySpecial} onChange={e=>setProfileForm({...profileForm, todaySpecial:e.target.value})} className="w-full bg-blue-50 p-4 rounded-2xl font-bold text-xs border border-blue-100 outline-none focus:bg-white" />
        </div>

        {/* 🏦 FINANCIAL NODE (UPI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400">UPI ID</label>
            <input type="text" placeholder="owner@okicici" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none" />
          </div> */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400">PhonePe/GPay Number</label>
            <input type="text" placeholder="9876543210" value={profileForm.upiNumber} onChange={e=>setProfileForm({...profileForm, upiNumber:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none" />
          </div>
        </div>

        {/* 📍 GEOLOCATION & ADDRESS */}
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={handleGetLocation} className="bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"><MapPin className="w-4 h-4" /> Sync GPS</button>
          <div className="flex bg-slate-100 p-1 rounded-2xl border">
            {['Veg', 'Non-Veg', 'Both'].map(t => (
              <button key={t} type="button" onClick={() => setProfileForm({...profileForm, foodType:t})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${profileForm.foodType===t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{t}</button>
            ))}
          </div>
        </div>

        <textarea placeholder="Specific Building Address / Landmark" value={profileForm.address} onChange={e=>setProfileForm({...profileForm, address:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border h-24 outline-none focus:bg-white" />
        
        <button disabled={sending} className="w-full bg-slate-900 py-6 text-white rounded-[2rem] font-black uppercase italic shadow-2xl tracking-[0.2em] active:scale-95 transition-all sticky bottom-0">
          {sending ? "Transmitting Matrix..." : "Commit Global Update"}
        </button>
      </form>
    </motion.div>
  </div>
)}

        {/* ANALYTICS MATRIX MODAL (Original Detailed Logic) */}
        {isShowingMatrix && (
          <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-5xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
              <button onClick={() => setIsShowingMatrix(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full active:scale-90"><X className="w-5 h-5"/></button>
              <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter mb-8 border-l-8 border-blue-600 pl-6">Hub Matrix</h3>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-6">
                <button onClick={() => setViewMode("daily")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "daily" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Today</button>
                <button onClick={() => setViewMode("range")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "range" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Range</button>
              </div>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewMode === "daily" ? (
                  <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                ) : (
                  <>
                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                    <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                  let stats = viewMode === "daily" ? {
                    hits: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.kitchen_entry || 0,
                    preOrders: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.pre_order_click || 0,
                    postOrders: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.post_order_click || 0,
                    calls: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.call_click || 0,
                  } : getOwnerRangeStats();
                  return [
                    { label: "Menu Hits", val: stats.hits, icon: Compass, color: "text-slate-500", bg: "bg-slate-100" },
                    { label: "Pre-Orders", val: stats.preOrders, icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-100" },
                    { label: "Post-Booking", val: stats.postOrders, icon: Bell, color: "text-orange-600", bg: "bg-orange-100" },
                    { label: "Calls Made", val: stats.calls, icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-100" },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 text-center hover:shadow-xl transition-all group">
                      <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><s.icon className="w-7 h-7"/></div>
                      <p className="text-[10px] font-black uppercase opacity-40 mb-2">{s.label}</p>
                      <p className="text-5xl font-black italic text-slate-900 tracking-tighter">{s.val}</p>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}

        {/* ADD/EDIT DISH MODAL (Original Logic) */}
        {(isAddingItem || isEditingItem) && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setIsAddingItem(false); setIsEditingItem(false); }} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full active:scale-90"><X className="w-5 h-5"/></button>
              <h3 className="text-xl font-black italic uppercase mb-8">{isEditingItem ? "Modify dish" : "Add to Kitchen"}</h3>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  {form.image ? <img src={form.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" /> : <ImageIcon className="text-slate-200 w-10 h-10"/>}
                  <label className="text-[10px] font-black bg-white border border-slate-200 px-5 py-2.5 rounded-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all">Upload Photo<input type="file" className="hidden" onChange={handleItemImage} accept="image/*" /></label>
                </div>
                <input type="text" placeholder="Dish Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border outline-none" required />
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border outline-none" required />
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["Veg", "Non-Veg"].map(c => <button key={c} type="button" onClick={()=>setForm({...form, category:c})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${form.category===c ? (c==='Veg'?'bg-emerald-500 text-white shadow-md':'bg-red-500 text-white shadow-md') : 'text-slate-400'}`}>{c}</button>)}
                </div>
                <select required value={form.subCategory} onChange={e => { setForm({...form, subCategory: e.target.value}); setIsOtherSub(e.target.value === "Others"); }} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border text-xs outline-none">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Others">+ Create New Category</option>
                </select>
                {isOtherSub && <input type="text" placeholder="Enter Category" value={customSub} onChange={e=>setCustomSub(e.target.value)} className="w-full bg-blue-50 border-blue-200 p-4 rounded-2xl font-bold text-xs" required />}
                <button disabled={sending} className="w-full bg-slate-900 py-5 text-white rounded-2xl font-black uppercase italic tracking-widest mt-4 shadow-xl active:scale-95 transition-all">{sending ? 'Publishing...' : 'Publish Item'}</button>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      <footer className="mt-auto border-t border-slate-200 bg-white p-8"><Footer /></footer>
    </div>
  );
}
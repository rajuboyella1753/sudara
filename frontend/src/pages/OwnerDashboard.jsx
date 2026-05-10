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

  const defaultMenuOptions = ["Biryanis", "Starters", "Breads", "Egg Items", "Sea Food", "Soups", "Noodles", "Gravys", "Rice", "Tiffins"];
  
  const allCategories = useMemo(() => {
    const uploadedCats = [...new Set((items || []).map(i => i.subCategory))].filter(Boolean);
    return [...new Set([...defaultMenuOptions, ...uploadedCats])];
  }, [items]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("owner"));
    if (!stored) { navigate("/owner"); return; }
    fetchData(stored._id);
  }, [navigate]);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const [oRes, iRes, ordRes] = await Promise.all([
        api.get(`/owner/${id}`),
        api.get(`/items/owner/${id}`),
        api.get(`/orders/restaurant/${id}`) // Order fetching integrated
      ]);
      
      const ownerData = oRes.data;
      setOwner(ownerData);
      console.log("Full Owner Data:", oRes.data); // 👈 ఇది పెట్టు రాజు, డేటా వస్తుందో లేదో తెలిసిపోద్ది
  console.log("Analytics Data:", oRes.data.analytics);
      setTodayMsg(ownerData.todaySpecial || "");
      setProfileForm({ ...ownerData });
      setItems(iRes.data);
      setOrders(ordRes.data || []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
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

const handleServed = async (orderObj) => {
  if (!window.confirm("Mark as Served? Amount will be added to your permanent Sales Matrix.")) return;
  
  const d = new Date();
  const dKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  // అమౌంట్ మరియు ఐటమ్ కౌంట్ అప్‌డేట్ చేసే ఆబ్జెక్ట్
  const analyticsUpdate = {
    [`analytics.${dKey}.daily_revenue`]: (owner.analytics?.[dKey]?.daily_revenue || 0) + orderObj.totalAmount,
  };

  // ఐటమ్స్ కౌంట్ పెంచడం (Trending Dish కోసం)
  orderObj.items.forEach(itemString => {
    // "1 X Chicken Biryani" నుండి పేరును మాత్రం తీసుకోవడం
    const itemName = itemString.includes(' X ') ? itemString.split(' X ')[1] : itemString;
    const currentCount = owner.analytics?.[dKey]?.food_clicks?.[itemName] || 0;
    analyticsUpdate[`analytics.${dKey}.food_clicks.${itemName}`] = currentCount + 1;
  });

  try {
    // 1. సేల్స్ డేటాని ఓనర్ అనలిటిక్స్ లో పర్మనెంట్ గా స్టోర్ చేయడం
    await api.put(`/owner/update-profile/${owner._id}`, analyticsUpdate);

    // 2. లైవ్ ఫీడ్ నుండి ఆర్డర్ ని డిలీట్ చేయడం
    await api.delete(`/orders/delete/${orderObj._id}`);
    
    // UI రిఫ్రెష్
    setOrders(prev => prev.filter(o => o._id !== orderObj._id));
    fetchData(owner._id); 
    alert("Order Completed & Sales Logged! ✅");
  } catch (err) { 
    console.error(err);
    alert("Action failed, please try again."); 
  }
};

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
    canvas.width = 1200; canvas.height = 1800;
    ctx.fillStyle = "#1E1B4B"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#312E81"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(canvas.width, 0); ctx.lineTo(canvas.width, 420); ctx.quadraticCurveTo(canvas.width/2, 520, 0, 420); ctx.fill();
    const hotelName = owner?.name?.toUpperCase() || "SUDARA RESTAURANT";
    ctx.font = "bold 100px Arial"; ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.fillText(hotelName, canvas.width / 2, 230);
    ctx.fillStyle = "#FACC15"; ctx.font = "bold 42px Arial"; ctx.fillText("SMART DIGITAL MENU", canvas.width / 2, 320);
    ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.roundRect(225, 520, 750, 750, 60); ctx.fill();
    ctx.drawImage(qrCanvas, 300, 595, 600, 600);
    ctx.fillStyle = "#FACC15"; ctx.font = "bold 55px Arial"; ctx.fillText("QUICK STEPS TO ORDER", canvas.width / 2, 1380);
    const steps = ["📱 SCAN QR CODE", "🍕 SELECT YOUR FOOD", "✅ SEND & ENJOY!"];
    ctx.font = "500 45px Arial"; ctx.fillStyle = "#FFFFFF";
    steps.forEach((text, i) => ctx.fillText(text, canvas.width / 2, 1480 + (i * 80)));
    ctx.globalAlpha = 0.6; ctx.fillText("POWERED BY SUDARA HUB", canvas.width / 2, 1780);
    const link = document.createElement("a"); link.href = canvas.toDataURL("image/png");
    link.download = `${owner?.name}_Poster.png`; link.click();
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
              <button onClick={() => setActiveTab("dashboard")} className={`text-[10px] font-black uppercase italic transition-all ${activeTab === "dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>Menu</button>
              <button onClick={() => setActiveTab("live-orders")} className={`text-[10px] font-black uppercase italic transition-all ${activeTab === "live-orders" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-400"}`}>Orders ({orders.length})</button>
              <button onClick={() => setActiveTab("sales-report")} className={`text-[10px] font-black uppercase italic transition-all ${activeTab === "sales-report" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400"}`}>Sales</button>
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
            <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Today's Special Entry..." value={todayMsg} onChange={e => setTodayMsg(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-400 shadow-inner" />
              <button onClick={handleUpdateSpecial} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Send className="w-4 h-4" /> {sending ? '...' : 'Publish'}</button>
            </section>

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
    <h2 className="text-4xl font-black italic uppercase text-slate-900">Live<br/><span className="text-orange-500">Orders Feed</span></h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.length === 0 ? (
        <div className="col-span-full p-20 text-center text-slate-300 font-black uppercase italic bg-white rounded-[2.5rem] border">No Active Orders</div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-black uppercase italic text-lg text-slate-900 leading-tight">{order.customerName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-blue-400 uppercase leading-none">Table</p>
                  <p className="text-xl font-black text-blue-600 leading-none mt-1"># {order.tableNo || "PRE"}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-wrap gap-2 mb-4">
                {order.items.map((it, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-slate-100 italic">
                    {it}
                  </span>
                ))}
              </div>

              {order.txnId && (
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mb-4">
                  <p className="text-[8px] font-black text-emerald-400 uppercase">Transaction ID</p>
                  <p className="text-[10px] font-bold text-emerald-700 break-all">{order.txnId}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Total Amount</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tighter">₹{order.totalAmount}</p>
              </div>
              <div className="flex gap-2">
                {/* <button onClick={() => window.open(`tel:${order.customerPhone}`)} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 transition-all"><PhoneCall className="w-5 h-5"/></button> */}
                <button onClick={() => handleServed(order)} className="bg-emerald-500 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase italic shadow-lg shadow-emerald-100 active:scale-95 transition-all">Served ✅</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </motion.div>
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
      const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      
      // 🚀 ఇక్కడ మ్యాజిక్: ఆబ్జెక్ట్ అయితే డైరెక్ట్ చూస్తుంది, మ్యాప్ అయితే .get() చేస్తుంది
      const dayData = owner?.analytics instanceof Map 
        ? owner.analytics.get(dayKey) 
        : owner?.analytics?.[dayKey];
        
      return dayData?.daily_revenue || 0;
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
                <hr className="my-4" />
                <button onClick={() => { setIsMenuOpen(false); setIsShowingMatrix(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs"><BarChart3 className="w-5 h-5" /> Analytics Matrix</button>
                <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs border border-slate-100"><Settings className="w-5 h-5" /> Hub Settings</button>
                <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </motion.div>
          </>
        )}

        {/* SETTINGS MODAL (Original Full Fields + Photo Upload Feature) */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div><h3 className="text-xl font-black italic uppercase text-slate-900">Hub Configuration</h3><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Profile Matrix</p></div>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
              </div>
              
              <form onSubmit={async (e) => { e.preventDefault(); setSending(true); try { const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); setOwner(res.data); localStorage.setItem("owner", JSON.stringify(res.data)); setIsEditingProfile(false); alert("Matrix Updated! ✅"); } catch(e){alert("Error")} finally {setSending(false)}} } className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide">
                 
                 {/* 📸 NEW: Restaurant Image Upload Section */}
                 <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="relative group">
                      <img src={profileForm.hotelImage || "https://via.placeholder.com/150"} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                        <Camera className="text-white w-8 h-8" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleProfileImage} />
                      </label>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 italic">Upload Restaurant Banner</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" placeholder="Hub Email" value={profileForm.email} onChange={e=>setProfileForm({...profileForm, email:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none focus:bg-white" required />
                    <input type="text" placeholder="Security Password" value={profileForm.password} onChange={e=>setProfileForm({...profileForm, password:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none focus:bg-white" required />
                    <input type="text" placeholder="Phone" value={profileForm.phone} onChange={e=>setProfileForm({...profileForm, phone:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none focus:bg-white" />
                    <input type="text" placeholder="WhatsApp" value={profileForm.whatsappNumber} onChange={e=>setProfileForm({...profileForm, whatsappNumber:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none focus:bg-white" />
                    {/* <input type="text" placeholder="UPI ID (e.g. user@ybl)" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="bg-blue-50 p-4 rounded-2xl font-black text-blue-600 text-xs border border-blue-200 col-span-2 uppercase outline-none" required /> */}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={handleGetLocation} className="w-full bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-95 transition-all"><MapPin className="w-4 h-4" /> Capture GPS</button>
                    <div className="flex bg-slate-100 p-1 rounded-2xl border">
                      {['Veg', 'Non-Veg', 'Both'].map(t => <button key={t} type="button" onClick={() => setProfileForm({...profileForm, foodType:t})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${profileForm.foodType===t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{t}</button>)}
                    </div>
                 </div>

                 <textarea placeholder="Specific Building Address / Landmark" value={profileForm.address} onChange={e=>setProfileForm({...profileForm, address:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border h-24 outline-none focus:bg-white" />
                 
                 <button disabled={sending} className="w-full bg-slate-900 py-6 text-white rounded-[2rem] font-black uppercase italic shadow-2xl tracking-[0.2em] active:scale-95 transition-all">
                   {sending ? "Transmitting..." : "Commit Matrix Updates"}
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
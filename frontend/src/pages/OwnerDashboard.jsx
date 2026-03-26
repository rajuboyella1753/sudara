import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { 
  Compass, UtensilsCrossed, Plus, Search, X, Bell, 
  Settings, LogOut, Image as ImageIcon, MapPin, 
  Menu, Power, Calendar, PhoneCall, BarChart3, Star, Send, QrCode, Download, Camera
} from "lucide-react"; 
import { QRCodeCanvas } from "qrcode.react";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);         
  const [isAddingItem, setIsAddingItem] = useState(false);     
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [isShowingMatrix, setIsShowingMatrix] = useState(false); 

  const [sending, setSending] = useState(false);
  const [todayMsg, setTodayMsg] = useState(""); 

  // Profile Form (All Model Fields Included)
const [profileForm, setProfileForm] = useState({ 
  name: "", 
  email: "", 
  password: "", 
  category: "", 
  phone: "", 
  whatsappNumber: "", 
  upiNumber: "", 
  upiID: "",
  state: "", 
  district: "", 
  collegeName: "",
  hotelImage: "",
  address: "",
  tableCount: 0,
  foodType: "Both",
  interiorImages: [],
  latitude: 0,
  longitude: 0
});

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All"); 
  const [subCategoryFilter, setSubCategoryFilter] = useState("All"); 
  const [editItemId, setEditItemId] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [form, setForm] = useState({ 
    name: "", price: "", discountPrice: "", image: "", category: "Veg", subCategory: "Biryanis" 
  });
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState("daily");

  const [isOtherSub, setIsOtherSub] = useState(false);
  const [customSub, setCustomSub] = useState("");

  // 1. Default Categories
  const defaultMenuOptions = ["Biryanis", "Starters", "Breads", "Egg Items", "Sea Food", "Soups", "Noodles", "Gravys", "Rice", "Tiffins"];
  
  // 🚀 2. మ్యాజిక్ లాజిక్: ఓనర్ అప్‌లోడ్ చేసిన కేటగిరీలు + డిఫాల్ట్ కేటగిరీలు = Full List
  const allCategories = useMemo(() => {
    const uploadedCats = [...new Set((items || []).map(i => i.subCategory))].filter(Boolean);
    // డిఫాల్ట్ వి మరియు ఓనర్ కొత్తగా యాడ్ చేసినవి కలిపేస్తున్నాం
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
    const [oRes, iRes] = await Promise.all([
      api.get(`/owner/${id}`),
      api.get(`/items/owner/${id}`) 
    ]);
    
    const ownerData = oRes.data;
    setOwner(ownerData);
    setTodayMsg(ownerData.todaySpecial || "");

    // 🚀 RAJU FIX 4: Fields unte display avthayi, lekapothe blank ga load avthayi
    setProfileForm({ 
      ...ownerData,
      email: ownerData.email || "",
      password: ownerData.password || "",
      whatsappNumber: ownerData.whatsappNumber || "", 
      upiNumber: ownerData.upiNumber || "",
      state: ownerData.state || "", 
      district: ownerData.district || "",
      collegeName: ownerData.collegeName || "",
      address: ownerData.address || ""
    });

    setItems(iRes.data); 
  } catch (err) { 
    console.error("Fetch Error:", err); 
  } finally { 
    setLoading(false); 
  }
};

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
      // Backend route /update-profile/:id ని వాడుతున్నాం
      const res = await api.put(`/owner/update-profile/${owner._id}`, { 
        ...profileForm, todaySpecial: todayMsg, specialTimestamp: new Date() 
      });
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
  
  let start = new Date(startDate);
  let end = new Date(endDate);
  let current = new Date(start);
  
  while (current <= end) {
    const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`; 
    const dayData = analyticsObj[dKey] || {};
    
    stats.hits += Number(dayData.kitchen_entry || 0);
    stats.preOrders += Number(dayData.pre_order_click || 0);
    stats.postOrders += Number(dayData.post_order_click || 0);
    stats.calls += Number(dayData.call_click || 0);
    
    // Food Clicks (Map) counting
    if (dayData.food_clicks) {
      const foodMap = dayData.food_clicks instanceof Map ? Object.fromEntries(dayData.food_clicks) : dayData.food_clicks;
      Object.values(foodMap).forEach(val => {
        stats.totalFoodClicks += Number(val || 0);
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  return stats;
};

const downloadQRCode = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const qrCanvas = document.getElementById("qr-gen");
  
  canvas.width = 1200; 
  canvas.height = 1800;

  // 1. MAIN BACKGROUND (Deep Indigo)
  ctx.fillStyle = "#1E1B4B"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. HEADER AREA
  ctx.fillStyle = "#312E81"; 
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, 420);
  ctx.quadraticCurveTo(canvas.width/2, 520, 0, 420);
  ctx.fill();

  // 3. RESTAURANT NAME (Dynamic Resizing)
  const hotelName = owner?.name?.toUpperCase() || "SUDARA RESTAURANT";
  let fontSize = 100;
  ctx.font = `bold ${fontSize}px Arial`;
  while (ctx.measureText(hotelName).width > (canvas.width - 100) && fontSize > 40) {
    fontSize -= 5;
    ctx.font = `bold ${fontSize}px Arial`;
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(hotelName, canvas.width / 2, 230);

  // Sub-header (Gold)
  ctx.fillStyle = "#FACC15"; 
  ctx.font = "bold 42px Arial";
  ctx.letterSpacing = "2px";
  ctx.fillText("SMART DIGITAL MENU", canvas.width / 2, 320);

  // 4. QR CODE SECTION
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(225, 520, 750, 750, 60);
  ctx.fill();
  ctx.drawImage(qrCanvas, 300, 595, 600, 600);

  // 5. INSTRUCTIONS HEADER
  ctx.fillStyle = "#FACC15"; 
  ctx.font = "bold 55px Arial";
  ctx.fillText("QUICK STEPS TO ORDER", canvas.width / 2, 1380);

  // 6. STEPS (Alignment)
  const steps = [
    "📱 SCAN QR CODE",
    "🍕 SELECT YOUR FOOD",
    "📝 NAME & TABLE NUMBER",
    "✅ SEND & ENJOY!"
  ];
  ctx.font = "500 45px Arial";
  ctx.fillStyle = "#FFFFFF";
  steps.forEach((text, i) => {
    ctx.fillText(text, canvas.width / 2, 1480 + (i * 80));
  });

  // 7. FOOTER BRANDING (Line position fixed here 👇)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(350, 1750); // Position pushed down to avoid overlap
  ctx.lineTo(850, 1750);
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 35px Arial";
  ctx.globalAlpha = 0.6;
  ctx.fillText("POWERED BY SUDARA HUB", canvas.width / 2, 1800); // Shifted text down too
  ctx.globalAlpha = 1.0;

  // Final Action
  const pngUrl = canvas.toDataURL("image/png");
  let link = document.createElement("a");
  link.href = pngUrl;
  link.download = `${owner?.name || 'Sudara'}_Menu_Poster.png`;
  link.click();
};

  const filteredItems = items.filter(i => {
    const s = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const c = categoryFilter === "All" || i.category === categoryFilter;
    const sc = subCategoryFilter === "All" || i.subCategory === subCategoryFilter;
    return s && c && sc;
  });

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-blue-600 font-black animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-slate-100 lg:hidden rounded-xl active:scale-90 transition-all">
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <div className="flex items-center gap-3">
              <img src={owner?.hotelImage || "https://via.placeholder.com/50"} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md" alt="Logo" />
              <div className="hidden sm:block">
                <h1 className="font-black text-xs uppercase italic tracking-tighter text-slate-900 leading-none">{owner?.name}</h1>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dashboard</p>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-3 mr-2">
                <button onClick={() => setIsShowingMatrix(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl font-black uppercase italic text-[9px] text-blue-600"><BarChart3 className="w-4 h-4" /> Matrix</button>
                <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl font-black uppercase italic text-[9px] text-slate-600"><Settings className="w-4 h-4" /> Settings</button>
            </div>
            <button onClick={toggleShopStatus} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border italic shadow-sm transition-all ${owner?.isStoreOpen ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'}`}>
                {owner?.isStoreOpen ? 'End Service' : 'Go Live'}
            </button>
            <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="bg-slate-900 text-white p-2.5 rounded-xl active:scale-95 transition-all"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
        
        {/* PUBLISH SPECIAL */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h3 className="text-xs font-black uppercase italic text-slate-700 tracking-tighter">Publish Today's Special</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Ex: Spl Chicken Fry Piece Biryani @ 199/- 🍲" value={todayMsg} onChange={e => setTodayMsg(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-400 transition-all shadow-inner" />
            <button onClick={handleUpdateSpecial} disabled={sending} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Updating...' : 'Publish Now'}
            </button>
          </div>
        </section>

        {/* QR SECTION */}
        <section className="bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="z-10 text-center md:text-left">
            <h3 className="text-xl md:text-3xl font-black uppercase italic text-white tracking-tighter mb-4">{owner?.name} <span className="text-blue-500">Poster</span></h3>
            <button onClick={downloadQRCode} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto md:mx-0"><Download className="w-4 h-4" /> Download QR Poster</button>
          </div>
          <div className="relative p-4 bg-white rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
            <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={150} level="H" />
          </div>
        </section>

        {/* INVENTORY & FILTERS */}
        <section className="space-y-8">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Kitchen<br/><span className="text-blue-600">Dashboard</span></h2>
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search dish..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400 shadow-sm" />
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  {["All", "Veg", "Non-Veg"].map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setSubCategoryFilter("All")} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === "All" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border-slate-200"}`}>All Menu</button>
                {/* 🚀 డైనమిక్ ఫిల్టర్లు: ఇక్కడ అన్ని కేటగిరీలు కనిపిస్తాయి */}
                {allCategories.map(sub => (
                  <button key={sub} onClick={() => setSubCategoryFilter(sub)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === sub ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border-slate-200"}`}>{sub}</button>
                ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredItems.map(i => (
              <div key={i._id} className={`bg-white p-5 rounded-[2.5rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-xl transition-all group ${!i.isAvailable && 'opacity-60'}`}>
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50">
                  <img src={i.image || "https://via.placeholder.com/400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                    <button onClick={() => { 
                      setForm({ ...i }); 
                      setIsOtherSub(false); 
                      setEditItemId(i._id); setIsEditingItem(true); 
                    }} className="bg-slate-50 text-slate-600 py-3 rounded-2xl text-[8px] font-black uppercase border border-slate-100 transition-all">Edit</button>
                    <button onClick={async () => { if(window.confirm("Remove item?")) { try { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(it => it._id !== i._id)); } catch(err) { alert("Fail"); } } }} className="bg-red-50 text-red-500 py-3 rounded-2xl text-[8px] font-black uppercase border border-red-100 transition-all">Del</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setIsAddingItem(true)} className="aspect-square border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-500 hover:border-blue-200 transition-all bg-white group shadow-sm">
              <Plus className="w-10 h-10" />
              <span className="font-black uppercase italic text-[10px]">Add Dish</span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. MODALS */}
      <AnimatePresence>
        
        {/* MOBILE MENU */}
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25 }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col p-6 lg:hidden">
              <div className="flex justify-between items-center mb-10 border-b pb-4">
                <span className="font-black italic uppercase text-blue-600">Hub Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-6 h-6"/></button>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => { setIsMenuOpen(false); setIsShowingMatrix(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs"><BarChart3 className="w-5 h-5" /> Analytics Matrix</button>
                <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs border border-slate-100"><Settings className="w-5 h-5" /> Hub Settings</button>
                <button onClick={() => { toggleShopStatus(); setIsMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl font-bold uppercase italic text-xs ${owner?.isStoreOpen ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}><Power className="w-5 h-5" /> {owner?.isStoreOpen ? 'End Service' : 'Go Live'}</button>
                <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </motion.div>
          </>
        )}

{isEditingProfile && (
  <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 20 }} 
      animate={{ scale: 1, opacity: 1, y: 0 }} 
      className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Hub Configuration</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Profile Matrix</p>
        </div>
        <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
          <X className="w-5 h-5"/>
        </button>
      </div>

{/* --- FORM BODY --- */}
<form 
  onSubmit={async (e) => { 
    e.preventDefault(); 
    setSending(true);
    try {
      const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); 
      
      if (res.data) {
        localStorage.setItem("owner", JSON.stringify(res.data));
        setOwner(res.data); 
        setProfileForm({ ...res.data }); 
        setIsEditingProfile(false); 
        alert("Matrix Updated! ✅"); 
      }
    } catch (err) {
      console.error("Update failed:", err);
      // Detailed error log check chey dashboard lo
      alert(err.response?.data?.message || "Network Error! ❌");
    } finally { 
      setSending(false); 
    }
  }}
  className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scrollbar-hide"
>
        
        {/* 📸 SECTION 1: VISUAL IDENTITY */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Visual Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-3 text-center">
               <img src={profileForm.hotelImage || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-2xl object-cover shadow-xl border-4 border-white" alt="Main" />
               <label className="text-[9px] font-black bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                 Change Main Photo
                 <input type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) optimizeImage(f, (b) => setProfileForm({...profileForm, hotelImage: b})); }} accept="image/*" />
               </label>
            </div>

            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
               <span className="text-[9px] font-black uppercase text-slate-400 block mb-3 italic">Ambience / Interior (Multiple)</span>
               <div className="flex flex-wrap gap-2">
                 {profileForm.interiorImages.map((img, idx) => (
                   <div key={idx} className="relative w-12 h-12">
                     <img src={img} className="w-full h-full object-cover rounded-lg border border-white shadow-sm" />
                     <button type="button" onClick={() => setProfileForm({...profileForm, interiorImages: profileForm.interiorImages.filter((_, i) => i !== idx)})} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"><X className="w-3 h-3"/></button>
                   </div>
                 ))}
                 <label className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer text-slate-300 hover:text-blue-500 hover:border-blue-400 transition-all">
                   <ImageIcon className="w-5 h-5" />
                   <input type="file" className="hidden" multiple onChange={(e) => { 
                     const files = Array.from(e.target.files);
                     files.forEach(f => optimizeImage(f, (b) => setProfileForm(p => ({...p, interiorImages: [...p.interiorImages, b]}))));
                   }} accept="image/*" />
                 </label>
               </div>
            </div>
          </div>
        </div>

        {/* 🔐 SECTION 2: ACCESS & CORE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Access Protocol</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Hub Email</label>
              <input type="email" value={profileForm.email} onChange={e=>setProfileForm({...profileForm, email:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 outline-none focus:bg-white focus:border-blue-400 transition-all text-xs" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Security Password</label>
              <input type="text" value={profileForm.password} onChange={e=>setProfileForm({...profileForm, password:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 outline-none focus:bg-white focus:border-blue-400 transition-all text-xs" required />
            </div>
          </div>
        </div>

        {/* 📞 SECTION 3: CONTACT & SETTLEMENT */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact & Settlement</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Phone (Calls)" value={profileForm.phone} onChange={e=>setProfileForm({...profileForm, phone:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none" />
            <input type="text" placeholder="WhatsApp Number" value={profileForm.whatsappNumber} onChange={e=>setProfileForm({...profileForm, whatsappNumber:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none" />
            <input type="text" placeholder="UPI Number (G-Pay/PhonePe)" value={profileForm.upiNumber} onChange={e=>setProfileForm({...profileForm, upiNumber:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none" />
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
            <QrCode className="w-6 h-6 text-blue-600 shrink-0" />
            <input type="text" placeholder="UPI VPA ID (e.g. user@ybl)" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="w-full bg-transparent font-black text-blue-600 text-xs outline-none uppercase placeholder:text-blue-200" required />
          </div>
        </div>

        {/* 📍 SECTION 4: REGIONAL MATRIX */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Regional Matrix</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" placeholder="State" value={profileForm.state} onChange={e=>setProfileForm({...profileForm, state:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none" />
            <input type="text" placeholder="District" value={profileForm.district} onChange={e=>setProfileForm({...profileForm, district:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none" />
            <input type="text" placeholder="Landmark / Area" value={profileForm.collegeName} onChange={e=>setProfileForm({...profileForm, collegeName:e.target.value})} className="bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none col-span-2 md:col-span-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {['Veg', 'Non-Veg', 'Both'].map((type) => (
                <button key={type} type="button" onClick={() => setProfileForm({ ...profileForm, foodType: type })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${profileForm.foodType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>{type}</button>
              ))}
            </div>
            <button type="button" onClick={handleGetLocation} className="w-full bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase italic flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-95 transition-all">
              <MapPin className="w-4 h-4" /> {profileForm.latitude !== 0 ? "Location Synchronized" : "Capture Hub GPS"}
            </button>
          </div>
          
          <textarea placeholder="Specific Building Address / Street Name" value={profileForm.address} onChange={e=>setProfileForm({...profileForm, address:e.target.value})} className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold border border-slate-200 text-xs h-24 outline-none focus:bg-white focus:border-blue-400 transition-all" />
        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="pt-4 sticky bottom-0 bg-white">
          <button disabled={sending} className="w-full bg-slate-900 py-6 text-white rounded-[2rem] font-black uppercase italic shadow-2xl active:scale-95 transition-all tracking-[0.2em] flex items-center justify-center gap-3">
            {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4"/>}
            {sending ? "Transmitting..." : "Commit Matrix Updates"}
          </button>
        </div>

      </form>
    </motion.div>
  </div>
)}

        {/* 🚀 ADD/EDIT DISH MODAL (Updated with Dynamic Dropdown) */}
        {(isAddingItem || isEditingItem) && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
             <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setIsAddingItem(false); setIsEditingItem(false); setForm({ name: "", price: "", image: "", subCategory: "Biryanis" }); setIsOtherSub(false); }} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full active:scale-90"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black italic uppercase mb-8">{isEditingItem ? "Modify dish" : "Add to Kitchen"}</h3>
              <form onSubmit={handleSubmitItem} className="space-y-5">
                <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  {form.image ? <img src={form.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" /> : <ImageIcon className="text-slate-200 w-10 h-10"/>}
                  <label className="text-[10px] font-black bg-white border border-slate-200 px-5 py-2.5 rounded-xl cursor-pointer">Upload Photo<input type="file" className="hidden" onChange={handleItemImage} accept="image/*" /></label>
                </div>
                <input type="text" placeholder="Dish Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 outline-none" required />
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 outline-none" required />
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {["Veg", "Non-Veg"].map(c => (
                    <button key={c} type="button" onClick={()=>setForm({...form, category:c})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${form.category===c ? (c==='Veg'?'bg-emerald-500 text-white shadow-md':'bg-red-500 text-white shadow-md') : 'text-slate-400'}`}>{c}</button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 italic">Category Choice *</label>
                  {/* 🚀 ఇక్కడ డైనమిక్ కేటగిరీలు కనిపిస్తాయి రాజు */}
                  <select required value={form.subCategory} onChange={e => { setForm({...form, subCategory: e.target.value}); setIsOtherSub(e.target.value === "Others"); }} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none">
                    {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="Others">+ Create New Category</option>
                  </select>
                  {isOtherSub && (
                    <motion.input initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} type="text" placeholder="Enter Category (e.g. Special Eggs)" value={customSub} onChange={e => setCustomSub(e.target.value)} className="w-full mt-3 bg-blue-50 border border-blue-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 shadow-inner" required />
                  )}
                </div>

                <button disabled={sending} className="w-full bg-slate-900 py-5 text-white rounded-2xl font-black uppercase italic active:scale-95 transition-all shadow-xl mt-4 tracking-widest">{sending ? 'Publishing...' : 'Publish Item'}</button>
              </form>
            </motion.div>
          </div>
        )}
        {/* ANALYTICS MATRIX MODAL */}
{isShowingMatrix && (
  <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-5xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative max-h-[90vh] overflow-y-auto">
      
      {/* CLOSE BUTTON */}
      <button onClick={() => setIsShowingMatrix(false)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 rounded-full active:scale-90"><X className="w-5 h-5" /></button>
      
      {/* RESPONSIVE TITLE */}
      <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter mb-8 border-l-8 border-blue-600 pl-4 sm:pl-6">Hub Matrix</h3>
      
      {/* MODE TABS */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-6">
        <button onClick={() => setViewMode("daily")} className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === "daily" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Today / Search Date</button>
        <button onClick={() => setViewMode("range")} className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === "range" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Range Report</button>
      </div>

      {/* 📅 DYNAMIC DATE SELECTORS: Raju, ikkada Daily ki kuda calendar add chesa */}
      <div className="mb-8 bg-slate-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100">
        {viewMode === "daily" ? (
          <div className="w-full">
            <label className="text-[10px] font-black uppercase opacity-40 block mb-1">Search Specific Date</label>
            <div className="flex items-center gap-3 bg-white p-2 sm:p-3 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-transparent font-bold text-xs outline-none w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 block mb-1">From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white p-2 sm:p-3 rounded-xl border border-slate-200 font-bold text-[10px] sm:text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 block mb-1">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white p-2 sm:p-3 rounded-xl border border-slate-200 font-bold text-[10px] sm:text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* CARDS GRID: 5 Cards showing all fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {(() => {
          let stats = { hits: 0, preOrders: 0, postOrders: 0, calls: 0, totalFoodClicks: 0 };
          const analyticsObj = owner?.analytics instanceof Map ? Object.fromEntries(owner.analytics) : (owner?.analytics || {});

          if (viewMode === "daily") {
            // Use filterDate for daily search
            const d = new Date(filterDate);
            const dKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const dayData = analyticsObj[dKey] || {};
            
            let foodSum = 0;
            if (dayData.food_clicks) {
              const foodMap = dayData.food_clicks instanceof Map ? Object.fromEntries(dayData.food_clicks) : dayData.food_clicks;
              Object.values(foodMap).forEach(v => foodSum += Number(v || 0));
            }

            stats = {
              hits: Number(dayData.kitchen_entry || 0),
              preOrders: Number(dayData.pre_order_click || 0),
              postOrders: Number(dayData.post_order_click || 0),
              calls: Number(dayData.call_click || 0),
              totalFoodClicks: foodSum
            };
          } else {
            stats = getOwnerRangeStats(); 
          }

          const cards = [
            { label: "Menu Hits", val: stats.hits, icon: Compass, color: "text-slate-500", bg: "bg-slate-100" },
            { label: "Pre-Orders", val: stats.preOrders, icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Post-Booking", val: stats.postOrders, icon: Bell, color: "text-orange-600", bg: "bg-orange-100" },
            { label: "Calls Made", val: stats.calls, icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-100" },
            // { label: "Total Food Clicks", val: stats.totalFoodClicks, icon: Star, color: "text-purple-600", bg: "bg-purple-100" }
          ];

          return cards.map((s, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${s.bg} rounded-xl sm:rounded-2xl flex items-center justify-center ${s.color} mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform`}><s.icon className="w-5 h-5 sm:w-7 sm:h-7" /></div>
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 sm:mb-2">{s.label}</p>
              <p className="text-4xl sm:text-6xl font-black italic text-slate-900 tracking-tighter">{s.val}</p>
            </div>
          ));
        })()}
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-slate-400 italic">* Report generated for: {owner?.name}</p>
    </motion.div>
  </div>
)}

      </AnimatePresence>

      <footer className="mt-auto border-t border-slate-200 bg-white p-8"><Footer /></footer>
    </div>
  );
}
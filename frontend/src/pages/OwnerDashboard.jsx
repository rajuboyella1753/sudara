import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { 
  Compass, UtensilsCrossed, Plus, Search, X, Bell, 
  Settings, LogOut, Image as ImageIcon, MapPin, 
  Menu, Power, Calendar, PhoneCall, BarChart3, Star, Send
} from "lucide-react"; 
import { QRCodeCanvas } from "qrcode.react"; // 🚀 QR కోడ్ కోసం
import { QrCode, Download, MessageSquare } from "lucide-react"; //  icons
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [dbColleges, setDbColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);         
  const [isBroadcasting, setIsBroadcasting] = useState(false); 
  const [isAddingItem, setIsAddingItem] = useState(false);     
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [isShowingMatrix, setIsShowingMatrix] = useState(false); 

  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);
  const [todayMsg, setTodayMsg] = useState(""); // 🚀 మెసేజ్ కోసం కొత్త స్టేట్

  const [profileForm, setProfileForm] = useState({ 
    name: "", phone: "", busyStatus: "Low", collegeName: "", hotelImage: "",
    latitude: null, longitude: null,
    interiorImages: [], upiQR: "",
    upiID: "",
    todaySpecial: "",
    tableCount: 0
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
    const [viewMode, setViewMode] = useState("daily"); // 🚀 'daily' లేదా 'range' మోడ్ కోసం
  const subCategories = ["Biryanis", "Starters", "Breads", "Sea Food", "Soups", "Noodles", "Gravys", "Rice", "Tiffins"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("owner"));
    if (!stored) { navigate("/owner"); return; }
    fetchData(stored._id);
    fetchColleges();
  }, [navigate]);

  const fetchColleges = async () => {
    try {
      const res = await api.get("/owner/colleges");
      setDbColleges(res.data || []);
    } catch (err) { console.error("Colleges fetch failed"); }
  };
const getOwnerRangeStats = () => {
  if (!owner?.analytics) return { hits: 0, orders: 0, calls: 0 };
  
  const analyticsObj = owner.analytics instanceof Map ? Object.fromEntries(owner.analytics) : owner.analytics;
  let stats = { hits: 0, orders: 0, calls: 0 };

  let start = new Date(startDate);
  let end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let current = new Date(start);
  while (current <= end) {
    // నీ DB ఫార్మాట్ '4/2/2026' కి తగ్గట్టుగా
    const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`; 
    const dayData = analyticsObj[dKey] || {};
    
    stats.hits += Number(dayData.kitchen_entry || 0);
    stats.orders += Number(dayData.pre_order_click || 0);
    stats.calls += Number(dayData.call_click || 0);

    current.setDate(current.getDate() + 1);
  }
  return stats;
};
  const fetchData = async (id) => {
    try {
      setLoading(true);
      const [oRes, iRes] = await Promise.all([
        api.get(`/owner/${id}`),
        api.get(`/items/owner/${id}`) 
      ]);
      const ownerData = oRes.data;
      setOwner(ownerData);
      setTodayMsg(ownerData.todaySpecial || ""); // 🚀 పాత మెసేజ్ లోడ్ చేస్తున్నాం
      setProfileForm({ 
        name: ownerData.name || "", phone: ownerData.phone || "",
        busyStatus: ownerData.busyStatus || "Low", collegeName: ownerData.collegeName || "",
        hotelImage: ownerData.hotelImage || "", latitude: ownerData.latitude || null,
        longitude: ownerData.longitude || null, interiorImages: ownerData.interiorImages || [],
        upiQR: ownerData.upiQR || "", upiID: ownerData.upiID || "",
        todaySpecial: ownerData.todaySpecial || ""
      });
      setItems(iRes.data); 
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    } finally { setLoading(false); }
  };
const downloadQRCode = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const qrCanvas = document.getElementById("qr-gen");

  canvas.width = 1200;
  canvas.height = 1600;

  // Background
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- మ్యాజిక్ ఇక్కడే ఉంది: Long Name Handling ---
  const name = owner?.name.toUpperCase() || "RESTAURANT";
  ctx.fillStyle = "#3B82F6";
  ctx.textAlign = "center";
  
  if (name.length > 20) {
    ctx.font = "bold italic 65px Arial"; // పేరు పెద్దగా ఉంటే ఫాంట్ సైజ్ తగ్గించాం
    const words = name.split(' ');
    let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
    ctx.fillText(line1, canvas.width / 2, 160);
    ctx.fillText(line2, canvas.width / 2, 240);
  } else {
    ctx.font = "bold italic 85px Arial";
    ctx.fillText(name, canvas.width / 2, 200);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "50px Arial";
  ctx.fillText("SMART DINING PROTOCOL", canvas.width / 2, 320);

  // White Box for QR
  ctx.fillStyle = "#FFFFFF";
  // RoundRect support లేని బ్రౌజర్‌ల కోసం బేసిక్ రెక్టాంగిల్ వాడదాం లేదా ఇలా:
  ctx.beginPath();
  ctx.roundRect(150, 420, 900, 900, 50);
  ctx.fill();

  ctx.drawImage(qrCanvas, 200, 470, 800, 800);

  // Footer text
  ctx.fillStyle = "#3B82F6";
  ctx.font = "black italic 70px Arial";
  ctx.fillText("SCAN • ORDER • ENJOY", canvas.width / 2, 1450);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "40px Arial";
  ctx.fillText("Instant WhatsApp Ordering via Sudara Hub", canvas.width / 2, 1530);

  const pngUrl = canvas.toDataURL("image/png");
  let downloadLink = document.createElement("a");
  downloadLink.href = pngUrl;
  downloadLink.download = `${owner?.name}_Smart_Menu.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
  // 🚀 మెసేజ్ అప్‌డేట్ చేసే ఫంక్షన్ రాజు!
 const handleUpdateSpecial = async () => {
  if (!todayMsg.trim()) return alert("Please enter a message!"); // ఖాళీగా ఉంటే పంపకూడదు రాజు
  try {
    setSending(true);
    // మెసేజ్ తో పాటు ప్రస్తుత టైమ్ ని కూడా పంపిస్తున్నాం
    const res = await api.put(`/owner/update-profile/${owner._id}`, { 
      ...profileForm, 
      todaySpecial: todayMsg,
      specialTimestamp: new Date() // 🚀 కొత్త టైమ్ సెట్ చేస్తున్నాం
    });
    
    setOwner(res.data);
    setTodayMsg(""); // ✅ ఇక్కడ మ్యాజిక్! మెసేజ్ పంపగానే బాక్స్ ఖాళీ అయిపోతుంది.
    alert("Today's Special Updated! 🍲");
  } catch (err) { 
    alert("Failed to update message"); 
  } finally { 
    setSending(false); 
  }
};

  const toggleShopStatus = async () => {
    try {
      const newStatus = !owner.isStoreOpen;
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: newStatus });
      setOwner(res.data);
      localStorage.setItem("owner", JSON.stringify(res.data));
    } catch (err) { alert("Failed to update status"); }
  };

const handleGetLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setProfileForm(prev => ({ ...prev, latitude, longitude }));
        alert(`Location Captured! ✅ \nLat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      },
      (err) => {
        console.error(err);
        alert("Location access denied! ❌ Please enable GPS in browser settings.");
      },
      { enableHighAccuracy: true }
    );
  }
};

  const optimizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500; 
        let width = img.width, height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL("image/jpeg", 0.6)); 
      };
    };
  };

  const handleItemImage = (e) => {
    const file = e.target.files[0];
    if (file) optimizeImage(file, (base64) => setForm({ ...form, image: base64 }));
    e.target.value = ""; 
  };

  const handleInteriorImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => optimizeImage(file, base64 => 
      setProfileForm(prev => ({ ...prev, interiorImages: [...prev.interiorImages, base64] }))));
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!form.subCategory) return alert("Please select a Category! ⚠️");
    setSending(true);
    try {
      if (isEditingItem) {
        const res = await api.put(`/items/update/${editItemId}`, form);
        setItems(items.map(item => item._id === editItemId ? res.data : item));
      } else {
        const res = await api.post("/items/add", { ...form, ownerId: owner._id });
        setItems([res.data, ...items]);
      }
      setForm(prev => ({ ...prev, name: "", price: "", image: "" }));
      setIsEditingItem(false); setIsAddingItem(false);
    } catch (err) { alert("Error saving item!"); }
    finally { setSending(false); }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === "All" || item.subCategory === subCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-blue-600 font-black animate-pulse text-2xl uppercase italic tracking-widest">Scanning Kitchen...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-blue-100">
      
      {/* 1. PREMIUM NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-slate-50 text-slate-600 lg:hidden rounded-xl border border-slate-100 active:scale-90 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={owner?.hotelImage || "https://via.placeholder.com/50"} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md" alt="Logo" />
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${owner?.isStoreOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-black text-sm uppercase italic tracking-tighter leading-none text-slate-900">{owner?.name}</h1>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Authorized Hub Partner</p>
              </div>
            </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-3 mr-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                <button onClick={() => setIsShowingMatrix(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl font-black uppercase italic text-[9px] transition-all text-blue-600 hover:shadow-sm"><BarChart3 className="w-3.5 h-3.5" /> Matrix</button>
                <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl font-black uppercase italic text-[9px] transition-all text-slate-600 hover:shadow-sm"><Settings className="w-3.5 h-3.5" /> Settings</button>
            </div>
            <button onClick={toggleShopStatus} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border italic transition-all shadow-sm ${owner?.isStoreOpen ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'}`}>
                {owner?.isStoreOpen ? 'End Service' : 'Go Live'}
            </button>
            <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="bg-slate-900 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-slate-200 active:scale-95"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      {/* 2. MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 lg:p-10 space-y-8">
        
        {/* 🚀 NEW: TODAY'S SPECIAL DIRECT INPUT BOX */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Star className="w-4 h-4 fill-orange-600" /></div>
            <h3 className="text-sm font-black uppercase italic text-slate-700 tracking-tighter">Publish Today's Special</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Ex: 10% Off on all Biryanis! (OR) Chicken Fry Piece Special @ 199/-" 
              value={todayMsg} 
              onChange={e => setTodayMsg(e.target.value)} 
              className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-orange-400 transition-all shadow-inner" 
            />
            <button 
              onClick={handleUpdateSpecial} 
              disabled={sending}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {sending ? 'Updating...' : 'Update Live'}
            </button>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-3 ml-2">* This message will be shown as a banner on your shop profile.</p>
        </section>
{/* 📱 PREMIUM SMART QR SECTION - UI Responsive Fix */}
<section className="bg-slate-900 p-5 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
  
  <div className="flex flex-col gap-3 md:gap-5 z-10 text-center md:text-left">
    <div className="flex items-center justify-center md:justify-start gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
        <QrCode className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Smart System</span>
    </div>
    
    <div className="max-w-xs md:max-w-md mx-auto md:mx-0">
      <h3 className="text-xl md:text-3xl font-black uppercase italic text-white tracking-tighter leading-tight">
        {owner?.name} <span className="text-blue-500">Menu QR</span>
      </h3>
      <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
        "Scan this and order" - Let your customers <br className="hidden md:block"/> order instantly via WhatsApp.
      </p>
    </div>

    <button 
      onClick={downloadQRCode}
      className="mt-2 flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 group"
    >
      <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> 
      Get Poster
    </button>
  </div>

  <div className="relative group shrink-0">
    <div className="p-4 bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
      <QRCodeCanvas
        id="qr-gen"
        value={`https://sudara.in/restaurant/${owner?._id}`}
        size={140} // మొబైల్ కోసం కొంచెం తగ్గించాం
        level={"H"}
        includeMargin={false}
      />
      <div className="mt-3 text-center">
        <p className="text-[8px] font-black uppercase text-slate-900 italic tracking-tighter">Scan to Order</p>
      </div>
    </div>
    <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-xl shadow-xl -rotate-12">
      <Star className="w-3 h-3 fill-white" />
    </div>
  </div>
</section>
        {/* --- MENU MANAGEMENT SECTION --- */}
        <section className="space-y-10">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-slate-900">
            <div>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-[0.02em] leading-[0.8] mb-4 text-slate-900">Owner<br/><span className="text-blue-600">Kitchen</span></h2>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${owner?.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{owner?.isStoreOpen ? 'Accepting Orders' : 'Offline'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="text" placeholder="Search your dishes..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400 shadow-sm transition-all" />
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
                  {["All", "Veg", "Non-Veg"].map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all shrink-0 ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setSubCategoryFilter("All")} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === "All" ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}>All Menu</button>
                {subCategories.map(sub => (
                  <button key={sub} onClick={() => setSubCategoryFilter(sub)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === sub ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"}`}>{sub}</button>
                ))}
              </div>
            </div>
          </header>

          {/* ITEM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredItems.map(i => (
              <div key={i._id} className={`bg-white p-5 rounded-[2.75rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-xl transition-all relative group ${!i.isAvailable && 'opacity-60'}`}>
                <div className="relative aspect-square rounded-[2.2rem] overflow-hidden bg-slate-50 border border-slate-100">
                  <img src={i.image || "https://via.placeholder.com/400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={i.name} />
                  <div className={`absolute top-5 left-5 px-3 py-1 rounded-full border-2 border-white/50 backdrop-blur-md text-[8px] font-black uppercase tracking-tighter text-white ${i.category === 'Veg' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {i.category}
                  </div>
                </div>
                <div className="flex flex-col flex-1 px-1">
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg mb-2 self-start italic">{i.subCategory || "General"}</span>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <h4 className="font-black uppercase text-xs text-slate-800 italic tracking-tight flex-1 leading-tight">{i.name}</h4>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{i.price}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <button onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(items.map(item => item._id === i._id ? res.data : item)))} className={`py-3 rounded-2xl text-[8px] font-black uppercase border transition-all ${i.isAvailable ? 'text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100' : 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'}`}>
                      {i.isAvailable ? 'Live' : 'Sold'}
                    </button>
                    <button onClick={() => { setForm({ name: i.name, price: i.price, discountPrice: i.discountPrice || "", image: i.image, category: i.category, subCategory: i.subCategory || "Biryanis"}); setEditItemId(i._id); setIsEditingItem(true); }} className="bg-slate-50 text-slate-600 py-3 rounded-2xl text-[8px] font-black uppercase border border-slate-100 hover:bg-slate-100 transition-all">Edit</button>
                    <button onClick={async () => { if(window.confirm("Remove this item?")) { try { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(item => item._id !== i._id)); } catch(err) { alert("Fail"); } } }} className="bg-red-50 text-red-500 py-3 rounded-2xl text-[8px] font-black uppercase border border-red-100 hover:bg-red-100 transition-all">Del</button>
                  </div>
                </div>
              </div>
            ))}
            
            <button onClick={() => setIsAddingItem(true)} className="aspect-square border-4 border-dashed border-slate-200 rounded-[2.75rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-500 hover:border-blue-200 transition-all bg-white group shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 transition-all border border-slate-100 shadow-inner"><Plus className="w-10 h-10 transition-transform group-hover:rotate-90" /></div>
              <span className="font-black uppercase italic text-[10px] tracking-widest text-slate-400 group-hover:text-blue-500">New Addition</span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. MODALS & POPUPS */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col p-6 lg:hidden overflow-y-auto">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <span className="font-black italic uppercase text-blue-600 text-lg tracking-tighter">Owner Hub</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setIsMenuOpen(false); setIsShowingMatrix(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs active:scale-95 transition-all">
                  <BarChart3 className="w-5 h-5" /> Analytics Matrix
                </button>
                <button onClick={() => { toggleShopStatus(); setIsMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl font-bold uppercase italic text-xs active:scale-95 transition-all ${owner?.isStoreOpen ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Power className="w-5 h-5" /> {owner?.isStoreOpen ? 'Close Service' : 'Start Service'}
                </button>
                <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs active:scale-95 border border-slate-100"><Settings className="w-5 h-5" /> Hub Settings</button>
                <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs active:scale-95"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </motion.div>
          </>
        )}

        {isShowingMatrix && (
  <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 text-slate-900">
    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-4xl p-6 sm:p-10 rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/20">
      <button onClick={() => setIsShowingMatrix(false)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 transition-all active:scale-90 shadow-sm"><X className="w-5 h-5" /></button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-l-4 border-blue-600 pl-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Hub Matrix</h3>
          {/* 🚀 View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit mt-4">
            <button onClick={() => setViewMode("daily")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>Today</button>
            <button onClick={() => setViewMode("range")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "range" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>Range Report</button>
          </div>
        </div>

        {/* 📅 కండిషనల్ డేట్ పిక్కర్స్ */}
        <div className="w-full md:w-auto">
          {viewMode === "daily" ? (
            <div className="flex items-center bg-slate-50 border border-slate-200 p-2.5 rounded-2xl shadow-inner">
              <Calendar className="w-4 h-4 text-blue-600 ml-2" />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none text-[12px] font-black outline-none px-4 cursor-pointer text-slate-700" />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-[8px] font-black text-slate-400">FROM</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer" />
              </div>
              <div className="flex items-center gap-1 px-2">
                <span className="text-[8px] font-black text-slate-400">TO</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {(() => {
          let statsData;
          if (viewMode === "daily") {
            const analyticsObj = owner?.analytics instanceof Map ? Object.fromEntries(owner.analytics) : (owner?.analytics || {});
            const d = new Date(filterDate);
            const dKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const dayEntry = analyticsObj[dKey] || {};
            statsData = { hits: dayEntry.kitchen_entry || 0, orders: dayEntry.pre_order_click || 0, calls: dayEntry.call_click || 0 };
          } else {
            statsData = getOwnerRangeStats();
          }

          const cards = [
            { label: viewMode === "daily" ? "Menu Hits Today" : "Total Restaurant Opened", value: statsData.hits, icon: Search, color: "text-slate-400", bg: "bg-slate-50" },
            { label: viewMode === "daily" ? "Pre-Orders Today" : "Total Pre-Books", value: statsData.orders, icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-50", border: "border-b-4 border-b-blue-600" },
            { label: viewMode === "daily" ? "Calls Today" : "Total Calls Made & ordered", value: statsData.calls, icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-b-4 border-b-emerald-600" }
          ];

          return cards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all ${s.border}`}>
              <div className="flex items-center gap-4 mb-4"><div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}><s.icon className="w-6 h-6" /></div><span className={`text-[11px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span></div>
              <p className="text-6xl font-black italic text-slate-900 leading-none">{s.value}</p>
            </motion.div>
          ));
        })()}
      </div>

      <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          * Viewing report for: <span className="text-blue-600">{owner?.name}</span>
        </p>
      </div>
    </motion.div>
  </div>
)}

        {/* HUB SETTINGS MODAL */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-900">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md p-8 rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-50">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              <h3 className="text-2xl font-black italic uppercase mb-8 border-l-4 border-blue-600 pl-4 tracking-tighter leading-none">Hub Settings</h3>
              <form onSubmit={async (e) => { e.preventDefault(); const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); setOwner(res.data); setIsEditingProfile(false); alert("Saved! ✅"); }} className="space-y-5">
                <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 transition-all hover:border-blue-300">
                  <img src={profileForm.hotelImage || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" />
                  <label className="text-[10px] font-black bg-blue-600 text-white px-5 py-2 rounded-xl cursor-pointer uppercase shadow-lg shadow-blue-100 active:scale-95 transition-all">Update Hub Logo <input type="file" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file) optimizeImage(file, (b) => setProfileForm({...profileForm, hotelImage: b})); }} accept="image/*" /></label>
                </div>
                <input type="text" placeholder="Hub Name" value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 focus:border-blue-500 outline-none transition-all shadow-inner" required />
                <input type="text" placeholder="UPI Protocol (e.g. pay@okaxis)" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-2xl font-bold border border-blue-100 text-blue-600 focus:border-blue-300 outline-none shadow-inner" required />
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between shadow-inner">
                   <span className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> GPS NODE</span>
                   <span className="text-[10px] font-bold text-emerald-600">{profileForm.latitude ? "LOCKED ✅" : "UNSET"}</span>
                   <button type="button" onClick={handleGetLocation} className="text-[9px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl active:scale-95 shadow-lg shadow-slate-200 transition-all">Sync</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map(lv => (
                    <button key={lv} type="button" onClick={()=>setProfileForm({...profileForm, busyStatus:lv})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${profileForm.busyStatus === lv ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-200'}`}>{lv}</button>
                  ))}
                </div>
                {/* 🪑 TABLE CONFIGURATION */}
<div className="space-y-1.5">
  <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic flex items-center gap-2">
    <UtensilsCrossed className="w-3 h-3"/> Total Tables in Restaurant
  </label>
  <select 
    value={profileForm.tableCount} 
    onChange={e => setProfileForm({...profileForm, tableCount: parseInt(e.target.value)})} 
    className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-200 text-xs outline-none focus:border-blue-500 transition-all shadow-inner cursor-pointer"
  >
    <option value="0">No Tables (Takeaway Only)</option>
    {[...Array(50)].map((_, i) => (
      <option key={i+1} value={i+1}>{i+1} Tables</option>
    ))}
  </select>
  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 ml-2">
    * This helps customers select their table number while ordering.
  </p>
</div>
                <button className="w-full bg-blue-600 py-5 text-white rounded-2xl font-black uppercase italic shadow-xl shadow-blue-100 active:scale-95 transition-all mt-4">Commit Changes</button>
              </form>
            </motion.div>
          </div>
        )}

        {(isAddingItem || isEditingItem) && (
          <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-900">
             <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-6 rounded-[2.5rem] shadow-2xl relative max-h-[85vh] overflow-y-auto pb-10 border border-slate-50">
              <button onClick={() => { setIsAddingItem(false); setIsEditingItem(false); setForm(prev => ({...prev, name: "", price: "", image: ""})); }} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full active:scale-90"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black italic uppercase mb-6">{isEditingItem ? "Update dish" : "Add dish"}</h3>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl bg-slate-50">
                  {form.image ? <img src={form.image} className="w-20 h-20 rounded-xl object-cover border border-slate-200" /> : <UtensilsCrossed className="text-slate-200 w-10 h-10"/>}
                  <label className="text-[10px] font-black bg-white border border-slate-200 px-4 py-2 rounded-lg cursor-pointer uppercase shadow-sm active:scale-95">Upload <input type="file" className="hidden" onChange={handleItemImage} accept="image/*" /></label>
                </div>
                <input type="text" placeholder="Dish Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border focus:border-blue-400 outline-none transition-all" required />
                <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border focus:border-blue-400 outline-none transition-all" required />
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  {["Veg", "Non-Veg"].map(c => (
                    <button key={c} type="button" onClick={()=>setForm({...form, category:c})} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${form.category===c ? (c==='Veg'?'bg-emerald-500 text-white shadow-md':'bg-red-500 text-white shadow-md') : 'text-slate-400'}`}>{c}</button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Menu Category *</label>
                  <select required value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border text-xs outline-none focus:border-blue-400 transition-all cursor-pointer">
                    {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button disabled={sending} className="w-full bg-slate-900 py-4 text-white rounded-xl font-black uppercase italic active:scale-95 transition-all shadow-xl shadow-slate-200 mt-2">{sending ? 'Publishing...' : 'Publish Item'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsAddingItem(true)} className="lg:hidden fixed bottom-10 right-6 w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200 flex items-center justify-center z-[55] border-4 border-white">
        <Plus className="w-8 h-8" />
      </motion.button>

      <footer className="mt-auto border-t border-slate-200 bg-white p-6 shadow-inner text-slate-900"><Footer /></footer>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { Compass, UtensilsCrossed, Plus, Search, X, Bell, Settings, LogOut, Image as ImageIcon, MapPin, Menu, Power } from "lucide-react"; 

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

  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  const [profileForm, setProfileForm] = useState({ 
    name: "", phone: "", busyStatus: "Low", collegeName: "", hotelImage: "",
    latitude: null, longitude: null,
    interiorImages: [], upiQR: "",
    upiID: "" 
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All"); 
  const [subCategoryFilter, setSubCategoryFilter] = useState("All"); 
  const [editItemId, setEditItemId] = useState(null);
  
  const [form, setForm] = useState({ 
    name: "", price: "", discountPrice: "", image: "", category: "Veg", subCategory: "Biryanis" 
  });

  const subCategories = ["Biryanis", "Starters", "Breads", "Sea Food", "Soups", "Noodles", "Gravys", "Rice"];

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

const fetchData = async (id) => {
    try {
      setLoading(true);
      
      // ✅ మ్యాజిక్ 1: Parallel fetching! ఓనర్ ని, ఐటమ్స్ ని ఒకేసారి లాగుతున్నాం.
      // ఐటమ్స్ కి మనం బ్యాకెండ్ లో రాసిన ఆ కొత్త రూట్ (/items/owner/${id}) వాడుతున్నాం.
      const [oRes, iRes] = await Promise.all([
        api.get(`/owner/${id}`),
        api.get(`/items/owner/${id}`) 
      ]);
      
      const ownerData = oRes.data;
      setOwner(ownerData);
      
      // ప్రొఫైల్ సెట్టింగ్స్ కోసం డేటా సెట్ చేయడం
      setProfileForm({ 
        name: ownerData.name || "", phone: ownerData.phone || "",
        busyStatus: ownerData.busyStatus || "Low", collegeName: ownerData.collegeName || "",
        hotelImage: ownerData.hotelImage || "", latitude: ownerData.latitude || null,
        longitude: ownerData.longitude || null, interiorImages: ownerData.interiorImages || [],
        upiQR: ownerData.upiQR || "", upiID: ownerData.upiID || "" 
      });

      // ✅ మ్యాజిక్ 2: ఇక ఫిల్టర్ అవసరం లేదు! 
      // బ్యాకెండ్ నుండే కేవలం ఈ ఓనర్ ఐటమ్స్ మాత్రమే వస్తాయి.
      setItems(iRes.data); 
      
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
      alert("Something went wrong while fetching data!");
    } finally { 
      setLoading(false); 
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
          alert(`Location Captured! ✅ Now click 'Save Profile'.`);
        },
        (err) => alert("Please enable location access.")
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
      setForm(prev => ({ ...prev, name: "", price: "", discountPrice: "", image: "" }));
      setIsEditingItem(false); setIsAddingItem(false);
    } catch (err) { alert("Error saving item!"); }
    finally { setSending(false); }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.title || !broadcastMsg.body) return alert("Title and Body are required! 📢");
    try {
      setSending(true);
      const res = await api.post("/owner/broadcast-to-all", broadcastMsg);
      if (res.data.success) {
        alert(`🚀 Broadcast Success! Sent to ${res.data.sentCount} customers.`);
        setBroadcastMsg({ title: "", body: "" });
        setIsBroadcasting(false);
      }
    } catch (err) { alert("Broadcast failed!"); }
    finally { setSending(false); }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === "All" || item.subCategory === subCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-blue-600 font-black animate-pulse text-2xl uppercase italic">Scanning Kitchen...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans overflow-x-hidden text-sm">
      
      {/* 1. TOP NAVBAR */}
      <nav className="bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-slate-800 lg:hidden active:scale-90 transition-transform">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={owner?.hotelImage || "https://via.placeholder.com/50"} className="w-8 h-8 rounded-lg object-cover" alt="Logo" />
              <h1 className="font-black text-sm sm:text-base uppercase italic tracking-tighter leading-none">{owner?.name}</h1>
            </div>
        </div>
        <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => setIsBroadcasting(true)} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl font-bold uppercase italic text-[10px]"><Bell className="w-4 h-4" /> Announce</button>
            <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl font-bold uppercase italic text-[10px]"><Settings className="w-4 h-4" /> Settings</button>
            
            {/* Desktop Status Button */}
            <button onClick={toggleShopStatus} className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border italic transition-all ${owner?.isStoreOpen ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'}`}>
                {owner?.isStoreOpen ? 'Close Shop' : 'Open Shop'}
            </button>
            
            <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="bg-red-50 text-red-500 p-2 rounded-xl"><LogOut className="w-4 h-4" /></button>
        </div>
        
        {/* Mobile Status Button */}
        <button onClick={toggleShopStatus} className={`lg:hidden text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all ${owner?.isStoreOpen ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-500 border-green-100'}`}>
          {owner?.isStoreOpen ? 'CLOSE' : 'OPEN'}
        </button>
      </nav>

      {/* 2. POPUPS & MODALS */}
      <AnimatePresence>
        {/* MOBILE MENU DRAWER */}
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col p-6 lg:hidden">
              <div className="flex justify-between items-center mb-8">
                <span className="font-black italic uppercase text-blue-600 text-lg">Hub Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="flex flex-col gap-3">
                {/* Mobile Shop Toggle */}
                <button onClick={() => { toggleShopStatus(); setIsMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl font-bold uppercase italic text-xs active:scale-95 transition-all ${owner?.isStoreOpen ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  <Power className="w-5 h-5" /> {owner?.isStoreOpen ? 'Close Shop Now' : 'Open Shop Now'}
                </button>
                
                <button onClick={() => { setIsMenuOpen(false); setIsBroadcasting(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs active:scale-95"><Bell className="w-5 h-5" /> Push alert</button>
                <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs active:scale-95"><Settings className="w-5 h-5" /> Shop Settings</button>
                <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs active:scale-95"><LogOut className="w-5 h-5" /> Logout Account</button>
              </div>
            </motion.div>
          </>
        )}

        {/* SHOP SETTINGS POPUP */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              <h3 className="text-xl font-black italic uppercase mb-6">Shop Settings</h3>
              <form onSubmit={async (e) => { e.preventDefault(); const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); setOwner(res.data); setIsEditingProfile(false); alert("Saved! ✅"); }} className="space-y-4">
                
                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl bg-slate-50">
                  <img src={profileForm.hotelImage || "https://via.placeholder.com/100"} className="w-16 h-16 rounded-xl object-cover border" />
                  <label className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg cursor-pointer uppercase">Change Logo <input type="file" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file) optimizeImage(file, (b) => setProfileForm({...profileForm, hotelImage: b})); }} accept="image/*" /></label>
                </div>

                <input type="text" placeholder="Hotel Name" value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border" required />
                <input type="text" placeholder="UPI ID (name@okaxis)" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="w-full bg-blue-50 p-3.5 rounded-xl font-bold border border-blue-100 text-blue-600" required />

                <div className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1"><MapPin className="w-3 h-3"/> GPS Location</span>
                   <span className="text-[10px] font-bold">{profileForm.latitude ? "CAPTURED ✅" : "NOT SET"}</span>
                   <button type="button" onClick={handleGetLocation} className="text-[9px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg active:scale-95">Capture</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 italic">Interior Gallery</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {profileForm.interiorImages.map((img, idx) => (
                      <div key={idx} className="relative shrink-0 w-14 h-14">
                        <img src={img} className="w-full h-full rounded-lg object-cover" />
                        <button type="button" onClick={()=>setProfileForm(p=>({...p, interiorImages:p.interiorImages.filter((_,i)=>i!==idx)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                    <label className="shrink-0 w-14 h-14 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 cursor-pointer active:scale-95"><Plus className="text-slate-300 w-4 h-4"/><input type="file" className="hidden" multiple onChange={handleInteriorImages} accept="image/*" /></label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map(lv => (
                    <button key={lv} type="button" onClick={()=>setProfileForm({...profileForm, busyStatus:lv})} className={`py-3 rounded-xl text-[9px] font-black uppercase border ${profileForm.busyStatus === lv ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>{lv}</button>
                  ))}
                </div>
                
                {/* Popup Status Toggle */}
                <button type="button" onClick={toggleShopStatus} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] border transition-all ${owner?.isStoreOpen ? 'bg-red-50 text-red-500 border-red-200' : 'bg-green-50 text-green-500 border-green-200'}`}>
                  {owner?.isStoreOpen ? 'Close Shop Now' : 'Open Shop Now'}
                </button>

                <button className="w-full bg-blue-600 py-4 text-white rounded-xl font-black uppercase italic shadow-lg active:scale-95">Save Profile</button>
              </form>
            </motion.div>
          </div>
        )}
        
        {/* BROADCAST MODAL */}
        {isBroadcasting && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-6 rounded-[2.5rem] shadow-2xl relative">
              <button onClick={() => setIsBroadcasting(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              <h2 className="text-xl font-black italic uppercase mb-4">Broadcast</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Offer Title" value={broadcastMsg.title} onChange={(e)=>setBroadcastMsg({...broadcastMsg, title:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border" />
                <textarea placeholder="Message Body" value={broadcastMsg.body} onChange={(e)=>setBroadcastMsg({...broadcastMsg, body:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border h-24 resize-none"></textarea>
                <button onClick={sendBroadcast} disabled={sending} className="w-full bg-blue-600 py-4 text-white rounded-xl font-black uppercase italic active:scale-95 transition-all">{sending ? 'Sending...' : 'Alert Users 🚀'}</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ADD/EDIT DISH MODAL */}
        {(isAddingItem || isEditingItem) && (
          <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-6 rounded-[2rem] shadow-2xl relative max-h-[85vh] overflow-y-auto pb-20">
              <button onClick={() => { setIsAddingItem(false); setIsEditingItem(false); setForm(prev => ({...prev, name: "", price: "", image: ""})); }} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full active:scale-90"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black italic uppercase mb-6">{isEditingItem ? "Update dish" : "Add dish"}</h3>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-2xl bg-slate-50">
                  {form.image ? <img src={form.image} className="w-16 h-16 rounded-xl object-cover" /> : <UtensilsCrossed className="text-slate-200"/>}
                  <label className="text-[10px] font-black bg-white border px-3 py-1.5 rounded-lg cursor-pointer uppercase">Upload <input type="file" className="hidden" onChange={handleItemImage} accept="image/*" /></label>
                </div>
                <input type="text" placeholder="Dish Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border" required />
                <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border" required />
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["Veg", "Non-Veg"].map(c => (
                    <button key={c} type="button" onClick={()=>setForm({...form, category:c})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${form.category===c ? (c==='Veg'?'bg-green-500 text-white shadow-md':'bg-red-500 text-white shadow-md') : 'text-slate-400'}`}>{c}</button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-1">Menu Category *</label>
                  <select required value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} className="w-full bg-slate-50 p-3.5 rounded-xl font-bold border text-xs outline-none focus:border-blue-600 transition-all">
                    {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button disabled={sending} className="w-full bg-slate-900 py-4 text-white rounded-xl font-black uppercase italic active:scale-95 transition-all">{sending ? 'Publishing...' : 'Publish'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${owner?.isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">{owner?.isStoreOpen ? 'Live Hub' : 'Offline'}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85]">Kitchen<br/>Menu</h2>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input type="text" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-white border p-3 pl-10 rounded-xl text-xs font-bold outline-none shadow-sm" /></div>
                    <div className="flex bg-white p-1 rounded-xl border shadow-sm overflow-x-auto scrollbar-hide">
                        {["All", "Veg", "Non-Veg"].map(cat => (<button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{cat}</button>))}
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button onClick={() => setSubCategoryFilter("All")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === "All" ? "bg-blue-600 text-white" : "bg-white text-slate-400 border-slate-100"}`}>All Menu</button>
                    {subCategories.map(sub => (<button key={sub} onClick={() => setSubCategoryFilter(sub)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shrink-0 transition-all ${subCategoryFilter === sub ? "bg-blue-600 text-white" : "bg-white text-slate-400 border-slate-100"}`}>{sub}</button>))}
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(i => (
              <div key={i._id} className={`bg-white p-4 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 shadow-sm relative ${!i.isAvailable && 'opacity-60 grayscale'}`}>
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50"><img src={i.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} className="w-full h-full object-cover" alt={i.name} /><div className={`absolute top-4 left-4 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white ${i.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}><div className="w-1 h-1 rounded-full bg-white"></div></div></div>
                <div className="flex flex-col flex-1">
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md mb-1 self-start italic">{i.subCategory || "General"}</span>
                    <div className="flex justify-between items-start mb-3"><h4 className="font-black uppercase text-[11px] text-slate-900 italic tracking-tight flex-1 leading-tight">{i.name}</h4><span className="text-xl font-black text-blue-600 italic">₹{i.price}</span></div>
                    <div className="grid grid-cols-3 gap-1.5 mt-auto">
                        <button onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(items.map(item => item._id === i._id ? res.data : item)))} className={`py-2 rounded-xl text-[8px] font-black uppercase border ${i.isAvailable ? 'text-green-600 border-green-100 bg-green-50' : 'text-red-600 border-red-100 bg-red-50'}`}>{i.isAvailable ? 'LIVE' : 'SOLD'}</button>
                        <button onClick={() => { setForm({ name: i.name, price: i.price, discountPrice: i.discountPrice || "", image: i.image, category: i.category, subCategory: i.subCategory || "Biryanis"}); setEditItemId(i._id); setIsEditingItem(true); }} className="bg-slate-50 text-slate-600 py-2 rounded-xl text-[8px] font-black uppercase border border-slate-100 shadow-sm">EDIT</button>
                        <button onClick={async () => { if(window.confirm("Remove?")) { try { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(item => item._id !== i._id)); } catch(err) { alert("Fail"); } } }} className="bg-red-50 text-red-500 py-2 rounded-xl text-[8px] font-black uppercase border border-red-100 shadow-sm">DEL</button>
                    </div>
                </div>
              </div>
            ))}
            <button onClick={() => setIsAddingItem(true)} className="hidden lg:flex aspect-square border-4 border-dashed border-slate-100 rounded-[3rem] flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-500 transition-all bg-white group"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-all"><Plus className="w-8 h-8" /></div><span className="font-black uppercase italic text-[10px] tracking-widest">New Dish</span></button>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsAddingItem(true)} className="lg:hidden fixed bottom-10 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[55] border-4 border-white"><Plus className="w-7 h-7" /></motion.button>
      <footer className="mt-auto border-t border-slate-100 bg-white p-4"><Footer /></footer>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
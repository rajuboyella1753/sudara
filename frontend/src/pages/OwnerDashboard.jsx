import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { ShieldCheck, Compass, UtensilsCrossed, Plus, Search } from "lucide-react"; 

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [dbColleges, setDbColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    name: "", phone: "", busyStatus: "Low", collegeName: "", hotelImage: "",
    latitude: null, longitude: null,
    interiorImages: [], upiQR: "" 
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  
  const [form, setForm] = useState({
    name: "", price: "", discountPrice: "", image: "", category: "Veg"
  });

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
      const oRes = await api.get(`/owner/${id}`);
      const ownerData = oRes.data;
      setOwner(ownerData);
      
      // ✅ FIX: Ensuring no value is undefined or null to prevent "controlled to uncontrolled" warning
      setProfileForm({ 
        name: ownerData.name || "", 
        phone: ownerData.phone || "",
        busyStatus: ownerData.busyStatus || "Low",
        collegeName: ownerData.collegeName || "",
        hotelImage: ownerData.hotelImage || "",
        latitude: ownerData.latitude || null,
        longitude: ownerData.longitude || null,
        interiorImages: ownerData.interiorImages || [],
        upiQR: ownerData.upiQR || ""
      });

      const iRes = await api.get("/items/all");
      setItems(iRes.data.filter(i => (i.ownerId?._id || i.ownerId) === id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const toggleShopStatus = async () => {
    try {
      const newStatus = !owner.isStoreOpen;
      const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: newStatus });
      setOwner(res.data);
      localStorage.setItem("owner", JSON.stringify(res.data));
    } catch (err) { alert("Failed to update status"); }
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

  const handleHotelProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) optimizeImage(file, (base64) => setProfileForm({ ...profileForm, hotelImage: base64 }));
    e.target.value = ""; 
  };

  const handleInteriorImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => optimizeImage(file, base64 => 
      setProfileForm(prev => ({ ...prev, interiorImages: [...prev.interiorImages, base64] }))));
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) optimizeImage(file, base64 => setProfileForm({ ...profileForm, upiQR: base64 }));
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    try {
      if (isEditingItem) {
        const res = await api.put(`/items/update/${editItemId}`, form);
        setItems(items.map(item => item._id === editItemId ? res.data : item));
      } else {
        const res = await api.post("/items/add", { ...form, ownerId: owner._id });
        setItems([res.data, ...items]);
      }
      setForm({ name: "", price: "", discountPrice: "", image: "", category: "Veg" });
      setIsEditingItem(false); setEditItemId(null);
    } catch (err) { alert("Error saving item!"); }
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-blue-600 font-black animate-pulse text-2xl md:text-4xl italic tracking-tighter uppercase">Scanning Kitchen...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans overflow-x-hidden text-sm">
      
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900">Shop Settings</h2>
                   <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-red-500 font-bold text-[10px] tracking-widest uppercase">CLOSE</button>
                </div>
                <form onSubmit={async (e) => {
                   e.preventDefault();
                   try {
                     const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm);
                     setOwner(res.data);
                     localStorage.setItem("owner", JSON.stringify(res.data));
                     setIsEditingProfile(false);
                     alert("Settings Updated! ✅");
                   } catch(err) { alert("Update failed"); }
                }} className="space-y-5">
                  
                  <div className="flex flex-col items-center gap-3 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    {profileForm.hotelImage ? (
                      <img src={profileForm.hotelImage} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-600 shadow-md" alt="Hotel" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[8px] font-black text-slate-300 text-center uppercase px-4 leading-tight">No Photo</div>
                    )}
                    <label className="text-[9px] font-black bg-white border border-slate-200 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 italic shadow-sm transition-all">
                      CHANGE LOGO
                      <input type="file" className="hidden" onChange={handleHotelProfileImage} accept="image/*" />
                    </label>
                  </div>

                  <input type="text" value={profileForm.name || ""} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Shop Name" />
                  
                  <select value={profileForm.collegeName || ""} onChange={e => setProfileForm({...profileForm, collegeName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold outline-none appearance-none text-slate-700 shadow-sm">
                    {dbColleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between shadow-sm">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-blue-600">Live Location</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {profileForm.latitude ? `Set (${profileForm.latitude.toFixed(2)}) ✅` : "Not Set ❌"}
                        </span>
                     </div>
                     <button type="button" onClick={handleGetLocation} className="text-[9px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition-all">GET GPS</button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-black uppercase text-slate-400 italic">QR Code & Gallery</label>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <label className="shrink-0 w-16 h-16 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-blue-50 transition-all">
                          {profileForm.upiQR ? <img src={profileForm.upiQR} className="w-full h-full rounded-2xl object-cover" alt="QR" /> : <span className="text-[7px] font-black text-slate-400 uppercase">QR</span>}
                          <input type="file" className="hidden" onChange={handleQRUpload} accept="image/*" />
                        </label>
                        {profileForm.interiorImages.map((img, idx) => (
                          <div key={idx} className="relative shrink-0 w-16 h-16">
                            <img src={img} className="w-full h-full rounded-2xl object-cover border border-slate-100 shadow-sm" alt="Interior" />
                            <button type="button" onClick={() => setProfileForm(p => ({...p, interiorImages: p.interiorImages.filter((_, i) => i !== idx)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow-md">×</button>
                          </div>
                        ))}
                        <label className="shrink-0 w-16 h-16 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100">
                          <span className="text-xl text-slate-300">+</span>
                          <input type="file" className="hidden" multiple onChange={handleInteriorImages} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Low", "Medium", "High"].map(level => (
                      <button key={level} type="button" onClick={() => setProfileForm({...profileForm, busyStatus: level})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${profileForm.busyStatus === level ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'border-slate-200 text-slate-400 bg-white'}`}>{level}</button>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase italic tracking-widest text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Save Profile</button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <img src={owner?.hotelImage ? owner.hotelImage : "https://via.placeholder.com/50"} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-md" alt="Hotel Logo" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${owner?.isStoreOpen ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                <h1 className="font-black text-lg md:text-xl uppercase italic tracking-tighter leading-none text-slate-900">{owner?.name}</h1>
              </div>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">{owner?.collegeName} | Rush: {owner?.busyStatus}</span>
            </div>
          </div>
          <button onClick={toggleShopStatus} className={`md:hidden text-[8px] font-black uppercase px-3 py-2 rounded-lg border italic ${owner?.isStoreOpen ? 'border-red-500 text-red-500 bg-red-50' : 'border-green-500 text-green-500 bg-green-50'}`}>
            {owner?.isStoreOpen ? 'Close' : 'Open'}
          </button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={toggleShopStatus} className={`hidden md:block text-[9px] font-black uppercase px-4 py-2 rounded-lg border italic transition-all ${owner?.isStoreOpen ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'}`}>
            {owner?.isStoreOpen ? 'Close Shop' : 'Open Shop'}
          </button>
          <button onClick={() => setIsEditingProfile(true)} className="flex-1 md:flex-none bg-slate-50 text-[9px] font-black text-slate-600 uppercase px-4 py-2 rounded-lg border border-slate-200 italic hover:bg-slate-100 shadow-sm transition-all">Settings</button>
          <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="flex-1 md:flex-none bg-red-500 text-[9px] font-black uppercase px-4 py-2 rounded-lg italic text-white shadow-md active:scale-95 transition-all">Logout</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[380px] bg-slate-50 p-4 sm:p-6 flex flex-col gap-6 border-b lg:border-r border-slate-100 overflow-y-auto shrink-0 scrollbar-hide lg:h-[calc(100vh-80px)]">
          <div className={`p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-300 shadow-sm ${isEditingItem ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
            <h3 className="text-[10px] font-black uppercase text-blue-600 mb-6 italic tracking-widest">
              {isEditingItem ? "✨ Update Live Item" : "🍲 Add New Dish"}
            </h3>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="flex flex-col items-center gap-2 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                {form.image ? <img src={form.image} className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-white" alt="Preview" /> : <div className="text-[8px] font-black text-slate-300 italic uppercase">Dish Image</div>}
                <label className="text-[8px] font-black bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-pointer uppercase hover:bg-slate-50 shadow-sm transition-all">
                  UPLOAD <input type="file" className="hidden" onChange={handleItemImage} accept="image/*" />
                </label>
              </div>
              <input type="text" placeholder="DISH NAME" value={form.name || ""} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="PRICE" value={form.price || ""} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" required />
                <input type="number" placeholder="OFFER PRICE" value={form.discountPrice || ""} onChange={e=>setForm({...form, discountPrice:e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button type="button" onClick={() => setForm({...form, category: "Veg"})} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase transition-all ${form.category === 'Veg' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400'}`}>Veg</button>
                <button type="button" onClick={() => setForm({...form, category: "Non-Veg"})} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase transition-all ${form.category === 'Non-Veg' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400'}`}>Non-Veg</button>
              </div>
              <button className={`w-full py-4 text-white rounded-xl font-black uppercase italic tracking-widest text-[11px] transition-all shadow-lg active:scale-95 ${isEditingItem ? 'bg-slate-900 shadow-slate-200' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'}`}>
                {isEditingItem ? 'Update Live Dish' : 'Publish Dish'}
              </button>
              {isEditingItem && (
                <button type="button" onClick={() => { setIsEditingItem(false); setForm({name:"", price:"", discountPrice:"", image:"", category:"Veg"}); }} className="w-full py-2 text-[8px] font-bold uppercase text-slate-400 hover:text-red-500 transition-colors">Cancel Edit</button>
              )}
            </form>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-white scroll-smooth lg:h-[calc(100vh-80px)]">
          <div className="mb-6 sm:mb-8 flex flex-col gap-6 sticky top-0 bg-white z-40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-slate-900">Kitchen Menu</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="text" placeholder="Search dish..." value={searchTerm || ""} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-3.5 pl-10 rounded-2xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map(i => (
              <div key={i._id} className={`group bg-white p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 flex flex-col gap-5 transition-all hover:border-blue-200 hover:shadow-xl shadow-sm ${!i.isAvailable && 'opacity-50 grayscale bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <img src={i.image ? i.image : "https://via.placeholder.com/150"} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] object-cover shrink-0 shadow-sm border border-slate-50" alt={i.name} />
                    <div className="min-w-0">
                      <h4 className="font-black uppercase text-[10px] sm:text-xs text-slate-900 italic truncate">{i.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg sm:text-xl font-black text-blue-600 italic">₹{i.discountPrice || i.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center shrink-0 ${i.category === 'Veg' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i.category === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                   <button 
                     onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(items.map(item => item._id === i._id ? res.data : item)))} 
                     className={`py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase border italic transition-all shadow-sm ${i.isAvailable ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'}`}>
                    {i.isAvailable ? 'Live' : 'Sold Out'}
                   </button>
                   <button onClick={() => { setForm({ name:i.name, price:i.price, discountPrice:i.discountPrice, image:i.image, category:i.category }); setEditItemId(i._id); setIsEditingItem(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="bg-slate-50 text-slate-600 py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase italic border border-slate-200 hover:bg-slate-100 shadow-sm transition-all">Edit</button>
                   <button onClick={async () => { if(window.confirm("Delete this dish?")) { try { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(item => item._id !== i._id)); } catch(err) { alert("Delete failed"); } } }} className="bg-red-50 text-red-500 py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase italic border border-red-100 hover:bg-red-100 shadow-sm transition-all">Del</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-slate-100 bg-white relative z-50 p-4">
        <Footer />
      </footer>

      <style>{`
        main {
          scrollbar-gutter: stable;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
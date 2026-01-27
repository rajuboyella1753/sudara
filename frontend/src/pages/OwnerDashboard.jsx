import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

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
      setDbColleges(res.data);
    } catch (err) { console.error("Colleges fetch failed"); }
  };

  const fetchData = async (id) => {
    try {
      const oRes = await api.get(`/owner/${id}`);
      setOwner(oRes.data);
      setProfileForm({ 
        ...oRes.data, 
        busyStatus: oRes.data.busyStatus || "Low",
        collegeName: oRes.data.collegeName || "",
        hotelImage: oRes.data.hotelImage || "",
        interiorImages: oRes.data.interiorImages || [],
        upiQR: oRes.data.upiQR || ""
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

  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black animate-pulse text-2xl md:text-4xl italic tracking-tighter">SUDARA LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans overflow-x-hidden text-sm">
      
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] w-full max-w-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-indigo-500/20 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Shop Settings</h2>
                   <button onClick={() => setIsEditingProfile(false)} className="text-slate-500 hover:text-white font-bold text-[10px] tracking-widest uppercase">CLOSE</button>
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
                  
                  <div className="flex flex-col items-center gap-3 p-4 border border-dashed border-indigo-500/20 rounded-2xl bg-black/20">
                    {/* 1. Hotel Logo Update ✅ */}
                    {profileForm.hotelImage ? (
                      <img src={profileForm.hotelImage ? profileForm.hotelImage : null} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-500" alt="Hotel" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-700 text-center uppercase px-4 leading-tight">No Photo</div>
                    )}
                    <label className="text-[9px] font-black bg-white/5 border border-indigo-500/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 italic">
                      CHANGE LOGO
                      <input type="file" className="hidden" onChange={handleHotelProfileImage} accept="image/*" />
                    </label>
                  </div>

                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl font-bold outline-none focus:border-blue-500" placeholder="Shop Name" />
                  
                  <select value={profileForm.collegeName} onChange={e => setProfileForm({...profileForm, collegeName: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl font-bold outline-none">
                    {dbColleges.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                  </select>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-blue-500">Live Location</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {profileForm.latitude ? `Set (${profileForm.latitude.toFixed(2)}) ✅` : "Not Set ❌"}
                        </span>
                     </div>
                     <button type="button" onClick={handleGetLocation} className="text-[9px] font-black bg-blue-500/20 text-blue-500 px-3 py-1.5 rounded-lg border border-blue-500/30">GET GPS</button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-black uppercase text-indigo-400 italic">QR Code & Gallery</label>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <label className="shrink-0 w-16 h-16 border-2 border-dashed border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center bg-indigo-500/5 cursor-pointer">
                          {/* 2. UPI QR Update ✅ */}
                          {profileForm.upiQR ? <img src={profileForm.upiQR ? profileForm.upiQR : null} className="w-full h-full rounded-2xl object-cover" alt="QR" /> : <span className="text-[7px] font-black text-indigo-500">QR</span>}
                          <input type="file" className="hidden" onChange={handleQRUpload} accept="image/*" />
                        </label>
                        {/* 3. Interior Gallery Images ✅ */}
                        {profileForm.interiorImages.map((img, idx) => (
                          <div key={idx} className="relative shrink-0 w-16 h-16">
                            <img src={img ? img : null} className="w-full h-full rounded-2xl object-cover border border-white/10" alt="Interior" />
                            <button type="button" onClick={() => setProfileForm(p => ({...p, interiorImages: p.interiorImages.filter((_, i) => i !== idx)}))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[8px]">×</button>
                          </div>
                        ))}
                        <label className="shrink-0 w-16 h-16 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-white/5 cursor-pointer">
                          <span className="text-xl text-slate-600">+</span>
                          <input type="file" className="hidden" multiple onChange={handleInteriorImages} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Low", "Medium", "High"].map(level => (
                      <button key={level} type="button" onClick={() => setProfileForm({...profileForm, busyStatus: level})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${profileForm.busyStatus === level ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-slate-500'}`}>{level}</button>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase italic tracking-widest text-white shadow-lg shadow-blue-500/20">Save Profile</button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-indigo-500/20 px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-50 sticky top-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            {/* 4. Owner Nav Logo ✅ */}
            <img src={owner?.hotelImage ? owner.hotelImage : "https://via.placeholder.com/50"} className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg" alt="Hotel Logo" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${owner?.isStoreOpen ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500 shadow-[0_0_8px_red]'}`}></div>
                <h1 className="font-black text-lg md:text-xl uppercase italic tracking-tighter leading-none">{owner?.name}</h1>
              </div>
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">{owner?.collegeName} | Rush: {owner?.busyStatus}</span>
            </div>
          </div>
          <button onClick={toggleShopStatus} className={`md:hidden text-[8px] font-black uppercase px-3 py-2 rounded-lg border italic ${owner?.isStoreOpen ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
            {owner?.isStoreOpen ? 'Close' : 'Open'}
          </button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={toggleShopStatus} className={`hidden md:block text-[9px] font-black uppercase px-4 py-2 rounded-lg border italic transition-all ${owner?.isStoreOpen ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
            {owner?.isStoreOpen ? 'Close Shop' : 'Open Shop'}
          </button>
          <button onClick={() => setIsEditingProfile(true)} className="flex-1 md:flex-none bg-white/5 text-[9px] font-black uppercase px-4 py-2 rounded-lg border border-indigo-500/20 italic hover:bg-white/10">Settings</button>
          <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="flex-1 md:flex-none bg-red-600 text-[9px] font-black uppercase px-4 py-2 rounded-lg italic text-white">Logout</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[380px] bg-[#020617] p-4 sm:p-6 flex flex-col gap-6 border-b lg:border-r border-indigo-500/20 overflow-y-auto shrink-0 scrollbar-hide lg:h-[calc(100vh-80px)]">
          <div className={`p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-300 ${isEditingItem ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-[#0f172a]'}`}>
            <h3 className="text-[10px] font-black uppercase text-indigo-300 mb-6 italic tracking-widest">
              {isEditingItem ? "✨ Update Live Item" : "🍲 Add New Dish"}
            </h3>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="flex flex-col items-center gap-2 p-4 border border-dashed border-indigo-500/20 rounded-2xl bg-black/20">
                {/* 5. Add Dish Preview ✅ */}
                {form.image ? <img src={form.image ? form.image : null} className="w-20 h-20 rounded-xl object-cover shadow-lg" alt="Preview" /> : <div className="text-[8px] font-black text-slate-800 italic">DISH IMAGE</div>}
                <label className="text-[8px] font-black bg-white/10 px-4 py-2 rounded-lg cursor-pointer uppercase hover:bg-white/20">
                  UPLOAD <input type="file" className="hidden" onChange={handleItemImage} accept="image/*" />
                </label>
              </div>
              <input type="text" placeholder="DISH NAME" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="PRICE" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500" required />
                <input type="number" placeholder="OFFER PRICE" value={form.discountPrice} onChange={e=>setForm({...form, discountPrice:e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold text-white outline-none focus:border-blue-500" />
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                <button type="button" onClick={() => setForm({...form, category: "Veg"})} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase transition-all ${form.category === 'Veg' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>Veg</button>
                <button type="button" onClick={() => setForm({...form, category: "Non-Veg"})} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase transition-all ${form.category === 'Non-Veg' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>Non-Veg</button>
              </div>
              <button className={`w-full py-4 text-white rounded-xl font-black uppercase italic tracking-widest text-[11px] transition-all shadow-xl ${isEditingItem ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}>
                {isEditingItem ? 'Update Live Dish' : 'Publish Dish'}
              </button>
              {isEditingItem && (
                <button type="button" onClick={() => { setIsEditingItem(false); setForm({name:"", price:"", discountPrice:"", image:"", category:"Veg"}); }} className="w-full py-2 text-[8px] font-bold uppercase text-slate-500">Cancel Edit</button>
              )}
            </form>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-[#020617] scroll-smooth lg:h-[calc(100vh-80px)]">
          <div className="mb-6 sm:mb-8 flex flex-col gap-6 sticky top-0 bg-[#020617] z-40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Kitchen Menu</h2>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search dish..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-indigo-500/20 p-3.5 pl-10 rounded-2xl text-xs text-white outline-none focus:border-blue-500 transition-all shadow-2xl" />
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map(i => (
              <div key={i._id} className={`group bg-[#0f172a] p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 flex flex-col gap-5 transition-all hover:border-blue-500/30 ${!i.isAvailable && 'opacity-40 grayscale'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* 6. Kitchen Menu Item List ✅ */}
                    <img src={i.image ? i.image : "https://via.placeholder.com/150"} className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] object-cover shrink-0" alt={i.name} />
                    <div className="min-w-0">
                      <h4 className="font-black uppercase text-[10px] sm:text-xs text-white italic truncate">{i.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg sm:text-xl font-black text-white italic">₹{i.discountPrice || i.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex items-center justify-center shrink-0 ${i.category === 'Veg' ? 'border-green-600/30' : 'border-red-600/30'}`}>
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i.category === 'Veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                   <button 
                     onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(items.map(item => item._id === i._id ? res.data : item)))} 
                     className={`py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase border italic transition-all ${i.isAvailable ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                    {i.isAvailable ? 'Live' : 'Sold Out'}
                   </button>
                   <button onClick={() => { setForm({ name:i.name, price:i.price, discountPrice:i.discountPrice, image:i.image, category:i.category }); setEditItemId(i._id); setIsEditingItem(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="bg-white/5 text-slate-300 py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase italic border border-indigo-500/20">Edit</button>
                   <button onClick={async () => { if(window.confirm("Delete this dish?")) { try { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(item => item._id !== i._id)); } catch(err) { alert("Delete failed"); } } }} className="bg-red-500/10 text-red-500 py-2.5 sm:py-3 rounded-2xl text-[7px] sm:text-[8px] font-black uppercase italic border border-red-500/10">Del</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-indigo-500/10 bg-[#020617] relative z-50 p-4">
        <Footer />
      </footer>

      <style>{`
        /* ✨ Fixed Scroll Bar Logic ✅ */
        main {
          scrollbar-gutter: stable;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e1b4b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #312e81;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
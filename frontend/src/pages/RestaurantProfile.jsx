import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Heart, Share2, Clock, MapPin, Search } from "lucide-react"; // ✅ Added Icons

export default function RestaurantProfile() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [itemSearch, setItemSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false); // ✅ Favorite State

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const oRes = await api.get(`/owner/${id}`);
        setOwner(oRes.data);
        const iRes = await api.get("/items/all");
        setItems(iRes.data.filter(i => (i.ownerId?._id || i.ownerId) === id));
        
        // ✅ Check Favorite Status
        const favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
        setIsFavorite(favorites.includes(id));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // ✅ Toggle Favorite
  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
    if (isFavorite) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem("favRestaurants", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  // ✅ Estimated Wait Time Logic
  const getWaitTime = (status) => {
    if (status === "High") return "30-45 Mins";
    if (status === "Medium") return "15-20 Mins";
    return "5-10 Mins";
  };

  // ✅ Search & Filter Logic
  const searchFiltered = items.filter(item => {
    const matchesFilter = filter === "All" ? true : item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableItems = searchFiltered.filter(item => item.isAvailable);
  const soldOutItems = searchFiltered.filter(item => !item.isAvailable);

  const handleGetDirections = () => {
    if (!owner) return;
    const destination = owner.latitude && owner.longitude 
      ? `${owner.latitude},${owner.longitude}` 
      : encodeURIComponent(`${owner.name} ${owner.collegeName}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleWhatsAppShare = () => {
    const text = `అరేయ్, ఈ మెనూ చూడు: ${owner.name} (${owner.collegeName}). లింక్: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-black animate-pulse uppercase tracking-widest transition-colors duration-500">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#3b82f6]"></div>
      Scanning Menu...
    </div>
  );

  if (!owner) return (
    <div className="h-screen bg-[#020617] text-white flex items-center justify-center font-black uppercase tracking-tighter">
      Restaurant Not Found ❌
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-500">
      <Navbar />
      
      {/* 🏗️ Header Section */}
      <div className="h-[250px] md:h-[400px] flex flex-col items-center justify-center border-b border-indigo-500/20 relative px-4 text-center overflow-hidden">
          {owner.hotelImage && (
            <div className="absolute inset-0 opacity-30 blur-md overflow-hidden scale-110">
               <img src={owner.hotelImage} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-blue-600/10 blur-[100px] md:blur-[150px] animate-pulse"></div>
          
          {/* Favorite Button */}
          <button onClick={toggleFavorite} className="absolute top-6 right-6 md:top-10 md:right-10 z-20 bg-black/40 p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 transition-all">
            <Heart className={`w-5 h-5 md:w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter relative z-10 break-words max-w-5xl drop-shadow-2xl">
             {owner.name}
          </h1>
          <div className="flex items-center gap-4 mt-4 relative z-10">
             <span className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
             <p className="text-indigo-200/60 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-[8px] md:text-[10px] italic">
                {owner.collegeName} • Exclusive Menu
             </p>
             <span className="w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* 🥗 Left: Menu Items */}
        <div className="order-2 lg:order-1 lg:col-span-8">
            
            {/* 🔍 Food Search Input */}
            <div className="relative mb-6 group">
                <input 
                    type="text" 
                    placeholder="Search for biryani, pizza, drinks..." 
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-5 px-8 rounded-[2rem] text-sm font-bold italic outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-2xl backdrop-blur-md"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Search className="h-6 w-6" />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide sticky top-20 z-20 bg-[#020617]/95 backdrop-blur-xl py-4 border-b border-indigo-500/20">
              {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 ${
                    filter === cat 
                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                    : "bg-[#1e293b]/40 border-white/10 text-indigo-300/60 hover:border-blue-500/50"
                  }`}
                >
                  {cat === "Veg" ? "🥦 Veg Only" : cat === "Non-Veg" ? "🥩 Non-Veg" : "🔥 All Menu"}
                </button>
              ))}
            </div>

            {/* 🥗 Live Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {availableItems.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white/5 backdrop-blur-sm p-4 rounded-[2rem] border border-white/10 flex items-center justify-between gap-4 group relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-blue-500/30 hover:-translate-y-1"
                >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image || "https://via.placeholder.com/150"} 
                          className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110" 
                          alt={item.name} 
                        />
                        <div className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-[#020617] shadow-lg ${item.category === 'Veg' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black uppercase text-xs md:text-sm mb-0.5 truncate text-white group-hover:text-blue-400 transition-colors tracking-tight">{item.name}</h4>
                         <div className="flex items-baseline gap-2">
                           <p className="text-xl md:text-2xl font-black text-blue-500 italic drop-shadow-sm">₹{item.price}</p>
                           {item.discountPrice && <p className="text-[10px] line-through text-slate-500 font-bold opacity-60">₹{item.discountPrice}</p>}
                         </div>
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter border bg-green-500/10 text-green-500 border-green-500/20">Live</div>
                </div>
              ))}
            </div>

            {/* 🌑 Sold Out Items Section */}
            {soldOutItems.length > 0 && (
                <>
                    <div className="flex items-center gap-4 mt-12 mb-6 opacity-40">
                        <h3 className="font-black uppercase italic text-xs tracking-[0.3em] shrink-0">Sold Out Items</h3>
                        <div className="h-[1px] w-full bg-white/10"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {soldOutItems.map((item) => (
                            <div key={item._id} className="bg-white/5 p-4 rounded-[2rem] border border-white/5 flex items-center justify-between gap-4 opacity-50 grayscale group relative">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        <img src={item.image || "https://via.placeholder.com/150"} className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] object-cover" alt={item.name} />
                                        <div className="absolute inset-0 bg-black/70 rounded-[1.5rem] flex items-center justify-center">
                                            <span className="uppercase text-[8px] font-black tracking-widest text-white -rotate-12 border border-white/30 px-1 bg-red-600/20">Over</span>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black uppercase text-xs text-white/60 tracking-tight">{item.name}</h4>
                                        <p className="text-xl font-black text-slate-600 italic">₹{item.price}</p>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter border bg-red-500/10 text-red-500 border-red-500/20">Empty</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {searchFiltered.length === 0 && (
              <div className="py-20 text-center border-4 border-dashed border-indigo-500/20 rounded-[2rem]">
                <p className="text-indigo-400/60 font-black uppercase tracking-[0.3em] text-xs italic">No items found for "{itemSearch}"</p>
              </div>
            )}
        </div>

        {/* 📞 Right Section */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           <div className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] lg:sticky lg:top-32 shadow-[0_20px_50px_rgba(59,130,246,0.1)] border-4 border-indigo-500/10 transition-all duration-500">
              
              {/* Wait Time Display */}
              <div className="flex items-center justify-between mb-6 bg-blue-600/5 p-4 rounded-2xl border border-blue-500/10">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Wait Time</span>
                </div>
                <span className="text-[10px] font-black text-white italic">{getWaitTime(owner.busyStatus)}</span>
              </div>

              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase text-indigo-400/60 mb-1 italic tracking-widest">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${owner.isStoreOpen ? 'bg-green-500 shadow-green-500 animate-pulse' : 'bg-red-500 shadow-red-500'}`}></div>
                    <span className="font-black text-[10px] uppercase tracking-widest">{owner.isStoreOpen ? 'Online' : 'Closed'}</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-indigo-400/60 mb-1 italic tracking-widest">Campus</p>
                    <span className="font-black text-[10px] uppercase text-blue-500">{owner.collegeName}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight mb-6">
                Hungry? <br/>
                <span className="text-blue-500 text-3xl">Order Now!</span>
              </h3>
              
              <div className="space-y-3">
                <a 
                    href={owner.isStoreOpen ? `tel:${owner.phone}` : "#"} 
                    className={`w-full block py-4 rounded-2xl font-black uppercase text-center text-[11px] tracking-[0.2em] transition-all shadow-xl ${
                    owner.isStoreOpen 
                    ? 'bg-blue-600 text-white hover:bg-indigo-600 active:scale-95 shadow-blue-500/20 border border-blue-400/30' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                >
                    {owner.isStoreOpen ? '📞 Call to Order' : 'Offline'}
                </a>

                {/* ✅ Get Route Button */}
                <button 
                    onClick={handleGetDirections}
                    className="w-full block py-4 rounded-2xl font-black uppercase text-center text-[11px] tracking-[0.2em] transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 active:scale-95"
                >
                    📍 Get Directions
                </button>

                {/* ✅ WhatsApp Share Button */}
                <button 
                    onClick={handleWhatsAppShare}
                    className="w-full block py-4 rounded-2xl font-black uppercase text-center text-[11px] tracking-[0.2em] transition-all bg-green-600/10 border border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white active:scale-95"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Share Menu
                    </span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-500/20">
                <p className="text-[9px] font-black uppercase text-indigo-400/60 mb-3 italic tracking-widest text-center">Crowd Rush</p>
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all ${i <= (owner.busyStatus === "High" ? 5 : owner.busyStatus === "Medium" ? 3 : 1) ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                <p className="text-[8px] font-bold mt-2 uppercase text-indigo-300 italic text-center">Traffic: {owner.busyStatus}</p>
              </div>

              <p className="mt-6 text-[8px] text-center font-bold text-indigo-300/40 uppercase italic leading-relaxed">
                Calling <span className="text-white font-black underline decoration-blue-500">{owner.name}</span> directly helps students get food faster!
              </p>
           </div>
        </div>
      </main>
      
      <Footer />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
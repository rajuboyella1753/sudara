import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// axios కి బదులు నీ api-base వాడుతున్నాం, దీనివల్ల URL టెన్షన్ ఉండదు
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion"; // యానిమేషన్ కోసం

export default function RestaurantProfile() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. ఓనర్ ప్రొఫైల్ డేటా
        const oRes = await api.get(`/owner/${id}`);
        setOwner(oRes.data);
        
        // 2. అన్ని ఐటమ్స్ తెప్పించి ఫిల్టర్ చేయడం
        const iRes = await api.get("/items/all");
        // ఓనర్ ఐడి మ్యాచ్ అయిన ఐటమ్స్ మాత్రమే తీసుకుంటున్నాం
        setItems(iRes.data.filter(i => (i.ownerId?._id || i.ownerId) === id));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const filteredItems = items.filter(item => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  if (loading) return (
    <div className="h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-black animate-pulse uppercase tracking-widest transition-colors duration-500">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      Loading Menu...
    </div>
  );

  if (!owner) return (
    <div className="h-screen bg-[#020617] text-white flex items-center justify-center font-black uppercase tracking-tighter">
      Restaurant Not Found ❌
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-500">
      <Navbar />
      
      {/* 🏗️ Header Section - Visual Fix for Dynamic Data */}
      <div className="h-[250px] md:h-[400px] flex flex-col items-center justify-center border-b border-white/5 relative px-4 text-center overflow-hidden">
          {/* Background Image Effect */}
          {owner.hotelImage && (
            <div className="absolute inset-0 opacity-30 blur-md overflow-hidden scale-110">
               <img src={owner.hotelImage} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-orange-600/10 blur-[100px] md:blur-[150px] animate-pulse"></div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter relative z-10 break-words max-w-5xl drop-shadow-2xl">
             {owner.name}
          </h1>
          <div className="flex items-center gap-4 mt-4 relative z-10">
             <span className="w-10 h-[2px] bg-orange-500 shadow-[0_0_10px_#f97316]"></span>
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-[8px] md:text-[10px] italic">
                {owner.collegeName} • Exclusive Menu
             </p>
             <span className="w-10 h-[2px] bg-orange-500 shadow-[0_0_10px_#f97316]"></span>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* 🥗 Left: Menu Items */}
        <div className="order-2 lg:order-1 lg:col-span-8">
            {/* Category Filters */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide sticky top-20 z-20 bg-[#020617]/95 backdrop-blur-xl py-4 border-b border-white/5">
              {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 ${
                    filter === cat 
                    ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]" 
                    : "bg-[#1e293b]/40 border-white/10 text-slate-400 hover:border-orange-500/50"
                  }`}
                >
                  {cat === "Veg" ? "🥦 Veg Only" : cat === "Non-Veg" ? "🥩 Non-Veg" : "🔥 All Menu"}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item._id} 
                  className={`bg-white/5 backdrop-blur-sm p-4 rounded-[2rem] border border-white/10 flex items-center justify-between gap-4 group relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-orange-500/30 hover:-translate-y-1 ${!item.isAvailable && 'opacity-50 grayscale'}`}
                >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image || "https://via.placeholder.com/150"} 
                          className={`w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-110 ${!item.isAvailable && 'grayscale'}`} 
                          alt={item.name} 
                        />
                        <div className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-[#020617] shadow-lg ${item.category === 'Veg' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/70 rounded-[1.5rem] flex items-center justify-center">
                            <span className="uppercase text-[8px] font-black tracking-widest text-white -rotate-12 border border-white/30 px-1 bg-red-600/20">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black uppercase text-xs md:text-sm mb-0.5 truncate text-white group-hover:text-orange-500 transition-colors tracking-tight">{item.name}</h4>
                         <div className="flex items-baseline gap-2">
                           <p className="text-xl md:text-2xl font-black text-orange-500 italic drop-shadow-sm">₹{item.price}</p>
                           {item.discountPrice && <p className="text-[10px] line-through text-slate-500 font-bold opacity-60">₹{item.discountPrice}</p>}
                         </div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter border ${item.isAvailable ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {item.isAvailable ? 'Live' : 'Over'}
                    </div>
                </div>
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="py-20 text-center border-4 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs italic">Empty in {filter}</p>
              </div>
            )}
        </div>

        {/* 📞 Right Section: Compact Action Card for Desktop */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           {/* Padding decreased from 10-12 to 8, margins reduced */}
           <div className="bg-white text-[#020617] p-8 rounded-[2.5rem] lg:sticky lg:top-32 shadow-[0_20px_50px_rgba(249,115,22,0.1)] border-4 border-orange-600/5 transition-all duration-500">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-1 italic tracking-widest">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${owner.isStoreOpen ? 'bg-green-500 shadow-green-500 animate-pulse' : 'bg-red-500 shadow-red-500'}`}></div>
                    <span className="font-black text-[10px] uppercase tracking-widest">{owner.isStoreOpen ? 'Online' : 'Closed'}</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase text-slate-400 mb-1 italic tracking-widest">Campus</p>
                   <span className="font-black text-[10px] uppercase text-orange-600">{owner.collegeName}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight mb-6">
                Hungry? <br/>
                <span className="text-orange-600 text-3xl">Order Now!</span>
              </h3>
              
              <a 
                href={owner.isStoreOpen ? `tel:${owner.phone}` : "#"} 
                className={`w-full block py-4 rounded-2xl font-black uppercase text-center text-[11px] tracking-[0.2em] transition-all shadow-xl ${
                  owner.isStoreOpen 
                  ? 'bg-[#020617] text-white hover:bg-orange-600 active:scale-95 shadow-orange-500/20' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                {owner.isStoreOpen ? '📞 Call to Order' : 'Offline'}
              </a>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-3 italic tracking-widest text-center">Crowd Rush</p>
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all ${i <= (owner.busyStatus === "High" ? 5 : owner.busyStatus === "Medium" ? 3 : 1) ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
                <p className="text-[8px] font-bold mt-2 uppercase text-slate-500 italic text-center">Traffic: {owner.busyStatus}</p>
              </div>

              <p className="mt-6 text-[8px] text-center font-bold text-slate-400 uppercase italic leading-relaxed">
                Calling <span className="text-black font-black underline">{owner.name}</span> directly helps students get food faster!
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
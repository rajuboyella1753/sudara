import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// axios కి బదులు నీ api-base వాడుతున్నాం, దీనివల్ల URL టెన్షన్ ఉండదు
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <div className="h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-black animate-pulse uppercase tracking-widest">
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
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-orange-500 selection:text-white">
      <Navbar />
      
      {/* 🏗️ Header Section - Visual Fix for Dynamic Data */}
      <div className="h-[250px] md:h-[450px] flex flex-col items-center justify-center border-b border-white/5 relative px-4 text-center overflow-hidden">
          {/* Background Image Effect */}
          {owner.hotelImage && (
            <div className="absolute inset-0 opacity-20 blur-sm overflow-hidden">
               <img src={owner.hotelImage} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-orange-600/5 blur-[80px] md:blur-[120px]"></div>
          
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-black italic uppercase tracking-tighter relative z-10 break-words max-w-full drop-shadow-2xl">
             {owner.name}
          </h1>
          <div className="flex items-center gap-3 mt-4 relative z-10">
             <span className="w-8 h-[1px] bg-orange-500/50"></span>
             <p className="text-slate-500 font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] italic">
                {owner.collegeName} • Live Menu
             </p>
             <span className="w-8 h-[1px] bg-orange-500/50"></span>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* 🥗 Left: Menu Items */}
        <div className="order-2 lg:order-1 lg:col-span-8">
            {/* Category Filters */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide sticky top-20 z-20 bg-[#020617]/90 backdrop-blur-md py-4">
              {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    filter === cat 
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                    : "bg-[#1e293b]/50 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {cat === "Veg" ? "Veg 🥦" : cat === "Non-Veg" ? "Non-Veg 🥩" : "All Menu"}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {filteredItems.map(item => (
                <div key={item._id} className={`bg-[#1e293b]/30 p-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 flex items-center justify-between gap-4 group relative overflow-hidden transition-all hover:border-orange-500/30 ${!item.isAvailable && 'opacity-60'}`}>
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image || "https://via.placeholder.com/150"} 
                          className={`w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl object-cover shadow-2xl transition-transform group-hover:scale-105 ${!item.isAvailable && 'grayscale'}`} 
                          alt={item.name} 
                        />
                        <div className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-[#020617] ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 rounded-xl md:rounded-2xl flex items-center justify-center">
                            <span className="uppercase text-[10px] font-black tracking-widest text-white -rotate-12 border border-white/20 px-1">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black uppercase text-xs md:text-sm mb-1 truncate group-hover:text-orange-500 transition-colors">{item.name}</h4>
                         <p className="text-xl md:text-2xl font-black text-orange-500 italic">₹{item.price}</p>
                         {item.discountPrice && <p className="text-[10px] line-through text-slate-500 font-bold">₹{item.discountPrice}</p>}
                      </div>
                    </div>
                    
                    {!item.isAvailable && (
                      <div className="bg-red-600/10 border border-red-600/20 text-red-500 text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}
                </div>
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic">No {filter} dishes available right now</p>
              </div>
            )}
        </div>

        {/* 📞 Right Section: Action Card */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           <div className="bg-white text-black p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] lg:sticky lg:top-32 shadow-2xl shadow-orange-500/10 border-4 border-orange-600/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-1 italic">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${owner.isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="font-black text-[10px] uppercase tracking-wider">{owner.isStoreOpen ? 'Taking Orders' : 'Closed'}</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase text-slate-400 mb-1 italic">College</p>
                   <span className="font-black text-[10px] uppercase text-orange-600">{owner.collegeName}</span>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-tight mb-8">
                Ready to <br/>
                <span className="text-orange-600 text-3xl md:text-4xl">Eat Fresh?</span>
              </h3>
              
              <a 
                href={owner.isStoreOpen ? `tel:${owner.phone}` : "#"} 
                className={`w-full block py-5 md:py-6 rounded-2xl font-black uppercase text-center text-[10px] md:text-xs tracking-[0.2em] transition-all shadow-xl ${
                  owner.isStoreOpen 
                  ? 'bg-black text-white hover:bg-orange-600 active:scale-95 shadow-orange-200' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                {owner.isStoreOpen ? '📞 Call to Order' : 'Store is Closed'}
              </a>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-2 italic">Rush Status</p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${owner.busyStatus === "High" ? 'bg-red-500' : owner.busyStatus === "Medium" ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                  ))}
                </div>
                <p className="text-[8px] font-bold mt-2 uppercase text-slate-500 italic text-center">Current Load: {owner.busyStatus}</p>
              </div>

              <p className="mt-6 text-[8px] md:text-[9px] text-center font-bold text-slate-400 uppercase italic leading-relaxed">
                Calling <span className="text-black font-black">{owner.name}</span> directly helps students get food faster!
              </p>
           </div>
        </div>
      </main>
      
      <Footer />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, X, ChevronDown, Filter, UtensilsCrossed, Compass } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState("MBU");
  const [dbColleges, setDbColleges] = useState([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedResId, setSelectedResId] = useState(null);
  const [hoverStar, setHoverStar] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location access denied")
      );
    }
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/all-owners");
      setRestaurants(res.data);
      const uniqueColleges = [...new Set(res.data.map(item => item.collegeName))].filter(Boolean);
      setDbColleges(uniqueColleges);
      setFilteredRestaurants(res.data);
    } catch (err) { console.error("Fetch Error:", err); }
    finally { setLoading(false); }
  };

  const handleRateClick = (id, e) => {
    e.stopPropagation();
    setSelectedResId(id);
    setShowRatingModal(true);
  };

  // ✅ UPGRADED: Instant UI Update Logic (No Refresh Needed)
const submitRating = async (ratingValue) => {
  try {
    const res = await api.put(`/owner/rate-restaurant/${selectedResId}`, { rating: ratingValue });
    
    if (res.data.success) {
      // ✅ ఇక్కడ మార్పు: బ్యాకెండ్ నుండి వస్తున్న కొత్త కౌంట్‌ని స్టేట్‌కి సింక్ చేస్తున్నాం
      const updatedList = restaurants.map(r => {
        if (r._id === selectedResId) {
          return { 
            ...r, 
            averageRating: res.data.averageRating, 
            numberOfReviews: res.data.numberOfReviews // 👈 ఇప్పుడు బ్యాకెండ్ ఇది పంపిస్తుంది
          };
        }
        return r;
      });

      setRestaurants(updatedList);
      setShowRatingModal(false);
    }
  } catch (err) { 
    console.error("Rating submission failed");
    setShowRatingModal(false); 
  }
};
  // ✅ UPGRADED: Synchronization Logic to keep filter and main list in sync
  useEffect(() => {
    let result = restaurants;
    if (selectedCollege !== "All") {
      result = result.filter(r => r.collegeName === selectedCollege);
    }
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(query) || (r.collegeName && r.collegeName.toLowerCase().includes(query)));
    }
    setFilteredRestaurants(result);
  }, [searchTerm, selectedCollege, restaurants]); // Added 'restaurants' as dependency

  // ✅ UPGRADED: Professional Haversine Formula for Accurate Distance
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in KM
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Returns KM with 1 decimal
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero & Search Section */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-orange-600/10 blur-[140px] -z-10 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-4 uppercase leading-none">
              SUDARA <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">HUB</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-sm mb-12">College Food Finder & Discovery</p>
          </motion.div>

          {/* Upgraded Search Bar Layout */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-3 flex flex-col lg:flex-row items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search for restaurants, colleges, or food..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-transparent py-5 pl-14 pr-6 rounded-3xl text-lg outline-none font-bold italic placeholder:text-slate-600" 
                />
              </div>

              <div className="h-10 w-[1px] bg-white/10 hidden lg:block"></div>
              
              <div className="relative w-full lg:w-72">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 z-10 pointer-events-none">
                  <Compass className="w-5 h-5 animate-pulse" />
                </div>
                <select 
                  value={selectedCollege} 
                  onChange={(e) => setSelectedCollege(e.target.value)} 
                  className="w-full bg-black/40 lg:bg-transparent border border-white/10 lg:border-none py-5 pl-14 pr-12 rounded-[2rem] text-xs font-black uppercase italic outline-none cursor-pointer appearance-none hover:bg-white/5 transition-all text-slate-200"
                >
                    <option value="All" className="bg-[#0f172a]">All Nearby Colleges</option>
                    {dbColleges.map((clg) => <option key={clg} value={clg} className="bg-[#0f172a]">{clg}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
              </div>

              <button className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase italic text-xs tracking-widest px-10 py-5 rounded-[2rem] transition-all active:scale-95 shadow-lg shadow-orange-500/20 w-full lg:w-auto">
                Discover
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {filteredRestaurants.map((res, index) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -12 }}
                key={res._id} 
                className="group relative h-full cursor-pointer"
                onClick={() => res.isStoreOpen && navigate(`/restaurant/${res._id}`)}
              >
                {/* Neon Glow Behind Card */}
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-600/10 rounded-[2.5rem] blur-3xl transition-all duration-500 -z-10"></div>

                <div className="relative h-full bg-[#0f172a]/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col transition-all duration-500 group-hover:border-orange-500/30 group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
                  
                  {/* Image Container */}
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={res.hotelImage || 'https://via.placeholder.com/400x300'} 
                      alt={res.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" 
                    />
                    
                    {/* Floating Info Over Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
                    
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black border border-white/10 flex items-center gap-2 tracking-widest shadow-xl">
                      <MapPin className="w-3 h-3 text-orange-500" /> 
                      {getDistance(userCoords?.lat, userCoords?.lng, res.latitude, res.longitude)} KM
                    </div>

                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter border backdrop-blur-md shadow-xl transition-colors ${res.isStoreOpen ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                       <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        {res.isStoreOpen ? 'Active Now' : 'Offline'}
                       </div>
                    </div>

                    {/* Quick Badge */}
                    <div className="absolute bottom-4 left-4 bg-orange-500 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic tracking-[0.2em] shadow-lg">
                      Top Choice
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-tight truncate group-hover:text-orange-500 transition-colors">
                          {res.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Compass className="w-3 h-3 text-slate-500" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.collegeName}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                          <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                          <span className="text-xs font-black text-orange-500">{res.averageRating ? res.averageRating.toFixed(1) : "0.0"}</span>
                        </div>

                        {/* <span className="text-[8px] font-bold text-slate-600 uppercase">({res.numberOfReviews || 0} reviews)</span> */}
                        <span className="text-[8px] font-bold text-slate-600 uppercase">
                          ({res.numberOfReviews !== undefined ? res.numberOfReviews : 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-[1px] bg-white/5"></div>
                         <UtensilsCrossed className="w-4 h-4 text-slate-700" />
                         <div className="flex-1 h-[1px] bg-white/5"></div>
                      </div>

                      <button 
                        disabled={!res.isStoreOpen}
                        className={`w-full py-5 rounded-[1.8rem] font-black uppercase italic text-[11px] tracking-[0.2em] transition-all relative overflow-hidden group/btn ${res.isStoreOpen ? 'bg-white text-black hover:bg-orange-500 hover:text-white' : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {res.isStoreOpen ? 'Enter Restaurant' : 'Currently Closed'}
                        </span>
                      </button>
                      
                      <button 
                        onClick={(e) => handleRateClick(res._id, e)} 
                        className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                      >
                        Share Rating <X className="w-3 h-3 rotate-45" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
            <UtensilsCrossed className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-black italic uppercase text-slate-600 tracking-widest">No results found for your craving</h3>
            <button onClick={() => {setSearchTerm(""); setSelectedCollege("All")}} className="mt-6 text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] border-b border-orange-500/50 pb-1 hover:text-white transition-colors">Clear All Filters</button>
          </motion.div>
        )}
      </main>

      {/* Rating Modal - UI Re-designed */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] border border-orange-500/30 p-12 rounded-[3.5rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(249,115,22,0.1)]">
              <button onClick={() => setShowRatingModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6"/></button>
              
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Star className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>

              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Rate <span className="text-orange-500 text-5xl block">Sudara</span></h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed">Your feedback helps fellow students find the best vibes.</p>
              
              <div className="flex justify-center gap-3 mb-12">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button 
                    key={num} 
                    onMouseEnter={() => setHoverStar(num)} 
                    onMouseLeave={() => setHoverStar(0)} 
                    onClick={() => submitRating(num)} 
                    className="hover:scale-125 transition-all duration-300"
                  >
                    <Star className={`w-11 h-11 ${num <= (hoverStar || 0) ? 'text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-800 fill-slate-800'}`} />
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-black italic text-slate-600 uppercase tracking-widest animate-bounce">Select stars to submit</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Global CSS for Custom Select Scrollbar & Effects */}
      <style>{`
        select option {
          background-color: #0f172a !important;
          color: white !important;
          padding: 20px !important;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, X, ChevronDown, Filter } from "lucide-react";

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

  const submitRating = async (ratingValue) => {
    try {
      const res = await api.put(`/owner/rate-restaurant/${selectedResId}`, { rating: ratingValue });
      if (res.data.success) {
        setRestaurants(prev => prev.map(r => r._id === selectedResId ? { ...r, averageRating: res.data.averageRating, numberOfReviews: res.data.numberOfReviews } : r));
        setShowRatingModal(false);
      }
    } catch (err) { setShowRatingModal(false); }
  };

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
  }, [searchTerm, selectedCollege, restaurants]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    // FIX: లొకేషన్ లేకపోతే 0 కాకుండా ప్రాపర్ చెక్
    if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-orange-500/30">
      <Navbar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/10 blur-[120px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black italic tracking-tighter mb-8 uppercase leading-tight">
            SUDARA <span className="text-orange-500">HUB</span>
          </motion.h1>

          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-2 flex flex-col md:flex-row items-center gap-2 shadow-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input type="text" placeholder="Search your craving..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent py-5 pl-14 pr-6 rounded-3xl text-lg outline-none font-bold italic" />
            </div>
            
            <div className="relative w-full md:w-64 group">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 z-10" />
              <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className="w-full bg-white/5 md:bg-black/40 border border-white/10 md:border-transparent py-5 pl-12 pr-10 rounded-[1.8rem] text-[11px] font-black uppercase italic outline-none cursor-pointer appearance-none hover:border-orange-500/50 transition-all text-orange-500">
                 <option value="All" className="bg-[#0f172a]">Select College (All)</option>
                 {dbColleges.map((clg) => <option key={clg} value={clg} className="bg-[#0f172a]">{clg}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredRestaurants.map((res) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -10 }}
                key={res._id} 
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-orange-500/5 rounded-[3rem] blur-2xl group-hover:bg-orange-500/10 transition-all duration-500"></div>

                <div className="relative h-full bg-[#0f172a]/60 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col transition-all duration-500 group-hover:border-orange-500/40 group-hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]">
                  
                  <div className="h-60 relative">
                    <img src={res.hotelImage || 'https://via.placeholder.com/400x300'} alt={res.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                    
                    <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black border border-white/10 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-orange-500" /> 
                      {/* FIX: కరెక్ట్ డిస్టెన్స్ ఫంక్షన్ కాల్ */}
                      {getDistance(userCoords?.lat, userCoords?.lng, res.latitude, res.longitude)} KM
                    </div>

                    <div className={`absolute top-5 right-5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${res.isStoreOpen ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}>
                       {res.isStoreOpen ? 'Active' : 'Offline'}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">{res.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{res.collegeName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span className="text-xs font-black">{res.averageRating ? res.averageRating.toFixed(1) : "0.0"}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <button 
                        onClick={() => res.isStoreOpen && navigate(`/restaurant/${res._id}`)}
                        className={`w-full py-5 rounded-[2rem] font-black uppercase italic text-[10px] tracking-[0.2em] transition-all shadow-xl ${res.isStoreOpen ? 'bg-white text-black hover:bg-orange-500 hover:text-white group-hover:shadow-orange-500/20' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                      >
                        {res.isStoreOpen ? 'Enter Restaurant' : 'Closed for Now'}
                      </button>
                      
                      <button onClick={(e) => handleRateClick(res._id, e)} className="w-full mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors">
                        Add Rating +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showRatingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] border border-orange-500/30 p-10 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(249,115,22,0.2)]">
              <button onClick={() => setShowRatingModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Rate <span className="text-orange-500">Experience</span></h2>
              <div className="flex justify-center gap-3 mb-10">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button key={num} onMouseEnter={() => setHoverStar(num)} onMouseLeave={() => setHoverStar(0)} onClick={() => submitRating(num)} className="hover:scale-125 transition-transform">
                    <Star className={`w-10 h-10 ${num <= (hoverStar || 0) ? 'text-orange-500 fill-orange-500' : 'text-slate-800 fill-slate-800'}`} />
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest">Click a star to submit</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
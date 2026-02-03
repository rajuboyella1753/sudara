import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Star, 
  X, 
  ChevronDown, 
  UtensilsCrossed, 
  Compass, 
  Plus, 
  ArrowUpRight 
} from "lucide-react";

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
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Location obtained! ✅");
            setUserCoords({ 
              lat: pos.coords.latitude, 
              lng: pos.coords.longitude 
            });
          },
          (err) => { 
            console.log("User denied location ❌", err.message); 
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
      } else {
        console.log("Geolocation not supported by browser.");
      }
    };

    getLocation();
    fetchOwners();
  }, []);
  
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/all-owners");
      
      // ✅ రాజు, ఇక్కడ కేవలం అప్రూవ్ అయిన వాళ్ళని మాత్రమే ఫిల్టర్ చేస్తున్నాం
      // దీనివల్ల పెండింగ్ లో ఉన్న ఓనర్స్ యూజర్ కి కనిపించరు
      const allData = Array.isArray(res.data) ? res.data : [];
      const approvedOnly = allData.filter(r => r.isApproved === true);
      
      const uniqueColleges = [...new Set(approvedOnly.map(item => item.collegeName))].filter(Boolean);
      
      setRestaurants(approvedOnly); // కేవలం అప్రూవ్ అయినవే స్టేట్ లో ఉంటాయి
      setDbColleges(uniqueColleges);
      setFilteredRestaurants(approvedOnly);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
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
        const updatedList = restaurants.map(r => {
          if (r._id === selectedResId) {
            return { ...r, averageRating: res.data.averageRating, numberOfReviews: res.data.numberOfReviews };
          }
          return r;
        });
        setRestaurants(updatedList);
        setShowRatingModal(false);
      }
    } catch (err) { setShowRatingModal(false); }
  };

  useEffect(() => {
    if (!restaurants || restaurants.length === 0) {
      setFilteredRestaurants([]);
      return;
    }
    let result = restaurants;

    if (selectedCollege !== "All") {
      result = result.filter(r => r.collegeName === selectedCollege);
    }

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => {
        if (!r.isStoreOpen) return false;
        const matchesRestaurant = r.name.toLowerCase().includes(query);
        const matchesFoodItem = r.items && r.items.some(item => 
          item.name.toLowerCase().includes(query) && item.isAvailable === true
        );
        return matchesRestaurant || matchesFoodItem;
      });
    }
    setFilteredRestaurants(result);
  }, [searchTerm, selectedCollege, restaurants]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); 
  };
  const handleRestaurantClick = async (resId) => {
  try {
    // 1. ఈరోజు డేట్ ని ఫార్మాట్ చెయ్ (DB లో సేవ్ అయినట్టు "4/2/2026")
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');
    
    // 2. బ్యాకెండ్ కి హిట్ పంపించు
    await api.put(`/owner/track-analytics/${resId}`, {
      action: "kitchen_entry",
      date: today
    });
    
    console.log("Visit tracked! ✅");
  } catch (err) {
    console.error("Tracking failed but moving to profile...");
  } finally {
    // 3. హిట్ వెళ్ళినా వెళ్ళకపోయినా యూజర్ ని పేజీ లోపలికి తీసుకెళ్ళు
    navigate(`/restaurant/${resId}`);
  }
};
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      {/* --- HERO & SEARCH SECTION --- */}
      <section className="relative pt-36 pb-20 overflow-hidden bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/5 blur-[140px] -z-10 rounded-full"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, ease: "backOut" }}
          >
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-4 uppercase leading-none text-slate-900">
              SUDARA <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]">HUB</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-sm mb-12"
            >
              College Food Finder & Discovery Platform
            </motion.p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white border border-slate-200 rounded-[3rem] p-3 flex flex-col lg:flex-row items-center gap-3 shadow-xl shadow-slate-200/50">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search for Restaurants or foodName..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-transparent py-5 pl-14 pr-6 rounded-3xl text-lg outline-none font-bold italic placeholder:text-slate-300 text-slate-800" 
                />
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden lg:block"></div>
              <div className="relative w-full lg:w-72">
                <Compass className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 z-10 w-5 h-5 animate-pulse" />
                <select 
                  value={selectedCollege} 
                  onChange={(e) => setSelectedCollege(e.target.value)} 
                  className="w-full bg-slate-50 lg:bg-transparent border border-slate-200 lg:border-none py-5 pl-14 pr-12 rounded-[2rem] text-xs font-black uppercase italic outline-none cursor-pointer appearance-none text-slate-700"
                >
                    <option value="All" className="bg-white">All Nearby Colleges</option>
                    {dbColleges.map((clg) => ( <option key={clg} value={clg} className="bg-white">{clg}</option> ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic text-xs tracking-widest px-10 py-5 rounded-[2rem] transition-all shadow-lg shadow-blue-500/30 w-full lg:w-auto"
              >
                Discover
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN GRID SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          <AnimatePresence>
            {filteredRestaurants.map((res, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -10 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index % 3 * 0.1,
                  layout: { duration: 0.3 }
                }} 
                key={res._id} 
                className="group cursor-pointer h-full"
                // onClick={() => res.isStoreOpen && navigate(`/restaurant/${res._id}`)}
                   onClick={() => res.isStoreOpen && handleRestaurantClick(res._id)}
              >
                <div className="relative flex flex-col h-full transition-all duration-500">
                  <div className="relative h-64 w-full overflow-hidden rounded-[2.5rem] mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 shrink-0">
                    {res.hotelImage ? (
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={res.hotelImage} alt={res.name} loading="lazy" className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <UtensilsCrossed className="w-10 h-10 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute top-5 right-5">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${res.isStoreOpen ? 'bg-white/90 border-green-100 text-green-600' : 'bg-white/90 border-red-100 text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        {res.isStoreOpen ? 'Active' : 'Closed'}
                      </motion.div>
                    </div>
                  </div>

                  <div className="px-2 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase italic leading-[1.1] group-hover:text-blue-600 transition-colors min-h-[3.5rem] line-clamp-2">
                        {res.name}
                      </h3>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-sm"
                        >
                          <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                          <span className="text-xs font-black text-slate-900">{res.averageRating ? res.averageRating.toFixed(1) : "5.0"}</span>
                        </motion.div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">({res.numberOfReviews || 0} Reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-4">
                      <div className="flex items-center gap-1">
                        <Compass className="w-3 h-3 text-blue-500" /> {res.collegeName}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {userCoords?.lat && res.latitude ? `${getDistance(userCoords.lat, userCoords.lng, res.latitude, res.longitude)} KM` : "NEARBY"}
                      </div>
                    </div>

                    {searchTerm && res.items?.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) && i.isAvailable) && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4 inline-flex items-center self-start gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100"
                      >
                        <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-tight italic">
                          "{searchTerm}" available here
                        </p>
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-2 mt-auto pb-2">
                      <motion.button 
                        whileTap={{ scale: 0.98 }}
                        disabled={!res.isStoreOpen}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${res.isStoreOpen ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                      >
                        {res.isStoreOpen ? (<>Enter Kitchen <ArrowUpRight className="w-3 h-3" /></>) : 'Currently Offline'}
                      </motion.button>
                      <button onClick={(e) => handleRateClick(res._id, e)} className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group">
                        <Star className="w-3.5 h-3.5 group-hover:fill-blue-600 transition-all" />
                        Give Rating
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- RATING MODAL --- */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-white/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }} 
              animate={{ scale: 1, rotate: 0 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white border border-slate-200 p-12 rounded-[3.5rem] max-w-sm w-full text-center relative shadow-2xl"
            >
              <button onClick={() => setShowRatingModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"> <X className="w-6 h-6"/></button>
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Star className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">Rate <span className="text-blue-600 text-5xl block">Sudara</span></h2>
              <div className="flex justify-center gap-3 mb-12">
                {[1, 2, 3, 4, 5].map((num) => (
                  <motion.button 
                    key={num} 
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverStar(num)} 
                    onMouseLeave={() => setHoverStar(0)} 
                    onClick={() => submitRating(num)} 
                  >
                    <Star className={`w-11 h-11 ${num <= (hoverStar || 0) ? 'text-blue-600 fill-blue-600' : 'text-slate-200 fill-slate-100'}`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <style>{`
        select option { background-color: white !important; color: #1e293b !important; padding: 20px !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: white; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
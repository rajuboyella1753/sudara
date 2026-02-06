import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { requestForToken } from "../firebase";
import { 
  Search, 
  MapPin, 
  Star, 
  X, 
  UtensilsCrossed, 
  Compass, 
  ArrowUpRight 
} from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollege] = useState("MBU"); 
  const [dbColleges, setDbColleges] = useState([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedResId, setSelectedResId] = useState(null);
  const [hoverStar, setHoverStar] = useState(0);

  const navigate = useNavigate();

  const fetchOwners = async () => {
    try {
      const res = await api.get("/owner/all-owners");
      const allData = Array.isArray(res.data) ? res.data : [];
      const approvedOnly = allData.filter(r => r.isApproved === true);
      const mbuOnly = approvedOnly.filter(r => r.collegeName === "MBU");
      
      const uniqueColleges = [...new Set(approvedOnly.map(item => item.collegeName))].filter(Boolean);
      
      setRestaurants(mbuOnly); 
      setDbColleges(uniqueColleges);
      setFilteredRestaurants(mbuOnly);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const setupNotifications = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        await api.post("/owner/save-fcm-token-general", { token });
      }
    } catch (err) {
      console.error("Notification failed ❌", err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        null,
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOwners();
    getLocation();
    setupNotifications();
  }, []);
  
  const handleRateClick = (id, e) => {
    e.stopPropagation(); 
    setSelectedResId(id);
    setShowRatingModal(true);
  };

  const submitRating = async (ratingValue) => {
    try {
      const res = await api.put(`/owner/rate-restaurant/${selectedResId}`, { rating: ratingValue });
      if (res.data.success) {
        const updatedList = restaurants.map(r => 
          r._id === selectedResId ? { ...r, averageRating: res.data.averageRating, numberOfReviews: res.data.numberOfReviews } : r
        );
        setRestaurants(updatedList);
        setShowRatingModal(false);
      }
    } catch (err) { setShowRatingModal(false); }
  };

  // ✅ ఇక్కడ ఫుడ్ సెర్చ్ లాజిక్ ని పక్కాగా ఉంచాను
  useEffect(() => {
    let result = restaurants;
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) || 
        (r.items && r.items.some(item => item.name.toLowerCase().includes(query) && item.isAvailable))
      );
    }
    setFilteredRestaurants(result);
  }, [searchTerm, restaurants]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1); 
  };

  const handleRestaurantClick = async (resId) => {
    try {
      const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');
      api.put(`/owner/track-analytics/${resId}`, { action: "kitchen_entry", date: today }); 
    } finally {
      navigate(`/restaurant/${resId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-24 pb-12 md:pt-36 md:pb-20 overflow-hidden bg-slate-50">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/5 blur-[140px] -z-10 rounded-full" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter mb-4 uppercase leading-none text-slate-900">
            SUDARA <span className="text-blue-600">HUB</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[8px] md:text-sm mb-8 md:mb-12 text-blue-600">Exclusive for Campus</p>

          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl md:rounded-[3rem] p-1.5 md:p-3 flex items-center gap-3 shadow-xl shadow-slate-200/50">
            <div className="relative flex-1 group">
              {/* మొబైల్‌లో ఐకాన్ లెఫ్ట్ పొజిషన్ తగ్గించాం (left-4) */}
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-4 h-4 md:w-5 h-5" />
              
              {/* - text-xs md:text-lg: మొబైల్‌లో ఫాంట్ చిన్నగా (xs) చేసి డెస్క్‌టాప్‌లో పెద్దగా (lg) చేశాం.
                - pl-10 md:pl-14: ఐకాన్ కోసం ఇచ్చే స్పేస్ తగ్గించాం. 
                దీనివల్ల ప్లేస్‌హోల్డర్ మొత్తం కనిపిస్తుంది.
              */}
              <input 
                type="text" 
                placeholder="Search Restaurants or Food..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-transparent py-3 md:py-5 pl-10 md:pl-14 pr-4 rounded-xl md:rounded-3xl text-xs md:text-lg outline-none font-bold italic placeholder:text-slate-300 text-slate-800" 
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center py-20">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="mt-4 font-black italic uppercase text-slate-400 text-xs tracking-widest">Fetching Campus Hub...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredRestaurants.map((res, index) => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={res._id} className="group cursor-pointer h-full" onClick={() => res.isStoreOpen && handleRestaurantClick(res._id)}>
                  <div className="relative flex flex-col h-full">
                    <div className="relative h-64 overflow-hidden rounded-[2.5rem] mb-6 shadow-sm">
                      <img src={res.hotelImage || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?w=500"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={res.name} />
                      <div className="absolute top-5 right-5 bg-white/90 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                        {res.isStoreOpen ? 'Active' : 'Closed'}
                      </div>
                    </div>
                    
                    <div className="px-2 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-black uppercase italic leading-tight group-hover:text-blue-600 transition-colors">{res.name}</h3>
                        <div className="bg-slate-50 px-2 py-1 rounded-lg border text-xs font-black flex items-center gap-1">
                          <Star className="w-3 h-3 fill-blue-600 text-blue-600" /> {res.averageRating?.toFixed(1) || "5.0"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] mb-4">
                        <MapPin className="w-3 h-3" /> <span>{getDistance(userCoords?.lat, userCoords?.lng, res.latitude, res.longitude)} KM away</span>
                      </div>

                      {/* ✅ రాజు, ఇక్కడ ఫుడ్ ఐటమ్ సెర్చ్ బ్యాడ్జ్ ని తిరిగి యాడ్ చేశాను */}
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

                      <div className="mt-auto">
                        <button disabled={!res.isStoreOpen} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${res.isStoreOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {res.isStoreOpen ? 'Enter Kitchen' : 'Offline'}
                        </button>
                        <button onClick={(e) => handleRateClick(res._id, e)} className="w-full py-2 text-[9px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Give Rating</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
      
      <AnimatePresence>
        {showRatingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-white/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white border border-slate-200 p-12 rounded-[3.5rem] max-w-sm w-full text-center relative shadow-2xl">
              <button onClick={() => setShowRatingModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"> <X className="w-6 h-6"/></button>
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8"><Star className="w-10 h-10 text-blue-600 animate-pulse" /></div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">Rate <span className="text-blue-600 text-5xl block">Sudara</span></h2>
              <div className="flex justify-center gap-3 mb-12">
                {[1, 2, 3, 4, 5].map((num) => (
                  <motion.button key={num} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => setHoverStar(num)} onMouseLeave={() => setHoverStar(0)} onClick={() => submitRating(num)}>
                    <Star className={`w-11 h-11 ${num <= (hoverStar || 0) ? 'text-blue-600 fill-blue-600' : 'text-slate-200 fill-slate-100'}`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
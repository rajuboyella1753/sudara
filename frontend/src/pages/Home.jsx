import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
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
  const [dbColleges, setDbColleges] = useState([]);

  const navigate = useNavigate();

  // 1. Fetch Owners - ఇది ఇప్పుడు దేనికోసం ఆగకుండా డేటా తెస్తుంది
const fetchOwners = async () => {
    try {
      const res = await api.get("/owner/all-owners");
      const allData = Array.isArray(res.data) ? res.data : [];
      
      // ✅ బ్యాకెండ్ లో ఆల్రెడీ isApproved ఫిల్టర్ ఉంది.
      // కాలేజీ పేరు స్పెల్లింగ్ తేడాలున్నా వచ్చేలా trim() & toUpperCase() వాడాను.
      const mbuOnly = allData.filter(r => 
        r.collegeName && r.collegeName.toString().trim().toUpperCase() === "MBU"
      );
      
      const uniqueColleges = [...new Set(allData.map(item => item.collegeName))].filter(Boolean);
      
      setRestaurants(mbuOnly); 
      setDbColleges(uniqueColleges);
      setFilteredRestaurants(mbuOnly);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // 2. Location ని బ్యాక్‌గ్రౌండ్ కి పంపించాను (Commented as requested for speed priority)
  /* const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null,
        { enableHighAccuracy: false, timeout: 3000 }
      );
    }
  };
  */

  useEffect(() => {
    setLoading(true);
    fetchOwners(); // డేటా ఫెచ్చింగ్ మాత్రమే ప్రయారిటీ
    // getLocation(); // లొకేషన్ స్లో చేస్తోంది కాబట్టి ప్రస్తుతానికి పక్కన పెట్టాం
  }, []);

useEffect(() => {
  let result = restaurants;
  if (searchTerm.trim() !== "") {
    const query = searchTerm.toLowerCase();
    // కేవలం హోటల్ పేరు మీద మాత్రమే సెర్చ్ జరుగుతుంది (చాలా ఫాస్ట్ గా ఉంటుంది)
    result = result.filter(r => r.name.toLowerCase().includes(query));
  }
  setFilteredRestaurants(result);
}, [searchTerm, restaurants]);

  // Distance ని ప్రస్తుతానికి "---" గా ఉంచాను లేదా ఫంక్షన్ ని డిసేబుల్ చేశాను
  const getDistance = (lat1, lon1, lat2, lon2) => {
    return "---"; // స్పీడ్ కోసం ప్రస్తుతానికి ఫిక్స్‌డ్ గా ఉంచాను
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

    {/* 🔍 New Professional Search & Dropdown Row */}
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-4">
      
      {/* 1. Search Bar */}
      <div className="relative flex-1 w-full group">
        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-4 h-4 md:w-5 h-5" />
        </div>
        <input 
          type="text" 
          placeholder="Search for restaurant or hotel..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-white border border-slate-200 py-3.5 md:py-5 pl-12 md:pl-16 pr-4 rounded-2xl md:rounded-[2.5rem] text-xs md:text-base outline-none font-bold italic shadow-xl shadow-slate-200/40 focus:border-blue-300 transition-all placeholder:text-slate-300 text-slate-800" 
        />
      </div>

      {/* 🏢 Restaurant Dropdown */}
      <div className="relative w-full md:w-72 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 z-10 pointer-events-none">
          <UtensilsCrossed className="w-4 h-4 md:w-5 h-5" />
        </div>
        <select 
          onChange={(e) => {
            if(e.target.value) handleRestaurantClick(e.target.value);
          }}
          className="w-full bg-white border border-slate-200 py-3.5 md:py-5 pl-12 md:pl-14 pr-10 rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-sm font-black uppercase tracking-widest outline-none shadow-xl shadow-slate-200/40 appearance-none cursor-pointer hover:bg-slate-50 transition-all focus:border-blue-300 text-slate-700"
        >
          <option value="">Quick Select ({restaurants.length})</option>
          {restaurants.map((res) => (
            <option key={res._id} value={res._id} className="font-bold text-slate-800">
              {res.name} {res.isStoreOpen ? "• Active" : "• Offline"}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors">
          <ArrowUpRight className="w-4 h-4 rotate-90" />
        </div>
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
              {filteredRestaurants.map((res) => (
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
                      </div>

                      {/* Distance ని Comment చేయకుండా కేవలం వాల్యూ ని మార్చాను డిజైన్ పాడవకుండా */}
                      <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] mb-4">
                        <MapPin className="w-3 h-3" /> <span>Campus Hub</span>
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

                      <div className="mt-auto">
                        <button disabled={!res.isStoreOpen} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${res.isStoreOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {res.isStoreOpen ? 'Enter Kitchen' : 'Offline'}
                        </button>
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
    </div>
  );
}
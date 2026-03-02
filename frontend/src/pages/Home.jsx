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
  ArrowUpRight,ChevronDown
} from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbColleges, setDbColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("MBU");
  const navigate = useNavigate();

const fetchOwners = async () => {
  try {
    const res = await api.get("/owner/all-owners");
    const allData = Array.isArray(res.data) ? res.data : [];
    
    // అన్ని రెస్టారెంట్లను సెట్ చేస్తున్నాం
    setRestaurants(allData); 
    
    // ఉన్న అన్ని యూనిక్ కాలేజీల లిస్ట్ తీస్తున్నాం
    const uniqueColleges = [...new Set(allData.map(item => item.collegeName))].filter(Boolean);
    setDbColleges(uniqueColleges);
    
    setFilteredRestaurants(allData);
  } catch (err) { 
    console.error("Fetch Error:", err); 
  } finally { 
    setLoading(false); 
  }
};

  // 2. Location ని బ్యాక్‌గ్రౌండ్ కి పంపించాను (Commented as requested for speed priority)
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Location Denied"),
      { enableHighAccuracy: true } // పక్కా లొకేషన్ కోసం ఇది ముఖ్యం
    );
  }
};
const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // ఇక్కడ నీ FCM టోకెన్ ని సర్వర్ కి పంపే లాజిక్ ఉండాలి
      console.log("Notification permission granted! 🎉");
    }
  }
};
  useEffect(() => {
    setLoading(true);
    fetchOwners(); // డేటా ఫెచ్చింగ్ మాత్రమే ప్రయారిటీ
    getLocation(); // లొకేషన్ స్లో చేస్తోంది కాబట్టి ప్రస్తుతానికి పక్కన పెట్టాం
    requestNotificationPermission();
  }, []);

useEffect(() => {
  let result = restaurants;

  // 1. కాలేజీ ఫిల్టర్ (ఇది చాలా ఫాస్ట్ గా ఉంటుంది)
  if (selectedCollege !== "All") {
    result = result.filter(r => 
      r.collegeName && r.collegeName.toString().trim().toUpperCase() === selectedCollege.toUpperCase()
    );
  }

  // 2. సెర్చ్ ఫిల్టర్
  if (searchTerm.trim() !== "") {
    const query = searchTerm.toLowerCase();
    result = result.filter(r => r.name.toLowerCase().includes(query));
  }

  // 3. డిస్టెన్స్ సార్టింగ్
  if (userCoords) {
    result = [...result].sort((a, b) => {
      const distA = a.latitude ? getDistanceRaw(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 999;
      const distB = b.latitude ? getDistanceRaw(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 999;
      return distA - distB;
    });
  }

  setFilteredRestaurants(result);
}, [searchTerm, restaurants, userCoords, selectedCollege]); // selectedCollege ఇక్కడ యాడ్ చెయ్

  // Distance ని ప్రస్తుతానికి "---" గా ఉంచాను లేదా ఫంక్షన్ ని డిసేబుల్ చేశాను
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
  
  const R = 6371; // భూమి వ్యాసార్థం (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // కిలోమీటర్లలో దూరం
  
  return distance < 1 
    ? `${(distance * 1000).toFixed(0)} meters` // 1km కంటే తక్కువ ఉంటే మీటర్లలో
    : `${distance.toFixed(1)} km`; // లేదంటే కిలోమీటర్లలో
};
const getDistanceRaw = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <Navbar />
{/* 🚀 ADMIN GLOBAL BROADCAST BANNER */}
<AnimatePresence>
  {(() => {
    const adminMsg = restaurants.find(r => r.collegeName === "General")?.todaySpecial;
    if (!adminMsg) return null;

    return (
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-slate-900 text-white overflow-hidden sticky top-0 z-[100] border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-600 p-1.5 rounded-lg shrink-0 animate-pulse">
              <Bell className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[10px] md:text-xs font-black uppercase italic tracking-wider truncate">
              <span className="text-blue-400">System Alert:</span> {adminMsg}
            </p>
          </div>
          
          <button 
            onClick={() => { /* Close logic if needed */ }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </motion.div>
    );
  })()}
</AnimatePresence>
      {/* 🏛️ Minimalist Hero Header */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 uppercase leading-none text-slate-900"
            >
              SUDARA <span className="text-blue-600">HUB</span>
            </motion.h1>
            <div className="h-1 w-20 bg-blue-600 rounded-full mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[9px] md:text-xs">
              Integrated Campus Dining Protocol
            </p>
          </div>

          {/* 🛠️ Modern Control Bar - Grid Layout */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search - Takes 6 columns */}
            <div className="lg:col-span-6 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search restaurant Name..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 py-4 md:py-5 pl-14 pr-6 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/5 transition-all placeholder:text-slate-300" 
              />
            </div>

            {/* College Select - Takes 3 columns */}
            <div className="lg:col-span-3 relative group">
              <Compass className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
              <select 
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-4 md:py-5 pl-14 pr-10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-white transition-all focus:border-blue-400 text-slate-600"
              >
                <option value="All">All Campuses</option>
                {dbColleges.map((col, idx) => (
                  <option key={idx} value={col}>{col.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Quick Access - Takes 3 columns */}
            <div className="lg:col-span-3 relative group">
              <UtensilsCrossed className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
              <select 
                onChange={(e) => { if(e.target.value) handleRestaurantClick(e.target.value); }}
                className="w-full bg-blue-600 text-white border border-blue-700 py-4 md:py-5 pl-14 pr-10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <option value="">Quick Select ({restaurants.length})</option>
                {restaurants.map((res) => (
                  <option key={res._id} value={res._id} className="bg-white text-slate-900 font-bold">
                    {res.name}
                  </option>
                ))}
              </select>
              <ArrowUpRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-100 rotate-90" />
            </div>

          </div>
        </div>
      </section>

      {/* 🍱 Content Grid - Better Spacing */}
      <main className="max-w-7xl mx-auto px-6 py-16 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center py-24">
             <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="mt-6 font-bold uppercase text-slate-400 text-[10px] tracking-widest">Loading Architecture...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filteredRestaurants.map((res) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={res._id} 
                  className="group" 
                  onClick={() => res.isStoreOpen && handleRestaurantClick(res._id)}
                >
                  <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer">
                    
                    {/* Square Image Layout */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img 
                        src={res.hotelImage || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?w=500"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt={res.name} 
                      />
                      
                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[9px] font-black uppercase tracking-tight text-slate-700">
                          {res.isStoreOpen ? 'Online' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {res.name}
                        </h3>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" /> 
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {userCoords && res.latitude
                              ? getDistance(userCoords.lat, userCoords.lng, res.latitude, res.longitude) 
                              : "Campus Hub"}
                          </span>
                        </div>
                        
                        {/* Match Indicator */}
                        {searchTerm && res.items?.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) && i.isAvailable) && (
                          <div className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-1 rounded-md uppercase italic">
                            Match Found
                          </div>
                        )}
                      </div>

                      {/* Simple Action Button */}
                      <button 
                        disabled={!res.isStoreOpen} 
                        className={`mt-6 w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                          res.isStoreOpen 
                          ? 'bg-slate-900 text-white hover:bg-blue-600' 
                          : 'bg-slate-50 text-slate-300'
                        }`}
                      >
                        {res.isStoreOpen ? 'View Menu' : 'Offline'}
                      </button>
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
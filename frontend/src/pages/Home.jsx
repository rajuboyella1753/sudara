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
  Compass, 
  ArrowUpRight,
  ChevronDown,
  Bell,
  Activity
} from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [dbStates, setDbStates] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState("All");

  const navigate = useNavigate();

const fetchOwners = async () => {
  try {
    const res = await api.get("/owner/all-owners");
    const allData = Array.isArray(res.data) ? res.data : [];
    
    const sanitizedData = allData.map(res => ({
      ...res,
      state: res.state ? res.state.trim() : "Other",
      district: res.district ? res.district.trim() : "Other",
      foodType: res.foodType ? res.foodType.trim() : "Both" 
    }));

    setRestaurants(sanitizedData); 
    
    const uniqueStates = [...new Set(sanitizedData.map(item => item.state))]
      .filter(s => s && s !== "Other" && s !== "Not Specified");

    const uniqueDistricts = [...new Set(sanitizedData.map(item => item.district))]
      .filter(d => d && d !== "Other" && d !== "Not Specified");
    
    setDbStates(uniqueStates);
    setDbDistricts(uniqueDistricts);
    setFilteredRestaurants(sanitizedData);
  } catch (err) { 
    console.error("Fetch Error:", err); 
  } finally { 
    setLoading(false); 
  }
};

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("Location Denied"),
        { enableHighAccuracy: true }
      );
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted! 🎉");
      }
    }
  };

  useEffect(() => {
    const APP_VERSION = "1.3"; 
    const lastVersion = localStorage.getItem("app_version");

    if (lastVersion !== APP_VERSION) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => caches.delete(name));
        });
      }
      localStorage.clear();
      localStorage.setItem("app_version", APP_VERSION);
      window.location.reload(true); 
    }

    setLoading(true);
    fetchOwners();
    getLocation();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    let result = restaurants;

    if (selectedState !== "All") {
      result = result.filter(r => 
        r.state && r.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    if (selectedDistrict !== "All") {
      result = result.filter(r => 
        r.district && r.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    if (selectedFoodType !== "All") {
      result = result.filter(r => {
        const resType = r.foodType;
        const filterType = selectedFoodType;
        if (filterType === "Veg") return resType === "Veg" || resType === "Both";
        if (filterType === "Non-Veg") return resType === "Non-Veg" || resType === "Both";
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(query));
    }

    if (userCoords) {
      result = [...result].sort((a, b) => {
        const distA = a.latitude ? getDistanceRaw(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 999;
        const distB = b.latitude ? getDistanceRaw(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 999;
        return distA - distB;
      });
    }

    setFilteredRestaurants(result);
  }, [searchTerm, restaurants, userCoords, selectedState, selectedDistrict, selectedFoodType]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "---";
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
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
    /* 🚀 RAJU FIX: Dynamic Background with Blue & Orange Mesh */
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10 pointer-events-none opacity-60"></div>
      
      <Navbar />
      
      <AnimatePresence>
        {(() => {
          const adminMsg = restaurants.find(r => r.collegeName === "General")?.todaySpecial;
          if (!adminMsg) return null;
          return (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-orange-600 text-white overflow-hidden sticky top-0 z-[100] border-b border-orange-500 shadow-lg">
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-white animate-bounce" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-wider truncate leading-none">System Alert: {adminMsg}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/50" />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <section className="relative pt-24 pb-12 md:pt-40 md:pb-24 overflow-hidden">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-40 -right-20 w-64 h-64 bg-orange-400/10 blur-[100px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 uppercase leading-none drop-shadow-sm">
              <span className="text-blue-600">SUDARA</span> <span className="text-orange-600">HUB</span>
            </motion.h1>
            <div className="h-2 w-32 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 rounded-full mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[9px] md:text-xs">Integrated Dining Network Protocol</p>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-all" />
                <input type="text" placeholder="Search restaurant name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 py-5 pl-14 pr-6 rounded-[2rem] text-sm font-bold outline-none focus:border-blue-400 transition-all shadow-xl shadow-blue-900/5 placeholder:text-slate-300" />
              </div>

              <div className="md:col-span-3 relative group">
                <Compass className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full bg-white border border-slate-200 py-5 pl-14 pr-10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-orange-400 shadow-xl shadow-orange-900/5 text-slate-600">
                  <option value="All">All States</option>
                  {dbStates.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <div className="md:col-span-3 relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full bg-white border border-slate-200 py-5 pl-14 pr-10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-blue-400 shadow-xl shadow-blue-900/5 text-slate-600">
                  <option value="All">All Districts</option>
                  {dbDistricts.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

         <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 w-full px-4 mt-6">
  {["Veg", "Non-Veg"].map((type) => (
    <button 
      key={type} 
      onClick={() => setSelectedFoodType(selectedFoodType === type ? "All" : type)}
      /* 🚀 RAJU FIX: flex-1 for mobile (50/50 split), sm:flex-none for desktop */
      className={`
        flex-1 sm:flex-none sm:min-w-[180px] 
        px-4 sm:px-8 py-3.5 sm:py-4 
        rounded-xl sm:rounded-[1.5rem] 
        text-[10px] sm:text-xs font-black uppercase tracking-widest 
        transition-all duration-500 border-2 active:scale-95
        ${
          selectedFoodType === type 
          ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 scale-105" 
          : "bg-white text-slate-600 border-slate-100 hover:border-orange-300 hover:text-orange-600"
        }
      `}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* 🟢/🔴 Dot logic remains same */}
        <div className={`
          w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full 
          ${type === 'Veg' ? 'bg-emerald-500' : 'bg-rose-500'} 
          ${selectedFoodType === type ? 'animate-pulse' : ''}
        `} />
        
        <span className="whitespace-nowrap">
          {type}
        </span>
      </div>
    </button>
  ))}
</div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20 min-h-[600px] relative">
        {/* Background Mesh Overlay for Main area */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-100/30 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-100/30 blur-[120px] rounded-full -z-10"></div>

        {loading ? (
          <div className="flex flex-col items-center py-32">
             <Activity className="w-12 h-12 text-blue-600 animate-spin" />
             <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Matrix...</p>
          </div>
        ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <AnimatePresence>
    {filteredRestaurants.map((res) => (
      <motion.div 
        layout 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        key={res._id} 
        className="group h-full"
        onClick={() => res.isStoreOpen && handleRestaurantClick(res._id)}
      >
        <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer">
          
          {/* 🖼️ Image Section - Clean (Distance Removed from here) */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <img 
              src={res.hotelImage || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?w=500"} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt={res.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
          
          {/* 📝 Content Section */}
          <div className="p-6 flex flex-col flex-grow">
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors leading-none truncate pr-2">
                {res.name}
              </h3>
              {/* LIVE/CLOSED Indicator */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-black text-[9px] uppercase tracking-tighter ${res.isStoreOpen ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {res.isStoreOpen ? 'LIVE' : 'CLOSED'}
              </div>
            </div>

            {/* 📍 Location & Distance Badges - Shifted Distance here */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Distance Badge */}
              <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 shadow-sm">
                <MapPin className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {userCoords && res.latitude ? getDistance(userCoords.lat, userCoords.lng, res.latitude, res.longitude) : "Locate"}
                </span>
              </div>
              
              <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 italic">
                {res.district}
              </span>
              <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 italic">
                {res.collegeName}
              </span>
            </div>

            {/* 🚀 Action Button */}
            <div className="mt-auto">
              <button 
                disabled={!res.isStoreOpen} 
                className={`w-full group/btn relative py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-300 overflow-hidden flex items-center justify-center gap-3 ${
                  res.isStoreOpen 
                    ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)] hover:shadow-blue-600/30 active:scale-95' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{res.isStoreOpen ? 'Enter Restaurant' : 'CURRENTLY CLOSED'}</span>
                {res.isStoreOpen && <ArrowUpRight className="relative z-10 w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />}
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
      
      {/* 🚀 CSS for smooth scrolling and animations */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
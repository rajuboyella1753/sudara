import { useEffect, useState, useMemo } from "react";
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
  Activity,
} from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSearched, setAiSearched] = useState(false);
  const [dbStates, setDbStates] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("Andhra Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState("Select");
  const [selectedFoodType, setSelectedFoodType] = useState("All");
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [travelDuration, setTravelDuration] = useState(0);
  const [selectedHubType, setSelectedHubType] = useState("Restaurant");
  // 🚀 RAJU NEW STATE: Route-Foodi Planner
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const availableDistricts = useMemo(() => {
    let filtered = restaurants;
    if (selectedHubType !== "All") {
      filtered = filtered.filter(r => r.category?.toLowerCase() === selectedHubType.toLowerCase());
    }
    if (selectedState !== "All") {
      filtered = filtered.filter(r => r.state?.toLowerCase() === selectedState.toLowerCase());
    }
    const districts = filtered.map(r => r.district).filter(d => d && d !== "Other" && d !== "Not Specified");
    return [...new Set(districts)];
  }, [selectedState, selectedHubType, restaurants]);

  const navigate = useNavigate();

  const fetchOwners = async () => {
    try {
      const res = await api.get("/owner/all-owners");
      const allData = Array.isArray(res.data) ? res.data : [];
      
      const sanitizedData = allData.map(res => ({
        ...res,
        state: res.state ? res.state.trim() : "Other",
        district: res.district ? res.district.trim() : "Other",
        foodType: res.foodType ? res.foodType.trim() : "Both",
        category: res.category ? res.category.trim() : "Restaurant"
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
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log("📍 USER LOCATION:", {
            latitude: lat,
            longitude: lng
          });

          setUserCoords({
            lat,
            lng
          });
        },
        (err) => {
          console.error("❌ Location Denied:", err);
        },
        {
          enableHighAccuracy: true
        }
      );
    } else {
      console.error("❌ Geolocation is not supported");
    }
  };

  const handleAISearch = async () => {
    const query = searchTerm.trim();

    if (!query) return;

    setAiLoading(true);
    setAiSearched(true);

    try {
      const response = await api.post("/search/universal-ai", {
        query,
        state: selectedState,
        district: selectedDistrict,
        latitude: userCoords?.lat ?? null,
        longitude: userCoords?.lng ?? null,
      });

      console.log("🤖 SUDARA AI SEARCH:", response.data);

      setAiResults(response.data?.results || []);
    } catch (error) {
      console.error(
        "❌ SUDARA AI SEARCH ERROR:",
        error.response?.data || error.message
      );

      setAiResults([]);
    } finally {
      setAiLoading(false);
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
    // 1. ఒకవేళ రూట్ మోడ్ ఆఫ్‌లో ఉండి, యూజర్ ఇంకా డిస్ట్రిక్ట్ సెలెక్ట్ చేయకపోతే లిస్ట్ ఖాళీగా ఉంచాలి
    if (!isTravelMode && selectedDistrict === "Select") {
      setFilteredRestaurants([]);
      return;
    }

    let result = restaurants;

    // 2. Hub Type Filter (Restaurant, Electronics, Clothing, etc.)
    if (selectedHubType !== "All") {
      result = result.filter(r => {
        const cat = r.category?.toLowerCase() || "";
        return cat === selectedHubType.toLowerCase();
      });
    }

    // 3. Highway Mode / Travel Mode Filter
    if (isTravelMode && destination.trim() !== "") {
      const destQuery = destination.trim().toLowerCase(); 
      const srcQuery = source.trim().toLowerCase();
      
      result = result.filter(r => {
        const dist = r.district?.toLowerCase() || "";
        const addr = r.address?.toLowerCase() || "";
        return dist.includes(destQuery) || dist.includes(srcQuery) || addr.includes(destQuery) || addr.includes(srcQuery);
      });
    }

    // 4. State & District Filter
    if (!isTravelMode) {
      if (selectedState !== "All") {
        result = result.filter(r => r.state && r.state.toLowerCase() === selectedState.toLowerCase());
      }

      if (selectedDistrict !== "Select" && selectedDistrict !== "All") {
        result = result.filter(r => r.district && r.district.toLowerCase() === selectedDistrict.toLowerCase());
      }
    }

    // 5. Food Type Filter
    if (selectedFoodType !== "All") {
      result = result.filter(r => {
        const resType = r.foodType;
        const filterType = selectedFoodType;
        if (filterType === "Veg") return resType === "Veg" || resType === "Both";
        if (filterType === "Non-Veg") return resType === "Non-Veg" || resType === "Both";
        return true;
      });
    }

    // 6. Search Bar Filter
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(query));
    }

    setFilteredRestaurants(result);
  }, [searchTerm, restaurants, userCoords, selectedState, selectedDistrict, selectedFoodType, selectedHubType, isTravelMode, source, destination]);

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
    <div className="min-h-screen bg-[#070B2E] text-white font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-950 via-[#070B2E] to-blue-950 -z-10 pointer-events-none opacity-90"></div>
      
      <div className="relative z-[100]">
        <Navbar />
      </div>
      
      <AnimatePresence>
        {(() => {
          const adminMsg = restaurants.find(r => r.collegeName === "General")?.todaySpecial;
          if (!adminMsg) return null;
          return (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white overflow-hidden sticky top-0 z-[100] border-b border-blue-400/30 shadow-lg shadow-blue-950/40">
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

      <section className="relative pt-28 pb-10 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-500/15 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 -right-20 w-64 h-64 bg-violet-500/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Heading */}
          <div className="relative z-10 flex flex-col items-center text-center mb-10 md:mb-14">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter mb-3 uppercase leading-none drop-shadow-[0_0_25px_rgba(59,130,246,0.25)]">
              <span className="text-blue-400">SUDARA</span> <span className="text-orange-400">HUB</span>
            </motion.h1>
            <div className="h-2 w-24 sm:w-32 bg-gradient-to-r from-blue-500 via-cyan-400 to-orange-400 rounded-full mb-4 shadow-lg shadow-blue-500/30"></div>
            <p className="text-slate-300 font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[8px] sm:text-[10px] md:text-xs">Integrated Network Protocol</p>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col gap-5">
            
            {/* 🚀 Hub Type Responsive Tabs Bar */}
            <div className="w-full">
              <div className="relative group">
                <Compass className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400 pointer-events-none" />
                <select 
                  value={selectedHubType} 
                  onChange={(e) => {
                    setSelectedHubType(e.target.value);
                    setSelectedState("All");      
                    setSelectedDistrict("Select"); 
                  }}
                  className="w-full bg-[#0D133D] border border-blue-500/20 py-4 sm:py-5 pl-12 sm:pl-14 pr-10 rounded-[1.75rem] sm:rounded-[2rem] text-[10px] sm:text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-blue-400 shadow-xl shadow-black/30 text-white"
                >
                  <option value="All">All Categories</option>
                  {Array.isArray(restaurants) && Array.from(new Set(restaurants.map(r => r.category))).filter(Boolean).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Main Search & Dropdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
              
              {/* State Select Dropdown */}
              <div className="md:col-span-3 relative group">
                <Compass className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <select 
                  value={selectedState} 
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict("All"); 
                  }}
                  className="w-full bg-[#0D133D] border border-orange-500/20 py-4 sm:py-5 pl-12 sm:pl-14 pr-10 rounded-[1.75rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-orange-400 shadow-xl shadow-black/30 text-white"
                >
                  <option value="All">All States</option>
                  {dbStates.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* District Select Dropdown */}
              <div className="md:col-span-3 relative group">
                <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)} 
                  className="w-full bg-[#0D133D] border border-blue-500/20 py-4 sm:py-5 pl-12 sm:pl-14 pr-10 rounded-[1.75rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-blue-400 shadow-xl shadow-black/30 text-white"
                >
                  <option value="Select">❌ Select District</option>
                  <option value="All">All Districts</option>
                  {availableDistricts.map((d, idx) => (
                    <option key={idx} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* AI Search Bar */}
              <div className="md:col-span-6 relative group">
                <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Ask Sudara AI... e.g. chicken biryani under ₹250"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAISearch();
                    }
                  }}
                  className="w-full bg-[#0D133D] border-2 border-blue-500/30 py-4 sm:py-5 pl-16 pr-16 rounded-[1.75rem] sm:rounded-[2rem] text-xs sm:text-sm font-bold text-white outline-none focus:border-blue-400 transition-all shadow-xl shadow-black/30 placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={handleAISearch}
                  disabled={aiLoading || !searchTerm.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-500 hover:to-violet-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40"
                >
                  {aiLoading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Veg/Non-Veg Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full mt-2">
              <div className="flex gap-2.5 w-full sm:w-auto">
                {selectedHubType?.trim().toLowerCase() === "restaurant" &&
                  ["Veg", "Non-Veg"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setSelectedFoodType(
                          selectedFoodType === type ? "All" : type
                        )
                      }
                      className={`flex-1 sm:min-w-[140px] px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 active:scale-95 ${
                        selectedFoodType === type
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40 scale-105"
                          : "bg-[#0D133D] text-slate-200 border-slate-700/50 hover:border-orange-400"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            type === "Veg"
                              ? "bg-emerald-400"
                              : "bg-rose-400"
                          } ${
                            selectedFoodType === type
                              ? "animate-pulse"
                              : ""
                          }`}
                        />
                        <span className="whitespace-nowrap">
                          {type}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Route Planner Input Box (Collapsible) */}
            <AnimatePresence>
              {isTravelMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 bg-[#0D133D] p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-orange-400/20 shadow-2xl shadow-black/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input 
                        type="text" 
                        placeholder="Starting From (e.g., Khammam)" 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)} 
                        className="w-full bg-[#080D32] border border-slate-700/60 py-3.5 sm:py-4 pl-12 pr-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-400 transition-all placeholder:text-slate-500" 
                      />
                    </div>
                    <div className="relative">
                      <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                      <input 
                        type="text" 
                        placeholder="Going To (e.g., Vijayawada)" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        className="w-full bg-[#080D32] border border-slate-700/60 py-3.5 sm:py-4 pl-12 pr-4 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-400 transition-all placeholder:text-slate-500" 
                      />
                    </div>
                  </div>
                  <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 bg-orange-500/10 p-3.5 rounded-2xl border border-orange-400/20">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-orange-300 italic tracking-wider">🛣️ Showing Sudara Hubs along your highway route</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">ETA Sync: ON</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20 min-h-[600px] relative">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>

        {aiSearched ? (
          // =====================================================
          // 🤖 SUDARA AI SEARCH RESULTS
          // =====================================================
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                  SUDARA AI
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white">
                  Search Results
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Results for "{searchTerm}"
                </p>
              </div>

              <button
                onClick={() => {
                  setAiResults([]);
                  setAiSearched(false);
                  setSearchTerm("");
                }}
                className="px-4 py-2 rounded-xl bg-[#151C4D] text-slate-300 text-[9px] font-black uppercase tracking-widest hover:bg-[#202B68] border border-slate-700/50"
              >
                Clear
              </button>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Activity className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Sudara AI is searching...
                </p>
              </div>
            ) : aiResults.length === 0 ? (
              <div className="bg-[#0D133D] border border-slate-700/50 rounded-[2rem] p-12 text-center shadow-xl shadow-black/30">
                <Search className="w-10 h-10 mx-auto text-slate-600" />
                <h3 className="mt-4 text-lg font-black uppercase italic text-white">
                  No matching items found
                </h3>
                <p className="mt-2 text-xs font-bold text-slate-400">
                  Try another item or search naturally.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiResults.map((item) => (
                  <motion.div
                    key={item.itemId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0D133D] rounded-[2rem] border border-slate-700/50 overflow-hidden shadow-lg shadow-black/30 hover:shadow-2xl hover:shadow-blue-950/40 transition-all"
                  >
                    {item.image && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                            {item.itemName}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">
                            {item.owner?.name}
                          </p>
                        </div>
                        <span className="text-lg font-black text-orange-400">
                          ₹{item.price}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5">
                        {userCoords &&
                          item.owner?.latitude &&
                          item.owner?.longitude && (
                            <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-[9px] font-black uppercase border border-blue-400/20">
                              📍{" "}
                              {getDistance(
                                userCoords.lat,
                                userCoords.lng,
                                item.owner.latitude,
                                item.owner.longitude
                              )}
                            </span>
                          )}

                        <span
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${
                            item.isAvailable
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
                              : "bg-red-500/10 text-red-300 border border-red-400/20"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>

                        {item.owner?.averageRating > 0 && (
                          <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 text-[9px] font-black uppercase border border-orange-400/20">
                            ⭐ {item.owner.averageRating}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-400 font-medium mt-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 pt-5 border-t border-slate-700/50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {item.owner?.address ||
                            item.owner?.district ||
                            "Location available"}
                        </p>

                        <button
                          onClick={() =>
                            navigate(`/restaurant/${item.owner?.id}`)
                          }
                          className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-500 hover:to-violet-600 transition-all shadow-lg shadow-blue-950/40"
                        >
                          {item.owner?.category?.trim().toLowerCase() === "restaurant"
                            ? "Enter Restaurant"
                            : item.owner?.category?.trim().toLowerCase() === "automobile"
                            ? "Enter Automobile Showroom"
                            : item.owner?.category?.trim().toLowerCase() === "electronics"
                            ? "Enter Electronics Store"
                            : item.owner?.category?.trim().toLowerCase() === "clothing"
                            ? "Enter Clothing Store"
                            : item.owner?.category?.trim().toLowerCase() === "furniture"
                            ? "Enter Furniture Hub"
                            : item.owner?.category?.trim().toLowerCase() === "grocery"
                            ? "Enter Grocery Store"
                            : item.owner?.category?.trim().toLowerCase() === "services"
                            ? "Enter Services Hub"
                            : `Enter ${item.owner?.category || "Store"}`}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        ) : (
          // =====================================================
          // 🏪 EXISTING SUDARA HUB LIST
          // =====================================================
          loading ? (
            <div className="flex flex-col items-center py-32">
              <Activity className="w-12 h-12 text-blue-400 animate-spin" />
              <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                Syncing Matrix...
              </p>
            </div>
          ) : (!isTravelMode && selectedDistrict === "Select") ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 border border-blue-400/20 shadow-md shadow-blue-950/30 animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">
                Discover Your Neighborhood
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                Please select your district above to explore Sudara Hubs
              </p>
            </motion.div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xs font-black text-orange-400 uppercase tracking-widest">
                No Sudara Hubs registered in this region yet!
              </p>
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
                    onClick={() =>
                      res.isStoreOpen &&
                      handleRestaurantClick(res._id)
                    }
                  >
                    <div className="flex flex-col h-full bg-[#0D133D] rounded-[2rem] border border-slate-700/50 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.25)] hover:border-blue-500/40 transition-all duration-500 cursor-pointer">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                          src={res.hotelImage || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?w=500"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt={res.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none truncate pr-2">
                            {res.name}
                          </h3>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-black text-[9px] uppercase tracking-tighter ${res.isStoreOpen ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300' : 'bg-red-500/10 border-red-400/20 text-red-300'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${res.isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {res.isStoreOpen ? 'LIVE' : 'CLOSED'}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-6">
                          <div className="flex items-center gap-1 bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-md border border-blue-400/20 shadow-sm">
                            <MapPin className="w-3 h-3 text-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {userCoords && res.latitude ? getDistance(userCoords.lat, userCoords.lng, res.latitude, res.longitude) : "Locate"}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50 italic">
                            {res.district}
                          </span>
                          <span className="text-[9px] font-black text-blue-300 uppercase bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-400/20 italic">
                            {res.collegeName}
                          </span>
                        </div>

                        <div className="mt-auto">
                          <button 
                            onClick={() => navigate(`/restaurant/${res._id}`)} 
                            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-500 hover:to-violet-600 transition-all shadow-lg shadow-blue-950/40"
                          >
                            {res.category?.trim().toLowerCase() === "restaurant"
                              ? "Enter Restaurant"
                              : res.category?.trim().toLowerCase() === "automobile"
                              ? "Enter Automobile Showroom"
                              : res.category?.trim().toLowerCase() === "electronics"
                              ? "Enter Electronics Store"
                              : res.category?.trim().toLowerCase() === "clothing"
                              ? "Enter Clothing Store"
                              : res.category?.trim().toLowerCase() === "furniture"
                              ? "Enter Furniture Hub"
                              : res.category?.trim().toLowerCase() === "grocery"
                              ? "Enter Grocery Store"
                              : res.category?.trim().toLowerCase() === "services"
                              ? "Enter Service Center"
                              : `Enter ${res.category || "Store"}`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        )}
      </main>

      <Footer />
       
      <style>{` 
        .scrollbar-hide::-webkit-scrollbar { display: none; } 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } 
      `}</style> 
    </div> 
  ); 
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, LogOut, Search, BarChart3, Store, X, 
  TrendingUp, Calendar, Activity, Star, MapPin, CreditCard,
  ArrowUpRight, LayoutDashboard, Globe, Menu, Bell, Filter,
  ChevronRight, RefreshCw,Send,ShoppingBag,UtensilsCrossed,PhoneCall
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [availableColleges, setAvailableColleges] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [viewMode, setViewMode] = useState("daily");

// 🚀 1. ఫస్ట్ టైమ్ పేజీ లోడ్ అయినప్పుడు మొత్తం డేటాను లాగడానికి (నీ పాత యూజ్ ఎఫెక్ట్ రాజు)
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/admin-all-owners");
      const ownersData = Array.isArray(res.data) ? res.data : [];
      setOwners(ownersData);
      
      // అవైలబుల్ స్టేట్స్ ని యూనిక్ గా సెట్ చేయడం
      const states = [...new Set(ownersData.map(o => o.state))].filter(Boolean);
      setAvailableStates(states);
      
      // బై-డిఫాల్ట్ ఫస్ట్ టైమ్ అన్ని జిల్లాలను చూపిస్తాం
      const districts = [...new Set(ownersData.map(o => o.district))].filter(Boolean);
      setAvailableDistricts(districts);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };
  fetchInitialData();
}, []);


// 🚀 2. రాజు అడ్మిన్ మ్యాజిక్: అడ్మిన్ స్టేట్ మార్చిన ప్రతిసారి డిస్ట్రిక్ట్స్ ని ఫిల్టర్ చేసే కొత్త యూజ్ ఎఫెక్ట్!
useEffect(() => {
  // ఒకవేళ అడ్మిన్ "All" సెలెక్ట్ చేస్తే, మెయిన్ లిస్ట్ లోని అన్ని జిల్లాలను చూపిస్తాం
  if (selectedState === "All") {
    const allDistricts = [...new Set(owners.map(o => o.district))].filter(Boolean);
    setAvailableDistricts(allDistricts);
  } else {
    // ఒకవేళ పర్టిక్యులర్ స్టేట్ సెలెక్ట్ చేస్తే... కేవలం ఆ స్టేట్ కి సంబంధించిన జిల్లాలను మాత్రమే ఫిల్టర్ చేస్తాం రాజు!
    const filteredDistricts = [...new Set(
      owners
        .filter(o => o.state === selectedState)
        .map(o => o.district)
    )].filter(Boolean);
    
    setAvailableDistricts(filteredDistricts);
  }

  // 🎯 సేఫ్టీ చెక్: స్టేట్ మారినప్పుడు డిస్ట్రిక్ట్ సెలెక్షన్ ని మళ్లీ "All" కి రీసెట్ చేస్తున్నాం రాజు
  setSelectedDistrict("All"); 
}, [selectedState, owners]); // 🔥 selectedState మారిన ప్రతిసారి ఈ మ్యాజిక్ రన్ అవుతుంది!

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/admin-all-owners"); 
      setOwners(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

const deleteOwnerForever = async (id, name) => {
  const confirmDelete = window.confirm(`⚠️ DANGER: Are you sure you want to delete "${name}"? \n\nThis will remove the owner and ALL their food items from Database. This cannot be undone!`);
  
  if (confirmDelete) {
    try {
      await api.delete(`/owner/delete-owner/${id}`);
      // UI update (Refresh avasaram lekunda card vellipothundi)
      setOwners(prev => prev.filter(owner => owner._id !== id)); 
      alert("Erased from Matrix! 🧹");
    } catch (err) {
      alert("Delete failed! Check network.");
    }
  }
};
const getRangeStats = (analytics) => {
  if (!analytics) return { hits: 0, orders: 0, postOrders: 0, calls: 0 };
  
  // 🎯 Map ని ఆబ్జెక్ట్‌గా మార్చుకుంటున్నాం
  const analyticsObj = analytics instanceof Map ? Object.fromEntries(analytics) : analytics;
  let stats = { hits: 0, orders: 0, postOrders: 0, calls: 0 };
  
  let current = new Date(startDate);
  let end = new Date(endDate);
  
  while (current <= end) {
    // 🎯 రాజు, ఇక్కడ 'padStart' తీసేయాలి! అప్పుడే "8/3/2026" కి మ్యాచ్ అవుతుంది.
    const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;

    // డేటాని తీసుకోవడం (పాత డేటాలో _doc ఉండే ఛాన్స్ ఉంది కాబట్టి ఇలా)
    const rawData = analyticsObj[dKey] || {};
    const dayData = rawData._doc || rawData;

    stats.hits += Number(dayData.kitchen_entry || 0);
    stats.orders += Number(dayData.pre_order_click || 0);
    stats.postOrders += Number(dayData.post_order_click || 0); 
    stats.calls += Number(dayData.call_click || 0);
    
    current.setDate(current.getDate() + 1);
  }
  return stats;
};

const getSubscriptionStatus = (createdAt, ownerId) => {
  let joinDate;
  if (createdAt) {
    joinDate = new Date(createdAt);
  } else if (ownerId && typeof ownerId === 'string' && ownerId.length === 24) {
    joinDate = new Date(parseInt(ownerId.substring(0, 8), 16) * 1000);
  }
  if (!joinDate || isNaN(joinDate.getTime())) {
    return { status: "Unknown", message: "Syncing...", isExpired: false };
  }
  const today = new Date();
  const start = new Date(joinDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) {
    const daysLeft = 30 - diffDays;
    return { 
      status: "Trialing", 
      message: daysLeft <= 0 ? "Last day of Trial" : `${daysLeft} days left in Free Trial`, 
      isExpired: false 
    };
  } else {
    return { 
      status: "Payment Due", 
      message: "Subscription Expired! (₹299)", 
      isExpired: true 
    };
  }
};

  const updateApprovalStatus = async (id, status) => {
    try {
      await api.put(`/owner/approve-owner/${id}`, { isApproved: status });
      setOwners(prev => prev.map(o => o._id === id ? { ...o, isApproved: status } : o));
    } catch (err) { alert("Status Update Failed ❌"); }
  };

const sendAdminBroadcast = async () => {
  if (!broadcastMsg.title || !broadcastMsg.body) return alert("Title and Body are required! 📢");
  
  try {
    setSending(true);
    
    // 🚀 RAJU FIX: Web compatible notification payload
    const payload = {
      title: broadcastMsg.title,
      body: broadcastMsg.body,
      // click_action ni tisesi direct data link pampali
      data: {
        url: "https://sudara.in" 
      }
    };

    const res = await api.post("/owner/broadcast-to-all", payload);
    
    if (res.data.success) {
      alert(`🚀 System Alert Sent to Users!`);
      setBroadcastMsg({ title: "", body: "" });
      setIsBroadcasting(false);
    }
  } catch (err) {
    alert("Broadcast failed!");
  } finally {
    setSending(false);
  }
};

  const selectedDateFormatted = new Date(filterDate).toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');

const filteredList = owners.filter(owner => {
  // 🚀 RAJU FIX: Strict "General" check - General colleges ni filter chesthunnam
  const isNotGeneral = owner.collegeName && owner.collegeName !== "General";
  
  // 1. Tab Filter
  let matchesTab = true;
  if (activeTab === "pending") matchesTab = !owner.isApproved;
  else if (activeTab === "approved") matchesTab = owner.isApproved;
  else if (activeTab === "analytics") matchesTab = owner.isApproved === true;

  // 2. Regional Filter
  const matchesState = selectedState === "All" || owner.state === selectedState;
  const matchesDistrict = selectedDistrict === "All" || owner.district === selectedDistrict;

  // 3. Search Filter
  const matchesSearch = (owner.name || "").toLowerCase().includes(searchTerm.toLowerCase());

  // ✅ Ikkada 'isNotGeneral' ni return condition lo add chesa
  return isNotGeneral && matchesTab && matchesState && matchesDistrict && matchesSearch;
});

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-blue-600 font-black px-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw className="w-12 h-12 text-blue-600" />
      </motion.div>
      <p className="mt-6 tracking-[0.3em] uppercase text-[10px] text-slate-400 font-bold animate-pulse">Syncing Intel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col lg:flex-row overflow-hidden relative font-sans">
      
      {/* 📱 MOBILE TOP BAR */}
      <div className="lg:hidden bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><ShieldCheck className="w-5 h-5"/></div>
            <span className="font-black italic tracking-tighter text-sm uppercase text-slate-900">SUDARA <span className="text-blue-600">INTEL</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-xl border border-slate-200 active:scale-90 transition-all">
            <Menu className="w-5 h-5 text-slate-600"/>
          </button>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative w-[280px] bg-white border-r border-slate-200 flex flex-col z-[80] transition-transform duration-500 ease-out shadow-2xl lg:shadow-none`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200"><ShieldCheck className="text-white w-6 h-6" /></div>
            <div className="flex flex-col leading-none">
                <span className="font-black text-xl italic tracking-tighter text-slate-900 leading-none">SUDARA</span>
                <span className="text-blue-600 text-[8px] tracking-[0.4em] font-black uppercase mt-1">Control Hub</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X /></button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'analytics', label: 'Matrix Insights', icon: BarChart3 }, 
            { id: 'approved', label: 'Verified Partners', icon: Store }, 
            { id: 'pending', label: 'Pending Queue', icon: ShieldAlert }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3"><tab.icon className="w-4 h-4"/> {tab.label}</div>
              {activeTab === tab.id && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-100">
              <button onClick={() => setIsBroadcasting(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-amber-50 text-amber-600 border border-amber-100 hover:shadow-md">
                <Bell className="w-4 h-4"/> System Broadcast
              </button>
          </div>
        </nav>

        <div className="p-6 border-t">
          <button onClick={() => navigate("/owner")} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcasting(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative border border-slate-50 z-[130]">
                <button onClick={() => setIsBroadcasting(false)} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-red-50 transition-colors"><X className="w-4 h-4 text-slate-400"/></button>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Bell className="w-7 h-7 text-amber-500" /></div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Push Alert</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="ALERT HEADER" value={broadcastMsg.title} onChange={(e)=>setBroadcastMsg({...broadcastMsg, title:e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-[11px] uppercase outline-none focus:border-blue-500 transition-all" />
                    <textarea placeholder="ALERT MESSAGE..." value={broadcastMsg.body} onChange={(e)=>setBroadcastMsg({...broadcastMsg, body:e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 h-32 resize-none transition-all"></textarea>
                    <button onClick={sendAdminBroadcast} disabled={sending} className="w-full bg-slate-900 py-5 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] text-[10px] text-white shadow-xl hover:bg-blue-600 transition-all disabled:bg-slate-200">
                        {sending ? 'TRANSMITTING...' : 'Deploy Broadcast 🚀'}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto h-screen bg-[#F8FAFC] scroll-smooth">
<header className="bg-white/70 backdrop-blur-2xl z-[100] border-b border-slate-200/60 p-4 lg:p-8 lg:sticky lg:top-0 transition-all duration-300">
  <div className="max-w-7xl mx-auto flex flex-col gap-6 w-full">
    
    {/* 🔝 TOP ROW: Title & Mode Switcher */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl lg:text-4xl font-black italic uppercase text-slate-900 tracking-tighter leading-none flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full hidden md:block"></div>
          {activeTab === 'analytics' ? 'Matrix' : 'Hub'} <span className="text-blue-600">Partners</span>
        </h2>
        
        {/* 🚀 View Mode Switcher: Only for Matrix Insights */}
        {activeTab === 'analytics' && (
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mt-4 border border-slate-200">
            <button 
              onClick={() => setViewMode("daily")} 
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "daily" ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-700"}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setViewMode("range")} 
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "range" ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-700"}`}
            >
              Range
            </button>
          </div>
        )}
      </div>

      {/* 📅 DATE PICKERS: Matrix Only */}
      {activeTab === 'analytics' && (
        <div className="w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-500">
          {viewMode === "daily" ? (
            <div className="relative flex items-center h-12 min-w-[200px] group isolate"> 
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[110] pointer-events-auto" 
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              />
              <div className="flex items-center justify-between gap-4 bg-white border-2 border-blue-50 px-5 py-3 rounded-2xl shadow-sm w-full h-full pointer-events-none group-hover:border-blue-400 group-hover:shadow-blue-100 transition-all z-10">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="uppercase tracking-widest text-slate-800 text-[10px] font-black">{new Date(filterDate).toLocaleDateString('en-GB')}</span>
                 </div>
                 <ChevronRight className="w-3 h-3 text-slate-300 rotate-90" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white border-2 border-slate-100 p-1.5 rounded-[1.5rem] shadow-sm w-full md:w-auto">
              <div className="flex flex-col px-4 py-1 border-r border-slate-100">
                <span className="text-[6px] font-black text-blue-500 uppercase tracking-tighter">Start Matrix</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer text-slate-800" 
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                />
              </div>
              <div className="flex flex-col px-4 py-1">
                <span className="text-[6px] font-black text-emerald-500 uppercase tracking-tighter">End Matrix</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer text-slate-800" 
                  onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* 🗺️ REGIONAL & SEARCH GRID: High Performance Layout */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
      {/* State Selector */}
      <div className="md:col-span-3 relative group">
        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10 transition-transform group-hover:rotate-12" />
        <select 
          value={selectedState} 
          onChange={(e) => setSelectedState(e.target.value)} 
          className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer shadow-inner"
        >
          <option value="All">All States</option>
          {availableStates.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
        </select>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
      </div>

      {/* District Selector */}
      <div className="md:col-span-3 relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 z-10 transition-transform group-hover:scale-110" />
        <select 
          value={selectedDistrict} 
          onChange={(e) => setSelectedDistrict(e.target.value)} 
          className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none cursor-pointer shadow-inner"
        >
          <option value="All">All Districts</option>
          {availableDistricts.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
        </select>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
      </div>

      {/* Modern Search Bar */}
      <div className="md:col-span-6 relative group">
         <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <div className="w-px h-4 bg-slate-200 group-focus-within:bg-blue-200"></div>
         </div>
         <input 
            type="text" 
            placeholder="SCAN PARTNER REGISTRY BY NAME OR COLLEGE..." 
            value={searchTerm} 
            onChange={(e)=>setSearchTerm(e.target.value)} 
            className="w-full bg-slate-100/40 border border-slate-200 p-4 pl-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] outline-none focus:bg-white focus:border-blue-300 focus:ring-8 focus:ring-blue-500/5 transition-all placeholder:text-slate-400" 
         />
         {searchTerm && (
           <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
             <X className="w-3 h-3" />
           </button>
         )}
      </div>
    </div>
  </div>
</header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full pb-20">
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] border-b border-slate-100">
                      <th className="p-8">Partner Node</th>
                      <th className="p-8 text-center">Hits</th>
                      <th className="p-8 text-center">Pre-Book</th>
                      <th className="p-8 text-center">Post-Book</th>
                      <th className="p-8 text-center">Calls</th>
                      <th className="p-8 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
            {filteredList.map((res) => {
  const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : (res.analytics || {});

  // 🎯 1. వేరియబుల్స్‌ని ఇక్కడ ముందే డిక్లేర్ చెయ్ రాజు!
  // అప్పుడే ఇవి 'if' లోపల మరియు బయట కూడా పనిచేస్తాయి.
  let dHits = 0;
  let dOrders = 0;
  let dPostOrders = 0;
  let dCalls = 0;

if (viewMode === "daily") {
  const d = new Date(filterDate);
  
  // 1. సున్నా లేని కీ (కొత్తది): 15/5/2026
  const key1 = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  
  // 2. సున్నా ఉన్న కీ (పాతది): 15/05/2026
  const key2 = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  const data1 = analyticsObj[key1] || {};
  const data2 = analyticsObj[key2] || {};
  
  // 🎯 రెండింటినీ కలిపేయ్ రాజు, అప్పుడు పాతది + కొత్తది కనిపిస్తుంది
  dHits = (data1.kitchen_entry || 0) + (data2.kitchen_entry || 0);
  dOrders = (data1.pre_order_click || 0) + (data2.pre_order_click || 0);
  dPostOrders = (data1.post_order_click || 0) + (data2.post_order_click || 0);
  dCalls = (data1.call_click || 0) + (data2.call_click || 0);
} else {
    const stats = getRangeStats(res.analytics);
    dHits = stats.hits;
    dOrders = stats.orders;
    dPostOrders = stats.postOrders;
    dCalls = stats.calls;
  }

  return (
    <tr key={res._id} className="hover:bg-blue-50/30 transition-all">
      <td className="p-8">
        <div className="flex items-center gap-4">
          <img src={res.hotelImage || "https://via.placeholder.com/60"} className="w-12 h-12 rounded-xl object-cover" alt="" />
          <div className="min-w-0">
            <span className="font-black text-sm uppercase italic text-slate-800 block truncate">{res.name}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.collegeName}</span>
          </div>
        </div>
      </td>
      {/* 🎯 ఇప్పుడు ఇక్కడ dHits పక్కాగా కనిపిస్తుంది! */}
      <td className="p-8 text-center font-black text-lg text-slate-900">{dHits}</td>
      <td className="p-8 text-center font-black text-2xl text-blue-600">{dOrders}</td>
      <td className="p-8 text-center font-black text-2xl text-emerald-600">{dPostOrders}</td>
      <td className="p-8 text-center font-black text-2xl text-orange-600">{dCalls}</td>
      <td className="p-8 text-right">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase italic ${dHits > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          {dHits > 0 ? 'Live Node' : 'Idle'}
        </div>
      </td>
    </tr>
  );
})}
                  </tbody>
                </table>
              </div>

               <div className="lg:hidden space-y-4 px-2 pb-20">
  {filteredList.map((res) => {
    const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : (res.analytics || {});
    let dHits = 0, dOrders = 0, dPostOrders = 0, dCalls = 0;

    if (viewMode === "daily") {
  const d = new Date(filterDate);
  
  // 🎯 1. సున్నా లేని కీ (ఉదా: 8/3/2026)
  const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  // 🎯 2. డేటాబేస్ నుండి డేటాని పక్కాగా లాగే లాజిక్
  let dayData = {};
  
  // ఒకవేళ అది Mongoose Map అయితే .get() వాడాలి
  if (res.analytics instanceof Map) {
    dayData = res.analytics.get(dayKey) || {};
  } else {
    // మామూలు ఆబ్జెక్ట్ అయితే ఇలా
    dayData = analyticsObj[dayKey] || {};
  }

  // 🎯 3. ఒకవేళ డేటా లోపల '_doc' ఉంటే (Mongoose formatting issue) దాన్ని కూడా హ్యాండిల్ చేద్దాం
  const finalData = dayData._doc || dayData;
  
  // 🎯 4. ఇప్పుడు వాల్యూస్ అసైన్ చెయ్
  dHits = finalData.kitchen_entry || 0;
  dOrders = finalData.pre_order_click || 0;
  dPostOrders = finalData.post_order_click || 0;
  dCalls = finalData.call_click || 0;
} else {
      const stats = getRangeStats(res.analytics);
      dHits = stats.hits;
      dOrders = stats.orders;
      dPostOrders = stats.postOrders;
      dCalls = stats.calls;
    }

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={res._id} 
        className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
      >
        {/* Header: Logo + Name + Status */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={res.hotelImage || "https://via.placeholder.com/60"} 
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50" 
                alt="" 
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${dHits > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-[13px] uppercase italic text-slate-800 leading-tight truncate">{res.name}</h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{res.collegeName}</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase italic ${dHits > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            {dHits > 0 ? 'Live' : 'Idle'}
          </div>
        </div>

        {/* Analytics Grid: 4 Columns */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Hits', val: dHits, color: 'slate', icon: Activity },
            { label: 'Pre', val: dOrders, color: 'blue', icon: ShoppingBag },
            { label: 'Post', val: dPostOrders, color: 'emerald', icon: UtensilsCrossed },
            { label: 'Calls', val: dCalls, color: 'orange', icon: PhoneCall }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-${stat.color}-50/50 p-3 rounded-2xl border border-${stat.color}-100/50 text-center`}>
              <p className={`text-[7px] font-black text-${stat.color}-400 uppercase mb-1 tracking-tighter`}>{stat.label}</p>
              <p className={`text-sm font-black text-${stat.color}-600 italic`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Bottom Quick Action (Optional) */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Matrix Node v1.0</span>
           <ChevronRight className="w-4 h-4 text-slate-200" />
        </div>
      </motion.div>
    );
  })}
</div>
            </motion.div>
          )}

{(activeTab === "pending" || activeTab === "approved") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8 pb-10">
              <AnimatePresence mode="popLayout">
                {filteredList.map((owner) => {
                  const sub = getSubscriptionStatus(owner.createdAt, owner._id);
                  return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={owner._id} className="bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative flex flex-col h-full overflow-hidden group">
                      
                      {/* 🚩 TOP BADGE: SUBSCRIPTION ALERT */}
                      {activeTab === "approved" && sub.isExpired && (
                        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[7px] font-black uppercase py-1 text-center z-10 animate-pulse">Monthly Due Pending (₹299)</div>
                      )}

                      {/* 🏨 RESTAURANT NAME & IMAGE */}
                      <div className="flex items-start gap-4 mb-6 mt-2">
                        <div className="relative shrink-0">
                          <img src={owner.hotelImage || "https://via.placeholder.com/100"} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt=""/>
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${owner.isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-slate-900 uppercase italic truncate leading-tight mb-1">{owner.name}</h3>
                          <div className="flex items-center gap-1.5 text-blue-600">
                             <Building2 className="w-3 h-3" />
                             <p className="text-[8px] font-black uppercase tracking-widest truncate">{owner.collegeName}</p>
                          </div>
                        </div>
                      </div>

                      {/* 📍 REGIONAL DATA: STATE & DISTRICT */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <span className="text-[7px] font-black text-slate-400 uppercase block mb-1 tracking-widest text-center">State</span>
                          <div className="flex items-center justify-center gap-1.5 text-slate-700">
                            <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-[10px] font-black uppercase truncate">{owner.state || "N/A"}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <span className="text-[7px] font-black text-slate-400 uppercase block mb-1 tracking-widest text-center">District</span>
                          <div className="flex items-center justify-center gap-1.5 text-slate-700">
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="text-[10px] font-black uppercase truncate">{owner.district || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* 📅 JOIN DATE INFO */}
                      <div className="flex items-center gap-2 mb-4 px-1">
                         <Calendar className="w-3 h-3 text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-tighter">Registered: {owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-GB') : "New Entry"}</span>
                      </div>

                      {/* 💳 SUBSCRIPTION STATUS BOX */}
                      {activeTab === "approved" && (
                        <div className={`mb-4 p-3 rounded-2xl border ${sub.isExpired ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                          <div className="flex justify-between items-center">
                             <div className="min-w-0">
                               <p className="text-[7px] font-black opacity-50 uppercase mb-0.5 tracking-widest">Protocol Status</p>
                               <span className={`text-[10px] font-black uppercase italic ${sub.isExpired ? 'text-red-600' : 'text-green-600'}`}>{sub.message}</span>
                             </div>
                             {sub.isExpired && (
                                <button 
  onClick={() => {
    // 🚀 1. నీ కోడ్‌లో ఉన్న డైనమిక్ డేటాను ఇక్కడ వేరియబుల్స్ లోకి తీసుకుంటున్నాం రాజు
    const restaurantName = owner?.name || "Partner Restaurant";
    const ownerPhone = owner?.phone || "";
    
    // 📊 ప్రీ & పోస్ట్ బుకింగ్ మెట్రిక్స్ (నీ డాష్ బోర్డ్ స్టేట్ వేరియబుల్స్ ని బట్టి మార్చుకో రాజు)
    const preBookings = owner?.preBookingsCount || 0; 
    const postBookings = owner?.postBookingsCount || 0; 
    
    // యూనిక్ బిల్లింగ్ రిఫరెన్స్ నంబర్ (చూడటానికి కార్పొరేట్ లుక్ వస్తుంది)
    const billingRef = `SUDARA-SUB-${Math.floor(100000 + Math.random() * 900000)}`;

    // 🚀 2. రాయల్ కార్పొరేట్ స్టైల్ లో వాట్సాప్ టెంప్లేట్ మెసేజ్
    const message = `*🛡️ SUDARA HUB NETWORK - BILLING DEPT* ---------------------------------------------
*URGENT NOTICE: SUBSCRIPTION EXPIRY*

Dear *${restaurantName}* Management,

This is an automated notification from Sudara Hub Compliance. Your commercial merchant account subscription has *EXPIRED*.

⚠️ *CURRENT STATUS:* YOUR RESTAURANT IS NOW INACTIVE (HIDDEN FROM HUB)

📊 *PENDING BUSINESS MATRIX AFFECTED:*
• Pending Pre-Bookings (Active Orders): *${preBookings} Orders*
• Post-Booking Records (Live Catalog/History): *${postBookings} Locked*

To bypass the service restriction, resume visibility within your neighborhood search engine, and instantly unlock your active matrix dashboard, please clear the node renewal fee.

💸 *Renewal Premium:* ₹299 / Month
👤 *Beneficiary Account:* Boyella Raju
🆔 *Billing Reference:* ${billingRef}

📌 *OFFICIAL MERCHANT PAYMENT PORTALS:*
• PhonePe Secure: *7569896128*
• Unified UPI ID: *boyellaraju@ybl*

🔄 *CRITICAL ACTIVATION STEP:*
Immediately after completing the transaction, transmit the digital payment receipt (screenshot) with the text *"SUBSCRIPTION RECHARGED"* to our merchant safety operations line: *7569896128* for instant grid restoration.

_Sudara Trust & Safety Compliance Team_
_Sudara.in | Empowering Hyperlocal Ecosystems_`;

    // 🚀 3. సేఫ్ గా ఎన్‌కోడ్ చేసి వాట్సాప్ వెబ్ లేదా యాప్ ద్వారా ఓపెన్ చేయడం రాజు
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${ownerPhone}?text=${encodedMessage}`, '_blank');
  }} 
  className="bg-rose-600 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all duration-300 hover:bg-rose-700 flex items-center justify-center gap-2 border border-rose-500/30"
  title="Send Professional Subscription Alert"
>
  <Send className="w-4 h-4" />
  <span className="text-[10px] font-black uppercase tracking-wider px-1">Alert Merchant</span>
</button>
                             )}
                          </div>
                        </div>
                      )}

                      {/* 📱 REGISTERED MOBILE NUMBER */}
                      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl mt-auto mb-4 shadow-inner">
                          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                             <Phone className="w-4 h-4" /> 
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Partner Contact</span>
                             <span className="text-[11px] font-black text-white tracking-wider uppercase leading-none">{owner.phone || "No Number"}</span>
                          </div>
                      </div>

                      {/* 🛠️ ACTION FOOTER: VERIFY & DELETE */}
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} 
                          className={`flex-1 py-3.5 rounded-2xl font-black text-[9px] uppercase italic tracking-widest transition-all shadow-xl active:scale-95 ${owner.isApproved ? 'bg-white border border-red-100 text-red-500 hover:bg-red-50' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                        >
                          {owner.isApproved ? 'Revoke' : 'Verify'}
                        </button>

                        <button 
                          onClick={() => deleteOwnerForever(owner._id, owner.name)}
                          className="p-3.5 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Delete Forever"
                        >
                          <X className="w-4 h-4" /> 
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

        <footer className="mt-auto p-6 lg:p-10 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><ShieldCheck className="w-4 h-4"/></div>
              <span className="font-black italic text-sm text-slate-900 uppercase">SUDARA <span className="text-blue-600">INTEL</span></span>
            </div>
            <div className="flex gap-6 text-center md:text-right">
               <div><p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">System Health</p><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Nominal</span></div></div>
               <div className="h-8 w-[1px] bg-slate-100"></div>
               <div><p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Developer</p><span className="text-[9px] font-black text-blue-600 uppercase italic">Raju Boyella ⚔️</span></div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
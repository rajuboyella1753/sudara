import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, LogOut, Search, BarChart3, Store, X, 
  TrendingUp, Calendar, Activity, Star, MapPin, CreditCard,
  ArrowUpRight, LayoutDashboard, Globe, Menu, Bell, Filter,
  ChevronRight, RefreshCw,Send
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  // ✅ రేంజ్ డేటా కోసం కొత్త స్టేట్స్
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [availableColleges, setAvailableColleges] = useState([]);
  // ✅ వ్యూ మోడ్ కోసం కొత్త స్టేట్ (daily లేదా range)
const [viewMode, setViewMode] = useState("daily");
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/owner/admin-all-owners");
        const ownersData = Array.isArray(res.data) ? res.data : [];
        setOwners(ownersData);

        // 🎓 కాలేజీల లిస్ట్ తయారు చేయడం (అడ్మిన్ 'General' ని తీసేసి)
        const colleges = [...new Set(ownersData.map(o => o.collegeName))]
          .filter(c => c && c !== "General");
        setAvailableColleges(colleges);
        
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

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
// ✅ రాజు, నీ DB కి తగ్గట్టుగా (No Zero Padding) డేటా లాగే ఫంక్షన్ ఇది!
const getRangeStats = (analytics) => {
  if (!analytics) return { hits: 0, orders: 0, postOrders: 0, calls: 0 }; // 🚀 postOrders యాడ్ చేశాం
  
  const analyticsObj = analytics instanceof Map ? Object.fromEntries(analytics) : analytics;
  let stats = { hits: 0, orders: 0, postOrders: 0, calls: 0 };

  let start = new Date(startDate);
  let end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let current = new Date(start);
  while (current <= end) {
    const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`; 
    const dayData = analyticsObj[dKey] || {};
    
    stats.hits += Number(dayData.kitchen_entry || 0);
    stats.orders += Number(dayData.pre_order_click || 0);
    stats.postOrders += Number(dayData.post_order_click || 0); // 👈 కొత్త ఫీల్డ్
    stats.calls += Number(dayData.call_click || 0);

    current.setDate(current.getDate() + 1);
  }
  return stats;
};
const getSubscriptionStatus = (createdAt, ownerId) => {
  let joinDate;
  
  // 🕒 1. డేట్ ని క్రియేట్ చేయడం
  if (createdAt) {
    joinDate = new Date(createdAt);
  } else if (ownerId && typeof ownerId === 'string' && ownerId.length === 24) {
    // MongoDB ID నుండి టైమ్ స్టాంప్ తీయడం
    joinDate = new Date(parseInt(ownerId.substring(0, 8), 16) * 1000);
  }

  // 🕒 2. ఒకవేళ పైన రెండు ఫెయిల్ అయితే డిఫాల్ట్ గా నేటి డేట్ ఇవ్వకుండా ఎర్రర్ ఆపడం
  if (!joinDate || isNaN(joinDate.getTime())) {
    return { status: "Unknown", message: "Syncing...", isExpired: false };
  }

  const today = new Date();
  
  // 🕒 3. కేవలం డేట్స్ మాత్రమే కంపేర్ చేయడానికి సమయాన్ని 00:00 చేయడం
  const start = new Date(joinDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  
  // మిల్లీసెకన్ల తేడాని రోజుల్లోకి మార్చడం
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 🚩 4. కచ్చితంగా 30 రోజుల ఫ్రీ ట్రయల్ లాజిక్
  if (diffDays <= 30) {
    const daysLeft = 30 - diffDays;
    return { 
      status: "Trialing", 
      message: daysLeft <= 0 ? "Last day of Trial" : `${daysLeft} days left in Free Trial`, 
      isExpired: false 
    };
  } else {
    // 31వ రోజు నుండి మాత్రమే ఎక్స్‌పైర్ అవ్వాలి
    return { 
      status: "Payment Due", 
      message: "Subscription Expired! (₹499)", 
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
    // 1. నోటిఫికేషన్ పంపడం (నువ్వు ఆల్రెడీ రాసిన కోడ్)
    const res = await api.post("/owner/broadcast-to-all", broadcastMsg);
    
    // 2. 🚀 కొత్తగా యాడ్ చేస్తున్నాం: హోమ్ పేజీ బ్యానర్ కోసం డేటాబేస్ లో సేవ్ చేయడం
    // దీని కోసం నీ సర్వర్‌లో ఒక API ఉండాలి (లేదంటే నెక్స్ట్ టైమ్ అది క్రియేట్ చేద్దాం)
    // ప్రస్తుతానికి నీ నోటిఫికేషన్ లాజిక్ యూజర్లకి వెళ్తుంది.
    
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
  // ✅ రాజు, డేట్ సెలెక్షన్ ఇక్కడ ఫిక్స్ చేశాను
  const selectedDateFormatted = new Date(filterDate).toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');

 const filteredList = owners.filter(o => {
    const isNotGeneral = o.collegeName !== "General";
    
    // 1. టాబ్ ఫిల్టర్
    let matchesTab = true;
    if (activeTab === "pending") matchesTab = !o.isApproved;
    else if (activeTab === "approved") matchesTab = o.isApproved;
    else if (activeTab === "analytics") matchesTab = o.isApproved === true;

    // 2. 🎓 కాలేజీ ఫిల్టర్ (Selected College లేదా All)
    const matchesCollege = selectedCollege === "All" || o.collegeName === selectedCollege;

    // 3. సెర్చ్ ఫిల్టర్
    const matchesSearch = (o.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return isNotGeneral && matchesTab && matchesCollege && matchesSearch;
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

      {/* 🚀 SIDEBAR NAVIGATION - ALL TABS RESTORED */}
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

      {/* 🛡️ BROADCAST MODAL - RESTORED */}
      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcasting(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl relative border border-slate-50 z-[130]">
                <button onClick={() => setIsBroadcasting(false)} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-red-50 transition-colors"><X className="w-4 h-4 text-slate-400"/></button>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Bell className="w-7 h-7 text-amber-500" /></div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Push Alert</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 mb-8 italic leading-none">Global Broadcast Protocol</p>
                
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
       <header className="bg-white/80 backdrop-blur-xl z-[100] border-b border-slate-200 p-6 lg:p-10 lg:sticky lg:top-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative">
        <div className="min-w-0">
          <h2 className="text-3xl lg:text-5xl font-black italic uppercase text-slate-900 tracking-tighter leading-none mb-2">
            {activeTab === 'analytics' ? 'Matrix' : 'Hub'} <span className="text-blue-600">Partners</span>
          </h2>
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active • {selectedDateFormatted}</span>
          </div>
        </div>
        
        {/* ✅ డేట్ సెలెక్టర్ కంటైనర్ */}
{/* ✅ మ్యాట్రిక్స్ ఇన్సైట్స్ - కొత్త డిజైన్ (లైన్ 215 సుమారు) */}
<div className="flex flex-col gap-6 mb-8 w-full">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    <div className="min-w-0">
      <h2 className="text-3xl lg:text-5xl font-black italic uppercase text-slate-900 tracking-tighter leading-none mb-2">
        {/* Matrix <span className="text-blue-600">Insights</span> */}
      </h2>
      {/* 🚀 View Mode Switcher - ఇక్కడ మొబైల్ లో కూడా పక్కాగా కనిపిస్తుంది */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mt-4">
        <button onClick={() => setViewMode("daily")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>Daily</button>
        <button onClick={() => setViewMode("range")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "range" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>Range</button>
      </div>
    </div>

    {/* 📅 Contextual Date Pickers - నువ్వు సెలెక్ట్ చేసిన మోడ్ ని బట్టి మారుతుంది */}
    <div className="w-full md:w-auto">
      {viewMode === "daily" ? (
        <div className="relative flex items-center h-11 min-w-[160px] group"> 
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
          <div className="flex items-center justify-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm w-full h-full pointer-events-none group-hover:bg-slate-50 transition-all z-10">
             <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
             <span className="uppercase tracking-widest text-slate-700 text-[10px] font-black">{new Date(filterDate).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 px-2">
            <span className="text-[8px] font-black text-slate-400">FROM</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer" />
          </div>
          <ArrowUpRight className="w-3 h-3 text-slate-300 shrink-0" />
          <div className="flex items-center gap-1 px-2">
            <span className="text-[8px] font-black text-slate-400">TO</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer" />
          </div>
        </div>
      )}
    </div>
    {/* 🎓 COLLEGE FILTER DROPDOWN - ఇదే కొత్త ఫీచర్ */}
<div className="flex flex-col gap-2 w-full md:w-auto mt-4">
  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Region</label>
  <div className="relative group">
    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 z-10" />
    <select 
  value={selectedCollege} 
  onChange={(e) => setSelectedCollege(e.target.value)}
  className="pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer w-full md:min-w-[220px]"
>
  <option value="All">All Regions / Colleges</option>
  {availableColleges && availableColleges.length > 0 ? (
    availableColleges.map((college, index) => (
      <option key={index} value={college}>
        {college}
      </option>
    ))
  ) : (
    <option disabled>No Regions Found</option>
  )}
</select>
    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 rotate-90 pointer-events-none" />
  </div>
</div>
  </div>
</div>


      </div>

      <div className="relative max-w-2xl">
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
         <input type="text" placeholder="SCAN BY NAME, COLLEGE OR IDENTIFIER..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-100/50 border border-slate-200 p-4 pl-14 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-200 transition-all shadow-inner" />
      </div>
  </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full pb-20">
{/* ANALYTICS VIEW - Responsive Implementation with Orders & Calls */}
{activeTab === "analytics" && (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    
    {/* 🖥️ Desktop: Ultra-Clean Matrix Table */}
    <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
{/* 🖥️ Desktop: Matrix Table */}
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
      
      let displayHits, displayOrders, displayPostOrders, displayCalls;

      if (viewMode === "daily") {
        const d = new Date(filterDate);
        const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        const dayData = analyticsObj[dayKey] || {};
        displayHits = dayData.kitchen_entry || 0;
        displayOrders = dayData.pre_order_click || 0;
        displayPostOrders = dayData.post_order_click || 0;
        displayCalls = dayData.call_click || 0;
      } else {
        const stats = getRangeStats(res.analytics);
        displayHits = stats.hits;
        displayOrders = stats.orders;
        displayPostOrders = stats.postOrders;
        displayCalls = stats.calls;
      }

      return (
        <tr key={res._id} className="hover:bg-blue-50/30 transition-all duration-300">
          <td className="p-8">
            <div className="flex items-center gap-4">
              <img src={res.hotelImage || "https://via.placeholder.com/60"} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div className="min-w-0">
                <span className="font-black text-sm uppercase italic text-slate-800 block truncate">{res.name}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.collegeName}</span>
              </div>
            </div>
          </td>
          <td className="p-8 text-center font-black text-lg text-slate-900">{displayHits}</td>
          <td className="p-8 text-center font-black text-2xl text-blue-600">{displayOrders}</td>
          <td className="p-8 text-center font-black text-2xl text-emerald-600">{displayPostOrders}</td>
          <td className="p-8 text-center font-black text-2xl text-orange-600">{displayCalls}</td>
          <td className="p-8 text-right">
             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase italic ${displayHits > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {displayHits > 0 ? 'Live Node' : 'Idle'}
             </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>


      </div>
    </div>

    {/* 📱 Mobile: Modern Grid Cards */}
{/* 📱 Mobile: Modern Grid Cards */}
<div className="lg:hidden space-y-4 px-1">
  {filteredList.map((res) => {
    const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : (res.analytics || {});
    
    // ✅ మొబైల్ కోసం డేటా సెలెక్షన్ లాజిక్ - ఇక్కడ mPostOrders డిక్లేర్ చేశాం
    let mHits, mOrders, mPostOrders, mCalls;

    if (viewMode === "daily") {
      const d = new Date(filterDate);
      const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const dayData = analyticsObj[dayKey] || {};
      mHits = dayData.kitchen_entry || 0;
      mOrders = dayData.pre_order_click || 0;
      mPostOrders = dayData.post_order_click || 0;
      mCalls = dayData.call_click || 0;
    } else {
      const stats = getRangeStats(res.analytics);
      mHits = stats.hits;
      mOrders = stats.orders;
      mPostOrders = stats.postOrders;
      mCalls = stats.calls;
    }

    return (
      <div key={res._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden active:scale-[0.98] transition-all">
        <div className="flex items-center gap-4 mb-6">
          <img src={res.hotelImage || "https://via.placeholder.com/60"} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50" alt="" />
          <div className="min-w-0">
            <h4 className="font-black text-sm uppercase italic text-slate-800 truncate leading-none mb-1.5">{res.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-md">{res.collegeName}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${mHits > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
            </div>
          </div>
        </div>

        {/* 📊 మొబైల్ స్టేట్స్ గ్రిడ్ - 4 పక్కా కాలమ్స్ */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 text-center">
            <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Hits</p>
            <p className="text-xs font-black text-slate-800 leading-none">{mHits}</p>
          </div>
          <div className="bg-blue-50/50 p-2.5 rounded-2xl border border-blue-100 text-center">
            <p className="text-[7px] font-black text-blue-400 uppercase mb-1">Pre</p>
            <p className="text-xs font-black text-blue-600 leading-none">{mOrders}</p>
          </div>
          <div className="bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[7px] font-black text-emerald-400 uppercase mb-1">Post</p>
            <p className="text-xs font-black text-emerald-600 leading-none">{mPostOrders}</p> 
          </div>
          <div className="bg-orange-50/50 p-2.5 rounded-2xl border border-orange-100 text-center">
            <p className="text-[7px] font-black text-orange-400 uppercase mb-1">Calls</p>
            <p className="text-xs font-black text-orange-600 leading-none">{mCalls}</p>
          </div>
        </div>
      </div>
    );
  })}
</div>
  </motion.div>
)}

   {/* PARTNERS CARDS VIEW - RESTORED & FIXED BY RAJU'S BADI */}
{(activeTab === "pending" || activeTab === "approved") && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-10">
    <AnimatePresence mode="popLayout">
      {filteredList.map((owner) => {     
        // console.log("Owner Data:", owner);  
        const sub = getSubscriptionStatus(owner.createdAt, owner._id);
        return (
          <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            key={owner._id} 
            className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col h-full overflow-hidden"
          >
            {/* 🚩 30 రోజులు దాటితే వచ్చే అలర్ట్ బ్యానర్ */}
            {activeTab === "approved" && sub.isExpired && (
              <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[8px] font-black uppercase tracking-[0.2em] py-1.5 text-center animate-pulse z-10">
                Attention: Monthly Due Pending (₹499)
              </div>
            )}

            <div className="flex items-start gap-5 mb-8 mt-2">
              <div className="relative shrink-0">
                <img src={owner.hotelImage || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-slate-50 shadow-inner" alt="Hotel"/>
                <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl shadow-lg border-2 border-white ${owner.isStoreOpen ? 'bg-green-500' : 'bg-red-500'} animate-bounce-slow`}>
                  <Store className="w-3 h-3 text-white"/>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 uppercase italic whitespace-normal tracking-tighter leading-tight mb-1">{owner.name}</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{owner.collegeName}</p>
                
                {/* 📅 జాయినింగ్ డేట్ డిస్‌ప్లే - ఫిక్స్డ్ లాజిక్ */}
<div className="flex items-center gap-2">
   <Calendar className="w-3.5 h-3.5 text-slate-400" />
   <span className="text-[10px] font-black text-slate-400 uppercase italic">
     Joined: {
       owner?.createdAt 
       ? new Date(owner.createdAt).toLocaleDateString('en-GB') 
       : owner?._id && owner._id.length === 24
         ? new Date(parseInt(owner._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-GB') 
         : "New Entry"
     }
   </span>
</div>
              </div>
            </div>

            {/* 💰 సబ్‌స్క్రిప్షన్ బాక్స్ - కేవలం Approved పార్ట్‌నర్లకు మాత్రమే */}
            {activeTab === "approved" && (
              <div className={`mb-6 p-4 rounded-3xl border transition-colors ${sub.isExpired ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Billing Protocol</span>
                    <span className={`text-[11px] font-black uppercase italic ${sub.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      {sub.message}
                    </span>
                  </div>
                  {sub.isExpired && (
                    <button onClick={() => window.open(`https://wa.me/${owner.phone}?text=Hi ${owner.name}, Your Sudara Hub monthly subscription is due.`)} className="bg-red-600 text-white p-2.5 rounded-2xl shadow-lg shadow-red-200 active:scale-90 transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 📱 ఓనర్ రిజిస్టర్డ్ మొబైల్ నంబర్ డిస్‌ప్లే */}
<div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-auto mb-6">
    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
        <Phone className="w-4 h-4" /> 
    </div>
    <div className="flex flex-col min-w-0">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registered Contact</span>
        <span className="text-[11px] font-black text-slate-700 tracking-tight uppercase leading-none">
            {owner.phone || "No Number Linked"}
        </span>
    </div>
</div>

            <div className="pt-6 border-t border-slate-100">
                <button onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase italic tracking-[0.2em] transition-all shadow-xl active:scale-95 ${owner.isApproved ? 'bg-white border border-red-100 text-red-500 hover:bg-red-50' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                    {owner.isApproved ? 'Revoke Permissions' : 'Grant Verified Access'}
                </button>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
)}
        </div>
{/* 🌊 SUDARA INTEL FOOTER */}
<footer className="mt-auto p-10 border-t border-slate-200 bg-white">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
          <ShieldCheck className="w-5 h-5"/>
        </div>
        <span className="font-black italic tracking-tighter text-lg text-slate-900">
          SUDARA <span className="text-blue-600">INTEL</span>
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
        © 2026 Powered by Matrix Hub Protocol
      </p>
    </div>
    
    <div className="flex items-center gap-8">
      <div className="text-center md:text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
        <div className="flex items-center gap-2 justify-center md:justify-end">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-700 uppercase">All Systems Nominal</span>
        </div>
      </div>
      <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>
      <div className="text-center md:text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Developer Intel</p>
        <span className="text-[10px] font-black text-blue-600 uppercase italic">Raju Boyella ⚔️</span>
      </div>
    </div>
  </div>
</footer>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
      `}</style>
    </div>
  );
} 
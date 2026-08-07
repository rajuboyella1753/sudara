import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, LogOut, Search, BarChart3, Store, X, 
  TrendingUp, Calendar, Activity, Star, MapPin, CreditCard,
  ArrowUpRight, LayoutDashboard, Globe, Menu, Bell, Filter,
  ChevronRight, RefreshCw, Send, ShoppingBag, UtensilsCrossed, PhoneCall, Trash2, Car
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
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [viewMode, setViewMode] = useState("daily");
  const [globalStats, setGlobalStats] = useState({ pre: 0, post: 0 });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/owner/admin-all-owners");
        const ownersData = Array.isArray(res.data) ? res.data : [];
        setOwners(ownersData);

        try {
          const statsRes = await api.get("/orders/admin/daily-stats");
          const stats = statsRes.data;
          const pre = stats.find(s => s._id === "Pre-book")?.count || 0;
          const post = stats.find(s => s._id === "Post-book")?.count || 0;
          setGlobalStats({ pre, post });
        } catch (e) { console.log("Stats fetch failed"); }

        const states = [...new Set(ownersData.map(o => o.state))].filter(Boolean);
        setAvailableStates(states);
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

  useEffect(() => {
    if (selectedState === "All") {
      const allDistricts = [...new Set(owners.map(o => o.district))].filter(Boolean);
      setAvailableDistricts(allDistricts);
    } else {
      const filteredDistricts = [...new Set(
        owners
          .filter(o => o.state === selectedState)
          .map(o => o.district)
      )].filter(Boolean);
      setAvailableDistricts(filteredDistricts);
    }
    setSelectedDistrict("All"); 
  }, [selectedState, owners]);

  useEffect(() => {
    const socketUrl = import.meta.env.MODE === 'production' 
        ? import.meta.env.VITE_API_PROD_URL 
        : import.meta.env.VITE_API_DEV_URL;
    const socket = io(socketUrl);
    socket.on("order_placed", (newOrder) => {
        setGlobalStats(prev => ({
            ...prev,
            [newOrder.orderType === "Pre-book" ? "pre" : "post"]: prev[newOrder.orderType === "Pre-book" ? "pre" : "post"] + 1
        }));
    });
    return () => socket.disconnect();
  }, []);

  const deleteOwnerForever = async (id, name) => {
    const confirmDelete = window.confirm(`⚠️ DANGER: Are you sure you want to delete "${name}"? \n\nThis will remove the owner and ALL their items from Database. This cannot be undone!`);
    if (confirmDelete) {
      try {
        await api.delete(`/owner/delete-owner/${id}`);
        setOwners(prev => prev.filter(owner => owner._id !== id)); 
        alert("Erased from Matrix! 🧹");
      } catch (err) {
        alert("Delete failed! Check network.");
      }
    }
  };

  const getRangeStats = (analytics) => {
    if (!analytics) return { hits: 0, orders: 0, postOrders: 0, calls: 0 };
    const analyticsObj = analytics instanceof Map ? Object.fromEntries(analytics) : analytics;
    let stats = { hits: 0, orders: 0, postOrders: 0, calls: 0 };
    let current = new Date(startDate);
    let end = new Date(endDate);
    while (current <= end) {
      const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;
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

  // 🎯 కేవలం ప్రీమియం మాత్రమే: రెస్టారెంట్ అయితే 999, మిగతా అన్ని కేటగిరీలకు 499
  const getSubscriptionStatus = (createdAt, nextBillingDate, category) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cat = (category || "").trim().toLowerCase();
    const isRestaurant = cat === "restaurant" || cat === "" || cat.includes("restaurant");
    const actualFee = isRestaurant ? 999 : 499;

    if (nextBillingDate) {
      const billingDate = new Date(nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);
      if (today <= billingDate) {
        const timeDiff = billingDate.getTime() - today.getTime();
        const daysRemaining = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        return { status: "Active", message: daysRemaining <= 0 ? "Expires Today! ⚠️" : `${daysRemaining} Days left in Cycle`, isExpired: false, chargeAmount: actualFee };
      } else {
        const overdueTime = today.getTime() - billingDate.getTime();
        const overdueDays = Math.floor(overdueTime / (1000 * 60 * 60 * 24));
        return { status: "Payment Due", message: "Subscription Expired! ⚠️", isExpired: true, chargeAmount: actualFee, overdueText: `${overdueDays} Days Overdue` };
      }
    }

    const joinDate = createdAt ? new Date(createdAt) : new Date();
    const overdueTime = today.getTime() - joinDate.getTime();
    const overdueDays = Math.floor(overdueTime / (1000 * 60 * 60 * 24));
    return { status: "Payment Due", message: "Subscription Expired! ⚠️", isExpired: true, chargeAmount: actualFee, overdueText: overdueDays <= 0 ? "0 Days Overdue" : `${overdueDays} Days Overdue` };
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
      const payload = {
        title: broadcastMsg.title,
        body: broadcastMsg.body,
        data: { url: "https://sudara.in" }
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

  const filteredList = owners.filter(owner => {
    const isNotGeneral = owner.collegeName && owner.collegeName !== "General";
    let matchesTab = true;
    if (activeTab === "pending") matchesTab = !owner.isApproved;
    else if (activeTab === "approved") matchesTab = owner.isApproved;
    else if (activeTab === "analytics") matchesTab = owner.isApproved === true;

    const matchesState = selectedState === "All" || owner.state === selectedState;
    const matchesDistrict = selectedDistrict === "All" || owner.district === selectedDistrict;
    const matchesCategory = selectedCategory === "All" || (owner.category || "Restaurant") === selectedCategory;
    const matchesSearch = (owner.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return isNotGeneral && matchesTab && matchesState && matchesDistrict && matchesCategory && matchesSearch;
  });

  const dailyTotals = filteredList.reduce((acc, res) => {
    const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : (res.analytics || {});
    let hits = 0, pre = 0, post = 0, calls = 0;
    if (viewMode === "daily") {
      const d = new Date(filterDate);
      const key1 = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const key2 = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      const data1 = analyticsObj[key1] || {};
      const data2 = analyticsObj[key2] || {};
      hits = (data1.kitchen_entry || 0) + (data2.kitchen_entry || 0);
      pre = (data1.pre_order_click || 0) + (data2.pre_order_click || 0);
      post = (data1.post_order_click || 0) + (data2.post_order_click || 0);
      calls = (data1.call_click || 0) + (data2.call_click || 0);
    } else {
      const s = getRangeStats(res.analytics);
      hits = s.hits; pre = s.orders; post = s.postOrders; calls = s.calls;
    }
    acc.hits += hits;
    acc.pre += pre;
    acc.post += post;
    acc.calls += calls;
    return acc;
  }, { hits: 0, pre: 0, post: 0, calls: 0 });

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl lg:text-4xl font-black italic uppercase text-slate-900 tracking-tighter leading-none flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full hidden md:block"></div>
                  {activeTab === 'analytics' ? 'Matrix' : 'Hub'} <span className="text-blue-600">Partners</span>
                </h2>
                {activeTab === 'analytics' && (
                  <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mt-4 border border-slate-200">
                    <button onClick={() => setViewMode("daily")} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "daily" ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-700"}`}>Daily</button>
                    <button onClick={() => setViewMode("range")} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "range" ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-700"}`}>Range</button>
                  </div>
                )}
              </div>

              {activeTab === 'analytics' && (
                <div className="w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-500">
                  {viewMode === "daily" ? (
                    <div className="relative flex items-center h-12 min-w-[200px] group isolate"> 
                      <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[110] pointer-events-auto" onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }} />
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
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer text-slate-800" onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }} />
                      </div>
                      <div className="flex flex-col px-4 py-1">
                        <span className="text-[6px] font-black text-emerald-500 uppercase tracking-tighter">End Matrix</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-black outline-none border-none cursor-pointer text-slate-800" onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
              <div className="md:col-span-3 relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10 transition-transform group-hover:rotate-12" />
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="All">All States</option>
                  {availableStates.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="md:col-span-3 relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 z-10 transition-transform group-hover:scale-110" />
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="All">All Districts</option>
                  {availableDistricts.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="md:col-span-3 relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 z-10 transition-transform group-hover:scale-110" />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full pl-11 pr-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-orange-500 transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="All">All Categories 🌐</option>
                  <option value="Restaurant">🍔 Restaurants</option>
                  <option value="Electronics">📱 Electronics</option>
                  <option value="Clothing">👗 Clothing</option>
                  <option value="Grocery">🛒 Groceries</option>
                  <option value="Automobile">🚗 Automobile Showroom</option>
                  <option value="Furniture">🛋️ Furniture & Living</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="md:col-span-3 relative group">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <div className="w-px h-4 bg-slate-200 group-focus-within:bg-blue-200"></div>
                 </div>
                 <input type="text" placeholder="SCAN PARTNER REGISTRY..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-100/40 border border-slate-200 p-4 pl-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] outline-none focus:bg-white transition-all placeholder:text-slate-400" />
                 {searchTerm && (
                   <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><X className="w-3 h-3" /></button>
                 )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full pb-20">
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* 📊 DAILY SUMMARY TOTALS (DYNAMIC LABELS BASED ON CATEGORY) */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {(() => {
    const isRestoCat = selectedCategory === "All" || selectedCategory === "Restaurant";
    const isAutoCat = selectedCategory === "Automobile";
    
    const cards = [
      { label: "Total Hits", val: dailyTotals.hits, color: "slate", icon: Activity, desc: "Page visits" },
      { 
        label: isRestoCat ? "Pre-Bookings" : (isAutoCat ? "Test Drives" : "Orders / Enquiries"), 
        val: dailyTotals.pre, 
        color: "blue", 
        icon: ShoppingBag, 
        desc: isRestoCat ? "Pre-orders" : (isAutoCat ? "Booking requests" : "Customer orders") 
      },
      { 
        label: isRestoCat ? "Post-Bookings" : (isAutoCat ? "Showroom Visits" : "Catalog Views"), 
        val: dailyTotals.post, 
        color: "emerald", 
        icon: UtensilsCrossed, 
        desc: isRestoCat ? "Post-orders" : "Interactions" 
      },
      { label: "Total Calls", val: dailyTotals.calls, color: "orange", icon: PhoneCall, desc: "Call clicks" },
    ];

    return cards.map((s, i) => (
      <div key={i} className={`bg-white border border-${s.color}-100 rounded-[2rem] p-6 shadow-sm`}>
        <p className={`text-[9px] font-black text-${s.color}-400 uppercase tracking-widest mb-1`}>{s.label}</p>
        <p className={`text-4xl font-black italic text-${s.color}-600`}>{s.val}</p>
        <p className="text-[8px] text-slate-400 uppercase mt-1">{s.desc}</p>
      </div>
    ));
  })()}
</div>

              <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] border-b border-slate-100">
  <th className="p-8">Partner Node</th>
  <th className="p-8 text-center">Hits</th>
  <th className="p-8 text-center">{selectedCategory === "Automobile" ? "Test Drives" : (selectedCategory === "All" || selectedCategory === "Restaurant" ? "Pre-Book" : "Orders")}</th>
  {/* <th className="p-8 text-center">{selectedCategory === "Automobile" ? "Showroom Visits" : (selectedCategory === "All" || selectedCategory === "Restaurant" ? "Post-Book" : "Interactions")}</th> */}
  <th className="p-8 text-center">Calls</th>
  <th className="p-8 text-right">Status</th>
</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredList.map((res) => {
                      const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : (res.analytics || {});
                      let dHits = 0, dOrders = 0, dPostOrders = 0, dCalls = 0;

                      if (viewMode === "daily") {
                        const d = new Date(filterDate);
                        const key1 = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                        const key2 = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                        const data1 = analyticsObj[key1] || {};
                        const data2 = analyticsObj[key2] || {};
                        dHits = (data1.kitchen_entry || 0) + (data2.kitchen_entry || 0);
                        dOrders = (data1.pre_order_click || 0) + (data2.pre_order_click || 0);
                        dPostOrders = (data1.post_order_click || 0) + (data2.post_order_click || 0);
                        dCalls = (data1.call_click || 0) + (data2.call_click || 0);
                      } else {
                        const stats = getRangeStats(res.analytics);
                        dHits = stats.hits; dOrders = stats.orders; dPostOrders = stats.postOrders; dCalls = stats.calls;
                      }

                      return (
                        <tr key={res._id} className="hover:bg-blue-50/30 transition-all">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              {res.hotelImage ? (
                                <img src={res.hotelImage} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                                  <Building2 className="w-6 h-6" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-black text-sm uppercase italic text-slate-800 block truncate">{res.name}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.collegeName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-8 text-center font-black text-lg text-slate-900">{dHits}</td>
                          <td className="p-8 text-center font-black text-2xl text-blue-600">{dOrders}</td>
                          <td className="p-8 text-center font-black text-2xl text-emerald-600">{dPostOrders}</td>
                          <td className="p-8 text-center font-black text-2xl text-orange-600">{dCalls}</td>
                          <td className="p-8 text-right">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase italic ${dHits > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                              {dHits > 0 ? 'Live Node' : 'Idle'}
                            </div>
                            {res.isApproved && (
                              <button type="button" onClick={() => {
                                localStorage.setItem("owner", JSON.stringify(res));
                                if (socket) socket.disconnect();
                                alert(`🛡️ Overcoming Matrix: Entering ${res.name}...`);
                                navigate("/owner/dashboard");
                              }} className="ml-3 p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-all active:scale-90 border border-indigo-100" title="Impersonate Node">
                                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 📱 MOBILE/TABLET GRID VIEW */}
              <div className="lg:hidden space-y-4 px-2 pb-20">
                {filteredList.map((owner) => {
                  const analyticsObj = owner.analytics instanceof Map ? Object.fromEntries(owner.analytics) : (owner.analytics || {});
                  let dHits = 0, dOrders = 0, dPostOrders = 0, dCalls = 0;
                  const sub = getSubscriptionStatus(owner.createdAt, owner.nextBillingDate, owner.category);

                  if (viewMode === "daily") {
                    const d = new Date(filterDate);
                    const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                    let dayData = owner.analytics instanceof Map ? owner.analytics.get(dayKey) || {} : analyticsObj[dayKey] || {};
                    const finalData = dayData._doc || dayData;
                    dHits = finalData.kitchen_entry || 0;
                    dOrders = finalData.pre_order_click || 0;
                    dPostOrders = finalData.post_order_click || 0;
                    dCalls = finalData.call_click || 0;
                  } else {
                    const stats = getRangeStats(owner.analytics);
                    dHits = stats.hits; dOrders = stats.orders; dPostOrders = stats.postOrders; dCalls = stats.calls;
                  }

                  const catLower = (owner.category || "").toLowerCase();
                  const isRestoMobile = catLower === "restaurant" || catLower === "" || catLower.includes("restaurant");
                  const isAutoMobile = catLower.includes("automobile");

                  return (
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={owner._id} className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm relative flex flex-col h-full overflow-hidden group">
                      {activeTab === "approved" && sub.isExpired && (
                        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[7px] font-black uppercase py-1 text-center z-10 animate-pulse">
                          Monthly Due Pending (₹{sub.chargeAmount})
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-5 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {owner.hotelImage && !owner.hotelImage.includes('placeholder') ? (
                              <img src={owner.hotelImage} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50" alt="" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-blue-600 shrink-0 border-2 border-slate-200/60 shadow-inner">
                                <Store className="w-5 h-5" />
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${dHits > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-[13px] uppercase italic text-slate-800 leading-tight truncate">{owner.name}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{owner.collegeName}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase italic ${dHits > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {dHits > 0 ? 'Live' : 'Idle'}
                        </div>
                      </div>

                      {/* 📊 ANALYTICS MATRIX GRID (Conditional based on Restaurant vs Others) */}
                      {isRestoMobile ? (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[
                            { label: 'Hits', val: dHits, color: 'slate' },
                            { label: 'Pre', val: dOrders, color: 'blue' },
                            { label: 'Post', val: dPostOrders, color: 'emerald' },
                            { label: 'Calls', val: dCalls, color: 'orange' }
                          ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{stat.label}</p>
                              <p className="text-sm font-black text-slate-700 italic">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                      ) : isAutoMobile ? (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: 'Hits', val: dHits },
                            { label: 'Test Drives', val: dOrders },
                            { label: 'Calls', val: dCalls }
                          ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{stat.label}</p>
                              <p className="text-sm font-black text-slate-700 italic">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: 'Hits', val: dHits },
                            { label: 'Orders', val: dOrders },
                            { label: 'Calls', val: dCalls }
                          ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{stat.label}</p>
                              <p className="text-sm font-black text-slate-700 italic">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4 px-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-tighter">
                          Registered: {owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-GB') : "New Entry"}
                        </span>
                      </div>

                      {activeTab === "approved" && (() => {
                        const displayAmount = sub.chargeAmount;
                        return (
                          <div className={`mb-4 p-4 rounded-2xl border transition-all duration-300 ${sub.isExpired ? 'bg-red-50 border-red-100 shadow-sm shadow-red-50' : 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-50'}`}>
                            <div className="flex justify-between items-center gap-4">
                              <div className="min-w-0 flex-1 w-full text-slate-900">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <div className="flex flex-col gap-0.5">
                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.25em] text-slate-500">System Protocol</p>
                                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Node Status</h5>
                                  </div>
                                  <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border animate-pulse shadow-sm flex items-center gap-1 ${sub.isExpired ? 'bg-rose-50/60 border-rose-100 text-rose-600' : 'bg-emerald-50/60 border-emerald-100 text-emerald-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${sub.isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                    {sub.isExpired ? 'Offline' : 'Active'}
                                  </div>
                                </div>

                                <div className={`p-3 rounded-xl border bg-white/80 ${sub.isExpired ? 'border-rose-100' : 'border-emerald-100'}`}>
                                  <span className={`text-xs font-black uppercase italic tracking-tight block ${sub.isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {sub.message}
                                  </span>
                                  {!sub.isExpired && (
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                      • Fee: <span className="text-slate-600 font-black">₹{displayAmount}</span>
                                    </p>
                                  )}
                                  {sub.isExpired && (
                                    <div className="mt-2 pt-2 border-t border-rose-100/50 grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[6px] font-black uppercase text-slate-400">Timeline</span>
                                        <span className="text-[9px] font-black text-rose-600">{sub.overdueText || "Expired"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[6px] font-black uppercase text-slate-400">Fee</span>
                                        <span className="text-[9px] font-black text-slate-800">₹{displayAmount}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {sub.isExpired && (
                                <button type="button" onClick={() => {
                                  const merchantName = owner?.name || "Partner Merchant";
                                  const ownerPhone = owner?.phone || "";
                                  const message = `*🛡️ SUDARA HUB NETWORK - BILLING DEPT* \n---------------------------------------------\n*URGENT NOTICE: SUBSCRIPTION EXPIRY*\n\nDear *${merchantName}* Management,\n\nYour commercial merchant account subscription has *EXPIRED*.\n\n💸 • Pending Due Amount: *₹${sub.chargeAmount} / Month*\n📌 PhonePe Secure: *7569896128*\n\n_Sudara Trust & Safety Compliance Team_`;
                                  window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`, '_blank');
                                }} className="bg-rose-600 text-white p-3.5 rounded-2xl shadow-xl active:scale-95 transition-all duration-300 hover:bg-rose-700 border border-rose-500/30 shrink-0 flex items-center justify-center border-b-4 border-b-rose-800" title="Transmit Expiry Alert">
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
{/* 🟢 RENEW CYCLE BUTTON (Direct 30 Days Extension by Admin) */}
{activeTab === "approved" && (
  <div className="flex gap-2 mb-4">
    <button 
      onClick={async () => {
        try {
          // 🎯 బ్యాక్‌ఎండ్ రౌట్ పర్‌ఫెక్ట్ గా హిట్ అవ్వడానికి /owner/update-billing/${owner._id} వాడాలి
          const response = await api.put(`/owner/update-billing/${owner._id}`);
          if (response.data.success) {
            setOwners(prev => prev.map(o => o._id === owner._id ? response.data.owner : o));
            alert("Subscription Renewed for 30 Days! 🚀");
          }
        } catch(err) { 
          console.error("Billing update failed ❌", err); 
          alert(err.response?.data?.message || "Billing update failed ❌ (Check backend route)");
        }
      }} 
      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
    >
      Renew 30 Days Cycle ✅
    </button>
  </div>
)}

                      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl mt-auto mb-4 shadow-inner">
                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-blue-400"><Phone className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Partner Contact</span>
                          <span className="text-[11px] font-black text-white tracking-wider uppercase leading-none">{owner.phone || "No Number"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100/80 mt-2">
                        {owner.isApproved && (
                          <button type="button" onClick={() => {
                            localStorage.setItem("owner", JSON.stringify(owner)); 
                            if (socket) socket.disconnect();
                            alert(`🛡️ OVERCOMING MATRIX: Entering ${owner.name} Node Control...`);
                            navigate("/owner/dashboard"); 
                          }} className="w-full mb-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-[10px] uppercase italic tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-b-indigo-900">
                            <LayoutDashboard className="w-4 h-4" /> Overcome Dashboard ⚔️
                          </button>
                        )}

                        <div className="flex items-center gap-2.5 w-full">
                          <button type="button" onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} className={`flex-1 py-3.5 rounded-2xl font-black text-[9px] uppercase italic tracking-widest transition-all shadow-sm active:scale-95 border-b-4 border-r inline-flex items-center justify-center gap-1.5 ${owner.isApproved ? 'bg-white border-slate-200 text-red-500 hover:bg-red-50/50 border-b-slate-300' : 'bg-slate-900 text-white border-b-slate-950 hover:bg-blue-600'}`}>
                            <span>{owner.isApproved ? '🛡️ Revoke Access' : '⚡ Verify Node'}</span>
                          </button>

                          <button type="button" onClick={() => deleteOwnerForever(owner._id, owner.name)} className="p-3.5 bg-red-50 text-red-500 rounded-2xl border border-red-100/70 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm flex items-center justify-center border-b-4 border-b-red-200 hover:border-b-red-700 aspect-square" title="Delete Forever">
                            <Trash2 className="w-4 h-4 stroke-[2.5]" /> 
                          </button>
                        </div>
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
                  const sub = getSubscriptionStatus(owner.createdAt, owner.nextBillingDate, owner.category);
                  
                  

                  const catLowerCard = (owner.category || "").toLowerCase();
                  const isRestoCard = catLowerCard === "restaurant" || catLowerCard === "" || catLowerCard.includes("restaurant");
                  const isAutoCard = catLowerCard.includes("automobile");
                  const displayAmount = sub.chargeAmount;

                  return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={owner._id} className="bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative flex flex-col h-full overflow-hidden group">
                      {activeTab === "approved" && sub.isExpired && (
                        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[7px] font-black uppercase py-1 text-center z-10 animate-pulse">
                          Monthly Due Pending (₹{sub.chargeAmount})
                        </div>
                      )}

                      <div className="flex items-start gap-4 mb-6 mt-2">
                        <div className="relative shrink-0">
                          {owner.hotelImage ? (
                            <img src={owner.hotelImage} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50" alt="" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-blue-600 shrink-0 border-2 border-slate-200/60 shadow-inner">
                              <Store className="w-5 h-5" />
                            </div>
                          )}
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

                      <div className="flex items-center gap-2 mb-4 px-1">
                         <Calendar className="w-3 h-3 text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-tighter">Registered: {owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-GB') : "New Entry"}</span>
                      </div>

                      {activeTab === "approved" && (
                        <div className={`mb-4 p-4 rounded-2xl border ${sub.isExpired ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                          <div className="flex justify-between items-center gap-4">
                             <div className="min-w-0 flex-1 w-full text-slate-900">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.25em] text-slate-500">System Protocol</p>
                                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Merchant Node Status</h5>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border animate-pulse shadow-sm flex items-center gap-1 ${sub.isExpired ? 'bg-rose-50/60 border-rose-100 text-rose-600' : 'bg-emerald-50/60 border-emerald-100 text-emerald-600'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sub.isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                  {sub.isExpired ? 'Offline' : 'Active'}
                                </div>
                              </div>

                              <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm shadow-inner ${sub.isExpired ? 'bg-gradient-to-br from-rose-50/60 to-white border-rose-100/70' : 'bg-gradient-to-br from-emerald-50/40 to-white border-emerald-100/60'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                                  <div className="space-y-1">
                                    <span className={`text-sm lg:text-base font-black uppercase italic tracking-tight leading-none block ${sub.isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>{sub.message}</span>
                                  </div>
                                  {sub.isExpired && (
                                    <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200/60 sm:pl-4">
                                      <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Timeline Due</span>
                                        <span className="text-[10px] font-black text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-lg w-fit">{sub.overdueText || "Expired"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Clearance Fee</span>
                                        <span className="text-xs font-black text-slate-800 tracking-tight flex items-center leading-none">₹{displayAmount}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "approved" && sub.isExpired && (
                        <button onClick={() => {
                          const merchantName = owner?.name || "Partner Merchant";
                          const ownerPhone = owner?.phone || "";
                          const message = `*🛡️ SUDARA HUB NETWORK - BILLING DEPT* \n---------------------------------------------\n*URGENT NOTICE: SUBSCRIPTION EXPIRY*\n\nDear *${merchantName}* Management,\n\nYour commercial merchant account subscription has *EXPIRED*.\n\n💸 • Pending Due Amount: *₹${sub.chargeAmount} / Month*\n📌 PhonePe Secure: *7569896128*\n\n_Sudara Trust & Safety Compliance Team_`;
                          window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`, '_blank');
                        }} className="bg-rose-600 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all duration-300 hover:bg-rose-700 flex items-center justify-center gap-2 border border-rose-500/30 shrink-0 mb-4">
                          <Send className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider px-1">Alert Merchant</span>
                        </button>
                      )}

{/* 🟢 RENEW CYCLE BUTTON (Direct 30 Days Extension by Admin) */}
{activeTab === "approved" && (
  <div className="flex gap-2 mb-4">
    <button 
      onClick={async () => {
        try {
          // 🎯 బ్యాక్‌ఎండ్ రౌట్ పర్‌ఫెక్ట్ గా హిట్ అవ్వడానికి /owner/update-billing/${owner._id} వాడాలి
          const response = await api.put(`/owner/update-billing/${owner._id}`);
          if (response.data.success) {
            setOwners(prev => prev.map(o => o._id === owner._id ? response.data.owner : o));
            alert("Subscription Renewed for 30 Days! 🚀");
          }
        } catch(err) { 
          console.error("Billing update failed ❌", err); 
          alert(err.response?.data?.message || "Billing update failed ❌ (Check backend route)");
        }
      }} 
      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
    >
      Renew 30 Days Cycle ✅
    </button>
  </div>
)}

                      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl mt-auto mb-4 shadow-inner">
                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                          <Phone className="w-4 h-4" /> 
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Partner Contact</span>
                          <span className="text-[11px] font-black text-white tracking-wider uppercase leading-none">{owner.phone || "No Number"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100/80 mt-2">
                        {owner.isApproved && (
                          <button type="button" onClick={() => {
                            localStorage.setItem("owner", JSON.stringify(owner)); 
                            alert(`🛡️ OVERCOMING MATRIX: Entering ${owner.name} Node Control...`);
                            navigate("/owner/dashboard"); 
                          }} className="w-full mb-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-[10px] uppercase italic tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-b-indigo-900">
                            <LayoutDashboard className="w-4 h-4" /> Overcome Dashboard ⚔️
                          </button>
                        )}

                        <div className="flex items-center gap-2.5 w-full">
                          <button type="button" onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} className={`flex-1 py-3.5 rounded-2xl font-black text-[9px] uppercase italic tracking-widest transition-all shadow-sm active:scale-95 border-b-4 border-r inline-flex items-center justify-center gap-1.5 ${owner.isApproved ? 'bg-white border-slate-200 text-red-500 hover:bg-red-50/50 border-b-slate-300' : 'bg-slate-900 text-white border-b-slate-950 hover:bg-blue-600'}`}>
                            <span>{owner.isApproved ? '🛡️ Revoke Access' : '⚡ Verify Node'}</span>
                          </button>

                          <button type="button" onClick={() => deleteOwnerForever(owner._id, owner.name)} className="p-3.5 bg-red-50 text-red-500 rounded-2xl border border-red-100/70 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm flex items-center justify-center border-b-4 border-b-red-200 hover:border-b-red-700 aspect-square" title="Delete Forever">
                            <Trash2 className="w-4 h-4 stroke-[2.5]" /> 
                          </button>
                        </div>
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
              <span className="font-black italic text-sm text-slate-900 uppercase">SUDARA <span className="text-blue-600">Automated</span> Hub</span>
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
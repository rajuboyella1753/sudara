import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, LogOut, Search, BarChart3, Store, X, 
  TrendingUp, Calendar, Activity, Star, MapPin, CreditCard,
  ArrowUpRight, LayoutDashboard, Globe, Menu, Bell, Filter,
  ChevronRight, RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchOwners(); }, []);

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
      const res = await api.post("/owner/broadcast-to-all", broadcastMsg);
      if (res.data.success) {
        alert(`🚀 System Alert Sent to ${res.data.sentCount} Users!`);
        setBroadcastMsg({ title: "", body: "" });
        setIsBroadcasting(false);
      }
    } catch (err) {
      alert("Broadcast failed! Check server logs.");
    } finally {
      setSending(false);
    }
  };

  // ✅ రాజు, డేట్ సెలెక్షన్ ఇక్కడ ఫిక్స్ చేశాను
  const selectedDateFormatted = new Date(filterDate).toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');

  const filteredList = owners.filter(o => {
    const isNotGeneral = o.collegeName !== "General";
    let matchesTab = true;
    if (activeTab === "pending") matchesTab = !o.isApproved;
    else if (activeTab === "approved") matchesTab = o.isApproved;
    else if (activeTab === "analytics") matchesTab = o.isApproved === true;

    const matchesSearch = (o.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.collegeName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return isNotGeneral && matchesTab && matchesSearch;
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
        <div className="flex items-center gap-3 w-full md:w-auto overflow-visible relative">
          <div className="relative flex items-center h-11 min-w-[150px] group"> 
            
        <input 
      type="date" 
      value={filterDate} 
      onChange={(e) => {
        console.log("✅ Date Changed to:", e.target.value);
        setFilterDate(e.target.value);
      }}
      onClick={(e) => {
        console.log("🔘 Force Opening Picker...");
        try {
          e.target.showPicker(); // 🎯 ఇది మోడ్రన్ బ్రౌజర్స్ లో క్యాలెండర్ ని ఓపెన్ చేస్తుంది
        } catch (err) {
          console.log("Picker error, falling back to focus");
        }
      }}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
      style={{ display: 'block' }}
    />
            
            {/* 🎨 నీ అందమైన బటన్ డిజైన్ - ఇది క్లిక్ ని అడ్డుకోకుండా pointer-events-none ఇచ్చాను */}
            <div className="flex items-center justify-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm w-full h-full pointer-events-none group-hover:bg-slate-50 transition-all z-10">
               <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
               <span className="uppercase tracking-widest text-slate-700 text-[9px] font-black whitespace-nowrap">
                 {filterDate ? new Date(filterDate).toLocaleDateString('en-GB') : "Filter Date"}
               </span>
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
          
          {/* ANALYTICS VIEW - WITH ORDERS SENT COLUMN */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                        <th className="p-8">Entity</th>
                        <th className="p-8 text-center">Daily Hits</th>
                        <th className="p-8 text-center text-blue-600">Orders Sent 📦</th>
                        <th className="p-8 text-center">Engagement</th>
                        <th className="p-8 text-right">Node Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredList.map((res) => {
                        const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : res.analytics;
                        const dayHits = analyticsObj?.[selectedDateFormatted]?.kitchen_entry || 0;
                        const orderSent = analyticsObj?.[selectedDateFormatted]?.pre_order_click || 0;

                        return (
                          <tr key={res._id} className="hover:bg-blue-50/20 transition-all group">
                            <td className="p-6 lg:p-8">
                              <div className="flex items-center gap-4">
                                <img src={res.hotelImage || "https://via.placeholder.com/60"} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" alt="" />
                                <div className="min-w-0 leading-tight">
                                    <span className="font-black text-sm uppercase italic text-slate-800 block truncate">{res.name}</span>
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mt-1.5 opacity-60">{res.collegeName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-8 text-center">
                              <div className="inline-flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group-hover:border-blue-100">
                                <span className="text-xl font-black text-slate-900 leading-none">{dayHits}</span>
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-1">Hits</span>
                              </div>
                            </td>
                            <td className="p-8 text-center">
                              <div className="inline-flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                                <span className="text-xl font-black text-blue-600 leading-none">{orderSent}</span>
                                <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter mt-1">Orders</span>
                              </div>
                            </td>
                            <td className="p-8 text-center">
                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto ${dayHits > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}><TrendingUp className="w-5 h-5"/></div>
                            </td>
                            <td className="p-8 text-right">
                               <div className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest ${dayHits > 0 ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-400'}`}>{dayHits > 0 ? 'Active Node' : 'Idle Node'}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
          )}

          {/* PARTNERS CARDS VIEW - ALL FEATURES RESTORED */}
          {(activeTab === "pending" || activeTab === "approved") && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-10">
              <AnimatePresence mode="popLayout">
                {filteredList.map((owner) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25 }} key={owner._id} className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative flex flex-col h-full">
                    
                    <div className="flex items-start gap-5 mb-8">
                      <div className="relative shrink-0">
                          <img src={owner.hotelImage || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-slate-50 shadow-inner group-hover:rotate-3 transition-transform" alt="Hotel"/>
                          <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl shadow-lg border-2 border-white ${owner.isStoreOpen ? 'bg-green-500' : 'bg-red-500'} animate-bounce-slow`}>
                              <Store className="w-3 h-3 text-white"/>
                          </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-slate-900 uppercase italic truncate tracking-tighter leading-none mb-2">{owner.name}</h3>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">{owner.collegeName}</p>
                        
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                             <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                             <span className="text-[10px] font-black text-amber-700">{owner.averageRating?.toFixed(1) || "5.0"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                             <Phone className="w-3 h-3 text-slate-400" />
                             <span className="text-[9px] font-bold text-slate-600 italic leading-none">{owner.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all mt-auto mb-6">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><CreditCard className="w-4 h-4" /></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Digital Protocol</span>
                            <span className="text-[11px] font-black text-slate-700 truncate tracking-tight uppercase leading-none">{owner.upiID || "NOT CONFIGURED"}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest italic leading-none">Security Node</span>
                            <span className={`text-[10px] font-black uppercase italic leading-none ${owner.isApproved ? 'text-green-500' : 'text-amber-500'}`}>
                                {owner.isApproved ? 'Secured Access ✅' : 'Pending Review ⏳'}
                            </span>
                        </div>
                        <button onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase italic tracking-[0.2em] transition-all shadow-xl shadow-slate-200/50 active:scale-95 ${owner.isApproved ? 'bg-white border border-red-100 text-red-500 hover:bg-red-50' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'}`}>
                            {owner.isApproved ? 'Revoke Permissions' : 'Grant Verified Access'}
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
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
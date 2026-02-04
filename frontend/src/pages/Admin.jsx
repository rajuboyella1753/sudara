import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, LogOut, Search, BarChart3, Store, X, 
  TrendingUp, Calendar, Activity, Star, MapPin, CreditCard,
  ArrowUpRight, LayoutDashboard, Globe, Menu
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchOwners(); }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/all-owners");
      setOwners(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); }
  };

  const updateApprovalStatus = async (id, status) => {
    try {
      await api.put(`/owner/approve-owner/${id}`, { isApproved: status });
      setOwners(prev => prev.map(o => o._id === id ? { ...o, isApproved: status } : o));
    } catch (err) { alert("Status Update Failed ❌"); }
  };

  // ✅ Date formatting logic for DB Match (e.g., 4/2/2026)
  const todayFormatted = new Date(filterDate).toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');

  const filteredList = owners.filter(o => {
    const matchesTab = activeTab === "pending" ? !o.isApproved : 
                       activeTab === "approved" ? o.isApproved : true;
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.collegeName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] text-blue-500 font-black px-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16" /></motion.div>
      <p className="mt-4 tracking-[0.3em] uppercase text-[8px] sm:text-[10px] text-slate-500 text-center">Syncing Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* 📱 MOBILE NAVIGATION BAR */}
      <div className="lg:hidden bg-[#1E293B] p-4 flex justify-between items-center text-white sticky top-0 z-[60] shadow-xl">
         <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><ShieldCheck className="w-5 h-5"/></div>
            <span className="font-black italic tracking-tighter text-sm uppercase">Sudara Hub</span>
         </div>
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-xl active:scale-90 transition-all">
            <Menu className="w-5 h-5 text-blue-400"/>
         </button>
      </div>

      {/* 🚀 RESPONSIVE SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative w-72 bg-[#1E293B] text-white flex flex-col z-[80] transition-transform duration-300 ease-in-out shadow-2xl`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40"><ShieldCheck className="text-white w-6 h-6" /></div>
            <span className="font-black text-xl italic leading-none tracking-tighter">SUDARA <span className="text-blue-400 block text-[9px] tracking-[0.4em] not-italic font-bold">INTEL V5.5</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white"><X /></button>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {[{ id: 'analytics', label: 'Daily Insights', icon: BarChart3 }, { id: 'approved', label: 'Active Partners', icon: Store }, { id: 'pending', label: 'Verification Queue', icon: ShieldAlert }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 shadow-xl' : 'hover:bg-slate-800 text-slate-400'}`}>
              <tab.icon className="w-4 h-4"/> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800/50">
          <button onClick={() => navigate("/owner")} className="w-full flex items-center gap-3 p-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all font-black text-[10px] uppercase tracking-widest"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative bg-[#F8FAFC] scroll-smooth">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
           <div className="flex justify-between items-center gap-4">
             <div className="min-w-0">
               <h2 className="text-lg sm:text-2xl font-black italic uppercase text-slate-900 tracking-tighter flex items-center gap-2 truncate">
                 {activeTab === 'analytics' ? 'Matrix' : 'Partners'}
               </h2>
               <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">Date: <span className="text-blue-600">{todayFormatted}</span></p>
             </div>
             
             <div className="relative group">
                <input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="bg-slate-900 text-white p-2.5 sm:px-4 sm:py-2 rounded-xl text-[9px] font-black shadow-lg flex items-center gap-2 transition-all group-hover:bg-blue-600">
                   <Calendar className="w-4 h-4 text-blue-400" />
                   <span className="hidden sm:inline uppercase">Change Date</span>
                </div>
             </div>
           </div>
           <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Search by name or college..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-100/50 border border-slate-200 p-3 pl-12 rounded-2xl text-[11px] font-bold outline-none focus:bg-white transition-all shadow-inner" />
           </div>
        </header>

        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-20">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50/80 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                        <th className="p-4 sm:p-8">Restaurant</th>
                        <th className="p-4 sm:p-8 text-center">Hits (Visits Today)</th>
                        <th className="p-4 sm:p-8 text-center">Engagement</th>
                        <th className="p-4 sm:p-8 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredList.map((res) => {
                        const analyticsObj = res.analytics instanceof Map ? Object.fromEntries(res.analytics) : res.analytics;
                        const dayHits = analyticsObj?.[todayFormatted]?.kitchen_entry || 0;

                        return (
                          <tr key={res._id} className="hover:bg-blue-50/30 transition-all group">
                            <td className="p-4 sm:p-6">
                              <div className="flex items-center gap-3">
                                <img src={res.hotelImage || "https://via.placeholder.com/60"} className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-cover border shadow-sm" />
                                <div className="min-w-0"><span className="font-black text-[11px] sm:text-sm uppercase italic text-slate-800 leading-tight block truncate">{res.name}</span><span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate block mt-0.5">{res.collegeName}</span></div>
                              </div>
                            </td>
                            <td className="p-4 sm:p-6 text-center">
                              <div className="inline-flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl min-w-[60px] sm:min-w-[80px]">
                                <span className="text-lg sm:text-xl font-black text-blue-600">
                                  {dayHits}
                                </span>
                                <span className="text-[7px] font-black text-slate-400 uppercase">Hits</span>
                              </div>
                            </td>
                            <td className="p-4 sm:p-6 text-center">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${dayHits > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}><TrendingUp className="w-4 h-4"/></div>
                            </td>
                            <td className="p-4 sm:p-6 text-right">
                               <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase ${dayHits > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400'}`}>{dayHits > 0 ? 'Active' : 'No Hits'}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
          )}

          {(activeTab === "pending" || activeTab === "approved") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-24">
              <AnimatePresence mode="popLayout">
                {filteredList.map((owner) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={owner._id} className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="relative shrink-0"><img src={owner.hotelImage || "https://via.placeholder.com/100"} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] object-cover border shadow-md" /><div className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-lg border border-white ${owner.isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}><Store className="w-3 h-3 text-white"/></div></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-xl font-black text-slate-900 uppercase italic truncate">{owner.name}</h3>
                        <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase truncate mt-1">{owner.collegeName}</p>
                        
                        {/* ⭐ రేటింగ్ సెక్షన్ */}
                        <div className="mt-2 flex items-center gap-2">
                          <Star className="w-3 h-3 text-blue-600 fill-blue-600" />
                          <span className="text-[10px] font-black text-slate-700">{owner.averageRating?.toFixed(1) || "5.0"}</span>
                        </div>

                        {/* ✅ రాజు, ఇక్కడ కొత్తగా UPI ID డిస్‌ప్లే ఫీచర్ యాడ్ చేశాను */}
                        <div className="mt-2 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 w-fit">
                          <CreditCard className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-black text-slate-600 tracking-tight">{owner.upiID || "UPI NOT SET"}</span>
                        </div>

                      </div>
                    </div>
                    <div className="mt-6 space-y-2 border-t pt-4">
                       <div className="flex items-center justify-between text-[10px] sm:text-[11px]"><span className="text-slate-400 font-bold uppercase">Approval</span><span className={`font-black uppercase italic ${owner.isApproved ? 'text-green-500' : 'text-amber-500'}`}>{owner.isApproved ? 'Verified ✅' : 'Pending ⏳'}</span></div>
                       <button onClick={() => updateApprovalStatus(owner._id, !owner.isApproved)} className={`w-full py-3.5 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase italic transition-all shadow-lg active:scale-95 ${owner.isApproved ? 'bg-red-50 text-red-500' : 'bg-blue-600 text-white'}`}>{owner.isApproved ? 'Deactivate Account' : 'Verify & Approve'}</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
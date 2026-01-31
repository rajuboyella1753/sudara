import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, CheckCircle, Building2, Phone, Users, 
  ShieldAlert, RefreshCcw, Compass, LogOut, Search, Filter, 
  BarChart3, GraduationCap, Zap, Store, ExternalLink, Menu, X
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu కోసం

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/all-owners");
      setOwners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApprovalStatus = async (id, status) => {
    try {
      const res = await api.put(`/owner/approve-owner/${id}`, { isApproved: status });
      if (res.status === 200) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, isApproved: status } : o));
      }
    } catch (err) {
      alert("Verification update failed ❌");
    }
  };

  const collegeStats = owners.reduce((acc, owner) => {
    const name = owner.collegeName || "General";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const colleges = ["All", ...Object.keys(collegeStats)];

  const filteredList = owners.filter(o => {
    const matchesTab = activeTab === "pending" ? !o.isApproved : o.isApproved;
    const matchesCollege = selectedCollege === "All" || o.collegeName === selectedCollege;
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesCollege && matchesSearch;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] text-blue-500">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
        <ShieldCheck className="w-12 h-12" />
      </motion.div>
      <p className="mt-4 font-bold text-[10px] uppercase tracking-[0.4em] text-slate-500 text-center px-6">Initializing Secure Systems...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* 📱 MOBILE HEADER */}
      <div className="lg:hidden bg-[#1E293B] text-white p-4 flex items-center justify-between sticky top-0 z-[60] shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-500 w-6 h-6" />
          <span className="font-black tracking-tighter text-sm uppercase">Sudara Hub</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🚀 SIDEBAR (Desktop & Mobile) */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative w-72 bg-[#1E293B] text-white flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out`}>
        <div className="p-8 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter italic">SUDARA <span className="text-blue-400 text-sm block tracking-widest font-bold not-italic opacity-70">ADMIN HUB</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8 lg:mt-4">
          <button onClick={() => { setActiveTab("pending"); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <div className="flex items-center gap-3"><ShieldAlert className="w-4 h-4"/> Pending Requests</div>
            <span className="bg-black/20 px-2 py-0.5 rounded-lg text-[10px]">{owners.filter(o=>!o.isApproved).length}</span>
          </button>
          <button onClick={() => { setActiveTab("approved"); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'approved' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <div className="flex items-center gap-3"><CheckCircle className="w-4 h-4"/> Verified Partners</div>
            <span className="bg-black/20 px-2 py-0.5 rounded-lg text-[10px]">{owners.filter(o=>o.isApproved).length}</span>
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-700/50">
          <button onClick={() => navigate("/owner")} className="w-full flex items-center gap-3 p-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-xs uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 🏙️ MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto max-h-screen relative flex flex-col">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 lg:top-0 bg-white/70 backdrop-blur-md z-40 border-b border-slate-200 px-6 sm:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <h2 className="text-sm lg:text-xl font-black uppercase tracking-tight text-slate-800">
             Dashboard / <span className="text-blue-600">{activeTab}</span>
           </h2>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search restaurant..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 py-3 pl-11 pr-4 rounded-2xl outline-none text-xs font-bold shadow-sm transition-all"/>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
           </div>
        </header>

        <div className="p-4 sm:p-10 max-w-7xl mx-auto w-full flex-1">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-10">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Users className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Database</h4>
                  <p className="text-2xl font-black text-slate-900">{owners.length}</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-2xl text-purple-600"><GraduationCap className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Colleges</h4>
                  <p className="text-2xl font-black text-slate-900">{Object.keys(collegeStats).length}</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Status</h4>
                  <p className="text-sm font-black text-slate-900 uppercase">Operational</p>
                </div>
             </div>
          </div>

          {/* College Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide">
             {colleges.map(clg => (
               <button key={clg} onClick={() => setSelectedCollege(clg)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCollege === clg ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>
                 {clg} <span className={`ml-1 opacity-50`}>{clg === 'All' ? owners.length : collegeStats[clg]}</span>
               </button>
             ))}
          </div>

          {/* Data Records */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredList.length > 0 ? (
                filteredList.map((owner) => (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={owner._id} className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${owner.isApproved ? 'border-green-100 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                           {owner.hotelImage ? (
                             <img src={owner.hotelImage} className="w-full h-full object-cover rounded-2xl" alt="logo" />
                           ) : (
                             <Building2 className={`w-6 h-6 sm:w-8 sm:h-8 ${owner.isApproved ? 'text-green-500' : 'text-slate-300'}`} />
                           )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-4 border-white ${owner.isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{owner.name || "N/A"}</h3>
                            <a href={`/restaurant/${owner._id}`} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-500 transition-all"><ExternalLink className="w-3.5 h-3.5" /></a>
                         </div>
                         <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-blue-500"/> {owner.collegeName}</span>
                            <span className="hidden xs:flex items-center gap-1"><Phone className="w-3 h-3 text-slate-300"/> {owner.phone}</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {activeTab === "pending" ? (
                        <button onClick={() => updateApprovalStatus(owner._id, true)} className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-blue-700 shadow-md active:scale-95 transition-all">Verify Partner</button>
                      ) : (
                        <button onClick={() => updateApprovalStatus(owner._id, false)} className="flex-1 sm:flex-none bg-slate-50 text-slate-400 border border-slate-200 px-6 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:text-red-500 hover:border-red-200 active:scale-95 transition-all">Revoke Access</button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                   <Store className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Empty Registry</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 🚀 IN-BUILT FOOTER */}
        <footer className="bg-white border-t border-slate-200 py-8 px-6 sm:px-10 mt-auto w-full">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 opacity-50">
                 <ShieldCheck className="w-4 h-4 text-slate-900" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sudara Protocol v4.2.1</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                 © 2026 Sudara Hub • Central Intelligence Panel
              </p>
              <div className="flex gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                 <span className="text-[8px] font-black uppercase text-slate-300">Server: Active</span>
              </div>
           </div>
        </footer>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 450px) {
          .xs\\:flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
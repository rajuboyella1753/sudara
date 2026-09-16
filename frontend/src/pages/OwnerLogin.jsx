import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { 
  ShieldCheck, Mail, Lock, Building2, LayoutGrid, 
  ChevronDown, AlertCircle, MapPin, Zap, Globe, 
  KeyRound, X 
} from "lucide-react"; // 🚀 RAJU FIX: KeyRound and X ikkada add chesa

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [dbDistricts, setDbDistricts] = useState([]); 
  const [verificationMessage, setVerificationMessage] = useState(""); 
  
  // 🚀 RAJU FIX: Missing States define chesa ikkada
  const [isForgotModal, setIsForgotModal] = useState(false);
  const [resetData, setResetData] = useState({ email: "", newPassword: "" });
  const [resetStatus, setResetStatus] = useState({ loading: false, msg: "" });

  const [form, setForm] = useState({
    email: "", 
    password: "",  
  });

  // =========================================================================
  // 🚀 రెండవ యూజ్ ఎఫెక్ట్: ఆల్రెడీ లాగిన్ అయి అప్రూవ్ అయిన ఓనర్ ని నేరుగా డాష్ బోర్డ్ కి పంపడానికి
  // =========================================================================
  useEffect(() => {
    const storedOwner = JSON.parse(localStorage.getItem("owner"));
    if (storedOwner && storedOwner.isApproved) {
        navigate("/owner/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setVerificationMessage(""); 
  };

  const handleDirectReset = async (e) => {
    e.preventDefault();
    setResetStatus({ loading: true, msg: "" });
    try {
      // ⚠️ Note: Backend lo e endpoint (/owner/direct-reset-password) nuvvu inka create cheyyali Raju
      const res = await api.put("/owner/direct-reset-password", resetData);
      setResetStatus({ loading: false, msg: res.data.message });
      
      setTimeout(() => {
        setIsForgotModal(false);
        setResetData({ email: "", newPassword: "" });
        setResetStatus({ loading: false, msg: "" });
      }, 2000);
    } catch (error) {
      setResetStatus({ loading: false, msg: error.response?.data?.message || "Reset failed!" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerificationMessage(""); 
    try {
      const payload = {
        email: form.email,
        password: form.password,
      };

      const res = await api.post("/owner/login", payload);
      
      if (res.data.isAdmin) {
        localStorage.setItem("isAdmin", "true"); 
        navigate("/sudara-admin-control");
        return;
      }

      if (res.data.owner.isApproved) {
        localStorage.setItem("owner", JSON.stringify(res.data.owner));
        
        const ownerCategory = res.data.owner.category;
        
        // 🎯 కేటగిరీని బట్టి కరెక్ట్ డాష్‌బోర్డ్‌కి రీడైరెక్ట్ చేసే లాజిక్
        if (!ownerCategory || ownerCategory === "Restaurant") {
          navigate("/owner/dashboard");
        } 
        else if (ownerCategory === "Electronics") {
          navigate("/owner/electronics-dashboard");
        } 
        else if (ownerCategory === "Clothing") {
          navigate("/owner/clothing-dashboard");
        } 
        else if (ownerCategory === "Grocery") {
          navigate("/owner/grocery-dashboard");
        } 
        else if (ownerCategory === "Automobile") {
          navigate("/automobile/dashboard"); // 🚗 ఆటోమొబైల్ షోరూమ్ డాష్‌బోర్డ్
        } 
        else if (ownerCategory === "Furniture") {
          navigate("/furniture/dashboard"); // 🛋️ ఫర్నిచర్ హబ్ డాష్‌బోర్డ్
        } 
        else {
          navigate("/owner/dashboard"); 
        }

      } else {
        setVerificationMessage("Account pending admin approval! ⏳");
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.registeredDistrict) {
        setVerificationMessage(`Wrong District! Registered with: ${errorData.registeredDistrict} ⚠️`);
      } else {
        setVerificationMessage(errorData?.message || "Login failed ❌");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05081c] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans relative">
      <Navbar />

      {/* Background Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-[#0a1033] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-[#1e2d69] p-6 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Owner <span className="text-cyan-400">Portal</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Access Business Matrix</p>
          </div>

          <AnimatePresence>
            {verificationMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }} 
                className="mb-8 bg-orange-950/40 border border-orange-500/40 p-4 rounded-2xl flex items-center gap-3 shadow-md"
              >
                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                <p className="text-[10px] font-black text-orange-200 uppercase leading-tight">
                  {verificationMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-cyan-400 mb-1.5 ml-4 tracking-widest block">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <input 
                    type="email" name="email" placeholder="owner@sudara.in" 
                    value={form.email} onChange={handleChange} required 
                    className="w-full bg-[#0e1638] border-2 border-[#1e2d69] pl-12 pr-4 py-4 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] outline-none font-bold text-sm text-slate-100 placeholder:text-slate-500 transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-cyan-400 mb-1.5 ml-4 tracking-widest block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <input 
                    type="password" name="password" placeholder="••••••••" 
                    value={form.password} onChange={handleChange} required 
                    className="w-full bg-[#0e1638] border-2 border-[#1e2d69] pl-12 pr-4 py-4 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] outline-none font-bold text-sm text-slate-100 placeholder:text-slate-500 transition-all shadow-inner" 
                  />
                </div>
                {/* 🚀 RAJU ADDED: Reset Password Clicker */}
                <div className="flex justify-end mt-2">
                   <button type="button" onClick={() => setIsForgotModal(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-400 transition-colors">Forgot Password?</button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-orange-600 hover:to-amber-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs italic transition-all duration-500 active:scale-95 shadow-xl shadow-blue-950/60 border border-cyan-400/30 flex items-center justify-center gap-3"
            >
              Login <Zap className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 text-center border-t border-[#1e2d69] pt-8 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              NEW PARTNER? 
              <a href="/owner/register" className="text-cyan-400 hover:text-orange-400 ml-2 transition-colors border-b-2 border-cyan-500/20 hover:border-orange-500/40 pb-0.5">
                Register Here...
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* 🚀 RAJU FIX: Forgot Password Modal Section */}
      <AnimatePresence>
        {isForgotModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-[#05081c]/80">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-[#0a1033] w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl relative border-t-8 border-orange-500 border border-[#1e2d69] text-white"
            >
              <button onClick={() => setIsForgotModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X /></button>
              
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-[#0e1638] border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <KeyRound className="text-orange-400 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-white">Access Override</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Reset your Password</p>
              </div>

              <form onSubmit={handleDirectReset} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="REGISTERED EMAIL" 
                    required 
                    className="w-full bg-[#0e1638] border border-[#1e2d69] p-4 pl-12 rounded-xl font-bold text-xs outline-none focus:border-cyan-400 focus:bg-[#121c45] text-white placeholder:text-slate-500 transition-all shadow-inner" 
                    value={resetData.email} 
                    onChange={(e)=>setResetData({...resetData, email: e.target.value})} 
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 w-4 h-4 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="NEW PASSWORD" 
                    required 
                    className="w-full bg-[#0e1638] border border-[#1e2d69] p-4 pl-12 rounded-xl font-bold text-xs outline-none focus:border-orange-400 focus:bg-[#121c45] text-white placeholder:text-slate-500 transition-all shadow-inner" 
                    value={resetData.newPassword} 
                    onChange={(e)=>setResetData({...resetData, newPassword: e.target.value})} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={resetStatus.loading} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl border border-cyan-400/30 transition-all active:scale-95 disabled:bg-slate-800 disabled:border-slate-700"
                >
                  {resetStatus.loading ? "OVERRIDING..." : "UPDATE ACCESS KEY"}
                </button>
              </form>

              {resetStatus.msg && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`mt-4 text-[10px] font-black uppercase text-center ${resetStatus.msg.includes('successfully') ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {resetStatus.msg}
                </motion.p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
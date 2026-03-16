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
    category: "food", 
    state: "Andhra Pradesh",
    district: "" 
  });

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await api.get("/owner/districts");
        if (res.data && res.data.length > 0) {
          setDbDistricts(res.data);
          setForm(prev => ({ ...prev, district: res.data[0] }));
        }
      } catch (err) {
        console.error("Districts load failed ❌");
      }
    };
    fetchDistricts();

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
        district: form.district, 
        category: form.category,
        state: form.state
      };

      const res = await api.post("/owner/login", payload);
      
      if (res.data.isAdmin) {
        localStorage.setItem("isAdmin", "true"); 
        navigate("/sudara-admin-control");
        return;
      }

      if (res.data.owner.isApproved) {
        localStorage.setItem("owner", JSON.stringify(res.data.owner));
        navigate("/owner/dashboard");
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-orange-100 overflow-x-hidden font-sans relative">
      <Navbar />

      {/* Background Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center px-4 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(30,58,138,0.12)] border border-slate-100 p-6 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-orange-500"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-4xl font-black italic uppercase text-slate-900 tracking-tighter leading-none mb-4">
              Owner <span className="text-indigo-600">Portal</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Access Business Matrix</p>
          </div>

          <AnimatePresence>
            {verificationMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-[10px] font-black text-orange-700 uppercase leading-tight">
                  {verificationMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-indigo-600 mb-1.5 ml-4 tracking-widest block">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 w-4 h-4 transition-colors" />
                  <input 
                    type="email" name="email" placeholder="owner@sudara.in" 
                    value={form.email} onChange={handleChange} required 
                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-4 rounded-2xl focus:border-indigo-100 focus:bg-white outline-none font-bold text-sm text-slate-800 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[9px] font-black uppercase text-indigo-600 mb-1.5 ml-4 tracking-widest block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 w-4 h-4 transition-colors" />
                  <input 
                    type="password" name="password" placeholder="••••••••" 
                    value={form.password} onChange={handleChange} required 
                    className="w-full bg-slate-50 border-2 border-slate-50 pl-12 pr-4 py-4 rounded-2xl focus:border-indigo-100 focus:bg-white outline-none font-bold text-sm text-slate-800 transition-all shadow-sm" 
                  />
                </div>
                {/* 🚀 RAJU ADDED: Reset Password Clicker */}
                <div className="flex justify-end mt-2">
                   <button type="button" onClick={() => setIsForgotModal(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">Forgot Password?</button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Regional Sync</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Registered State</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                  <select 
                    name="state" 
                    value={form.state} 
                    onChange={handleChange} 
                    className="w-full bg-white border-2 border-transparent pl-12 pr-10 py-4 rounded-xl outline-none font-bold appearance-none cursor-pointer text-sm text-slate-800 shadow-sm focus:border-indigo-400 transition-all"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Assigned District</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4 pointer-events-none" />
                  <select 
                    name="district" 
                    value={form.district} 
                    onChange={handleChange} 
                    className="w-full bg-white border-2 border-transparent pl-12 pr-10 py-4 rounded-xl outline-none font-bold appearance-none cursor-pointer text-sm text-slate-800 shadow-sm focus:border-orange-400 transition-all"
                  >
                    {dbDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs italic transition-all duration-500 active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
            >
              Login <Zap className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-100 pt-8 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              NEW PARTNER? 
              <a href="/owner/register" className="text-indigo-600 hover:text-orange-500 ml-2 transition-colors border-b-2 border-indigo-50 hover:border-orange-100 pb-0.5">
                Register Here...
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* 🚀 RAJU FIX: Forgot Password Modal Section */}
      <AnimatePresence>
        {isForgotModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl relative border-t-8 border-orange-500"
            >
              <button onClick={() => setIsForgotModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"><X /></button>
              
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <KeyRound className="text-orange-600 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-slate-900">Access Override</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Reset your Matrix Access Key</p>
              </div>

              <form onSubmit={handleDirectReset} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 w-4 h-4 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="REGISTERED EMAIL" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-xl font-bold text-xs outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                    value={resetData.email} 
                    onChange={(e)=>setResetData({...resetData, email: e.target.value})} 
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 w-4 h-4 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="NEW ACCESS TOKEN" 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-xl font-bold text-xs outline-none focus:border-orange-600 focus:bg-white transition-all shadow-inner" 
                    value={resetData.newPassword} 
                    onChange={(e)=>setResetData({...resetData, newPassword: e.target.value})} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={resetStatus.loading} 
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-200"
                >
                  {resetStatus.loading ? "OVERRIDING..." : "UPDATE ACCESS KEY"}
                </button>
              </form>

              {resetStatus.msg && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`mt-4 text-[10px] font-black uppercase text-center ${resetStatus.msg.includes('successfully') ? 'text-emerald-500' : 'text-rose-500'}`}
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
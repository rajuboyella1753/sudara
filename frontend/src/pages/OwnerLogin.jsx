import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { ShieldCheck, Mail, Lock, Building2, LayoutGrid, ChevronDown, AlertCircle, MapPin } from "lucide-react"; 

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [dbDistricts, setDbDistricts] = useState([]); 
  const [verificationMessage, setVerificationMessage] = useState(""); 
  const [form, setForm] = useState({
    email: "", 
    password: "", 
    category: "food", 
    state: "Andhra Pradesh",
    district: "" 
  });

  useEffect(() => {
    // 1. Database nundi districts fetch chesi dropdown populate cheyyadam
    const fetchDistricts = async () => {
      try {
        const res = await api.get("/owner/districts");
        if (res.data && res.data.length > 0) {
          setDbDistricts(res.data);
          // Default selection set cheyyadam
          setForm(prev => ({ ...prev, district: res.data[0] }));
        }
      } catch (err) {
        console.error("Districts load failed ❌");
      }
    };
    fetchDistricts();

    // Already login ayyi unte redirect
    const storedOwner = JSON.parse(localStorage.getItem("owner"));
    if (storedOwner && storedOwner.isApproved) {
        navigate("/owner/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setVerificationMessage(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerificationMessage(""); 
    try {
      // 🚀 PAYLOAD: Updated Backend logic ki taggattu district pampali
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
      // ✅ Hint Logic: Oka vela owner thappu district select chesthe ikkada hint vasthundhi
      if (errorData?.registeredDistrict) {
        setVerificationMessage(`Wrong District! Your account is registered with: ${errorData.registeredDistrict} ⚠️`);
      } else {
        setVerificationMessage(errorData?.message || "Login failed ❌");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500/30 overflow-hidden font-sans">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center px-4 py-20 sm:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="text-center mb-12 relative z-10">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShieldCheck className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black italic uppercase text-slate-900 tracking-tighter">
              Owner <span className="text-blue-600">Access</span>
            </h2>
          </div>

          <AnimatePresence>
            {verificationMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight leading-tight">
                  {verificationMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 w-5 h-5" />
              <input 
                type="email" name="email" placeholder="Business Email" 
                value={form.email} onChange={handleChange} required 
                className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold text-sm text-slate-800 shadow-sm" 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 w-5 h-5" />
              <input 
                type="password" name="password" placeholder="Access Token" 
                value={form.password} onChange={handleChange} required 
                className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold text-sm text-slate-800 shadow-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4 pointer-events-none" />
                <select 
                  name="state" 
                  value={form.state} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-100 pl-10 pr-8 py-4 rounded-2xl focus:border-blue-400 outline-none font-bold appearance-none cursor-pointer text-[9px] uppercase tracking-widest text-slate-600 shadow-sm"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4 pointer-events-none" />
                <select 
                  name="district" 
                  value={form.district} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-100 pl-10 pr-8 py-4 rounded-2xl focus:border-blue-400 outline-none font-bold appearance-none cursor-pointer text-[9px] uppercase tracking-widest text-slate-600 shadow-sm"
                >
                  {dbDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              </div>
            </div>

            <div className="relative group">
              <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4 pointer-events-none" />
              <select 
                name="category" value={form.category} onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-100 pl-10 pr-8 py-4 rounded-2xl focus:border-blue-400 outline-none font-bold appearance-none cursor-pointer text-[9px] uppercase tracking-widest text-slate-600 shadow-sm"
              >
                <option value="food">Food Business</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Initiate Access
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Unrecognized? 
              <a href="/owner/register" className="text-blue-600 hover:text-blue-500 ml-2 transition-colors border-b border-blue-100 pb-0.5">
                Register Command
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
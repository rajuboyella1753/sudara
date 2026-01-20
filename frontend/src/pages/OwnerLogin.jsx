import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, Building2, LayoutGrid } from "lucide-react";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [dbColleges, setDbColleges] = useState([]); 
  const [form, setForm] = useState({
    email: "", password: "", category: "food", collegeName: "", 
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get("/owner/colleges");
        if (res.data && res.data.length > 0) {
          setDbColleges(res.data);
          setForm(prev => ({ ...prev, collegeName: res.data[0] }));
        }
      } catch (err) {
        console.error("Colleges load failed ❌");
      }
    };
    fetchColleges();
    if (localStorage.getItem("owner")) navigate("/owner/dashboard");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/owner/login", form);
      localStorage.setItem("owner", JSON.stringify(res.data.owner));
      navigate("/owner/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden">
      <Navbar />

      {/* 🌌 Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center px-4 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0f172a]/50 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-indigo-500/20 p-10 relative overflow-hidden"
        >
          {/* Top Branding */}
          <div className="text-center mb-12 relative z-10">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/5">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">
              Admin <span className="text-blue-500">Access</span>
            </h2>
            <p className="text-indigo-300/60 text-[10px] font-black uppercase mt-3 tracking-[0.3em]">Guardian Protocol v2.0</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="email" 
                name="email" 
                placeholder="Business Email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                className="w-full bg-black/40 border border-indigo-500/10 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500/50 outline-none font-bold transition-all placeholder:text-slate-600 text-sm" 
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="password" 
                name="password" 
                placeholder="Access Token" 
                value={form.password} 
                onChange={handleChange} 
                required 
                className="w-full bg-black/40 border border-indigo-500/10 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500/50 outline-none font-bold transition-all placeholder:text-slate-600 text-sm" 
              />
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 pointer-events-none" />
                <select 
                  name="collegeName" 
                  value={form.collegeName} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-indigo-500/10 pl-10 pr-4 py-4 rounded-2xl focus:border-blue-500/50 outline-none font-bold appearance-none cursor-pointer text-[10px] uppercase tracking-widest text-slate-300"
                >
                  {dbColleges.map((c) => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                </select>
              </div>

              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 pointer-events-none" />
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-indigo-500/10 pl-10 pr-4 py-4 rounded-2xl focus:border-blue-500/50 outline-none font-bold appearance-none cursor-pointer text-[10px] uppercase tracking-widest text-slate-300"
                >
                  <option value="food" className="bg-[#0f172a]">Food</option>
                  {/* <option value="delivery" className="bg-[#0f172a]">Delivery</option> */}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic transition-all active:scale-95 shadow-xl shadow-blue-600/20 border border-blue-400/30"
            >
              Initiate Access
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-10 text-center border-t border-indigo-500/10 pt-8 relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Unrecognized? 
              <a href="/owner/register" className="text-blue-500 hover:text-blue-400 ml-2 transition-colors border-b border-blue-500/20 pb-0.5">
                Register Command
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
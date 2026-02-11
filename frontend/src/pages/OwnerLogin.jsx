import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { ShieldCheck, Mail, Lock, Building2, LayoutGrid, ChevronDown, AlertCircle } from "lucide-react"; 

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [dbColleges, setDbColleges] = useState([]); 
  const [verificationMessage, setVerificationMessage] = useState(""); 
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

    // ✅ రాజు, ఇక్కడ పాత లాజిక్ తీసేసి వెరిఫికేషన్ చెక్ పెట్టాలి
    const storedOwner = JSON.parse(localStorage.getItem("owner"));
    if (storedOwner) {
      // ఒకవేళ ఆల్రెడీ లాగిన్ అయ్యి ఉండి, అప్రూవ్ అయ్యి ఉంటేనే పంపించు
      if (storedOwner.isApproved) {
        navigate("/owner/dashboard");
      } else {
        // ఒకవేళ అప్రూవ్ కాకపోతే లోకల్ స్టోరేజ్ క్లియర్ చేసి ఇక్కడే ఉంచు
        localStorage.removeItem("owner");
        setVerificationMessage("Your account is still under review.");
      }
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
      const res = await api.post("/owner/login", form);
      
      if (res.data.isAdmin) {
        navigate("/sudara-admin-control");
        return;
      }

      if (res.data.owner.isApproved) {
        // ✅ డేటా సేవ్ చేసి డ్యాష్‌బోర్డ్ కి పంపించు
        localStorage.setItem("owner", JSON.stringify(res.data.owner));
        navigate("/owner/dashboard");
      } else {
        setVerificationMessage("Account pending admin approval! ⏳");
      }
    } catch (error) {
      setVerificationMessage(error.response?.data?.message || "Login failed ❌");
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
            <p className="text-slate-400 text-[9px] font-black uppercase mt-3 tracking-[0.3em]">Guardian Protocol v2.0</p>
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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input 
                type="email" 
                name="email" 
                placeholder="Business Email" 
                value={form.email} 
                onChange={handleChange} 
                autoComplete="email"
                required 
                className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold transition-all placeholder:text-slate-300 text-sm text-slate-800 shadow-sm" 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input 
                type="password" 
                name="password" 
                placeholder="Access Token" 
                value={form.password} 
                onChange={handleChange} 
                autoComplete="current-password"
                required 
                className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold transition-all placeholder:text-slate-300 text-sm text-slate-800 shadow-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4 pointer-events-none" />
                <select 
                  name="collegeName" 
                  value={form.collegeName} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-100 pl-10 pr-8 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold appearance-none cursor-pointer text-[9px] uppercase tracking-widest text-slate-600 shadow-sm"
                >
                  {dbColleges.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              </div>

              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-4 h-4 pointer-events-none" />
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-100 pl-10 pr-8 py-4 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold appearance-none cursor-pointer text-[9px] uppercase tracking-widest text-slate-600 shadow-sm"
                >
                  <option value="food">Food</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
              </div>
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
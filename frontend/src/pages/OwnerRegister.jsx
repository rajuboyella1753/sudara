import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api-base"; 
import { motion } from "framer-motion";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  CreditCard,
  Info
} from "lucide-react";

export default function OwnerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "food",
    phone: "", // Calling Number
    whatsappNumber: "", 
    upiNumber: "",      
    state: "Andhra Pradesh", 
    district: "Tirupati",    
    collegeName: "MBU",      
    customCollege: ""   
  });

  const collegesList = ["MBU", "Others"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.collegeName === "Others" && !form.customCollege.trim()) {
      alert("Please enter your Area/Landmark name!");
      return;
    }
    const finalCollege = form.collegeName === "Others" ? form.customCollege : form.collegeName;
    const payload = {
      ...form,
      collegeName: finalCollege,
      whatsappNumber: form.whatsappNumber || form.phone,
      upiNumber: form.upiNumber || form.phone
    };

    try {
      await api.post("/owner/register", payload);
      alert("Registered successfully ✅");
      window.location.href = "/owner";
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden relative">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
        {/* Changed max-w-lg to max-w-xl for more space */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(30,58,138,0.15)] border border-slate-100 p-6 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-orange-500"></div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">
              DEPLOY <span className="text-indigo-600">HUB</span>
            </h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-4">
              Enter In-Detailed Business Intelligence
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 🏢 Basic Identity Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Business Identity</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">Restaurant Name</label>
                  <input type="text" name="name" required placeholder="e.g. Sudara Kitchen" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                </div>
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">Official Email</label>
                  <input type="email" name="email" required placeholder="owner@sudara.in" value={form.email} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                </div>
              </div>
            </div>

            {/* 🗺️ Regional Matrix Section (State & District) */}
            <div className="p-6 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100 space-y-6 shadow-inner">
              <div className="flex items-center gap-2 text-indigo-900">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Regional Location Data</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">Select State</label>
                  <div className="relative">
                    <select name="state" value={form.state} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-indigo-400 appearance-none cursor-pointer shadow-sm">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">Current District</label>
                  <div className="relative">
                    <input type="text" name="district" required placeholder="e.g. Tirupati" value={form.district} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-400" />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">Primary Area / Landmark</label>
                <select name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-500 cursor-pointer">
                  {collegesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                  <label className="text-[9px] font-black uppercase text-orange-600 ml-1 mb-1 block">Specify Area Name</label>
                  <input type="text" name="customCollege" required placeholder="Type Landmark Name..." value={form.customCollege} onChange={handleChange} className="w-full bg-white border-2 border-orange-200 px-4 py-3.5 rounded-2xl font-bold text-sm focus:border-orange-500 outline-none shadow-md transition-all" />
                </motion.div>
              )}
            </div>

            {/* 📱 Network Communication (Numbers Section) */}
            <div className="p-6 bg-orange-50/40 rounded-[2.5rem] border border-orange-100 space-y-6">
              <div className="flex items-center gap-2 text-orange-900">
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Connectivity Channels</span>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-orange-600 ml-1 block">Primary Calling Number (For Customers)</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300 transition-colors" />
                  <input type="tel" name="phone" required placeholder="e.g. 9876543210" value={form.phone} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-12 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-600 ml-1 flex items-center gap-1">WhatsApp Line <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div></label>
                  <input type="tel" name="whatsappNumber" placeholder="WhatsApp Number" value={form.whatsappNumber} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-emerald-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">UPI Number (For Payments)</label>
                  <div className="relative">
                    <input type="tel" name="upiNumber" placeholder="UPI Registered Phone" value={form.upiNumber} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-400" />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
                  </div>
                </div>
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase italic px-2 tracking-tighter">* If WhatsApp or UPI numbers are left empty, primary number will be used.</p>
            </div>

            {/* Access Matrix Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Access Protocol</span>
              </div>
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">Secure Access Key (Password)</label>
                <input type="password" name="password" required placeholder="Create Password" value={form.password} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-orange-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs italic transition-all duration-500 shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3">
              REGISTER <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ALREADY REGISTERED? <a href="/owner" className="text-indigo-600 hover:text-orange-500 ml-1 transition-colors underline underline-offset-8 decoration-orange-300">LOGIN HERE</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Separate Icon for Select
function ChevronDown(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
}
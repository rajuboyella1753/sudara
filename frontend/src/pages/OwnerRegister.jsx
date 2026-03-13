import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api-base"; 
import { motion } from "framer-motion";

export default function OwnerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "food",
    phone: "", // Calling Number
    whatsappNumber: "", // 🆕 Added
    upiNumber: "",      // 🆕 Added
    state: "Andhra Pradesh", // 🆕 Added
    district: "Tirupati",    // 🆕 Added
    collegeName: "MBU",      // Landmark / Area
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
      // If WhatsApp or UPI numbers are empty, fallback to primary phone
      whatsappNumber: form.whatsappNumber || form.phone,
      upiNumber: form.upiNumber || form.phone
    };

    try {
      const res = await api.post("/owner/register", payload);
      alert("Registered successfully ✅");
      window.location.href = "/owner";
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Try again!";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/30">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 md:py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 relative overflow-hidden"
        >
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              Join the <span className="text-blue-600">Hub</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
              Create your business account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Shop Details */}
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Shop / Owner Name</label>
              <input type="text" name="name" required placeholder="Business Name" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all text-slate-800" />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Email Address</label>
              <input type="email" name="email" required placeholder="owner@hub.com" value={form.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all text-slate-800" />
            </div>

            {/* 🆕 Section: Location Info */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">State</label>
                  <select name="state" value={form.state} onChange={handleChange} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-bold text-xs">
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">District</label>
                  <input type="text" name="district" value={form.district} onChange={handleChange} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-bold text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Area / Landmark</label>
                <select name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-bold text-xs">
                  {collegesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <input type="text" name="customCollege" required placeholder="Type Landmark (e.g. Tirupati Town)" value={form.customCollege} onChange={handleChange} className="w-full bg-white border-2 border-orange-500/20 px-3 py-2 rounded-lg font-bold text-xs focus:border-orange-500" />
              )}
            </div>

            {/* 🆕 Section: Multiple Numbers */}
            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Calling Number *</label>
                  <input type="tel" name="phone" required placeholder="Primary Number" value={form.phone} onChange={handleChange} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-green-600 mb-1">WhatsApp</label>
                    <input type="tel" name="whatsappNumber" placeholder="Whatsapp number" value={form.whatsappNumber} onChange={handleChange} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-bold text-xs" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-blue-600 mb-1">UPI Number</label>
                    <input type="tel" name="upiNumber" placeholder="phonepay number" value={form.upiNumber} onChange={handleChange} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-bold text-xs" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Password</label>
              <input type="password" name="password" required placeholder="••••••••" value={form.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 font-bold text-sm" />
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-xl active:scale-95">
              Start Business Now
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 border-t border-slate-50 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already a partner? <a href="/owner" className="text-blue-600 hover:text-blue-500 ml-1 font-black">Login here</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
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
    phone: "",
    collegeName: "MBU", 
    customCollege: ""   
  });

  const collegesList = ["MBU", "Others"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCollege = form.collegeName === "Others" ? form.customCollege : form.collegeName;
    
    const payload = {
      ...form,
      collegeName: finalCollege
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

      {/* 🌌 Background Atmosphere - Subtle Blue Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 md:py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 relative overflow-hidden"
        >
          {/* Top Branding */}
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
              Join the <span className="text-blue-600">Hub</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
              Create your business account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Shop / Owner Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="DINE OUT CRYSTAL"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all placeholder:text-slate-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="owner@hub.com"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all placeholder:text-slate-300 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Nearby College</label>
                <select
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all appearance-none cursor-pointer text-slate-700"
                >
                  {collegesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[9px] font-black uppercase text-orange-500 mb-1 ml-1 tracking-widest">Type College Name</label>
                  <input
                    type="text"
                    name="customCollege"
                    required
                    placeholder="Enter College Name"
                    value={form.customCollege}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-orange-500/20 px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-sm transition-all text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all placeholder:text-slate-300 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Mobile</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-sm transition-all placeholder:text-slate-300 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Start Business Now
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 border-t border-slate-50 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already a partner?{" "}
              <a href="/owner" className="text-blue-600 hover:text-blue-500 ml-1 font-black">Login here</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
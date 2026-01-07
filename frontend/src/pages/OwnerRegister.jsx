import { useState } from "react";
import Navbar from "../components/Navbar";
// 1. మన సెంట్రల్ API ని ఇంపోర్ట్ చేస్తున్నాం
import api from "../api/api-base"; 

export default function OwnerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "food",
    phone: "",
    collegeName: "MBU", // Default College
    customCollege: ""   // Others కోసం
  });

  const collegesList = ["MBU", "Others"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ఒకవేళ Others ఎంచుకుంటే, customCollege లో ఉన్న పేరుని collegeName గా పంపాలి
    const finalCollege = form.collegeName === "Others" ? form.customCollege : form.collegeName;
    
    const payload = {
      ...form,
      collegeName: finalCollege
    };

    try {
      // 2. fetch బదులు api.post వాడుతున్నాం
      const res = await api.post("/owner/register", payload);

      // Axios లో నేరుగా డేటా వస్తుంది, res.ok బదులు status చెక్ చేయాలి (లేదా నేరుగా సక్సెస్ కిందకి వస్తుంది)
      alert("Registered successfully ✅");
      window.location.href = "/owner";
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Try again!";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-10 md:py-20">
        <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-white/5 p-8 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 blur-[80px]"></div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Join the <span className="text-blue-500">Hub</span>
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
              Create your business account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Shop / Owner Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="DINE OUT CRYSTAL"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-sm transition-all placeholder:text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="owner@hub.com"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-sm transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Nearby College</label>
                <select
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                >
                  {collegesList.map((c) => (
                    <option key={c} value={c} className="bg-[#0f172a]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black uppercase text-orange-500 mb-1 ml-1">Type College Name</label>
                  <input
                    type="text"
                    name="customCollege"
                    required
                    placeholder="Enter College Name"
                    value={form.customCollege}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-2 border-orange-500/30 px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-sm transition-all"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-sm transition-all placeholder:text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Mobile</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-sm transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs italic transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Start Business Now
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 border-t border-white/5 pt-6">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Already a partner?{" "}
              <a href="/owner" className="text-blue-500 hover:underline ml-1 font-black">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
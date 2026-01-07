import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api-base"; 

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
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] shadow-2xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-600/10 blur-[80px]"></div>
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-4xl font-black italic uppercase text-white">Welcome <span className="text-orange-500">Back</span></h2>
            <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">Manage your empire</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <input type="email" name="email" autoComplete="username" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-xl focus:border-orange-500 outline-none font-bold" />
            <input type="password" name="password" autoComplete="current-password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-xl focus:border-orange-500 outline-none font-bold" />

            <div className="grid grid-cols-2 gap-4">
              <select name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-xl focus:border-orange-500 outline-none font-bold appearance-none cursor-pointer">
                {dbColleges.map((c) => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
              </select>
              <select name="category" value={form.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-xl focus:border-orange-500 outline-none font-bold appearance-none cursor-pointer">
                <option value="food" className="bg-[#0f172a]">Food</option>
                <option value="delivery" className="bg-[#0f172a]">Delivery</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs italic transition-all active:scale-95">Access Dashboard</button>
          </form>
          <div className="mt-8 text-center border-t border-white/5 pt-6 relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase">New? <a href="/owner/register" className="text-orange-500 hover:underline ml-1">Create Account</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  UtensilsCrossed
} from "lucide-react";

export default function OwnerRegister() {
  const [form, setForm] = useState({
    ownerName: "",
    name: "",
    email: "",
    password: "",
    category: "Restaurant",
    phone: "",
    whatsappNumber: "", 
    upiNumber: "",      
    state: "Andhra Pradesh", 
    district: "Tirupati",    
    collegeName: "MBU",      
    customCollege: "",
    fssaiNumber: "",
    gstNumber: "",
    // 🍔 కేవలం రెస్టారెంట్ల కోసం ఎక్స్ట్రా ఫీల్డ్స్
    foodType: "Both",
    tableCount: "",
    todaySpecial: ""
  });

  const collegesList = ["MBU", "Others"];
  const categoriesList = [
  { label: "🍔 Restaurants & Food", value: "Restaurant" },
  { label: "🚗 Automobile Showroom", value: "Automobile" },
  { label: "📱 Electronics & Mobiles", value: "Electronics" },
  { label: "👗 Clothing & Fashion", value: "Clothing" },
  { label: "🛒 Groceries & Supermarket", value: "Grocery" },
  { label: "🛋️ Furniture & Living", value: "Furniture" },
  { label: "🔧 Services & Repairs", value: "Services" },
  { label: "🏬 General Store", value: "General" }
];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.collegeName === "Others" && !form.customCollege.trim()) {
      alert("దయచేసి మీ ఏరియా/ల్యాండ్‌మార్క్ పేరు ఇవ్వండి!");
      return;
    }

    const finalCollege = form.collegeName === "Others" ? form.customCollege : form.collegeName;
    
    // 💡 ఆప్టిమైజ్డ్ పేలోడ్: కేవలం కేటగిరీని బట్టి తగిన డేటాను మాత్రమే బ్యాక్‌ఎండ్‌కి పంపిస్తున్నాం
    const payload = {
      ownerName: form.ownerName,
      name: form.name,
      email: form.email,
      password: form.password,
      category: form.category,
      phone: form.phone,
      whatsappNumber: form.whatsappNumber || form.phone,
      upiNumber: form.upiNumber || form.phone,
      state: form.state,
      district: form.district,
      collegeName: finalCollege,
      fssaiNumber: form.fssaiNumber,
      gstNumber: form.gstNumber,
      
      // 🍔 కేవలం కేటగిరీ "Restaurant" అయితేనే ఈ ఎక్స్ట్రా ఫీల్డ్స్ డేటాబేస్‌కి వెళ్తాయి, లేదంటే అసలు వెళ్లవు!
      ...(form.category === "Restaurant" ? {
        foodType: form.foodType,
        tableCount: form.tableCount ? Number(form.tableCount) : 0
      } : {})
    };

    try {
      await api.post("/owner/register", payload);
      alert("రిజిస్ట్రేషన్ విజయవంతమైంది ✅");
      window.location.href = "/owner";
    } catch (error) {
      alert(error.response?.data?.message || "రిజిస్ట్రేషన్ విఫలమైంది.");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081c] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-[#0a1033] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-[#1e2d69] p-6 md:p-12 relative overflow-hidden text-white"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500"></div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              SUDARA <span className="text-cyan-400">HUB</span>
            </h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-4">
              మర్చంట్ డిజిటల్ రిజిస్ట్రేషన్ పోర్టల్
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 🏢 Basic Identity Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">బిజినెస్ & ఓనర్ వివరాలు</span>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block">బిజినెస్ కేటగిరీ</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-cyan-400 focus:bg-[#121c45] cursor-pointer shadow-inner text-white appearance-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#0a1033] text-white">{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">ఓనర్ పూర్తి పేరు</label>
                  <input type="text" name="ownerName" required placeholder="ఉదా: రమేష్ కుమార్" value={form.ownerName} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
                </div>
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">స్టోర్ / బిజినెస్ పేరు</label> 
                  <input type="text" name="name" required placeholder="ఉదా: రాయల్ Business" value={form.name} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">అధికారిక ఇమెయిల్</label>
                  <input type="email" name="email" required placeholder="owner@sudara.in" value={form.email} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
                </div>

                {(form.category === "Restaurant" || form.category === "Grocery") && (
                  <div className="relative">
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">FSSAI లైసెన్స్ నంబర్</label>
                    <input type="text" name="fssaiNumber" placeholder="14-అంకెల FSSAI నంబర్" value={form.fssaiNumber} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">GST నంబర్</label>
                <input type="text" name="gstNumber" placeholder="GST నంబర్ నమోదు చేయండి" value={form.gstNumber} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
              </div>
            </div>

            {/* 🍔 RESTAURANT SPECIAL FEATURES SECTION (కేవలం రెస్టారెంట్ అయితేనే కనిపిస్తుంది) */}
            {form.category === "Restaurant" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 bg-[#0e1638] rounded-[2.5rem] border border-amber-500/30 space-y-5">
                <div className="flex items-center gap-2 text-amber-300">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">రెస్టారెంట్ ప్రత్యేక వివరాలు (Restaurant Specs)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-amber-400 ml-1">ఫుడ్ టైప్ (Food Type)</label>
                    <select name="foodType" value={form.foodType} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-amber-400 cursor-pointer text-white">
                      <option value="Veg" className="bg-[#0a1033] text-white">వెజ్ మాత్రం (Veg Only)</option>
                      <option value="Non-Veg" className="bg-[#0a1033] text-white">నాన్-వెజ్ (Non-Veg)</option>
                      <option value="Both" className="bg-[#0a1033] text-white">రెండూ (Veg & Non-Veg)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-amber-400 ml-1">మొత్తం టేబుల్స్ (Table Count)</label>
                    <input type="number" name="tableCount" placeholder="ఉదా: 20" value={form.tableCount} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-amber-400 text-white placeholder:text-slate-500" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🗺️ Regional Matrix Section */}
            <div className="p-6 bg-[#0e1638] rounded-[2.5rem] border border-[#1e2d69] space-y-6 shadow-inner">
              <div className="flex items-center gap-2 text-cyan-300">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">ప్రాంతీయ లొకేషన్ వివరాలు</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-cyan-400 ml-1">రాష్ట్రం (State)</label>
                  <div className="relative">
                    <select name="state" value={form.state} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-cyan-400 appearance-none cursor-pointer shadow-sm text-white">
                      <option value="Andhra Pradesh" className="bg-[#0a1033] text-white">Andhra Pradesh</option>
                      <option value="Telangana" className="bg-[#0a1033] text-white">Telangana</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-cyan-400 ml-1">జిల్లా (District)</label>
                  <div className="relative">
                    <input type="text" name="district" required placeholder="ఉదా: తిరుపతి" value={form.district} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-cyan-400 text-white placeholder:text-slate-500" />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-cyan-400 ml-1">ప్రైమరీ ఏరియా / ల్యాండ్‌మార్క్</label>
                <select name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-cyan-400 cursor-pointer text-white">
                  {collegesList.map((c) => (<option key={c} value={c} className="bg-[#0a1033] text-white">{c}</option>))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                  <label className="text-[9px] font-black uppercase text-orange-400 ml-1 mb-1 block">మీ ఏరియా పేరు రాయండి</label>
                  <input type="text" name="customCollege" required placeholder="ల్యాండ్‌మార్క్ పేరు..." value={form.customCollege} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-orange-500/40 px-4 py-3.5 rounded-2xl font-bold text-sm focus:border-orange-400 outline-none shadow-md transition-all text-white placeholder:text-slate-500" />
                </motion.div>
              )}
            </div>

            {/* 📱 Network Communication */}
            <div className="p-6 bg-[#0e1638] rounded-[2.5rem] border border-[#1e2d69] space-y-6 shadow-inner">
              <div className="flex items-center gap-2 text-orange-400">
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">కమ్యూనికేషన్ ఛానెల్స్</span>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-orange-400 ml-1 block">ప్రైమరీ కాలింగ్ నంబర్</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                  <input type="tel" name="phone" required placeholder="ఉదా: 9876543210" value={form.phone} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-12 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-orange-400 text-white placeholder:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-400 ml-1 flex items-center gap-1">వాట్సాప్ నంబర్ <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div></label>
                  <input type="tel" name="whatsappNumber" placeholder="వాట్సాప్ నంబర్" value={form.whatsappNumber} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-emerald-400 text-white placeholder:text-slate-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-cyan-400 ml-1">ఫోన్‌పే / UPI నంబర్</label>
                  <div className="relative">
                    <input type="tel" name="upiNumber" placeholder="UPI రిజిస్టర్డ్ నంబర్" value={form.upiNumber} onChange={handleChange} className="w-full bg-[#0a1033] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-cyan-400 text-white placeholder:text-slate-500" />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase italic px-2 tracking-tighter">* వాట్సాప్ లేదా UPI నంబర్లు ఖాళీగా వదిలితే ప్రైమరీ నంబర్ తీసుకోబడుతుంది.</p>
            </div>

            {/* Access Matrix Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">సెక్యూరిటీ ప్రోటోకాల్</span>
              </div>
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">పాస్‌వర్డ్</label>
                <input type="password" name="password" required placeholder="పాస్‌వర్డ్ సృష్టించండి" value={form.password} onChange={handleChange} className="w-full bg-[#0e1638] border-2 border-[#1e2d69] px-4 py-3.5 rounded-2xl focus:border-cyan-400 focus:bg-[#121c45] focus:outline-none font-bold text-sm text-white placeholder:text-slate-500 transition-all shadow-inner" />
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-orange-600 hover:to-amber-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs italic transition-all duration-500 shadow-xl shadow-blue-950/60 border border-cyan-400/30 active:scale-95 flex items-center justify-center gap-3">
              రిజిస్టర్ చేయి <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 text-center border-t border-[#1e2d69] pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ఇటీవలే రిజిస్టర్ అయ్యారా? <a href="/owner" className="text-cyan-400 hover:text-orange-400 ml-1 transition-colors underline underline-offset-8 decoration-orange-400">లాగిన్ అవ్వండి</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ChevronDown(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}
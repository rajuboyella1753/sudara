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
    { label: "📱 Electronics & Mobiles", value: "Electronics" },
    { label: "👗 Clothing & Fashion", value: "Clothing" },
    { label: "🛒 Groceries & Supermarket", value: "Grocery" },
    { label: "🚗 Automobile Showroom", value: "Automobile" },
    { label: "🛋️ Furniture & Living", value: "Furniture" },
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden relative">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(30,58,138,0.15)] border border-slate-100 p-6 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-orange-500"></div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">
              SUDARA <span className="text-indigo-600">HUB</span>
            </h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-4">
              మర్చంట్ డిజిటల్ రిజిస్ట్రేషన్ పోర్టల్
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 🏢 Basic Identity Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">బిజినెస్ & ఓనర్ వివరాలు</span>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block">బిజినెస్ కేటగిరీ</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-indigo-100 focus:bg-white cursor-pointer shadow-sm"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">ఓనర్ పూర్తి పేరు</label>
                  <input type="text" name="ownerName" required placeholder="ఉదా: రమేష్ కుమార్" value={form.ownerName} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                </div>
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">స్టోర్ / బిజినెస్ పేరు</label> 
                  <input type="text" name="name" required placeholder="ఉదా: రాయల్ దాబా" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">అధికారిక ఇమెయిల్</label>
                  <input type="email" name="email" required placeholder="owner@sudara.in" value={form.email} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                </div>

                {(form.category === "Restaurant" || form.category === "Grocery") && (
                  <div className="relative">
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">FSSAI లైసెన్స్ నంబర్</label>
                    <input type="text" name="fssaiNumber" placeholder="14-అంకెల FSSAI నంబర్" value={form.fssaiNumber} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">GST నంబర్</label>
                <input type="text" name="gstNumber" placeholder="GST నంబర్ నమోదు చేయండి" value={form.gstNumber} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all shadow-sm" />
              </div>
            </div>

            {/* 🍔 RESTAURANT SPECIAL FEATURES SECTION (కేవలం రెస్టారెంట్ అయితేనే కనిపిస్తుంది) */}
            {form.category === "Restaurant" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 bg-amber-50/50 rounded-[2.5rem] border border-amber-200 space-y-5">
                <div className="flex items-center gap-2 text-amber-900">
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">రెస్టారెంట్ ప్రత్యేక వివరాలు (Restaurant Specs)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-amber-700 ml-1">ఫుడ్ టైప్ (Food Type)</label>
                    <select name="foodType" value={form.foodType} onChange={handleChange} className="w-full bg-white border-2 border-amber-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-amber-400 cursor-pointer">
                      <option value="Veg">వెజ్ మాత్రం (Veg Only)</option>
                      <option value="Non-Veg">నాన్-వెజ్ (Non-Veg)</option>
                      <option value="Both">రెండూ (Veg & Non-Veg)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-amber-700 ml-1">మొత్తం టేబుల్స్ (Table Count)</label>
                    <input type="number" name="tableCount" placeholder="ఉదా: 20" value={form.tableCount} onChange={handleChange} className="w-full bg-white border-2 border-amber-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-amber-400" />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-amber-700 ml-1">నేటి స్పెషల్ ఆఫర్ / ఐటమ్ (Today's Special)</label>
                  <input type="text" name="todaySpecial" placeholder="ఉదా: చికెన్ బిర్యానీ స్పెషల్ ఆఫర్..." value={form.todaySpecial} onChange={handleChange} className="w-full bg-white border-2 border-amber-100 px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-amber-400" />
                </div> */}
              </motion.div>
            )}

            {/* 🗺️ Regional Matrix Section */}
            <div className="p-6 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100 space-y-6 shadow-inner">
              <div className="flex items-center gap-2 text-indigo-900">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">ప్రాంతీయ లొకేషన్ వివరాలు</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">రాష్ట్రం (State)</label>
                  <div className="relative">
                    <select name="state" value={form.state} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-indigo-400 appearance-none cursor-pointer shadow-sm">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">జిల్లా (District)</label>
                  <div className="relative">
                    <input type="text" name="district" required placeholder="ఉదా: తిరుపతి" value={form.district} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-400" />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">ప్రైమరీ ఏరియా / ల్యాండ్‌మార్క్</label>
                <select name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full bg-white border-2 border-indigo-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-500 cursor-pointer">
                  {collegesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              {form.collegeName === "Others" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                  <label className="text-[9px] font-black uppercase text-orange-600 ml-1 mb-1 block">మీ ఏరియా పేరు రాయండి</label>
                  <input type="text" name="customCollege" required placeholder="ల్యాండ్‌మార్క్ పేరు..." value={form.customCollege} onChange={handleChange} className="w-full bg-white border-2 border-orange-200 px-4 py-3.5 rounded-2xl font-bold text-sm focus:border-orange-500 outline-none shadow-md transition-all" />
                </motion.div>
              )}
            </div>

            {/* 📱 Network Communication */}
            <div className="p-6 bg-orange-50/40 rounded-[2.5rem] border border-orange-100 space-y-6">
              <div className="flex items-center gap-2 text-orange-900">
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">కమ్యూనికేషన్ ఛానెల్స్</span>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-orange-600 ml-1 block">ప్రైమరీ కాలింగ్ నంబర్</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                  <input type="tel" name="phone" required placeholder="ఉదా: 9876543210" value={form.phone} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-12 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-emerald-600 ml-1 flex items-center gap-1">వాట్సాప్ నంబర్ <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div></label>
                  <input type="tel" name="whatsappNumber" placeholder="వాట్సాప్ నంబర్" value={form.whatsappNumber} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-emerald-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-indigo-600 ml-1">ఫోన్‌పే / UPI నంబర్</label>
                  <div className="relative">
                    <input type="tel" name="upiNumber" placeholder="UPI రిజిస్టర్డ్ నంబర్" value={form.upiNumber} onChange={handleChange} className="w-full bg-white border-2 border-orange-50 px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm outline-none focus:border-indigo-400" />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
                  </div>
                </div>
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase italic px-2 tracking-tighter">* వాట్సాప్ లేదా UPI నంబర్లు ఖాళీగా వదిలితే ప్రైమరీ నంబర్ తీసుకోబడుతుంది.</p>
            </div>

            {/* Access Matrix Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">సెక్యూరిటీ ప్రోటోకాల్</span>
              </div>
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">పాస్‌వర్డ్</label>
                <input type="password" name="password" required placeholder="పాస్‌వర్డ్ సృష్టించండి" value={form.password} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 px-4 py-3.5 rounded-2xl focus:border-indigo-100 focus:bg-white focus:outline-none font-bold text-sm transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-orange-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs italic transition-all duration-500 shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3">
              రిజిస్టర్ చేయి <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ఇటీవలే రిజిస్టర్ అయ్యారా? <a href="/owner" className="text-indigo-600 hover:text-orange-500 ml-1 transition-colors underline underline-offset-8 decoration-orange-300">లాగిన్ అవ్వండి</a>
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
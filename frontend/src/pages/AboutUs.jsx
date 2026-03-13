import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { 
  Zap, Target, Users, ShieldCheck, Cpu, Smartphone, 
  ChefHat, HeartHandshake, Navigation, Globe, MapPin, 
  BarChart3, LayoutGrid, CheckCircle2 
} from "lucide-react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* --- 🚀 VISIONARY HERO SECTION --- */}
        <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] -z-10 rounded-full"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-[9px] md:text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6 md:mb-8">
                <Globe className="w-3 h-3" /> The Future of Food Discovery
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter text-slate-900 mb-6 md:mb-8 leading-[0.9] md:leading-[0.85]">
                Sudara <span className="text-blue-600">Hub.</span>
              </h1>
              <p className="text-base md:text-2xl font-bold text-slate-400 italic leading-relaxed max-w-3xl mx-auto px-4">
                A hyper-local digital ecosystem bridging the gap between hungry students and local culinary experts through precision data.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
          
          {/* --- 🌐 DYNAMIC PROTOCOL SECTION (Responsive Grid) --- */}
          <div className="mb-24 md:mb-40 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 italic text-center lg:text-left">Protocol 2.0</h3>
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase italic mb-6 md:mb-8 tracking-tighter leading-tight text-center lg:text-left">
                Location Based <br className="hidden md:block"/> <span className="text-blue-600">Discovery.</span>
              </h2>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 text-center lg:text-left">
                Sudara Hub operates on a multi-tier location structure. Users can instantly filter restaurants across different regions, ensuring you find the best food whether you're in Tirupati, Vijayawada, or anywhere in Andhra Pradesh.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Globe, title: "State-Wide Presence", desc: "Filter by State registers." },
                  { icon: MapPin, title: "District Precision", desc: "Drill down to your specific city or district." },
                  { icon: LayoutGrid, title: "Food Hubs", desc: "Access specific Landmark-based kitchens." }
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase italic">{f.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-7 order-1 lg:order-2 bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-4 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-40 bg-blue-600/20 blur-[100px] rounded-full"></div>
              <div className="relative z-10 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-inner">
                {/* Visual UI Frame */}
                <div className="p-5 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/80">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Filtering Interface</div>
                </div>
                <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                  <div className="h-12 md:h-14 w-full bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center px-4 md:px-6 gap-3 md:gap-4">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <div className="text-[10px] md:text-xs font-black uppercase text-white/60 tracking-widest truncate">Select State: Andhra Pradesh</div>
                  </div>
                  <div className="h-12 md:h-14 w-full bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center px-4 md:px-6 gap-3 md:gap-4">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div className="text-[10px] md:text-xs font-black uppercase text-white/60 tracking-widest truncate">Select District: Tirupati</div>
                  </div>
                  <div className="pt-4 md:pt-6 grid grid-cols-2 gap-3 md:gap-4">
                    <div className="h-16 md:h-20 bg-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-center shadow-lg shadow-blue-600/20">
                      <div className="text-[8px] md:text-[10px] font-black uppercase text-white/60 mb-1">Found</div>
                      <div className="text-xl md:text-2xl font-black italic text-white uppercase leading-none">12 Hubs</div>
                    </div>
                    <div className="h-16 md:h-20 bg-slate-700 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-center border border-white/10">
                      <div className="text-[8px] md:text-[10px] font-black uppercase text-white/40 mb-1">Status</div>
                      <div className="text-base md:text-lg font-black italic text-emerald-400 uppercase leading-none">All Live</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 📈 ANALYTICS SECTION (Responsive Grid) --- */}
          <div className="mb-24 md:mb-40">
             <div className="text-center mb-12 md:mb-20">
               <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 italic">Operational Control</h3>
               <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">Empowering Owners.</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {[
                 { icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50", title: "Analytics Matrix", desc: "Every menu click and call is tracked to provide business insights to kitchen owners." },
                 { icon: Smartphone, color: "text-orange-600", bg: "bg-orange-50", title: "Zero Commissions", desc: "No middleman. No hidden fees. Owners keep 100% of the price mentioned in the menu." },
                 { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Live Management", desc: "Real-time 'Go Live' and 'End Service' toggles give owners total control." }
               ].map((item, i) => (
                 <div key={i} className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] hover:shadow-xl transition-all group">
                   <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform`}>
                     <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                   </div>
                   <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase italic mb-4">{item.title}</h4>
                   <p className="text-sm md:text-base text-slate-500 leading-relaxed italic">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>

          {/* --- 💎 CORE FEATURES (Flex & Grid Hybrid) --- */}
          <div className="mb-24 md:mb-40 bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_rgba(37,99,235,0.1),_transparent)]"></div>
            
            <div className="flex flex-col lg:flex-row gap-12 md:gap-16 relative z-10">
              <div className="lg:w-1/3 text-center lg:text-left">
                <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 italic">Engineering Hub</h3>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 md:mb-8 leading-[0.9]">Digital <br className="hidden lg:block"/> Dining <br className="hidden lg:block"/> Protocol.</h2>
                <p className="text-slate-400 font-medium text-sm md:text-base">Built for high-performance mobile devices, optimized for Food internet speeds.</p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {[
                  { Icon: Navigation, title: "Map Routes", desc: "Precise GPS directions for every listed Hub." },
                  { Icon: Cpu, title: "Live Sync", desc: "Millisecond updates on dish availability." },
                  { Icon: Smartphone, title: "PWA Integrated", desc: "Installable app experience without bulky downloads." },
                  { Icon: ChefHat, title: "Verified Kitchens", desc: "Manual auditing for quality assurance." }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/10 transition-all group">
                    <item.Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="text-base md:text-lg font-black uppercase italic mb-2 tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- 🎯 THE SUDARA PROMISE (Responsive Container) --- */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <HeartHandshake className="w-12 h-12 md:w-20 md:h-20 text-white/30 mx-auto mb-6 md:mb-8" />
              <h2 className="text-3xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 md:mb-8">
                The Hub <br/> Promise.
              </h2>
              <p className="text-white/80 text-sm md:text-3xl max-w-4xl mx-auto leading-tight italic mb-10 md:mb-12 font-medium px-2">
                "Zero middleman interference. Zero hidden fees. Direct kitchen connection. Just honest food discovery."
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <div className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 rounded-full font-black uppercase italic text-[9px] md:text-xs tracking-widest shadow-xl">
                  <CheckCircle2 className="w-4 h-4" /> Trusted Service
                </div>
                <div className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-black/20 backdrop-blur-md rounded-full border border-white/20 text-[9px] md:text-xs font-black uppercase text-white tracking-widest">
                  <Target className="w-4 h-4" /> Build Version 1.3
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { 
  Zap, Target, Globe, MapPin, BarChart3, 
  Smartphone, ChefHat, HeartHandshake, Navigation, 
  Cpu, LayoutGrid, CheckCircle2, ShieldCheck, Activity,
  Layers, Wallet
} from "lucide-react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-600 font-sans selection:bg-orange-100 overflow-x-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* --- 🚀 VISIONARY HERO SECTION --- */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-white border-b border-slate-100">
          {/* Background Mesh Glows */}
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/5 blur-[80px] md:blur-[120px] -z-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-orange-600/5 blur-[80px] md:blur-[120px] -z-10 rounded-full animate-pulse delay-700"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 rounded-full border border-indigo-100 text-[9px] md:text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-8">
                <Activity className="w-3.5 h-3.5 animate-spin-slow" /> The Future of Food Discovery
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter text-slate-900 mb-8 leading-[0.85]">
                Sudara <span className="text-orange-600">Hub.</span>
              </h1>
              <p className="text-base md:text-2xl font-bold text-slate-400 italic leading-relaxed max-w-3xl mx-auto px-4">
                A hyper-local digital ecosystem bridging the gap between campus students and culinary experts through precision data.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-32">
          
          {/* --- 🌐 DYNAMIC PROTOCOL SECTION (Strictly Responsive) --- */}
          <div className="mb-24 md:mb-48 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 text-center lg:text-left">
              <h3 className="text-orange-600 font-black uppercase text-[10px] tracking-[0.5em] mb-6 italic">Protocol 2.0</h3>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 uppercase italic mb-8 tracking-tighter leading-[0.9]">
                Location Based <br className="hidden md:block"/> <span className="text-indigo-600">Discovery.</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-lg leading-relaxed mb-10 italic font-medium">
                Sudara Hub operates on a multi-tier location structure. Filter restaurants across different regions instantly, ensuring you find the best Hub in your district.
              </p>
              
              <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: Globe, title: "State-Wide Presence", desc: "Filter by State registers.", color: "text-indigo-600", bg: "bg-indigo-50" },
                  { icon: MapPin, title: "District Precision", desc: "Drill down to your specific city.", color: "text-orange-600", bg: "bg-orange-50" },
                  { icon: LayoutGrid, title: "Food Hubs", desc: "Access specific Landmark-based kitchens.", color: "text-emerald-600", bg: "bg-emerald-50" }
                ].map((f, i) => (
                  <motion.div whileHover={{ x: 10 }} key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-default text-left">
                    <div className={`w-12 h-12 shrink-0 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} shadow-inner`}>
                      <f.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm uppercase italic leading-none mb-1">{f.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Dark UI Mockup for Discovery */}
            <div className="lg:col-span-7 order-1 lg:order-2 bg-slate-950 rounded-[2.5rem] md:rounded-[4rem] p-4 md:p-16 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-40 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse"></div>
              <div className="relative z-10 border border-white/10 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="p-4 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
                  <div className="flex gap-2">
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-rose-500/50"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 italic animate-pulse">Matrix Sync Active</div>
                </div>
                <div className="p-6 md:p-12 space-y-4 md:space-y-6">
                  <div className="h-12 md:h-14 w-full bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 md:px-6 gap-3 md:gap-4 overflow-hidden">
                    <Globe className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 shrink-0" />
                    <div className="text-[9px] md:text-[11px] font-black uppercase text-white/70 tracking-[0.2em] truncate">State: Andhra Pradesh</div>
                  </div>
                  <div className="h-12 md:h-14 w-full bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 md:px-6 gap-3 md:gap-4 overflow-hidden">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500 shrink-0" />
                    <div className="text-[9px] md:text-[11px] font-black uppercase text-white/70 tracking-[0.2em] truncate">District: Tirupati</div>
                  </div>
                  <div className="pt-6 md:pt-8 grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-indigo-600 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 flex flex-col justify-center shadow-2xl">
                      <div className="text-[8px] md:text-[9px] font-black uppercase text-white/50 mb-1 tracking-widest">Nodes</div>
                      <div className="text-xl md:text-3xl font-black italic text-white uppercase leading-none">12 Hubs</div>
                    </div>
                    <div className="bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 flex flex-col justify-center border border-white/10">
                      <div className="text-[8px] md:text-[9px] font-black uppercase text-white/40 mb-1 tracking-widest">Security</div>
                      <div className="text-lg md:text-xl font-black italic text-emerald-400 uppercase leading-none">Secure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 📈 ANALYTICS SECTION --- */}
          <div className="mb-24 md:mb-48">
             <div className="text-center mb-16 md:mb-24">
               <h3 className="text-orange-600 font-black uppercase text-[10px] tracking-[0.5em] mb-6 italic">Business Intelligence</h3>
               <h2 className="text-4xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Empowering <span className="text-indigo-600">Partners.</span></h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", title: "Analytics Matrix", desc: "Every menu click and call is tracked to provide business insights to kitchen owners." },
                 { icon: Wallet, color: "text-orange-600", bg: "bg-orange-50", title: "Zero Commissions", desc: "No middleman fees. Owners keep 100% of the price mentioned in the menu." },
                 { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Master Control", desc: "Real-time service toggles give owners total control over their digital visibility." }
               ].map((item, i) => (
                 <motion.div 
                   key={i} 
                   whileInView={{ y: [0, -10, 0] }}
                   viewport={{ once: true }}
                   className="p-8 md:p-12 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] hover:shadow-2xl transition-all group border-b-8 border-b-transparent hover:border-b-orange-500"
                 >
                   <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/5`}>
                     <item.icon className="w-7 h-7" />
                   </div>
                   <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic mb-5 leading-tight">{item.title}</h4>
                   <p className="text-sm md:text-base text-slate-500 leading-relaxed italic font-medium">{item.desc}</p>
                 </motion.div>
               ))}
             </div>
          </div>

          {/* --- 💎 CORE FEATURES --- */}
          <div className="mb-24 md:mb-48 bg-slate-950 rounded-[3rem] md:rounded-[5rem] p-8 md:p-24 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_rgba(79,70,229,0.1),_transparent)]"></div>
            
            <div className="flex flex-col lg:flex-row gap-16 md:gap-24 relative z-10">
              <div className="lg:w-1/3 text-center lg:text-left">
                <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.5em] mb-8 italic">Engineering Hub</h3>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-[0.9]">Digital <br className="hidden lg:block"/> Dining <br className="hidden lg:block"/> Protocol.</h2>
                <p className="text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest leading-loose">Built for high-performance mobile nodes, optimized for campus internet speeds.</p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {[
                  { Icon: Navigation, title: "Map Routes", desc: "Precise GPS directions for every listed Hub." },
                  { Icon: Cpu, title: "Live Sync", desc: "Millisecond updates on dish availability." },
                  { Icon: Smartphone, title: "PWA Native", desc: "Installable app experience without downloads." },
                  { Icon: ChefHat, title: "Verified Kitchens", desc: "Manual auditing for non-negotiable quality." }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 md:p-10 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] hover:bg-white/[0.08] transition-all group">
                    <item.Icon className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 mb-6 group-hover:scale-110 transition-transform group-hover:text-orange-500" />
                    <h4 className="text-lg md:text-xl font-black uppercase italic mb-3 tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- 🎯 THE SUDARA PROMISE --- */}
          <div className="bg-indigo-600 rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 p-40 bg-orange-500/20 blur-[100px] rounded-full animate-pulse"></div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <HeartHandshake className="w-16 md:w-24 h-16 md:h-24 text-white/30 mx-auto mb-10" />
              <h2 className="text-4xl sm:text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter text-white mb-10 leading-none">
                The Hub <br/> Promise.
              </h2>
              <p className="text-indigo-50 text-xl md:text-4xl max-w-5xl mx-auto leading-tight italic mb-16 font-medium px-4">
                "Zero middleman interference. Zero hidden fees. Direct kitchen connection. Just honest food discovery."
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-white text-indigo-600 rounded-full font-black uppercase italic text-[9px] md:text-xs tracking-[0.2em] shadow-2xl">
                  <CheckCircle2 className="w-5 h-5" /> Trusted Service
                </div>
                <div className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-indigo-900/40 backdrop-blur-md rounded-full border border-white/20 text-[9px] md:text-xs font-black uppercase text-white tracking-[0.2em]">
                  <Target className="w-5 h-5" /> Hub Version 1.3
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default About;
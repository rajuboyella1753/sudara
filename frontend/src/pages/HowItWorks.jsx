import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Search, 
  Camera, 
  Navigation, 
  Zap, 
  CreditCard, 
  ShieldCheck,
  Banknote,
  ChevronRight,
  Globe,
  Store,
  Activity,
  ArrowRight
} from "lucide-react";

const features = [
  {
    title: "Personally Verified",
    desc: "Every Hub on our platform is personally audited. Quality food is our non-negotiable protocol.",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Regional Protocol",
    desc: "Filter restaurants by State and District to find the perfect Hub in your current location.",
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "Live Inventory",
    desc: "Check real-time dish availability. No more 'Sold Out' surprises after reaching the Hub.",
    icon: <Search className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Ambience Preview",
    desc: "Take a virtual tour of the interior and seating before you decide to walk in.",
    icon: <Camera className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Rush & Routing",
    desc: "See live crowd status and get precise walking directions via integrated GPS.",
    icon: <Navigation className="w-6 h-6 text-orange-600" />,
  },
  {
    title: "Advance Booking",
    desc: "Secure your meal by paying a 50% advance. Your order starts cooking before you arrive.",
    icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function HowItWorks() {
  const navigate = useNavigate(); 

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* --- 🚀 DYNAMIC HERO SECTION --- */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 bg-white overflow-hidden border-b border-slate-100">
          {/* Animated Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] -z-10 rounded-full animate-pulse delay-700" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black uppercase text-[10px] tracking-widest mb-8 border border-indigo-100">
                <Activity className="w-3 h-3 animate-bounce" /> System Documentation v1.3
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                Operating <br/> <span className="text-orange-600">Procedures</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs max-w-xl mx-auto leading-relaxed">
                The Integrated Matrix for Seamless Campus Dining and Direct Discovery
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- 🛠️ THE 3-STEP ARCHITECTURE --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-40">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {[
              { step: "01", title: "Discovery", desc: "Browse verified Hubs across Regions with live inventory tracking.", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
              { step: "02", title: "Protocol", desc: "Execute a 50% advance to initiate preparation and bypass queue latency.", icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
              { step: "03", title: "Arrival", desc: "Arrive at the Hub, finalize settlement, and consume your meal.", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((s, idx) => (
              <motion.div key={idx} variants={itemVariants} className="relative p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group overflow-hidden">
                <div className="text-5xl md:text-7xl font-black italic text-slate-50 absolute -top-2 -right-2 group-hover:text-indigo-100 transition-colors pointer-events-none">{s.step}</div>
                <div className={`w-14 h-14 md:w-16 md:h-16 ${s.bg} ${s.color} rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-lg transition-transform group-hover:-translate-y-2 group-hover:rotate-3`}>
                  <s.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic mb-3 text-slate-900 tracking-tighter">{s.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed italic">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* --- 💎 DIRECT SETTLEMENT PROTOCOL --- */}
        <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-indigo-600 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 relative overflow-hidden shadow-2xl shadow-indigo-200"
          >
            {/* Dynamic Pattern Overlays */}
            <div className="absolute top-0 right-0 p-40 bg-orange-500/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 p-20 bg-white/10 blur-[80px] rounded-full"></div>
            
            <div className="shrink-0 w-24 h-24 md:w-36 md:h-36 bg-white/10 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center border border-white/20 shadow-inner">
              <Banknote className="w-12 h-12 md:w-20 md:h-20 text-orange-400" />
            </div>
            
            <div className="text-center lg:text-left relative z-10">
              <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-tight">100% Direct <span className="text-orange-400">Settlement</span></h2>
              <p className="text-indigo-50 text-base md:text-xl leading-relaxed italic opacity-90 max-w-3xl">
                Transparency is our fundamental matrix. <strong>Payments flow directly to the Hub owner's wallet.</strong> Sudara Hub acts as a zero-tax discovery node, ensuring users pay base prices and owners retain 100% revenue.
              </p>
            </div>
          </motion.div>
        </section>

        {/* --- 🍱 ADVANCED FEATURE GRID --- */}
        <section className="bg-slate-950 py-20 md:py-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#4f46e508,transparent)]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="text-center lg:text-left">
                <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.5em] mb-6 italic">Engineering Matrix</h3>
                <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-white mb-8">
                  Built For <br/> <span className="text-indigo-500 text-opacity-90">Efficiency.</span>
                </h2>
                <p className="text-slate-400 text-base md:text-xl mb-10 italic leading-relaxed">
                  We aren't just a directory; we are a high-performance protocol optimized for the campus lifestyle.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-4 bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-2xl hover:bg-orange-500 transition-all shadow-orange-950/20"
                >
                  Enter Discovery <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="shrink-0 mb-6 group-hover:scale-110 transition-transform bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl">
                      {f.icon}
                    </div>
                    <h4 className="font-black uppercase italic text-base text-white mb-3 tracking-tight">{f.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-bold uppercase tracking-widest">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- 🎯 THE 50% POLICY --- */}
        <section className="py-24 md:py-48 text-center max-w-5xl mx-auto px-6 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e505,transparent)] -z-10"></div>
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
           >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-orange-50 text-orange-600 rounded-full font-black uppercase text-[10px] tracking-widest mb-10 border border-orange-100">
                <Zap className="w-4 h-4 fill-orange-600 animate-pulse" /> Advanced Booking Protocol
              </div>
              <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight mb-10">
                Zero Wait. <br/> <span className="text-indigo-600">50% Advance.</span>
              </h2>
              <p className="text-slate-500 text-base md:text-xl leading-relaxed italic max-w-3xl mx-auto px-4 font-medium">
                To eliminate food wastage and guarantee Hub priority, we utilize a 50% advance model. This confirms your slot so the chef starts prep before you arrive. Settle the balance at the Hub.
              </p>
           </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
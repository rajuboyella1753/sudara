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
  Store
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
    icon: <Globe className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Live Inventory",
    desc: "Check real-time dish availability. No more 'Sold Out' surprises after reaching the Hub.",
    icon: <Search className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "Ambience Preview",
    desc: "Take a virtual tour of the interior and seating before you decide to walk in.",
    icon: <Camera className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Rush & Routing",
    desc: "See live crowd status and get precise walking directions via integrated GPS.",
    icon: <Navigation className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Advance Booking",
    desc: "Secure your meal by paying a 50% advance. Your order starts cooking before you arrive.",
    icon: <CreditCard className="w-6 h-6 text-pink-500" />,
  }
];

export default function HowItWorks() {
  const navigate = useNavigate(); 

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* --- 🚀 DYNAMIC HERO SECTION --- */}
        <section className="relative pt-28 pb-12 md:pt-48 md:pb-24 bg-white overflow-hidden border-b border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
          
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl sm:text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.9] md:leading-[0.85] mb-6 md:mb-8">
                Operating <br/> <span className="text-blue-600">Procedures.</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-xs mb-8 md:mb-12">
                The Integrated Guide to Smarter Hub Discovery
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- 🛠️ THE 3-STEP ARCHITECTURE (Responsive Grid) --- */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {[
              { step: "01", title: "Discover", desc: "Browse verified Hubs across States & Districts with live menus.", icon: Globe },
              { step: "02", title: "Protocol", desc: "Pay 50% advance to initiate the cooking process and skip the wait.", icon: Zap },
              { step: "03", title: "Dining", desc: "Arrive at the Hub, enjoy your fresh meal, and pay the rest.", icon: Store }
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 md:p-8 bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                <div className="text-4xl md:text-6xl font-black italic text-slate-100 absolute top-4 md:top-6 right-6 md:right-8 group-hover:text-blue-50 transition-colors pointer-events-none">{s.step}</div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                  <s.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase italic mb-2 md:mb-3 text-slate-900 tracking-tighter">{s.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed italic">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- 💎 DIRECT SETTLEMENT PROTOCOL (Responsive Banner) --- */}
        <section className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
          <div className="bg-blue-600 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-20 text-white flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 p-40 bg-white/10 blur-[80px] rounded-full"></div>
            
            <div className="shrink-0 w-20 h-20 md:w-32 md:h-32 bg-white/20 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center border border-white/20">
              <Banknote className="w-10 h-10 md:w-16 md:h-16" />
            </div>
            
            <div className="text-center lg:text-left relative z-10">
              <h2 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-tight">100% Direct Settlement</h2>
              <p className="text-blue-50 text-sm md:text-lg leading-relaxed italic opacity-90 max-w-3xl">
                Transparency is our core protocol. <strong>Payments go directly to the Hub owner's account.</strong> Sudara Hub operates as a zero-commission ecosystem, ensuring you pay the original price and owners keep 100% of their earnings.
              </p>
            </div>
          </div>
        </section>

        {/* --- 🍱 ADVANCED FEATURE GRID (Responsive Flex/Grid) --- */}
        <section className="bg-slate-900 py-16 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="text-center lg:text-left">
                <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-4 italic text-center lg:text-left">Core Matrix</h3>
                <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-6 md:mb-8">
                  Engineered <br className="hidden md:block"/> For Your <br className="hidden md:block"/> <span className="text-blue-500">Hunger.</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-lg mb-8 md:mb-10 italic">
                  We aren't just a food directory; we are a digital protocol built to optimize campus dining efficiency.
                </p>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] shadow-2xl hover:bg-blue-500 transition-colors mx-auto lg:mx-0"
                >
                  Enter Discovery <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {features.map((f, i) => (
                  <div key={i} className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] hover:bg-white/10 transition-all group">
                    <div className="shrink-0 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <h4 className="font-black uppercase italic text-sm text-white mb-2 tracking-tight">{f.title}</h4>
                    <p className="text-slate-500 text-[10px] md:text-[11px] leading-relaxed font-medium uppercase tracking-wider">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- 🎯 THE 50% POLICY (Text Center Content) --- */}
        <section className="py-20 md:py-40 text-center max-w-4xl mx-auto px-6">
           <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest mb-6 md:mb-8 border border-blue-100">
             <Zap className="w-3 h-3 fill-blue-600" /> Advance Booking Protocol
           </div>
           <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight mb-6 md:mb-8">
             Zero Wait. <br className="md:hidden"/> <span className="text-blue-600">50% Advance.</span>
           </h2>
           <p className="text-slate-500 text-sm md:text-lg leading-relaxed italic max-w-2xl mx-auto px-2">
             To eliminate food wastage and guarantee Hub priority, we utilize a 50% advance payment model. This confirms your slot so the chef can start prep before you arrive. Simply settle the remaining 50% at the Hub!
           </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
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
  ArrowRight,
  ShoppingBag,
  Shirt,
  Tv,
  Car,
  Layers
} from "lucide-react";

const features = [
  {
    title: "Personally Verified Merchants",
    desc: "Every business and store on our platform is carefully audited to maintain high quality standards.",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Regional Discovery",
    desc: "Filter across states and districts instantly to find trusted local providers in your exact area.",
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "Live Stock & Inventories",
    desc: "Check real-time product availability and direct pricing before visiting or ordering.",
    icon: <Search className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Storefront & Catalog Previews",
    desc: "Explore high-resolution product photos, store ambiances, and complete digital catalogs.",
    icon: <Camera className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "GPS Routing & Crowds",
    desc: "Get precise directions to any local store or showroom using integrated map routing.",
    icon: <Navigation className="w-6 h-6 text-orange-600" />,
  },
  {
    title: "Direct Secure Ordering",
    desc: "Place direct orders or pre-book test drives and reservations with zero intermediary delays.",
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* --- 🚀 DYNAMIC HERO SECTION --- */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 bg-white overflow-hidden border-b border-slate-100">
          {/* Animated Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -z-10 rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] -z-10 rounded-full animate-pulse delay-700" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black uppercase text-[10px] tracking-widest mb-8 border border-blue-100">
                <Activity className="w-3 h-3 animate-bounce" /> Unified Hyperlocal Protocol v2.0
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                How <span className="text-blue-600">Sudara Hub</span> <br/> <span className="text-orange-600">Works.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl mx-auto leading-relaxed italic">
                Bridging the gap between consumers and local businesses across food, fashion, electronics, groceries, and automobiles.
              </p>
            </motion.div>
          </div>
        </section>

        {/* --- 🛒 MULTI-INDUSTRY VERTICALS HIGHLIGHT --- */}
        <section className="bg-slate-50 border-b border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-orange-600 font-black uppercase text-[10px] tracking-[0.4em] mb-3 italic">Ecosystem Coverage</h3>
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight text-slate-900">Digitizing All Local Industries</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Store, title: "Restaurants & Dining", desc: "Live menus & table bookings" },
                { icon: Shirt, title: "Clothing & Fashion", desc: "Boutiques & apparel catalogs" },
                { icon: Tv, title: "Electronics & Gadgets", desc: "Appliances & tech hardware" },
                { icon: Car, title: "Automobiles", desc: "Showrooms & test drive booking" }
              ].map((ind, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                    <ind.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black uppercase italic text-slate-900">{ind.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 🛠️ THE 3-STEP ARCHITECTURE --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-3 italic">Seamless Workflow</h3>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-slate-900">How Connection Works</h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {[
              { step: "01", title: "Location Discovery", desc: "Users select their state, district, and category to browse verified local merchants and inventories instantly.", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
              { step: "02", title: "Direct Interaction", desc: "Browse real-time product catalogs, view store ambiances, or call/chat directly with the merchant without middlemen.", icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
              { step: "03", title: "Fulfillment & Visit", desc: "Place direct orders for doorstep delivery, pick up parcels, or schedule a physical visit/test drive.", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((s, idx) => (
              <motion.div key={idx} variants={itemVariants} className="relative p-8 md:p-10 bg-slate-50 border border-slate-200/80 rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                <div className="text-5xl md:text-7xl font-black italic text-slate-200/60 absolute -top-2 -right-2 group-hover:text-blue-100 transition-colors pointer-events-none">{s.step}</div>
                <div className={`w-14 h-14 md:w-16 md:h-16 ${s.bg} ${s.color} rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-sm transition-transform group-hover:-translate-y-2`}>
                  <s.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic mb-3 text-slate-900 tracking-tighter">{s.title}</h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed italic">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* --- 💎 100% DIRECT SETTLEMENT & ZERO COMMISSION PROTOCOL --- */}
        <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-36">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-white flex flex-col lg:flex-row items-center gap-10 md:gap-16 relative overflow-hidden shadow-2xl"
          >
            {/* Dynamic Pattern Overlays */}
            <div className="absolute top-0 right-0 p-40 bg-blue-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 p-20 bg-orange-500/10 blur-[80px] rounded-full"></div>
             
            <div className="shrink-0 w-24 h-24 md:w-36 md:h-36 bg-white/10 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center border border-white/20 shadow-inner">
              <Banknote className="w-12 h-12 md:w-20 md:h-20 text-orange-400" />
            </div>
             
            <div className="text-center lg:text-left relative z-10">
              <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-tight">Zero Commissions & <span className="text-blue-400">Direct Settlement</span></h2>
              <p className="text-slate-300 text-base md:text-xl leading-relaxed italic opacity-90 max-w-3xl">
                Transparency is our core principle. <strong>Sudara Hub charges 0% commission on orders.</strong> Payments and inquiries flow directly to local business owners, ensuring customers pay fair local prices and merchants keep 100% of their revenue.
              </p>
            </div>
          </motion.div>
        </section>

        {/* --- 🍱 ADVANCED FEATURE GRID --- */}
        <section className="bg-slate-950 py-20 md:py-36 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#3b82f608,transparent)]"></div>
           
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="text-center lg:text-left">
                <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.5em] mb-6 italic">Platform Matrix</h3>
                <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-8">
                  Empowering Every <br/> <span className="text-blue-500">Local Business.</span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg mb-10 italic leading-relaxed">
                  We connect communities with local enterprises across all sectors, providing powerful digital storefronts built for speed, transparency, and trust.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-xl hover:bg-blue-500 transition-all"
                >
  1          Explore Local Hubs <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.08] transition-all group"
                  >
                    <div className="shrink-0 mb-6 group-hover:scale-110 transition-transform bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl">
                      {f.icon}
                    </div>
                    <h4 className="font-black uppercase italic text-base text-white mb-3 tracking-tight">{f.title}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase tracking-widest">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- 🎯 THE SUDARA PROMISE --- */}
        <section className="py-24 md:py-40 text-center max-w-5xl mx-auto px-6 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f605,transparent)] -z-10"></div>
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
           >
             <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-full font-black uppercase text-[10px] tracking-widest mb-10 border border-blue-100">
               <Zap className="w-4 h-4 fill-blue-600 animate-pulse" /> Hyperlocal Mission
             </div>
             <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight mb-10 text-slate-900">
               Connecting Communities, <br/> <span className="text-blue-600">Empowering Businesses.</span>
             </h2>
             <p className="text-slate-600 text-base md:text-xl leading-relaxed italic max-w-3xl mx-auto px-4 font-medium">
               "Whether you are looking for local dining, fashion boutiques, home electronics, or automobile showrooms, Sudara Hub connects you directly to trusted merchants in your region."
             </p>
           </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
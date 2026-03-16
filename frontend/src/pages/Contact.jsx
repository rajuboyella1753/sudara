import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight, Clock, ShieldCheck, Globe, Headset, Zap, Activity } from "lucide-react";
import Footer from "../components/Footer";

const Contact = () => {
  const contactInfo = {
    email: "sudaraofficial703@gmail.com",
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-600 flex flex-col font-sans overflow-x-hidden selection:bg-orange-100">
      <Navbar />

      {/* 📞 Main Contact Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 mt-28 md:mt-32 mb-16">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-8"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" /> 24/7 Digital Concierge
            </motion.div>
            <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter text-slate-900 leading-[0.85] mb-8">
                Support <br className="hidden md:block" /> <span className="text-orange-600">Protocol.</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] md:text-xs tracking-[0.4em] italic max-w-2xl mx-auto leading-relaxed">
               Direct Assistance for Students & Strategic Onboarding for Hub Partners
            </p>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 relative items-stretch">
          
          {/* 🌌 Background Decorative Glows */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-500/10 blur-[120px] -z-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-orange-500/10 blur-[120px] -z-10 rounded-full animate-pulse delay-700"></div>

          {/* Left Column: System Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-slate-950 p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group border border-white/5"
          >
            <div className="absolute top-0 right-0 p-40 bg-indigo-600/20 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-white/10 group-hover:border-indigo-500 transition-colors">
                  <Globe className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-6 tracking-tighter">Global <br/> <span className="text-indigo-500">Reach.</span></h3>
                <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed italic">
                    Expanding our digital dining matrix across campus networks. Reach out to join the core ecosystem.
                </p>
            </div>

            <div className="relative z-10 mt-16 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Node Status: Operational</span>
            </div>
          </motion.div>

          {/* Right Column: Communication Channels */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-6 flex flex-col justify-center"
          >
            {/* 💬 WhatsApp Support Card */}
            <motion.a 
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              href={`https://wa.me/${contactInfo.whatsapp}`} 
              target="_blank" rel="noreferrer" 
              className="group flex items-center justify-between bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500"
            >
              <div className="flex items-center gap-6 md:gap-10">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700">
                  <MessageCircle className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase italic tracking-[0.25em] block mb-2">Instant Uplink</span>
                  <p className="text-slate-900 font-black italic text-2xl md:text-4xl tracking-tighter">WhatsApp</p>
                </div>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:rotate-45 transition-all">
                <ArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors w-6 h-6 md:w-8 md:h-8" />
              </div>
            </motion.a>

            {/* ✉️ Email Inquiry Card */}
            <motion.a 
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              href={`mailto:${contactInfo.email}`} 
              className="group flex items-center justify-between bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500"
            >
              <div className="flex items-center gap-6 md:gap-10 overflow-hidden">
                <div className="shrink-0 w-16 h-16 md:w-24 md:h-24 bg-indigo-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700">
                  <Mail className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase italic tracking-[0.25em] block mb-2">Corporate Node</span>
                  <p className="text-slate-900 font-black italic text-base md:text-2xl tracking-tighter truncate">
                    {contactInfo.email}
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:rotate-45 transition-all">
                 <ArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-colors w-6 h-6 md:w-8 md:h-8" />
              </div>
            </motion.a>

            {/* 🛡️ Response Metrics */}
            <div className="pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                <Clock className="w-6 h-6 text-orange-500 group-hover:rotate-12 transition-transform" />
                <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest italic leading-tight">24h Response <br/> Window</p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                <Zap className="w-6 h-6 text-indigo-600 group-hover:scale-125 transition-transform" />
                <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest italic leading-tight">Verified Help <br/> Protocol</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-center mt-20 md:mt-32 text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] italic">
            SUDARA HUB • DATA INTEGRITY & SUPPORT MATRIX
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
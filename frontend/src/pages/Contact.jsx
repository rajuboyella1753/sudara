import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight, Clock, ShieldCheck, Globe, Headset } from "lucide-react";
import Footer from "../components/Footer";

const Contact = () => {
  const contactInfo = {
    email: "sudaraofficial703@gmail.com",
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-600 flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* 📞 Main Contact Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 mt-24 md:mt-32 mb-16">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6"
            >
              <Headset className="w-3 h-3" /> 24/7 Digital Concierge
            </motion.div>
            <h1 className="text-5xl md:text-[8rem] font-black italic uppercase tracking-tighter text-slate-900 leading-[0.85] mb-6">
               Support <br className="hidden md:block" /> <span className="text-blue-600 text-outline">Protocol.</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] md:text-xs tracking-[0.3em] italic">
               Assistance for Students & Strategic Onboarding for Hub Owners
            </p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative items-start">
          
          {/* 🌌 Background Effects */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full animate-pulse"></div>

          {/* Left Column: Visual Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white flex flex-col justify-between aspect-square lg:aspect-auto h-full shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-32 bg-blue-600/20 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10">
                <Globe className="w-10 h-10 text-blue-500 mb-8" />
                <h3 className="text-3xl md:text-4xl font-black italic uppercase leading-none mb-4">Global <br/> Reach.</h3>
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
                    Expanding our digital dining protocol across campus networks. Reach out to join the ecosystem.
                </p>
            </div>

            <div className="relative z-10 mt-12 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Systems Operational</span>
            </div>
          </motion.div>

          {/* Right Column: Contact Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-4 md:space-y-6"
          >
            {/* 💬 WhatsApp Support Card */}
            <motion.a 
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              href={`https://wa.me/${contactInfo.whatsapp}`} 
              target="_blank" rel="noreferrer" 
              className="group flex items-center justify-between bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-5 md:gap-8">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-green-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                  <MessageCircle className="w-7 h-7 md:w-10 md:h-10" />
                </div>
                <div>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase italic tracking-widest block mb-1">Priority Support</span>
                  <p className="text-slate-900 font-black italic text-xl md:text-3xl tracking-tight">WhatsApp</p>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                <ArrowRight className="text-slate-300 group-hover:text-green-600 transition-colors w-5 h-5 md:w-6 md:h-6" />
              </div>
            </motion.a>

            {/* ✉️ Email Inquiry Card */}
            <motion.a 
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              href={`mailto:${contactInfo.email}`} 
              className="group flex items-center justify-between bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-5 md:gap-8 overflow-hidden">
                <div className="shrink-0 w-14 h-14 md:w-20 md:h-20 bg-blue-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <Mail className="w-7 h-7 md:w-10 md:h-10" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase italic tracking-widest block mb-1">Corporate & Logistics</span>
                  <p className="text-slate-900 font-black italic text-sm md:text-xl tracking-tight truncate">
                    {contactInfo.email}
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                 <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors w-5 h-5 md:w-6 md:h-6" />
              </div>
            </motion.a>

            {/* 🛡️ Trust Badges */}
            <div className="pt-6 md:pt-10 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center lg:items-start gap-2 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <Clock className="w-5 h-5 text-blue-500" />
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">24h Response Matrix</p>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Verified Protocol</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-center mt-16 md:mt-24 text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em] italic">
           Sudara Hub • The Gold Standard in Dining Data
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
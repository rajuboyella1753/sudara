import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight, Clock, ShieldCheck, Globe, Activity, Headphones, Sparkles, MapPin, AlertTriangle } from "lucide-react";
import Footer from "../components/Footer";

const Contact = () => {
  const contactInfo = {
    email: "sudaraofficial703@gmail.com",
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-[#05081c] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* --- 📞 PROFESSIONAL CONTACT SECTION --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 md:pt-44 md:pb-32">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0a1033] rounded-full border border-cyan-500/30 text-[10px] font-black uppercase text-cyan-300 tracking-widest mb-6 shadow-md"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> 24/7 Digital Concierge & Support
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.9] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Get in Touch <br className="hidden sm:block" /> with <span className="text-cyan-400">Sudara Hub.</span>
          </h1>
          
          <p className="text-slate-400 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed italic">
            Direct assistance for students, seamless support for local merchants, and strict grievance redressal mechanisms across Andhra Pradesh.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-stretch">
          
          {/* Background Decorative Soft Glows */}
          <div className="absolute top-1/2 left-10 w-80 h-80 bg-blue-600/10 blur-[120px] -z-10 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-600/10 blur-[120px] -z-10 rounded-full pointer-events-none"></div>

          {/* Left Column: Brand / Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-[#0a1033] p-8 md:p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border border-[#1e2d69]"
          >
            <div className="absolute top-0 right-0 p-32 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-[#0e1638] rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-inner">
                <Headphones className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight mb-2 text-white">Direct <br /> <span className="text-cyan-400">Channels.</span></h3>
                <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                  Have questions about listing your restaurant, clothing store, electronics shop, or automobile showroom? Reach our core team instantly.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-12 space-y-3 pt-6 border-t border-[#1e2d69]">
              <div className="flex items-center gap-3 bg-[#0e1638] p-3 rounded-xl border border-cyan-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">System Status: Operational</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> Based in Andhra Pradesh, India
              </div>
            </div>
          </motion.div>

          {/* Right Column: Communication Channels */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-5 flex flex-col justify-center"
          >
            {/* 💬 WhatsApp Support Card */}
            <motion.a 
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              href={`https://wa.me/${contactInfo.whatsapp}`} 
              target="_blank" rel="noreferrer" 
              className="group flex items-center justify-between bg-[#0a1033] p-6 md:p-8 rounded-[2rem] border border-[#1e2d69] hover:border-emerald-400/60 hover:bg-[#0e1638] hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-300 shadow-md"
            >
              <div className="flex items-center gap-5 md:gap-8">
                <div className="w-14 h-14 md:w-18 md:h-18 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <MessageCircle className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase italic tracking-widest block mb-1">Instant Uplink</span>
                  <p className="text-white font-black italic text-xl md:text-3xl tracking-tight">WhatsApp Support</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">+91 75698 96128</p>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#1e2d69] bg-[#05081c] flex items-center justify-center group-hover:bg-emerald-950/60 group-hover:border-emerald-400/50 group-hover:rotate-45 transition-all shrink-0">
                <ArrowRight className="text-slate-400 group-hover:text-emerald-300 transition-colors w-5 h-5" />
              </div>
            </motion.a>

            {/* ✉️ Email Inquiry Card */}
            <motion.a 
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              href={`mailto:${contactInfo.email}`} 
              className="group flex items-center justify-between bg-[#0a1033] p-6 md:p-8 rounded-[2rem] border border-[#1e2d69] hover:border-cyan-400/60 hover:bg-[#0e1638] hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 shadow-md"
            >
              <div className="flex items-center gap-5 md:gap-8 overflow-hidden">
                <div className="shrink-0 w-14 h-14 md:w-18 md:h-18 bg-blue-950/50 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300">
                  <Mail className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase italic tracking-widest block mb-1">Corporate & Merchant Node</span>
                  <p className="text-white font-black italic text-sm md:text-xl tracking-tight truncate">
                    {contactInfo.email}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official Partnership & Feedback</p>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#1e2d69] bg-[#05081c] flex items-center justify-center group-hover:bg-blue-950/60 group-hover:border-cyan-400/50 group-hover:rotate-45 transition-all">
                 <ArrowRight className="text-slate-400 group-hover:text-cyan-300 transition-colors w-5 h-5" />
              </div>
            </motion.a>

            {/* 🚨 Supreme Grievance / Complaint Directive Card */}
            <div className="bg-[#0a1033] border-2 border-orange-500/40 p-6 md:p-8 rounded-[2rem] shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-md border border-orange-400/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-orange-400 italic tracking-wider">Supreme Grievance Protocol (ఫిర్యాదుల విధానం)</h4>
                  <p className="text-[9px] sm:text-[10px] text-orange-300/80 font-bold uppercase tracking-wider">Direct Action Against Owners / Businesses</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                ఏదైనా రెస్టారెంట్, స్టోర్ లేదా ఓనర్ మీద మీకు ఫిర్యాదు ఉంటే, దయచేసి నేరుగా సుప్రీం అథారిటీకి మెయిల్ ద్వారా తెలియజేయండి. మీ మెయిల్‌లో తప్పనిసరిగా కింద తెలిపిన వివరాలు స్పష్టంగా రాయండి:
              </p>

              <div className="bg-[#0e1638] p-4 rounded-xl border border-[#1e2d69] text-[11px] font-bold text-slate-200 space-y-1 shadow-inner">
                <p>📌 <span className="text-cyan-400">Category</span> (రకం: Restaurant / Store / Automobile మొదలైనవి)</p>
                <p>📌 <span className="text-cyan-400">State & District</span> (రాష్ట్రం & జిల్లా)</p>
                <p>📌 <span className="text-cyan-400">Business Name</span> (వ్యాపారం పేరు / ఓనర్ పేరు)</p>
                <p>📌 <span className="text-cyan-400">Issue Description</span> (సమస్య ఏమిటో స్పష్టంగా వివరంగా)</p>
              </div>

              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 italic">
                ఈ వివరాలతో <a href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("Grievance / Complaint Against Business")}&body=${encodeURIComponent("Category:\nState & District:\nBusiness Name:\nIssue Description:")}`} className="text-cyan-400 hover:text-cyan-300 font-black underline">sudaraofficial703@gmail.com</a> కు మెయిల్ పంపిన వెంటనే, సుప్రీం టీమ్ నేరుగా ఆ ఓనర్ లేదా బిజినెస్ మీద కఠినమైన తక్షణ చర్యలు తీసుకుంటుంది.
              </p>
            </div>

            {/* 🛡️ Response Metrics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-4 p-5 bg-[#0a1033] rounded-2xl border border-[#1e2d69] shadow-sm group hover:border-orange-500/40 transition-all">
                <Clock className="w-5 h-5 text-orange-400 group-hover:rotate-12 transition-transform shrink-0" />
                <div>
                  <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-wider italic">24-Hour Window</h5>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fast query resolution</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-[#0a1033] rounded-2xl border border-[#1e2d69] shadow-sm group hover:border-cyan-400/40 transition-all">
                <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-wider italic">Verified Protocol</h5>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Secure communication</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

        <div className="text-center mt-20 md:mt-28">
          <p className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic bg-[#0a1033] px-6 py-2.5 rounded-full border border-[#1e2d69] shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Sudara Hub • Data Integrity & Support Matrix
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
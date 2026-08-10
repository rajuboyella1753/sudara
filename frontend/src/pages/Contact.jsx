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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-orange-100">
      <Navbar />

      {/* --- 📞 PROFESSIONAL CONTACT SECTION --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 md:pt-44 md:pb-32">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" /> 24/7 Digital Concierge & Support
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9] mb-6">
            Get in Touch <br className="hidden sm:block" /> with <span className="text-blue-600">Sudara Hub.</span>
          </h1>
          
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed italic">
            Direct assistance for students, seamless support for local merchants, and strict grievance redressal mechanisms across Andhra Pradesh.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-stretch">
          
          {/* Background Decorative Soft Glows */}
          <div className="absolute top-1/2 left-10 w-80 h-80 bg-blue-500/5 blur-[120px] -z-10 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/5 blur-[120px] -z-10 rounded-full pointer-events-none"></div>

          {/* Left Column: Brand / Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-800"
          >
            <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[90px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                <Headphones className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight mb-2">Direct <br /> <span className="text-blue-400">Channels.</span></h3>
                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                  Have questions about listing your restaurant, clothing store, electronics shop, or automobile showroom? Reach our core team instantly.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-12 space-y-3 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Status: Operational</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Based in Andhra Pradesh, India
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
              className="group flex items-center justify-between bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200/80 hover:border-emerald-300 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
            >
              <div className="flex items-center gap-5 md:gap-8">
                <div className="w-14 h-14 md:w-18 md:h-18 bg-emerald-100/70 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <MessageCircle className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase italic tracking-widest block mb-1">Instant Uplink</span>
                  <p className="text-slate-900 font-black italic text-xl md:text-3xl tracking-tight">WhatsApp Support</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">+91 75698 96128</p>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:rotate-45 transition-all shrink-0">
                <ArrowRight className="text-slate-400 group-hover:text-emerald-600 transition-colors w-5 h-5" />
              </div>
            </motion.a>

            {/* ✉️ Email Inquiry Card */}
            <motion.a 
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              href={`mailto:${contactInfo.email}`} 
              className="group flex items-center justify-between bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div className="flex items-center gap-5 md:gap-8 overflow-hidden">
                <div className="shrink-0 w-14 h-14 md:w-18 md:h-18 bg-blue-100/70 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Mail className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] md:text-[10px] font-black text-blue-700 uppercase italic tracking-widest block mb-1">Corporate & Merchant Node</span>
                  <p className="text-slate-900 font-black italic text-sm md:text-xl tracking-tight truncate">
                    {contactInfo.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Official Partnership & Feedback</p>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:rotate-45 transition-all">
                 <ArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
              </div>
            </motion.a>

            {/* 🚨 Supreme Grievance / Complaint Directive Card */}
            <div className="bg-orange-50/80 border-2 border-orange-200/80 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-orange-900 italic tracking-wider">Supreme Grievance Protocol (ఫిర్యాదుల విధానం)</h4>
                  <p className="text-[9px] sm:text-[10px] text-orange-700 font-bold uppercase tracking-wider">Direct Action Against Owners / Businesses</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                ఏదైనా రెస్టారెంట్, స్టోర్ లేదా ఓనర్ మీద మీకు ఫిర్యాదు ఉంటే, దయచేసి నేరుగా సుప్రీం అథారిటీకి మెయిల్ ద్వారా తెలియజేయండి. మీ మెయిల్‌లో తప్పనిసరిగా కింద తెలిపిన వివరాలు స్పష్టంగా రాయండి:
              </p>

              <div className="bg-white/90 p-4 rounded-xl border border-orange-200 text-[11px] font-bold text-slate-800 space-y-1 shadow-2xs">
                <p>📌 <span className="text-blue-600">Category</span> (రకం: Restaurant / Store / Automobile మొదలైనవి)</p>
                <p>📌 <span className="text-blue-600">State & District</span> (రాష్ట్రం & జిల్లా)</p>
                <p>📌 <span className="text-blue-600">Business Name</span> (వ్యాపారం పేరు / ఓనర్ పేరు)</p>
                <p>📌 <span className="text-blue-600">Issue Description</span> (సమస్య ఏమిటో స్పష్టంగా వివరంగా)</p>
              </div>

              <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 italic">
                ఈ వివరాలతో <a href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("Grievance / Complaint Against Business")}&body=${encodeURIComponent("Category:\nState & District:\nBusiness Name:\nIssue Description:")}`} className="text-blue-600 font-black underline">sudaraofficial703@gmail.com</a> కు మెయిల్ పంపిన వెంటనే, సుప్రీం టీమ్ నేరుగా ఆ ఓనర్ లేదా బిజినెస్ మీద కఠినమైన తక్షణ చర్యలు తీసుకుంటుంది.
              </p>
            </div>

            {/* 🛡️ Response Metrics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 group">
                <Clock className="w-5 h-5 text-orange-600 group-hover:rotate-12 transition-transform shrink-0" />
                <div>
                  <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider italic">24-Hour Window</h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fast query resolution</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 group">
                <ShieldCheck className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider italic">Verified Protocol</h5>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Secure communication</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

        <div className="text-center mt-20 md:mt-28">
          <p className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic bg-slate-50 px-6 py-2.5 rounded-full border border-slate-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Sudara Hub • Data Integrity & Support Matrix
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
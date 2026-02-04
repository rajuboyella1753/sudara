import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";

const Contact = () => {
  const contactInfo = {
    email: "sudaraofficial703@gmail.com",
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-white text-slate-600 flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* 📞 Main Contact Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 mt-20 md:mt-10 mb-10">
        <div className="w-full max-w-2xl relative">
          
          {/* 🌌 Subtle Background Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 rounded-full animate-pulse"></div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-12 md:p-16 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden"
          >
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                Let's <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.1)]">Talk</span>
              </h2>
              <p className="text-slate-400 font-black uppercase text-[8px] sm:text-[10px] tracking-[0.3em] mb-10 sm:mb-14 italic">
                Support for Students & Onboarding for Owners
              </p>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 text-left">
                
                {/* 💬 WhatsApp Support Card */}
                <motion.a 
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${contactInfo.whatsapp}`} 
                  target="_blank" rel="noreferrer" 
                  className="group flex items-center justify-between bg-slate-50 p-5 sm:p-6 rounded-[1.8rem] border border-slate-100 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase italic tracking-widest block mb-1">Fast Response</span>
                      <p className="text-slate-900 font-black italic text-base sm:text-xl tracking-tight">WhatsApp Support</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-green-600 transition-colors w-5 h-5" />
                </motion.a>

                {/* ✉️ Email Inquiry Card */}
                <motion.a 
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:${contactInfo.email}`} 
                  className="group flex items-center justify-between bg-slate-50 p-5 sm:p-6 rounded-[1.8rem] border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase italic tracking-widest block mb-1">Official Inquiry</span>
                      <p className="text-slate-900 font-black italic text-sm sm:text-xl tracking-tight truncate">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors w-5 h-5 flex-shrink-0" />
                </motion.a>

              </div>

              {/* 🛡️ Trust Badges */}
              <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-300" />
                  <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest italic">24h Response Time</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Verified Support</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <p className="text-center mt-8 text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] italic">
            Sudara Hub • Digital Excellence
          </p>
        </div>
      </div>

      {/* 🚀 Footer Component */}
      <Footer />
    </div>
  );
};

export default Contact;
import React from "react";
import Navbar from "../components/Navbar";

const Contact = () => {
  const contactInfo = {
    email: "codewithraju1753@gmail.com",
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar Section */}
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
        <Navbar />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 -mt-10">
        <div className="w-full max-w-2xl bg-[#0f172a] p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          
          {/* Background Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-3">
              Get In <span className="text-blue-500">Touch</span>
            </h2>
            <p className="text-slate-500 font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] mb-8 md:mb-12 italic">
              Support for Students & Business Inquiries for Owners
            </p>

            <div className="grid grid-cols-1 gap-4 text-left">
              
              {/* WhatsApp Card */}
              <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noreferrer" 
                 className="group flex items-center justify-between bg-black/40 p-4 md:p-5 rounded-2xl border border-white/5 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Fastest Response</span>
                    <p className="text-white font-black italic text-base md:text-lg leading-tight">WhatsApp Support</p>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-green-500 transition-colors">→</span>
              </a>

              {/* Email Card - Fixed for Mobile Responsiveness */}
              <a href={`mailto:${contactInfo.email}`} 
                 className="group flex items-center justify-between bg-black/40 p-4 md:p-5 rounded-2xl border border-white/5 hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden w-full">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform">
                    ✉️
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Official Inquiry</span>
                    <p className="text-white font-black italic text-sm md:text-lg leading-tight truncate">
                      {contactInfo.email}
                    </p>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-orange-500 transition-colors flex-shrink-0">→</span>
              </a>

            </div>

            {/* Availability Info */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5">
              <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase italic tracking-[0.2em]">
                We usually respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
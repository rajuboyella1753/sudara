import React from "react";
import Navbar from "../components/Navbar";

const Contact = () => {
  const contactInfo = {
    email: "codewithraju1753@gmail.com", // నీ ప్రొఫెషనల్ ఈమెయిల్ ఇక్కడ ఇవ్వు
    phone: "+91 7569896128", 
    whatsapp: "917569896128"
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar at the top */}
      <div className="p-6 max-w-6xl mx-auto w-full">
        <Navbar />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 -mt-10">
        <div className="w-full max-w-2xl bg-[#0f172a] p-8 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
              Get In <span className="text-blue-500">Touch</span>
            </h2>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] mb-12 italic">
              Support for Students & Business Inquiries for Owners
            </p>

            <div className="grid grid-cols-1 gap-4 text-left">
              
              {/* WhatsApp Card - Best for quick support */}
              <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noreferrer" 
                 className="group flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Fastest Response</span>
                    <p className="text-white font-black italic text-lg leading-tight">WhatsApp Support</p>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-green-500 transition-colors">→</span>
              </a>

              {/* Call Card */}
              <a href={`tel:${contactInfo.phone}`} 
                 className="group flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📞
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Direct Line</span>
                    <p className="text-white font-black italic text-lg leading-tight">{contactInfo.phone}</p>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-blue-500 transition-colors">→</span>
              </a>

              {/* Email Card */}
              <a href={`mailto:${contactInfo.email}`} 
                 className="group flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-orange-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ✉️
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Official Inquiry</span>
                    <p className="text-white font-black italic text-lg leading-tight">{contactInfo.email}</p>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-orange-500 transition-colors">→</span>
              </a>

            </div>

            {/* Business Hours / Availability Info */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase italic tracking-[0.2em]">
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
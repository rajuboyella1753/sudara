import { motion } from "framer-motion";
import { Clock, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans relative">
      
      {/* 📦 Main Content Area */}
      <div className="max-w-xl w-full text-center relative z-20">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-200">
            <span className="text-white font-black text-2xl italic">S</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            SUDARA<span className="text-blue-600">.IN</span>
          </h1>
        </motion.div>

        {/* Hero Text */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          System Upgrade <br /> <span className="text-blue-600">In Progress.</span>
        </h2>
        
        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
          Sudara Hub is currently undergoing a scheduled upgrade. We’ll be back online with new features shortly.
        </p>

        {/* 📊 Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left">
            <Clock className="w-6 h-6 text-blue-600 mb-4" />
            <h4 className="text-sm font-bold text-slate-900 mb-1 italic uppercase tracking-tight">Estimated Time</h4>
            <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">Ready in 10-15 Minutes</p>
          </div>
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left">
            <ShieldCheck className="w-6 h-6 text-blue-600 mb-4" />
            <h4 className="text-sm font-bold text-slate-900 mb-1 italic uppercase tracking-tight">System Integrity</h4>
            <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">Data is Safe & Secure</p>
          </div>
        </div>

        {/* ✅ Buttons Section - Fixed Z-Index & Logic */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-30">
          <button 
            type="button"
            onClick={() => {
              console.log("Status check triggered");
              window.location.reload();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-tight hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
          >
            Check Status 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href="mailto:codewithraju1753@gmail.com"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm tracking-tight hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>

      {/* 🔗 Footer Section */}
      <div className="absolute bottom-12 left-0 w-full px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-8 max-w-7xl mx-auto z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          © 2026 SUDARA HUB • SYSTEM UPGRADE
        </p>
        <div className="flex gap-6">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-default">Privacy</span>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-default">Terms</span>
        </div>
      </div>
    </div>
  );
}
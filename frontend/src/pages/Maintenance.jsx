import { motion } from "framer-motion";
import { Clock, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* 🌌 Atmospheric Glow - Very Subtle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>

      {/* 📦 Main Content Area */}
      <div className="max-w-xl w-full text-center relative z-20">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-100">
            <span className="text-white font-black text-2xl italic">S</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            SUDARA<span className="text-blue-600">.IN</span>
          </h1>
        </motion.div>

        {/* Hero Text */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
        >
          System Upgrade <br /> <span className="text-blue-600">In Progress.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-lg font-medium leading-relaxed mb-12"
        >
          Sudara Hub is currently undergoing a scheduled upgrade. We’ll be back online with new features shortly.
        </motion.p>

        {/* 📊 Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left shadow-sm"
          >
            <Clock className="w-6 h-6 text-blue-600 mb-4" />
            <h4 className="text-sm font-bold text-slate-900 mb-1 italic uppercase tracking-tight">Estimated Time</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight uppercase">Ready in 1 Day</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left shadow-sm"
          >
            <ShieldCheck className="w-6 h-6 text-blue-600 mb-4" />
            <h4 className="text-sm font-bold text-slate-900 mb-1 italic uppercase tracking-tight">System Integrity</h4>
            <p className="text-xs text-slate-400 font-bold tracking-tight uppercase">Data is Safe & Secure</p>
          </motion.div>
        </div>

        {/* ✅ Buttons Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-30"
        >
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95 shadow-lg shadow-slate-200"
          >
            Check Status 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href="mailto:codewithraju1753@gmail.com"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </motion.div>
      </div>

      {/* 🔗 Footer Section */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full px-6 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto z-10 border-t border-slate-50 pt-8">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
          © 2026 SUDARA HUB • SYSTEM UPGRADE
        </p>
        <div className="flex gap-6">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-default hover:text-blue-400 transition-colors">Privacy</span>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-default hover:text-blue-400 transition-colors">Terms</span>
        </div>
      </div>
    </div>
  );
}
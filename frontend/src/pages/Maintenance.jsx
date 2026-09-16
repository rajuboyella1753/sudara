import { motion } from "framer-motion";
import { Clock, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#05081c] text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 🌌 Atmospheric Glow - Sudara Deep Indigo & Cyan Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* 📦 Main Content Area */}
      <div className="max-w-xl w-full text-center relative z-20">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-950/60 border border-cyan-400/40">
            <span className="text-white font-black text-2xl italic">S</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            SUDARA<span className="text-cyan-400">.IN</span>
          </h1>
        </motion.div>

        {/* Hero Text */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        >
          System Upgrade <br /> <span className="text-cyan-400">In Progress.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-10 max-w-md mx-auto"
        >
          Sudara Hub is currently undergoing a scheduled upgrade. We’ll be back online with new features shortly.
        </motion.p>

        {/* 📊 Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[#0a1033] border border-[#1e2d69] rounded-3xl text-left shadow-lg hover:border-cyan-400/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0e1638] border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white mb-1 italic uppercase tracking-wider">Estimated Time</h4>
            <p className="text-[10px] text-cyan-300 font-black tracking-widest uppercase">Ready in 1 hour</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[#0a1033] border border-[#1e2d69] rounded-3xl text-left shadow-lg hover:border-emerald-400/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0e1638] border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white mb-1 italic uppercase tracking-wider">System Integrity</h4>
            <p className="text-[10px] text-emerald-300 font-black tracking-widest uppercase">Data is Safe & Secure</p>
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
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95 shadow-xl shadow-blue-950/60 border border-cyan-400/30"
          >
            Check Status 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href="mailto:codewithraju1753@gmail.com"
            className="w-full sm:w-auto px-8 py-4 bg-[#0a1033] text-slate-200 border border-[#1e2d69] rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#0e1638] hover:border-cyan-500/40 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            Contact Support
          </a>
        </motion.div>
      </div>

      {/* 🔗 Footer Section */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-6 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto z-10 border-t border-[#131d47] pt-6">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
          © 2026 SUDARA HUB • SYSTEM UPGRADE
        </p>
        <div className="flex gap-6">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-default hover:text-cyan-400 transition-colors">Privacy</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-default hover:text-cyan-400 transition-colors">Terms</span>
        </div>
      </div>
    </div>
  );
}
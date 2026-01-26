import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Zap, Target, Users, ShieldCheck, Cpu, Smartphone } from "lucide-react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
      <Navbar />
      
      {/* 🚀 Main Content Wrapper */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          
          {/* 🚀 Visionary Header */}
          <div className="text-center mb-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-blue-600/5 blur-[120px] -z-10 rounded-full"></div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">
                The <span className="text-blue-500">Evolution</span> <br /> of College Dining
              </h1>
              <p className="text-lg md:text-2xl font-bold text-indigo-200/40 italic leading-relaxed max-w-3xl mx-auto">
                Sudara is a hyper-local ecosystem built to bridge the gap between small culinary businesses and the student community.
              </p>
            </motion.div>
          </div>

          {/* 💎 The MVP Core - Feature Detailed Grid */}
          <div className="mb-32">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-12 text-center italic">Core Framework (MVP 1.0)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Live Inventory */}
              <div className="bg-[#0f172a]/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                <Cpu className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white uppercase italic mb-4">Live Menu Tracking</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Real-time synchronization of dish availability. No more walking to a restaurant only to find your favorite meal is sold out.
                </p>
              </div>

              {/* Smart Calculator */}
              <div className="bg-[#0f172a]/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                <Zap className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white uppercase italic mb-4">Self-Calculator</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Our built-in smart engine automatically calculates your bill and exact 50% advance payment, removing all financial guesswork.
                </p>
              </div>

              {/* Wait Time Logic */}
              <div className="bg-[#0f172a]/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                <Target className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white uppercase italic mb-4">Rush Status 2.0</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Proprietary "Busy-Status" indicator helps students gauge crowd density and estimated preparation time before stepping out.
                </p>
              </div>
            </div>
          </div>

          {/* 🛠️ Deeper Tech Insight - Detailed Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-center">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 italic">Operational Integrity</h3>
              <h2 className="text-4xl font-black text-white uppercase italic mb-8 tracking-tighter">Empowering Local <br /> Micro-Enterprises</h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-black">01</div>
                  <div>
                    <h5 className="text-lg font-black text-white uppercase italic mb-2">Zero-Commission Model</h5>
                    <p className="text-sm text-slate-500">Direct ordering via phone calls ensures owners keep 100% of their revenue, bypassing heavy aggregator fees.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-black">02</div>
                  <div>
                    <h5 className="text-lg font-black text-white uppercase italic mb-2">Ambience Transparency</h5>
                    <p className="text-sm text-slate-500">Verified interior galleries allow students to check the dining environment and seating vibes remotely.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-black">03</div>
                  <div>
                    <h5 className="text-lg font-black text-white uppercase italic mb-2">Seamless QR Payments</h5>
                    <p className="text-sm text-slate-500">Integrated UPI QR codes facilitate quick advance payments, ensuring order commitment for both parties.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[80px] -z-10 rounded-full"></div>
              <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] p-1 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="bg-[#020617] p-10 rounded-[2.8rem] space-y-6">
                   <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Platform Metrics</span>
                      <Smartphone className="w-4 h-4 text-blue-500" />
                   </div>
                   <div className="grid grid-cols-2 gap-6 pt-4">
                      <div>
                         <p className="text-3xl font-black text-white italic tracking-tighter">Real-Time</p>
                         <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Inventory Sync</p>
                      </div>
                      <div>
                         <p className="text-3xl font-black text-white italic tracking-tighter">1-Tap</p>
                         <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Owner Connect</p>
                      </div>
                   </div>
                   <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/10">
                      <p className="text-sm text-slate-400 leading-relaxed italic">
                        "Sudara is not just a food finder; it's a movement to digitize every college-adjacent kitchen with zero barrier to entry."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 Our Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
               <Users className="w-10 h-10 text-blue-500 mb-6" />
               <h4 className="text-2xl font-black text-white uppercase italic mb-4">Student-Centric UX</h4>
               <p className="text-sm text-slate-400 leading-relaxed">
                 Designed specifically for those living in hostels and private rooms. We understand the value of every rupee and every minute of a student's life.
               </p>
            </div>
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5">
               <ShieldCheck className="w-10 h-10 text-blue-500 mb-6" />
               <h4 className="text-2xl font-black text-white uppercase italic mb-4">Operational Security</h4>
               <p className="text-sm text-slate-400 leading-relaxed">
                 By using verified UPI identifiers and direct call logs, we create a secure and accountable environment for every transaction.
               </p>
            </div>
          </div>

          {/* 📢 Final Call to Impact */}
          <motion.div 
             whileHover={{ scale: 1.01 }}
             className="p-12 sm:p-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] sm:rounded-[4rem] text-center shadow-2xl relative overflow-hidden group mb-10"
          >
            <div className="absolute top-0 right-0 p-20 bg-white/10 blur-[80px] rounded-full group-hover:bg-white/20 transition-all"></div>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white mb-6 relative z-10">
              Impact through <br /> Digital Service.
            </h2>
            <p className="text-white/70 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-10 relative z-10">Sudara Hub • Version 1.0 (Live)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
               <span className="px-8 py-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase text-white">Hyper-Local</span>
               <span className="px-8 py-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase text-white">Student Optimized</span>
               <span className="px-8 py-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase text-white">Commission Free</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🚀 Footer Component (Outside max-width for full width feel) */}
      <Footer />
    </div>
  );
};

export default About;
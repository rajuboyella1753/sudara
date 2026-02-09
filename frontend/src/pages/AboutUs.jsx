import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Zap, Target, Users, ShieldCheck, Cpu, Smartphone, ChefHat, HeartHandshake, Navigation } from "lucide-react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* --- 🚀 VISIONARY HERO SECTION --- */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 rounded-full"></div>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-slate-900 mb-6 leading-none">
                More Than Just <br /> <span className="text-blue-600">A Food Finder.</span>
              </h1>
              <p className="text-lg md:text-2xl font-bold text-slate-400 italic leading-relaxed max-w-3xl mx-auto">
                Sudara Hub is a hyper-local ecosystem built to bridge the gap between campus students and local culinary experts.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-24">
          
          {/* --- 💎 WHAT IS SUDARA HUB? --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 italic">Our Origin</h3>
              <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-6 tracking-tighter">Empowering <br /> Campus Life.</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Students often struggle with long queues, unknown food availability, and lack of menu clarity. Sudara Hub was born to solve these exact problems. We digitize the campus dining experience, making it transparent, efficient, and direct.
              </p>
              <div className="flex gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex-1">
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-1">900m Reach</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Focusing on Hyper-Local Hubs</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
                  <h4 className="font-black text-slate-900 text-sm uppercase mb-1">Direct Connect</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Zero Middleman Interaction</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-20 bg-blue-600/20 blur-[60px] rounded-full"></div>
               <Users className="w-12 h-12 text-blue-500 mb-8 relative z-10" />
               <h3 className="text-3xl font-black italic uppercase mb-4 relative z-10">Built for <br/> The Community.</h3>
               <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                 Sudara Hub supports small-scale restaurant owners by giving them a digital identity with 0% commission. This ensures you get food at the original price, and the owner keeps 100% of their earnings.
               </p>
            </div>
          </div>

          {/* --- 🛠️ CORE FEATURES GRID --- */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 italic">Our Platform</h3>
              <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Site Features.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              { [
                { Icon: Navigation, title: "Map Routes", desc: "Precise walking directions to the kitchen." },
                { Icon: Cpu, title: "Live Sync", desc: "Real-time updates on dish availability." },
                { Icon: Smartphone, title: "WhatsApp Direct", desc: "Order confirmation via direct message." },
                { Icon: ShieldCheck, title: "Verified Hubs", desc: "We only list curated & verified partners." }
              ].map((item, idx) => (
                <div key={idx} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-blue-300 transition-all group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    {/* ✅ వేరియబుల్ పేరు ఖచ్చితంగా Capital Letter ఉండాలి (Icon) */}
                    <item.Icon className="w-6 h-6" /> 
                  </div>
                  <h4 className="text-lg font-black text-slate-900 uppercase italic mb-2">{item.title}</h4>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-400 uppercase tracking-wider">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* --- 🎯 THE SUDARA PROMISE --- */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <HeartHandshake className="w-16 h-16 text-white/30 mx-auto mb-8" />
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-6">
                Our Promise.
              </h2>
              <p className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed italic mb-10">
                "We promise to provide the fastest, cleanest, and most reliable food discovery service for campus residents. No hidden fees, no wait times, just fresh food."
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase text-white tracking-widest">
                <Target className="w-4 h-4" /> Version 1.0 (Official Release)
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
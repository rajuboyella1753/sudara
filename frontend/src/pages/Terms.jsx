import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Info, Scale, Lock } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: <Info className="w-6 h-6 text-orange-500" />,
      title: "Introduction",
      content: "Welcome to SUDARA Hub. By using our website, you agree to these terms. Our platform is designed to provide information about nearby hotels and convenience for students."
    },
    {
      icon: <Scale className="w-6 h-6 text-orange-500" />,
      title: "Accuracy of Information",
      content: "While we strive to provide accurate hotel timings and availability, we rely on information provided by hotel owners. SUDARA is not responsible for any sudden changes in hotel operations."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-orange-500" />,
      title: "User Reviews",
      content: "Users are encouraged to provide honest ratings. Any use of abusive language or intentional false reporting may lead to a ban from the platform."
    },
    {
      icon: <Lock className="w-6 h-6 text-orange-500" />,
      title: "Privacy & Data",
      content: "We respect your privacy. SUDARA does not sell your data. We only use essential information to improve your browsing experience within the campus hub."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-orange-500/30">
      <Navbar />

      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/5 blur-[120px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">
              TERMS & <span className="text-orange-500">CONDITIONS</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Last Updated: January 2026
            </p>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#0f172a]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-8 hover:border-orange-500/30 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-orange-500/10 transition-colors">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-orange-500 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 rounded-[2.5rem] bg-orange-500/10 border border-orange-500/20 text-center"
          >
            <p className="text-sm font-bold italic text-orange-500 uppercase tracking-widest">
              Have questions? Contact us at codewithraju1753@gmail.com
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
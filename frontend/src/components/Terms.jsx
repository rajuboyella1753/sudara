import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft, QrCode, Info } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Legal Documentation</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none text-slate-900">
            Terms of <span className="text-blue-600">Service</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">
            Last Updated: Jan 2026 • SUDARA HUB Ecosystem
          </p>
        </motion.div>

        <div className="space-y-8 text-slate-600">
          
          {/* 1. Platform Nature */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">1. Nature of Service</h3>
            </div>
            <p className="text-sm leading-relaxed">
              SUDARA HUB is a <b>Hyper-Local Discovery Platform</b> designed to bridge the gap between campus students and local food vendors. We act strictly as a <b>Digital Reflector</b>; we do not own, manage, or operate any of the listed restaurants.
            </p>
          </section>

          {/* 2. Payments & QR Disclaimer - The Crucial Section */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-amber-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">2. Payments & QR Liability</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                SUDARA HUB does not collect, hold, or process any payments. We facilitate information, not financial transactions.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    <b>Direct Owner QR:</b> The QR codes displayed in the pre-order sections belong <b>Directly to the Restaurant Owners</b>. All money is transferred to their bank accounts directly.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    <b>Zero Responsibility:</b> SUDARA HUB is <b>NOT responsible</b> for failed transactions, money debited but not received by owners, server timeouts, or bank-related issues.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>
                    <b>Verification:</b> Always check the recipient's name on your payment app before confirming. Disputes must be handled with the restaurant or your bank.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Liability Limits */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-red-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">3. Quality & Hygiene</h3>
            </div>
            <div className="space-y-4 text-sm italic">
              <p>SUDARA HUB shall NOT be held responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Food quality, hygiene, or taste of any meal.</li>
                <li>Health issues arising from food consumption from vendors.</li>
                <li>Live Status inaccuracies managed by restaurant owners.</li>
              </ul>
            </div>
          </section>

          {/* 4. User Conduct */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-green-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">4. Fair Usage</h3>
            </div>
            <p className="text-sm">
              Users agree not to exploit the rating system or provide fake feedback. Any attempt to scrape data or violate these terms may lead to a permanent IP ban from the SUDARA ecosystem.
            </p>
          </section>

        </div>

        {/* Back to Home Button */}
        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> I Accept & Return Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
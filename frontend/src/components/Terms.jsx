import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft, QrCode, CreditCard, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    /* 🚀 RAJU FIX: Indigo Blue & Orange Theme */
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative">
        {/* Background Mesh Glows */}
        <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-500/5 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-orange-500/5 blur-[100px] rounded-full -z-10"></div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Protocol Documentation</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none text-slate-900">
            Terms of <span className="text-orange-600">Service</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">
            Last Updated: March 2026 • SUDARA HUB Ecosystem
          </p>
        </motion.div>

        <div className="space-y-8">
          
          {/* 1. Platform Nature */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">1. Nature of Protocol</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              SUDARA HUB is a <b>Hyper-Local Discovery Matrix</b> designed to connect students with campus food vendors. We act strictly as an <b>Information Bridge</b>. We do not prepare food, manage staff, or control the physical operations of any listed restaurant.
            </p>
          </section>

          {/* 2. 🚨 THE CORE PAYMENT DISCLAIMER - CRUCIAL FIX */}
          <section className="bg-orange-50/50 p-8 rounded-[2.5rem] border-2 border-orange-100 hover:border-orange-300 transition-all shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">2. Payment & Transaction Policy</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-700">
              <p className="font-bold text-orange-700 uppercase tracking-tight text-xs">
                ⚠️ IMPORTANT: SUDARA HUB IS NOT A PAYMENT GATEWAY.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>Direct Transfers:</b> All payments made via the platform (PhonePe, GPay, UPI) go <b>DIRECTLY</b> to the Restaurant Owner's bank account. SUDARA HUB never touches, holds, or processes your money.
                  </span>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>QR Code Responsibility:</b> The QR codes and UPI numbers provided are managed by the respective owners. You must verify the recipient's name before confirming any transaction.
                  </span>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>Liability Waiver:</b> We are <b>NOT RESPONSIBLE</b> for failed transactions, double debits, money sent to wrong numbers, or disputes regarding refunds. All financial issues must be resolved between the <b>User and the Restaurant Owner</b>.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Operational Liability */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">3. Quality & Safety</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 italic">
              <p>SUDARA HUB shall not be held liable for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 font-medium">
                <li>Food quality, hygiene, or any health-related issues.</li>
                <li>Inaccurate "Live Special" or "Online Status" updates by owners.</li>
                <li>Price mismatches or availability of items.</li>
                <li>Delays in pre-order preparation at the restaurant.</li>
              </ul>
            </div>
          </section>

          {/* 4. User Conduct */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-orange-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">4. Network Integrity</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Users are prohibited from providing fake feedback or exploiting the pre-order system. Misuse of the platform or owner contact details will result in a permanent ban from the SUDARA ecosystem.
            </p>
          </section>

        </div>

        {/* Action Button */}
        <div className="mt-20 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-orange-600 text-white rounded-[1.8rem] font-black uppercase italic text-xs tracking-widest transition-all shadow-xl shadow-indigo-200 active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> I Accept & Return to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
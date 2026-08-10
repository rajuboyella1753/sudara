import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft, QrCode, CreditCard, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    /* 🚀 Blue & Orange Theme */
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative">
        {/* Background Mesh Glows */}
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-orange-500/5 blur-[100px] rounded-full -z-10"></div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-5 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Protocol Documentation & Legal Disclaimer</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none text-slate-900">
            Terms of <span className="text-orange-600">Service</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">
            Last Updated: March 2026 • SUDARA HUB Ecosystem
          </p>
        </motion.div>

        <div className="space-y-8">
          
          {/* 1. Vision, Mission & Platform Nature */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/80 hover:border-blue-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100/70 rounded-2xl text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">1. Our Vision, Mission & Nature of Protocol</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                <b>SUDARA HUB</b> is a <b>Hyper-Local Discovery & Digital Matrix</b> created with the vision of empowering local economies, civilians, and merchants. Our mission is to bridge the gap between consumers and regional businesses across all sectors—including <b>Restaurants, Clothing & Fashion Stores, Electronics & Appliances, Groceries, and Automobile Showrooms</b>.
              </p>
              <p>
                <b>Strictly as Connectors:</b> SUDARA HUB acts solely as a digital bridge and information directory. We do not manufacture products, run physical storefronts, manage inventories, or control the operations of any listed business. Every listed entity operates independently.
              </p>
            </div>
          </section>

          {/* 2. 🚨 THE CORE PAYMENT DISCLAIMER - CRUCIAL PROTECTION */}
          <section className="bg-orange-50/70 p-8 rounded-[2.5rem] border-2 border-orange-200 hover:border-orange-300 transition-all shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">2. Payment & Financial Policy (Zero Financial Liability)</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-700">
              <p className="font-bold text-orange-700 uppercase tracking-tight text-xs">
                ⚠️ IMPORTANT: SUDARA HUB IS NOT A PAYMENT GATEWAY OR FINANCIAL INSTITUTION.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>Direct Owner Transfers:</b> All financial transactions, advances, or payments made via the platform (PhonePe, GPay, UPI, or cash) are transferred <b>DIRECTLY</b> to the respective business owner's personal or commercial bank account. SUDARA HUB never touches, holds, processes, or intercepts any user funds.
                  </span>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>QR Code & UPI Accountability:</b> The QR codes and UPI numbers displayed belong entirely to individual store owners. Users must independently verify the recipient business/owner name before authorizing any payment.
                  </span>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <b>Complete Liability Waiver:</b> SUDARA HUB holds <b>ZERO FINANCIAL LIABILITY</b> for failed transfers, double debits, misdirected funds, service cancellations, or refund disputes. All commercial settlements, returns, or refunds must be resolved directly between the <b>User and the Business Owner</b>.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Operational & Product Liability */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/80 hover:border-blue-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100/70 rounded-2xl text-blue-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">3. Product Quality, Safety & Business Operations</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 italic">
              <p className="font-medium not-italic text-slate-700">
                Because SUDARA HUB is only a technology connector, <b>product-related issues are handled entirely by the respective business owners.</b> SUDARA HUB shall not be held legally or operationally liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 font-medium">
                <li>Product defects, clothing sizing issues, food hygiene, or health-related incidents.</li>
                <li>Inaccurate stock updates, pricing errors, or outdated digital catalogs published by owners.</li>
                <li>Delays in order fulfillment, test-drive schedules, or service appointments.</li>
                <li>Any physical disputes arising on or off the merchant's premises.</li>
              </ul>
            </div>
          </section>

          {/* 4. User Conduct & Legal Protection */}
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/80 hover:border-orange-200 transition-all shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">4. Network Integrity & Legal Shield</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Users are strictly prohibited from submitting fraudulent reviews, manipulating pre-orders, or misusing merchant contact details. Any malicious activity will result in immediate termination of access.
              </p>
              <p className="font-bold text-slate-800">
                Indemnification Clause: By using Sudara Hub, you agree to indemnify, defend, and hold harmless Sudara Hub, its founder (Boyella Raju / BSR), and its affiliates from any claims, legal pressures, damages, or expenses arising from your transactions with local merchants.
              </p>
            </div>
          </section>

        </div>

        {/* Action Button */}
        <div className="mt-20 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-orange-600 text-white rounded-[1.8rem] font-black uppercase italic text-xs tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> I Accept & Return to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
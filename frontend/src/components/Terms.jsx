import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Legal Documentation</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            Terms of <span className="text-blue-500">Service</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">
            Last Updated: Jan 2026 • SUDARA HUB Ecosystem
          </p>
        </motion.div>

        <div className="space-y-8 text-slate-400">
          
          {/* 1. Platform Nature */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-600/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">1. Nature of Service</h3>
            </div>
            <p className="text-sm leading-relaxed">
              SUDARA HUB is a <b>Hyper-Local Discovery Platform</b> designed to bridge the gap between campus students and local food vendors. We act as a digital directory and do not own, manage, or operate any of the listed restaurants.
            </p>
          </section>

          {/* 2. Pre-Orders & Disclaimers */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-600/10 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">2. Pre-Orders & Transactions</h3>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">•</span>
                <span><b>No Direct Payments:</b> We do not process payments on the platform. All financial transactions occur directly between the user and the vendor.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">•</span>
                <span><b>Order Fulfillment:</b> Vendor acceptance of a pre-order is subject to their current capacity and stock. SUDARA HUB is not liable for rejected or unfulfilled orders.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">•</span>
                <span><b>Pricing Accuracy:</b> While we strive for accuracy, the final price at the restaurant counter prevails over the prices listed on our digital menus.</span>
              </li>
            </ul>
          </section>
          {/* Newly added section */}
          {/* 2. Pre-Orders & Financial Disclaimer */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-600/10 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">2. Pre-Orders & Financial Disclaimer</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                SUDARA HUB is strictly a <b>Digital Reflector</b>. We only display the menu and facilitate communication; we do not manage the actual transaction or food preparation.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>
                    <b>Zero Money Involvement:</b> SUDARA HUB does not collect, hold, or process any payments. All financial dealings are strictly between the <b>User</b> and the <b>Restaurant Owner</b> directly.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>
                    <b>Owner's Authority:</b> The fulfillment of any pre-order, including stock availability and pricing, is entirely in the hands of the owners. We have no control over their internal operations.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>
                    <b>User Responsibility:</b> Users are advised to verify the final order status and price at the restaurant counter before making any physical payments.
                  </span>
                </li>
              </ul>
            </div>
          </section>
          {/* 3. Liability Limits */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-red-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-600/10 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">3. Limitation of Liability</h3>
            </div>
            <div className="space-y-4 text-sm italic">
              <p>SUDARA HUB shall NOT be held responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Food quality, hygiene, or taste of any meal ordered via the platform.</li>
                <li>Any health-related issues arising from the consumption of food from listed vendors.</li>
                <li>Discrepancies in "Live Status" indicators (Open/Closed/Rush Levels) as these are managed by hotel owners.</li>
              </ul>
            </div>
          </section>

          {/* 4. User Conduct */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-green-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-600/10 rounded-2xl">
                <Scale className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight">4. Fair Usage Policy</h3>
            </div>
            <p className="text-sm">
              Users agree not to exploit the rating system, provide fraudulent feedback, or attempt to scrape data from the platform. Any violation may lead to a permanent IP ban from the SUDARA ecosystem.
            </p>
          </section>

        </div>

        {/* Back to Home Button */}
        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-white hover:text-black rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-xl shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" /> I Accept & Return Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
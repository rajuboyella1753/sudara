import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ ఇంపోర్ట్ ఇక్కడే ఉండాలి
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Search, 
  Camera, 
  Navigation, 
  Zap, 
  CreditCard, 
  Smartphone, 
  ShieldCheck,
  UserCheck,
  Banknote
} from "lucide-react";

const features = [
  {
    title: "Only Verified Restaurants",
    desc: "Every restaurant on our platform is personally verified. We never compromise on food quality!",
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
  },
  {
    title: "Nearby & Real-time Info",
    desc: "Find restaurants closest to you and see their live open/closed status instantly.",
    icon: <MapPin className="w-6 h-6 text-red-500" />,
  },
  {
    title: "Live Menu & Availability",
    desc: "Check what's cooking! Know if a dish is available or sold out before you even leave your room.",
    icon: <Search className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Interior & Ambience View",
    desc: "Take a virtual tour. View high-quality photos of the restaurant's interior to pick your perfect spot.",
    icon: <Camera className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Rush Status & Directions",
    desc: "Check if the place is crowded and get precise walking directions via Google Maps.",
    icon: <Navigation className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Pay 50% to Pre-Book",
    desc: "Secure your meal by paying a small 50% advance. Your food will be hot and ready when you arrive!",
    icon: <CreditCard className="w-6 h-6 text-teal-500" />,
  }
];

export default function HowItWorks() {
  const navigate = useNavigate(); 

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-24 pb-12 bg-slate-50 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4"
          >
            How <span className="text-blue-600">Sudara</span> Works?
          </motion.h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
            Your Comprehensive Guide to Smarter Campus Dining
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Step-by-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-blue-200">1</div>
            <h3 className="font-black uppercase italic">Discover</h3>
            <p className="text-slate-500 text-sm">Browse verified restaurants near you and explore their live menus.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-blue-200">2</div>
            <h3 className="font-black uppercase italic">Pre-Book</h3>
            <p className="text-slate-500 text-sm">Pay a 50% advance to confirm your slot and skip the waiting line at Restaurant and pay remaining amount at Restaurant.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-blue-200">3</div>
            <h3 className="font-black uppercase italic">Eat Fresh</h3>
            <p className="text-slate-500 text-sm">Walk into the restaurant and enjoy your meal without the queue!</p>
          </div>
        </div>

        {/* --- DIRECT PAYMENT CLARITY SECTION --- */}
        <section className="mb-24 p-8 md:p-12 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="p-4 bg-white/20 rounded-full">
            <Banknote className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic mb-2">100% Direct Payments</h2>
            <p className="text-blue-100 font-medium text-sm md:text-base leading-relaxed">
              Transparency is our priority. <strong>Your payments go directly to the restaurant owner's bank account.</strong> Sudara Hub acts as a discovery platform and does not hold your money or charge any hidden commissions from your food bill. No middlemen, no delays!
            </p>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6">
                Why Use <br/><span className="text-blue-500">Sudara Hub?</span>
              </h2>
              <p className="text-slate-400 font-medium mb-8">
                We aren't just a directory; we are a smart tool built to save your time and ensure you get the best campus food experience.
              </p>
              <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")} // ✅ ఇది ఇప్పుడు కరెక్ట్ గా వర్క్ అవుతుంది
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-xl shadow-blue-900/40"
            >
              Start Exploring
            </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="shrink-0 p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic text-sm mb-1">{f.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- 50% PAYMENT POLICY SECTION --- */}
        <section className="mt-24 text-center max-w-3xl mx-auto space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black uppercase text-[10px] tracking-widest">
             <Zap className="w-3 h-3 fill-blue-600" /> Booking Policy
           </div>
           <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Skip the Wait with <br/><span className="text-blue-600">50% Advance Booking</span></h2>
           <p className="text-slate-500 text-sm leading-relaxed">
             To prevent food wastage and ensure restaurant owners can prioritize your order, we utilize a 50% advance payment model. This confirms your slot so the chef can start cooking before you arrive. Simply pay the remaining 50% at the restaurant after your meal!
           </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
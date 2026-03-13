import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); 

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBtn(false);
    setDeferredPrompt(null);
  };

  const hideOwnerBtn = location?.pathname?.startsWith("/owner");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How it works", path: "/how-it-works", badge: "New" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    /* 🚀 RAJU FIX: Background with subtle Blue/Indigo tint */
    <nav className={`fixed top-0 left-0 w-full z-[150] transition-all duration-500 ${
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-900/5 py-3 border-b border-blue-50" : "bg-white/50 backdrop-blur-sm py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* 🏢 Logo Section */}
        <Link to="/" className="relative group flex items-center">
          <img 
            src="/SUDAR.png" 
            alt="Sudara Logo"
            className="h-7 md:h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.target.style.display = 'none')}
          />
          {/* Indigo Underline on hover */}
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></div>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              /* RAJU FIX: Hover state with Blue/Indigo */
              className={`relative text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-indigo-600 ${
                location.pathname === link.path ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              {link.name}
              {link.badge && (
                /* Orange Badge */
                <span className="absolute -top-3 -right-5 bg-orange-500 text-white text-[6px] px-1.5 py-0.5 rounded-full animate-pulse font-black">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {/* 📲 Install App Button: Orange/Indigo styling */}
          {showInstallBtn && (
            <button 
              onClick={handleInstallClick} 
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase italic border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <Smartphone className="w-3 h-3" /> Get Sudara App
            </button>
          )}

          {!hideOwnerBtn && (
            <Link to="/owner" className="relative group overflow-hidden bg-indigo-600 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95">
              <span className="relative z-10">Partner Access</span>
              <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
          )}
        </div>

        {/* 📱 Mobile UI Styling */}
        <div className="flex items-center gap-3 lg:hidden">
           {showInstallBtn && (
            <button 
              onClick={handleInstallClick} 
              className="bg-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          )}
          <button 
            className="relative w-11 h-11 flex flex-col justify-center items-center focus:outline-none bg-indigo-50 rounded-2xl border border-indigo-100"
            onClick={() => setOpen(!open)}
          >
            <div className={`w-5 h-0.5 bg-indigo-900 transition-all duration-300 ${open ? "rotate-45 translate-y-1" : ""}`}></div>
            <div className={`w-5 h-0.5 bg-orange-500 my-1 transition-all duration-300 ${open ? "opacity-0" : ""}`}></div>
            <div className={`w-5 h-0.5 bg-indigo-900 transition-all duration-300 ${open ? "-rotate-45 -translate-y-1" : ""}`}></div>
          </button>
        </div>
      </div>

      {/* 📱 Mobile Overlay Menu - Indigo/Orange styling */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white border-t border-indigo-50 overflow-hidden shadow-2xl h-screen"
          >
            <div className="px-8 py-12 space-y-10">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.name}
                >
                  <Link 
                    onClick={() => setOpen(false)} 
                    to={link.path} 
                    className={`text-xl font-black uppercase tracking-[0.1em] flex justify-between items-center ${
                      location.pathname === link.path ? "text-indigo-600" : "text-slate-800"
                    }`}
                  >
                    {link.name}
                    <div className={`w-2 h-2 rounded-full bg-orange-500 ${location.pathname === link.path ? "opacity-100" : "opacity-0"}`}></div>
                  </Link>
                </motion.div>
              ))}
              
              {!hideOwnerBtn && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    onClick={() => setOpen(false)} 
                    to="/owner" 
                    className="block bg-indigo-600 text-white text-center py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-200"
                  >
                    Owner Portal Login
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
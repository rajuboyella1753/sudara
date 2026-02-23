import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // 🚀 PWA States - వీటిని యాడ్ చేశాను రాజు
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // 📲 PWA Debugging Logic
    console.log("🛠️ PWA Debug: Initializing listener...");

    const handleBeforeInstallPrompt = (e) => {
      console.log("✅ PWA Debug: 'beforeinstallprompt' event fired!");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
    // ఇక్కడ [] మాత్రమే ఉంచు రాజు, అప్పుడు ఎర్రర్ రాదు
  }, []); 

  // బటన్ స్టేట్ చెక్ చేయడానికి విడిగా ఒక useEffect
  useEffect(() => {
    if (!showInstallBtn) {
      console.log("ℹ️ PWA Debug: Install button is currently hidden.");
    } else {
      console.log("🚀 PWA Debug: Install button is now VISIBLE!");
    }
  }, [showInstallBtn]);

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
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg py-3" : "bg-white py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* 🏢 Logo Section */}
        <Link to="/" className="relative group flex items-center">
          <img 
            src="/SUDAR.png" 
            alt="Sudara Logo"
            className="h-7 md:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></div>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={`relative text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-blue-600 ${
                location.pathname === link.path ? "text-blue-600" : "text-slate-400"
              }`}
            >
              {link.name}
              {link.badge && (
                <span className="absolute -top-3 -right-5 bg-blue-600 text-white text-[6px] px-1.5 py-0.5 rounded-full animate-pulse font-black">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          {/* 📲 Install App Button (Desktop) - ఇక్కడ యాడ్ చేశాను */}
          {showInstallBtn && (
            <button 
              onClick={handleInstallClick} 
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[9px] uppercase italic border border-blue-100 hover:bg-blue-100 transition-all"
            >
              <Smartphone className="w-3 h-3" /> Get App
            </button>
          )}

          {!hideOwnerBtn && (
            <Link to="/owner" className="relative group overflow-hidden bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-blue-500/20 active:scale-95">
              <span className="relative z-10">Owner Portal</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          )}
        </div>

        {/* 📱 Mobile Toggle Button */}
        <div className="flex items-center gap-3 lg:hidden">
           {/* 📲 Mobile Install Button */}
           {showInstallBtn && (
            <button 
              onClick={handleInstallClick} 
              className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          )}
          <button 
            className="relative w-10 h-10 flex flex-col justify-center items-center focus:outline-none bg-slate-50 rounded-xl"
            onClick={() => setOpen(!open)}
          >
            <div className={`w-5 h-0.5 bg-slate-900 transition-all duration-300 ${open ? "rotate-45 translate-y-1" : ""}`}></div>
            <div className={`w-5 h-0.5 bg-blue-600 my-1 transition-all duration-300 ${open ? "opacity-0" : ""}`}></div>
            <div className={`w-5 h-0.5 bg-slate-900 transition-all duration-300 ${open ? "-rotate-45 -translate-y-1" : ""}`}></div>
          </button>
        </div>
      </div>

      {/* 📱 Mobile Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-50 overflow-hidden shadow-2xl"
          >
            <div className="px-8 py-10 space-y-8">
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
                    className={`text-lg font-black uppercase tracking-[0.1em] flex justify-between items-center ${
                      location.pathname === link.path ? "text-blue-600" : "text-slate-800"
                    }`}
                  >
                    {link.name}
                    <div className={`w-1.5 h-1.5 rounded-full bg-blue-600 ${location.pathname === link.path ? "opacity-100" : "opacity-0"}`}></div>
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
                    className="block bg-slate-900 text-white text-center py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                  >
                    Owner Login
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
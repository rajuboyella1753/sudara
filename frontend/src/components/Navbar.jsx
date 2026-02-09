import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // /owner పేజీల్లో ఉన్నప్పుడు బటన్ దాచడానికి
  const hideOwnerBtn = location.pathname.startsWith("/owner");

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* ☄️ Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src="/SUDAR.png" 
            alt="Sudara Logo"
            className="h-8 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <h1 className="hidden text-2xl font-black italic tracking-tighter text-slate-900 uppercase">
            Sudara<span className="text-blue-600">.</span>
          </h1>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
          
          {/* ✅ How It Works Link with Badge */}
          <Link to="/how-it-works" className="relative text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">
            How to use site
            <span className="absolute -top-3 -right-4 bg-blue-600 text-white text-[6px] px-1 rounded-full animate-bounce">New</span>
          </Link>

          <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Contact</Link>

          {!hideOwnerBtn && (
            <Link
              to="/owner"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Owner Login
            </Link>
          )}
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <span className="text-2xl text-blue-600 font-bold">✕</span>
          ) : (
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-slate-900"></div>
              <div className="w-4 h-0.5 bg-blue-600 ml-auto"></div>
              <div className="w-6 h-0.5 bg-slate-900"></div>
            </div>
          )}
        </button>
      </div>

      {/* 📱 Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-8 space-y-6 absolute w-full left-0 shadow-2xl animate-in slide-in-from-top duration-300">
          <Link onClick={() => setOpen(false)} to="/" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800 hover:text-blue-600">
            Home
          </Link>

          {/* ✅ Mobile How It Works Link */}
          <Link onClick={() => setOpen(false)} to="/how-it-works" className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-blue-600">
            How to Use site <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-md">GUIDE</span>
          </Link>

          <Link onClick={() => setOpen(false)} to="/about" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800 hover:text-blue-600">
            About
          </Link>
          <Link onClick={() => setOpen(false)} to="/contact" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800 hover:text-blue-600">
            Contact
          </Link>

          {!hideOwnerBtn && (
            <Link
              onClick={() => setOpen(false)}
              to="/owner"
              className="block bg-blue-600 text-white text-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100"
            >
              Owner Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
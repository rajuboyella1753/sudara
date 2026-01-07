
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // /owner పేజీల్లో ఉన్నప్పుడు బటన్ దాచడానికి
  const hideOwnerBtn = location.pathname.startsWith("/owner");

  return (
    <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* ☄️ Logo - Sudara */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-orange-600 rounded-lg shadow-lg shadow-orange-600/20 group-hover:rotate-12 transition-transform"></div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Sudara<span className="text-orange-500">.</span>
          </h1>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">Home</Link>
          <Link to="/about" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">About</Link>
          <Link to="/contact" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">Contact</Link>

          {!hideOwnerBtn && (
            <Link
              to="/owner"
              className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Owner Login
            </Link>
          )}
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <span className="text-2xl">✕</span>
          ) : (
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-orange-500"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          )}
        </button>
      </div>

      {/* 📱 Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden bg-[#020617] border-b border-white/5 px-6 py-8 space-y-6 absolute w-full left-0 animate-in slide-in-from-top duration-300">
          <Link onClick={() => setOpen(false)} to="/" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:text-orange-500">
            Home
          </Link>
          <Link onClick={() => setOpen(false)} to="/about" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:text-orange-500">
            About
          </Link>
          <Link onClick={() => setOpen(false)} to="/contact" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-300 hover:text-orange-500">
            Contact
          </Link>

          {!hideOwnerBtn && (
            <Link
              onClick={() => setOpen(false)}
              to="/owner"
              className="block bg-orange-600 text-white text-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest"
            >
              Owner Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
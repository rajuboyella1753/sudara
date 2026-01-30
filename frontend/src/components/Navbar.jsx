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

        {/* ☄️ Logo - Sudara (Solid Black/Blue for Light Theme) */}
        <Link to="/" className="flex items-center group">
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase group-hover:scale-105 transition-transform">
            Sudara<span className="text-blue-600">.</span>
          </h1>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
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

      {/* 📱 Mobile Menu Overlay (Solid Background Fix) */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-8 space-y-6 absolute w-full left-0 shadow-2xl animate-in slide-in-from-top duration-300">
          <Link onClick={() => setOpen(false)} to="/" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800 hover:text-blue-600">
            Home
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
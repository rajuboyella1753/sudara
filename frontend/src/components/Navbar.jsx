import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // /owner పేజీల్లో ఉన్నప్పుడు బటన్ దాచడానికి
  const hideOwnerBtn = location.pathname.startsWith("/owner");

  return (
    <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-indigo-500/20 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* ☄️ Logo - Sudara */}
        {/* <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform"></div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Sudara<span className="text-blue-500">.</span>
          </h1>
        </Link> */}
        <Link to="/" className="flex items-center group">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase group-hover:scale-105 transition-transform">
            Sudara<span className="text-blue-500">.</span>
          </h1>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-indigo-200/60 hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/about" className="text-xs font-black uppercase tracking-widest text-indigo-200/60 hover:text-blue-400 transition-colors">About</Link>
          <Link to="/contact" className="text-xs font-black uppercase tracking-widest text-indigo-200/60 hover:text-blue-400 transition-colors">Contact</Link>

          {!hideOwnerBtn && (
            <Link
              to="/owner"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 border border-blue-400/30"
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
            <span className="text-2xl text-blue-400">✕</span>
          ) : (
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          )}
        </button>
      </div>

      {/* 📱 Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden bg-[#020617] border-b border-indigo-500/20 px-6 py-8 space-y-6 absolute w-full left-0 animate-in slide-in-from-top duration-300">
          <Link onClick={() => setOpen(false)} to="/" className="block text-sm font-black uppercase tracking-[0.2em] text-indigo-100 hover:text-blue-400">
            Home
          </Link>
          <Link onClick={() => setOpen(false)} to="/about" className="block text-sm font-black uppercase tracking-[0.2em] text-indigo-100 hover:text-blue-400">
            About
          </Link>
          <Link onClick={() => setOpen(false)} to="/contact" className="block text-sm font-black uppercase tracking-[0.2em] text-indigo-100 hover:text-blue-400">
            Contact
          </Link>

          {!hideOwnerBtn && (
            <Link
              onClick={() => setOpen(false)}
              to="/owner"
              className="block bg-blue-600 text-white text-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 border border-blue-400/30"
            >
              Owner Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
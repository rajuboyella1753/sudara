import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // సేఫ్ కండిషన్
  const hideOwnerBtn = location?.pathname?.startsWith("/owner");

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo Section */}
        <Link to="/" className="flex items-center group">
          <img 
            src="/SUDAR.png" 
            alt="Sudara Logo"
            className="h-8 md:h-10 w-auto object-contain transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Link>

        {/* Desktop & Tablet Menu (Large screens) */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/how-it-works" className="relative text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">
            How to use site
            <span className="absolute -top-3 -right-4 bg-blue-600 text-white text-[6px] px-1 rounded-full">New</span>
          </Link>
          <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Contact</Link>

          {!hideOwnerBtn && (
            <Link to="/owner" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
              Owner Login
            </Link>
          )}
        </div>

        {/* Mobile & Tablet Button (Smaller screens) */}
        <button className="lg:hidden p-2 focus:outline-none" onClick={() => setOpen(!open)}>
          {open ? <span className="text-2xl text-blue-600 font-bold">✕</span> : (
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-slate-900"></div>
              <div className="w-4 h-0.5 bg-blue-600 ml-auto"></div>
              <div className="w-6 h-0.5 bg-slate-900"></div>
            </div>
          )}
        </button>
      </div>

      {/* Mobile/Tablet Overlay */}
      {open && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-6 py-8 space-y-6 absolute w-full left-0 shadow-2xl">
          <Link onClick={() => setOpen(false)} to="/" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800">Home</Link>
          <Link onClick={() => setOpen(false)} to="/how-it-works" className="block text-sm font-black uppercase tracking-[0.2em] text-blue-600">How to Use site</Link>
          <Link onClick={() => setOpen(false)} to="/about" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800">About</Link>
          <Link onClick={() => setOpen(false)} to="/contact" className="block text-sm font-black uppercase tracking-[0.2em] text-slate-800">Contact</Link>
          {!hideOwnerBtn && (
            <Link onClick={() => setOpen(false)} to="/owner" className="block bg-blue-600 text-white text-center py-4 rounded-2xl text-xs font-black uppercase tracking-widest">
              Owner Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
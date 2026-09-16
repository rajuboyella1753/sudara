import { Link } from "react-router-dom";
import { Mail, Youtube, Instagram, ArrowUpRight, MessageSquare, ShieldCheck, Heart, MapPin, Sparkles } from "lucide-react"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // 🚀 ఇక్కడ ఇచ్చిన ఇన్‌స్టాగ్రామ్ హ్యాండిల్ ఆధారంగా వర్కింగ్ లింక్ అప్‌డేట్ చేయబడింది (@sudara_official_journey)
  const socialLinks = {
    instagram: "https://www.instagram.com/sudara_official_journey/",
    youtube: "https://youtube.com/@sudaraofficial-z6u?si=1K3q2-DouYVPCNzL", 
    email: "mailto:sudaraofficial703@gmail.com"
  };

  const getMailLink = (subject) => {
    return `mailto:sudaraofficial703@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Raju, I want to talk about...")}`;
  };

  return (
    <footer className="bg-[#05081c] text-slate-100 border-t border-[#131d47] pt-24 pb-12 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 🚀 డ్యూయల్ గ్లో బ్యాక్‌గ్రౌండ్ ఎఫెక్ట్ (డీప్ నియాన్ బ్లూ & అంబర్ గ్లో) */}
      <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[140px] -z-10 rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-orange-600/10 blur-[140px] -z-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Brand & Mission Section (Cols 1-5) */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-block text-3xl font-black italic tracking-tighter uppercase group">
              <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">SUDARA</span> <span className="text-orange-500 group-hover:text-orange-400 transition-colors">HUB</span>
            </Link>
            
            <p className="text-slate-400 font-medium leading-relaxed text-xs sm:text-sm max-w-md">
              Empowering users with seamless access to nearby local businesses. One platform for every local business — built for speed, transparency, and trust in every community. Developed with passion by <span className="text-white font-black italic">Raju Boyella (BSR)</span>.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Live & Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1033] border border-[#1e2d69] text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-cyan-400" /> Andhra Pradesh, India
              </span>
            </div>
              
            {/* Social Links with Real Working Instagram Link */}
            <div className="flex items-center gap-4 pt-4">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Profile"
                className="p-3.5 bg-[#0a1033] text-pink-400 rounded-2xl border border-[#1e2d69] hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all shadow-sm hover:shadow-pink-900/30 active:scale-95 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube Channel"
                className="p-3.5 bg-[#0a1033] text-orange-400 rounded-2xl border border-[#1e2d69] hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all shadow-sm hover:shadow-orange-900/30 active:scale-95 group"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href={socialLinks.email} 
                aria-label="Send Email"
                className="p-3.5 bg-[#0a1033] text-cyan-400 rounded-2xl border border-[#1e2d69] hover:bg-cyan-600 hover:text-white hover:border-cyan-500 transition-all shadow-sm hover:shadow-cyan-900/30 active:scale-95 group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Support / Matrix (Cols 6-8) */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 border-l-4 border-orange-500 pl-3">Network Matrix</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={getMailLink("FeedBack from Users")} 
                  className="text-slate-400 hover:text-cyan-400 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-3 text-orange-400 group-hover:scale-110 transition-transform" />
                  User Analytics
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-cyan-400" />
                </a>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-slate-400 hover:text-cyan-400 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-3 text-orange-400 group-hover:scale-110 transition-transform" />
                  Hub Protocol
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-cyan-400" />
                </Link>
              </li>
              <li>
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-cyan-400 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-3 text-orange-400 group-hover:scale-110 transition-transform" />
                  Community Feed
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-cyan-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Direct Feed (Cols 9-12) */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 border-l-4 border-orange-500 pl-3">Direct Support Feed</h4>
            
            <div className="bg-[#0a1033] p-5 rounded-2xl border border-[#1e2d69] space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md border border-cyan-400/30">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Official Dev Mail</p>
                  <a href={socialLinks.email} className="text-xs sm:text-sm font-black text-slate-200 hover:text-orange-400 transition-colors italic">
                    sudaraofficial703@gmail.com
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-[#1e2d69]">
                Business queries, technical support & startup scaling inquiries are welcome 24/7.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#131d47] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              © {currentYear} <span className="text-cyan-400">SUDARA</span> <span className="text-orange-500">HUB</span>. All Rights Reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0a1033] px-5 py-2.5 rounded-full border border-[#1e2d69] shadow-inner">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic flex items-center gap-2">
              Designed with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" /> by Raju Boyella (BSR)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
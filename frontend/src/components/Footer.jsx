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
    <footer className="bg-white text-slate-900 border-t border-slate-100 pt-24 pb-12 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* 🚀 డ్యూయల్ గ్లో బ్యాక్‌గ్రౌండ్ ఎఫెక్ట్ (లైట్ గ్లో) */}
      <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[140px] -z-10 rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] bg-orange-500/5 blur-[140px] -z-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Brand & Mission Section (Cols 1-5) */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-block text-3xl font-black italic tracking-tighter uppercase group">
              <span className="text-blue-600 group-hover:text-blue-700 transition-colors">SUDARA</span> <span className="text-orange-600 group-hover:text-orange-700 transition-colors">HUB</span>
            </Link>
            
            <p className="text-slate-600 font-medium leading-relaxed text-xs sm:text-sm max-w-md">
              Empowering users with seamless access to nearby local businesses. One platform for every local business — built for speed, transparency, and trust in every community. Developed with passion by <span className="text-slate-900 font-black italic">Raju Boyella (BSR)</span>.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Live & Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                <MapPin className="w-3 h-3" /> Andhra Pradesh, India
              </span>
            </div>
              
            {/* Social Links with Real Working Instagram Link */}
            <div className="flex items-center gap-4 pt-4">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Profile"
                className="p-3.5 bg-slate-50 text-pink-600 rounded-2xl border border-slate-200 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all shadow-sm hover:shadow-pink-100 active:scale-95 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube Channel"
                className="p-3.5 bg-slate-50 text-orange-600 rounded-2xl border border-slate-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm hover:shadow-orange-100 active:scale-95 group"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href={socialLinks.email} 
                aria-label="Send Email"
                className="p-3.5 bg-slate-50 text-blue-600 rounded-2xl border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm hover:shadow-blue-100 active:scale-95 group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Support / Matrix (Cols 6-8) */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 border-l-4 border-orange-500 pl-3">Network Matrix</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={getMailLink("FeedBack from Users")} 
                  className="text-slate-600 hover:text-blue-600 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                  User Analytics
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-blue-600" />
                </a>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-slate-600 hover:text-blue-600 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                  Hub Protocol
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-blue-600" />
                </Link>
              </li>
              <li>
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-blue-600 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                  Community Feed
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1 text-blue-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Direct Feed (Cols 9-12) */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 border-l-4 border-orange-500 pl-3">Direct Support Feed</h4>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Official Dev Mail</p>
                  <a href={socialLinks.email} className="text-xs sm:text-sm font-black text-slate-800 hover:text-orange-600 transition-colors italic">
                    sudaraofficial703@gmail.com
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                Business queries, technical support & startup scaling inquiries are welcome 24/7.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
              © {currentYear} <span className="text-blue-600">SUDARA</span> <span className="text-orange-600">HUB</span>. All Rights Reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 shadow-inner">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic flex items-center gap-2">
              Designed with <Heart className="w-3.5 h-3.5 text-orange-600 fill-orange-600 animate-pulse" /> by Raju Boyella (BSR)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
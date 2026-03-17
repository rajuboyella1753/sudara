import { Link } from "react-router-dom";
import { Mail, Youtube, Instagram, ArrowUpRight, MessageSquare, ShieldCheck, Heart } from "lucide-react"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = {
    instagram: "https://www.instagram.com/sudara_1753",
    youtube: "https://www.youtube.com/@BOYELLA-B21", 
    email: "mailto:sudaraofficial703@gmail.com"
  };

  const getMailLink = (subject) => {
    return `mailto:sudaraofficial703@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Raju, I want to talk about...")}`;
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 relative overflow-hidden">
      {/* 🚀 RAJU FIX: Dual Glow Background (Blue & Orange) */}
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] -z-10 rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 group">
              <span className="text-blue-600">SUDARA</span> <span className="text-orange-600">HUB</span>
            </Link>
            <p className="mt-8 text-slate-500 font-medium leading-relaxed max-w-sm text-sm">
  Empowering users with seamless access to nearby urban food hubs. 
  Integrated Dining Network Protocol built for speed and reliability in every city.
</p>
            
            <div className="flex items-center gap-4 mt-10">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-200"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm hover:shadow-orange-200"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-8 border-l-4 border-orange-500 pl-3">Network Matrix</h4>
            <ul className="space-y-5">
              <li>
                <a 
                  href={getMailLink("FeedBack from Users")} 
                  className="text-slate-400 hover:text-blue-600 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-3 text-orange-500 opacity-70" />
                  User Analytics
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-2" />
                </a>
              </li>
              <li>
              <Link 
                to="/terms" 
                className="text-slate-400 hover:text-blue-600 transition-all font-black text-[11px] uppercase flex items-center group tracking-widest"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-3 text-orange-500 opacity-70" />
                Hub Protocol
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-2" />
              </Link>
            </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-8 border-l-4 border-orange-500 pl-3">Direct Feed</h4>
            <div className="flex items-start gap-4 group">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Dev Protocol</p>
                <a href={socialLinks.email} className="text-[13px] font-black text-slate-700 hover:text-orange-600 transition-colors italic">
                  sudaraofficial703@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              © {currentYear} <span className="text-blue-600">SUDARA</span> <span className="text-orange-600">HUB</span>. Active Node.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
              Designed with <Heart className="w-3 h-3 text-orange-600 fill-orange-600" /> for You
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { Link } from "react-router-dom";
import { Mail, Youtube, Instagram, ArrowUpRight, MessageSquare, PlusCircle, AlertTriangle } from "lucide-react"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = {
    instagram: "https://www.instagram.com/sudara_1753",
    youtube: "https://www.youtube.com/@BOYELLA-B21", 
    email: "mailto:codewithraju1753@gmail.com"
  };

  // మెయిల్ సబ్జెక్ట్స్ మరియు బాడీ సెట్ చేయడం కోసం ఫంక్షన్
  const getMailLink = (subject) => {
    return `mailto:codewithraju1753@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Raju, I want to talk about...")}`;
  };

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-orange-500/5 blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-white group">
              SUDARA<span className="text-orange-500 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all">HUB</span>
            </Link>
            <p className="mt-6 text-slate-500 font-medium leading-relaxed max-w-sm">
              Empowering students with seamless access to nearby campus food hubs. 
              Built for convenience, speed, and mental freedom.
            </p>
            
            <div className="flex items-center gap-4 mt-8">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-orange-500/50 hover:text-orange-500 transition-all shadow-lg"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all shadow-lg group"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Support - అన్నీ మెయిల్స్ కి కనెక్ట్ చేశాను */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 italic">Support & Help</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={getMailLink("Inquiry about Terms & Policy")} 
                  className="text-slate-400 hover:text-orange-500 transition-all font-bold text-[13px] uppercase flex items-center group"
                >
                  <MessageSquare className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100" />
                  Terms Inquiry
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href={getMailLink("New Hotel Registration Request")} 
                  className="text-slate-400 hover:text-orange-500 transition-all font-bold text-[13px] uppercase flex items-center group"
                >
                  <PlusCircle className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100" />
                  Add Your Hotel
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href={getMailLink("Reporting an Issue/Abuse")} 
                  className="text-slate-400 hover:text-orange-500 transition-all font-bold text-[13px] uppercase flex items-center group"
                >
                  <AlertTriangle className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100" />
                  Report Abuse
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 italic">Direct Contact</h4>
            <div className="flex items-start gap-3 group">
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500 transition-colors">
                <Mail className="w-4 h-4 text-orange-500 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Email Us At</p>
                <a href={socialLinks.email} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                  codewithraju1753@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            © {currentYear} <span className="text-slate-400">SUDARA HUB</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">
              Designed for  Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
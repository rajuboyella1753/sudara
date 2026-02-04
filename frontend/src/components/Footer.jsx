import { Link } from "react-router-dom";
import { Mail, Youtube, Instagram, ArrowUpRight, MessageSquare, ShieldCheck } from "lucide-react"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = {
    instagram: "https://www.instagram.com/sudara_1753",
    youtube: "https://www.youtube.com/@BOYELLA-B21", 
    email: "mailto:sudaraofficial703@gmail.com"
  };

  // మెయిల్ సబ్జెక్ట్స్ మరియు బాడీ సెట్ చేయడం కోసం ఫంక్షన్
  const getMailLink = (subject) => {
    return `mailto:sudaraofficial703@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Raju, I want to talk about...")}`;
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 relative overflow-hidden">
      {/* Background Decorative Glow - Adjusted for Light Theme */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-blue-500/5 blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 group">
              SUDARA<span className="text-blue-600 group-hover:drop-shadow-[0_0_10px_rgba(37,99,235,0.2)] transition-all"> HUB</span>
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
                className="p-3 bg-slate-50 rounded-full border border-slate-100 hover:border-blue-500/50 hover:text-blue-600 transition-all shadow-sm"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-slate-50 rounded-full border border-slate-100 hover:border-red-500/50 hover:text-red-600 transition-all shadow-sm group"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6 italic">Support & Help</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={getMailLink("FeedBack from Users")} 
                  className="text-slate-400 hover:text-blue-600 transition-all font-bold text-[11px] uppercase flex items-center group"
                >
                  <MessageSquare className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100" />
                  FeedBack link
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1" />
                </a>
              </li>
              <li>
              <Link 
                to="/terms" 
                className="text-slate-400 hover:text-blue-600 transition-all font-bold text-[11px] uppercase flex items-center group"
              >
                <ShieldCheck className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100" />
                Terms & Conditions
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ml-1" />
              </Link>
            </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-6 italic">Direct Contact</h4>
            <div className="flex items-start gap-3 group">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
                <Mail className="w-4 h-4 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Email Us At</p>
                <a href={socialLinks.email} className="text-[13px] font-bold text-slate-600 hover:text-blue-600 transition-colors">
                  sudaraofficial703@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            © {currentYear} <span className="text-slate-600">SUDARA HUB</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">
              Designed for Students By Student
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
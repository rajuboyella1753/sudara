import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-6 md:p-20 overflow-x-hidden selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <Navbar />
        
        {/* Header Section */}
        <div className="mt-10 mb-16 relative">
          {/* Background Glow matching Navbar */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10 rounded-full"></div>
          
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-6">
            About <span className="text-blue-500">Sudara</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-indigo-200/60 italic leading-relaxed max-w-2xl">
            Sudara is a dedicated platform designed to bridge the gap between local hotel owners and students, ensuring a seamless business flow and daily convenience.
          </p>
        </div>

        {/* Why Sudhara? - Purpose Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bg-[#0f172a]/50 backdrop-blur-xl p-8 rounded-[2rem] border border-indigo-500/20 shadow-2xl">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4 italic">For Hotel Owners</h3>
            <p className="text-sm leading-relaxed font-medium">
              స్థానిక హోటల్ యజమానులకు నేరుగా విద్యార్థులతో అనుసంధానం ఏర్పరుస్తుంది. దీని ద్వారా వ్యాపారం పెరగడమే కాకుండా, ఆర్డర్ మేనేజ్మెంట్ సులభతరం అవుతుంది. డిజిటల్ ప్లాట్‌ఫామ్ లేని చిన్న హోటల్స్ కి ఇది ఒక గొప్ప వేదిక.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 backdrop-blur-xl p-8 rounded-[2rem] border border-indigo-500/20 shadow-2xl">
            <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-4 italic">For Students</h3>
            <p className="text-sm leading-relaxed font-medium">
              హాస్టల్స్ లేదా రూమ్స్ లో ఉండే విద్యార్థులకు తమ చుట్టుపక్కల ఉన్న హోటల్స్ లో ఏముందో, ఏది అందుబాటులో ఉందో క్లారిటీ ఇస్తుంది. తక్కువ ధరలో మంచి ఆహారాన్ని వెతుక్కునే శ్రమను తగ్గిస్తుంది.
            </p>
          </div>
        </div>

        {/* How it works / Impact */}
        <div className="border-t border-white/5 pt-16">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-10 italic">Why this Platform?</h3>
          
          <div className="space-y-12">
            <div className="flex gap-6 group">
              <span className="text-3xl font-black text-indigo-500/20 italic group-hover:text-blue-500/40 transition-colors">01</span>
              <div>
                <h4 className="text-xl font-black text-white uppercase italic mb-2">Transparency</h4>
                <p className="text-sm text-slate-400">మెనూ ధరలు, లభ్యత (Availability) మరియు హోటల్ రద్దీ (Busy Status) ని ముందే తెలుసుకోవచ్చు.</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <span className="text-3xl font-black text-indigo-500/20 italic group-hover:text-blue-500/40 transition-colors">02</span>
              <div>
                <h4 className="text-xl font-black text-white uppercase italic mb-2">Local Business Growth</h4>
                <p className="text-sm text-slate-400">పెద్ద ఫుడ్ డెలివరీ యాప్స్ కి కమిషన్లు కట్టలేక ఇబ్బంది పడే చిన్న హోటల్ యజమానులకు ఇది నేరుగా సాయపడుతుంది.</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <span className="text-3xl font-black text-indigo-500/20 italic group-hover:text-blue-500/40 transition-colors">03</span>
              <div>
                <h4 className="text-xl font-black text-white uppercase italic mb-2">Time Saving</h4>
                <p className="text-sm text-slate-400">ఏ హోటల్ తెరిచి ఉందో, ఏది మూసి ఉందో వెతుక్కునే అవసరం లేకుండా లైవ్ అప్‌డేట్స్ అందిస్తుంది.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="mt-20 p-10 bg-blue-600/5 rounded-[2rem] border border-blue-500/20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 -z-10"></div>
           <p className="text-white font-black italic uppercase tracking-tighter text-xl">
             Focus on Work. Impact through Service.
           </p>
        </div>
      </div>
    </div>
  );
};

export default About;
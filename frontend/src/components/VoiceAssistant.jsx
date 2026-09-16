import React, { useState } from 'react';
import { Mic, Loader2, MicOff } from 'lucide-react';
import api from '../api/api-base';

const VoiceAssistant = ({ menuItems, onOrderDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("మీ బ్రౌజర్ వాయిస్ సపోర్ట్ చేయదు, Chrome వాడండి!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'te-IN';
    recognition.continuous = false; // దీన్ని false లోనే ఉంచు కానీ..
    recognition.interimResults = true; // 🎯 దీన్ని true చెయ్, అప్పుడు రిజల్ట్ కోసం వెయిట్ చేస్తుంది
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Listening started...");
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log("🎤 Listening ended.");
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ User said:", transcript);
      setLoading(true);

      try {
        // 🎯 బ్యాకెండ్ కి పంపేటప్పుడు /ai/ మర్చిపోకు రాజు (నీ రూట్ ని బట్టి)
        const res = await api.post('/ai/process-voice', { transcript, menuItems });
        console.log("🤖 AI Response Data:", res.data);

        if (res.data.reply) {
          const utterance = new SpeechSynthesisUtterance(res.data.reply);
          utterance.lang = 'te-IN';
          utterance.rate = 1.0;
          
          // పాత మాటలు ఏమన్నా ఉంటే ఆపేసి కొత్తది ప్లే చేస్తుంది
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }

        if (res.data.items && res.data.items.length > 0) {
          onOrderDetected(res.data.items);
        }
      } catch (err) {
        console.error("❌ API/AI Error:", err);
      } finally {
        setLoading(false);
      }
    };

    recognition.start();
  };

  return (
    <button 
      onClick={isListening ? null : startListening} 
      disabled={loading}
      className={`fixed bottom-24 right-6 z-[500] p-5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.6)] border transition-all active:scale-90 ${
        isListening 
          ? 'bg-rose-600 border-rose-400/80 shadow-rose-600/50 animate-pulse text-white' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-cyan-400/40 shadow-blue-900/50 text-cyan-200'
      }`}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
      ) : isListening ? (
        <MicOff className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </button>
  );
};

export default VoiceAssistant;
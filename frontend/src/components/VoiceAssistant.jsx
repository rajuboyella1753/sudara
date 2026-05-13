import React, { useState } from 'react';
import { Mic, Loader2, MicOff } from 'lucide-react';
import api from '../api/api-base';

const VoiceAssistant = ({ menuItems, onOrderDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("మీ బ్రౌజర్ వాయిస్ సపోర్ట్ చేయదు రాజు, Chrome వాడండి!");
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
      className={`fixed bottom-24 right-6 z-[500] p-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all active:scale-90 ${
        isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-900'
      } text-white`}
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
    </button>
  );
};

export default VoiceAssistant;
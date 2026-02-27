import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Clock, MapPin, Search, Camera, CreditCard, X, PhoneCall, Plus, Minus, ShoppingBag,ShieldCheck, Copy, UtensilsCrossed , MessageSquare, Star, Send, Navigation} from "lucide-react"; 

export default function RestaurantProfile() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [activeSubCat, setActiveSubCat] = useState("All"); 
  const [itemSearch, setItemSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null); 
  const [cart, setCart] = useState({}); 
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({ name: "", phone: "", txId: "", arrivalTime: "" });
  const [showPayWarning, setShowPayWarning] = useState(false); 

  const availableSubCats = useMemo(() => {
    const catsInMenu = items.map(item => item.subCategory);
    return ["Biryanis", "Starters", "Soups", "Noodles", "Gravys", "Rice", "Breads", "Sea Food", "Tiffins"].filter(cat => 
      catsInMenu.includes(cat)
    );
  }, [items]);

  const trackFoodInterest = async (itemName) => {
    try {
      const today = new Date().toLocaleDateString('en-GB'); 
      await api.put(`/owner/track-analytics/${id}`, {
        action: "food_click",
        foodName: itemName,
        date: today
      });
    } catch (err) { console.log("Interest tracking failed"); }
  };

const trackCallInterest = async () => {
  try {
    // 🎯 రాజు, ఇక్కడ డేట్ ని నీ DB కి తగ్గట్టుగా క్లీన్ చేస్తున్నాం
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/'); 
    // ఇది "13/02/2026" ని "13/2/2026" గా మారుస్తుంది
    
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "call_click", 
      date: today 
    });
  } catch (err) {
    console.log("Call tracking failed");
  }
};
const openGoogleMaps = () => {
  if (!owner?.latitude || !owner?.longitude || owner.latitude === 0) {
    return alert("Restaurant location not set by owner! 📍");
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const restLat = owner.latitude;
        const restLng = owner.longitude;

        // ✅ మొబైల్ లో ఉన్నావా లేదా అని చెక్ చేస్తున్నాం
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          // 🚀 మొబైల్ అయితే నేరుగా యాప్ లో 'Navigation' స్టార్ట్ అవుతుంది
          // saddr = Start (User GPS), daddr = Destination (Owner Lat/Lng)
          window.location.href = `https://maps.google.com/maps?saddr=${userLat},${userLng}&daddr=${restLat},${restLng}&directionsmode=walking`;
        } else {
          // 💻 ల్యాప్‌టాప్ అయితే బ్రౌజర్ లో కొత్త ట్యాబ్ ఓపెన్ అవుతుంది
          const mapsURL = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${restLat},${restLng}&travelmode=walking`;
          window.open(mapsURL, "_blank");
        }
      },
      (error) => {
        // GPS పర్మిషన్ ఇవ్వకపోతే డీఫాల్ట్ గా రెస్టారెంట్ లొకేషన్ చూపిస్తాం
        window.open(`https://www.google.com/maps/search/?api=1&query=${owner.latitude},${owner.longitude}`, "_blank");
      },
      { 
        enableHighAccuracy: true, // 🎯 49m vs 46m అక్యురసీ కోసం ఇది ప్రాణం!
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  } else {
    alert("Nee browser geolocation support cheyyadam ledu bro! 📍");
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [oRes, iRes] = await Promise.all([
          api.get(`/owner/${id}`),
          api.get(`/items/owner/${id}`) 
        ]);
        setOwner(oRes.data);
        setItems(iRes.data);
        const favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
        setIsFavorite(favorites.includes(id));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const addToCart = (item) => {
    trackFoodInterest(item.name); 
    setCart(prev => ({
      ...prev,
      [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 }
    }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const currentQty = prev[item._id]?.qty || 0;
      if (currentQty <= 1) {
        const { [item._id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item._id]: { ...item, qty: currentQty - 1 } };
    });
  };

  const totalAmount = Object.values(cart).reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const halfAmount = (totalAmount / 2).toFixed(2);

const handleConfirmOrder = async () => {
  // 1. Validation check
  if (!orderData.name || !orderData.phone || !orderData.txId) return alert("Please fill details! 📝");

  // 2. User Confirmation
  const userReady = window.confirm(
    "ORDER READY! ✅\n\nNext Step: We will open WhatsApp. After sending the message, please CALL THE OWNER immediately to confirm.\n\nProceed to WhatsApp?"
  );
  if (!userReady) return;

  try {
    // 3. Analytics Tracking (Date Format: 17/2/2026)
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');
    
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "pre_order_click", 
      date: today 
    });
  } catch (err) {
    console.log("Analytics error:", err);
  }

  // 4. Message Preparation
  const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`).join(", ");
  const message = `*NEW PRE-ORDER - SUDARA HUB*\n\n*Name:* ${orderData.name}\n*Phone:* ${orderData.phone}\n*Items:* ${itemList}\n\n*Total Bill:* ₹${totalAmount}\n*Advance Paid (50%):* ₹${halfAmount}\n*Remaining:* ₹${halfAmount}\n*Txn ID:* ${orderData.txId}\n*Arrival:* ${orderData.arrivalTime}\n\n_Note: I am calling you now for confirmation!_`;
  
  // 5. WhatsApp URL Fix (రాజు, ఇక్కడ ఫోన్ నంబర్ క్లీన్ చేస్తున్నాం)
  const cleanPhone = owner?.phone?.replace(/[^0-9]/g, ''); // నంబర్ లో కేవలం అంకెలు మాత్రమే ఉంచుతుంది
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  // పక్కాగా పనిచేసే API లింక్ ఇది
  const waURL = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`;
  
  window.open(waURL, "_blank");
  setShowOrderForm(false);
};

  const searchFiltered = useMemo(() => {
    return items.filter(item => {
      const matchesFilter = filter === "All" ? true : item.category === filter;
      const matchesSubCat = activeSubCat === "All" ? true : item.subCategory === activeSubCat;
      const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
      return matchesFilter && matchesSubCat && matchesSearch;
    });
  }, [items, filter, activeSubCat, itemSearch]);

  const availableItems = searchFiltered.filter(item => item.isAvailable);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest text-[10px]">Scanning Menu...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      
{/* 🏛️ Header Section: Ultra Clean & Responsive */}
<div className="relative h-[350px] sm:h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 w-full">
    {/* Background Image with Overlay */}
    {owner?.hotelImage && (
      <img 
        src={owner.hotelImage} 
        loading="eager" 
        className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-40 blur-[0.1px]" 
        alt={owner?.name} 
      />
    )}
    
    {/* Enhanced Professional Overlays for Text Contrast */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#FDFDFD]"></div>
    <div className="absolute inset-0 bg-black/20"></div>

    {/* Center Content: Mobile-First Optimized */}
    <div className="relative z-10 text-center px-4 w-full max-w-4xl flex flex-col items-center pt-8">
        <motion.h1 
  initial={{ opacity: 0, y: 15 }} 
  animate={{ opacity: 1, y: 0 }}
  // 🔥 రాజు, ఇక్కడ కేవలం డెస్క్‌టాప్ సైజ్ (md/lg) మాత్రమే తగ్గించాను
  className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight text-center"
>
  {owner?.name}
</motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-white/95 font-black uppercase tracking-widest text-[8px] sm:text-[10px] md:text-xs mt-4 bg-blue-600/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/20 inline-block shadow-xl"
        >
          {owner?.collegeName} • Exclusive Menu
        </motion.p>

        {/* 📍 Route Button - Fixed Padding for Mobile */}
        <div className="mt-8 md:mt-12">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={openGoogleMaps}
            className="flex items-center gap-2 sm:gap-3 bg-white px-6 py-3 md:px-10 md:py-5 rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 group border border-white/30"
          >
            <Navigation className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600 group-hover:text-white animate-pulse" />
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest italic">Get Campus Route</span>
          </motion.button>
        </div>
    </div>

    {/* Top Right Action Buttons - Safe Area Adjusted */}
    <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2 sm:gap-3 z-20">
        <button className="bg-white/90 backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl text-slate-900 border border-white/40 active:scale-90">
          <Share2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="bg-white/90 backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-white/40 active:scale-90 group">
          <Heart className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-red-500 transition-colors" />
        </button>
    </div>
</div>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Content: Responsive Column Span */}
        <div className="order-2 lg:order-1 lg:col-span-8 space-y-6 md:space-y-8">
          {/* 🚀 1. ఇక్కడ పెట్టు రాజు: TODAY'S SPECIAL BANNER */}
      {(() => {
        if (!owner?.todaySpecial || !owner?.specialTimestamp) return null;
        const now = new Date();
        const msgDate = new Date(owner.specialTimestamp);
        const diffInHours = (now - msgDate) / (1000 * 60 * 60);

        if (diffInHours < 24) {
          return (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-[2.5rem] shadow-xl shadow-orange-100 flex items-center gap-4 relative overflow-hidden border-2 border-white/20"
            >
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                <Star className="w-7 h-7 fill-white animate-pulse" />
              </div>
              <div className="min-w-0 z-10">
                <p className="text-[10px] font-black uppercase text-white/90 tracking-[0.2em] leading-none mb-2 italic">Live Special Alert</p>
                <h3 className="text-xl font-black text-white italic leading-tight uppercase tracking-tighter">{owner.todaySpecial}</h3>
              </div>
              <UtensilsCrossed className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 -rotate-12" />
            </motion.div>
          );
        }
        return null;
      })()}
          {/* special offers end  */}
            {owner?.interiorImages?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3"><h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-800 tracking-widest italic">Ambience</h3></div>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {owner.interiorImages.map((img, idx) => (
                    <img key={idx} src={img} loading="lazy" onClick={() => setSelectedImg(img)} className="w-60 sm:w-72 h-40 sm:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] border shadow-sm shrink-0 cursor-zoom-in" alt="" />
                  ))}
                </div>
              </div>
            )}

            {/* Filter Section: Sticky with Responsive Spacing */}
            <div className="sticky top-16 sm:top-20 z-30 bg-white/95 py-2 border-b space-y-3 sm:space-y-4 backdrop-blur-md">
                <div className="relative">
                    <input type="text" placeholder="Search dish..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="w-full bg-slate-50 border py-2.5 sm:py-3 px-10 rounded-full text-[10px] sm:text-xs font-bold outline-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 h-4" />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
  {["All", "Veg", "Non-Veg"].map((cat) => {
    const isSelected = filter === cat;
    
    // 🎨 ఇక్కడ కేటగిరీ కలర్ లాజిక్ ఉంది రాజు
    let btnStyles = "";
    if (cat === "Veg") {
      btnStyles = isSelected 
        ? "bg-green-600 text-white border-green-600 shadow-md" 
        : "bg-white text-green-600 border-green-200 hover:bg-green-50";
    } else if (cat === "Non-Veg") {
      btnStyles = isSelected 
        ? "bg-red-600 text-white border-red-600 shadow-md" 
        : "bg-white text-red-600 border-red-200 hover:bg-red-50";
    } else {
      btnStyles = isSelected 
        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50";
    }
    return (
      <button 
        key={cat} 
        onClick={() => setFilter(cat)} 
        className={`px-4 sm:px-6 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase border transition-all shrink-0 flex items-center gap-1.5 ${btnStyles}`}
      >
        {/* చిన్న కలర్ డాట్ - ఫుడ్ ఐటమ్స్ లాగానే */}
        {cat === "Veg" && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
        {cat === "Non-Veg" && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>}
        {cat === "All" && (
          <div className="flex -space-x-1">
            <div className="w-1.2 h-1.2 sm:w-1.5 rounded-full bg-green-500 border border-white"></div>
            <div className="w-1.2 h-1.2 sm:w-1.5 rounded-full bg-red-500 border border-white"></div>
          </div>
        )}
        {cat}
      </button>
    );
  })}
</div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setActiveSubCat("All")} className={`px-3 sm:px-4 py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === "All" ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}>All Menu</button>
                    {availableSubCats.map(sub => (
                      <button key={sub} onClick={() => setActiveSubCat(sub)} className={`px-3 sm:px-4 py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === sub ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}>{sub}</button>
                    ))}
                </div>
            </div>
{/* ⚠️ IMAGES DISCLAIMER MESSAGE */}
<div className="bg-slate-50 border-l-4 border-amber-500 p-4 rounded-2xl mb-6 flex items-start gap-3">
  <Camera className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-relaxed uppercase italic">
    <span className="text-amber-600 font-black">Note:</span> These images are for representation only (sourced from Google). Please do not select food based solely on the image appearance. Check dish names and descriptions.
  </p>
</div>
            {/* Items Grid: Responsive Column Count */}
            <div className="max-h-screen lg:max-h-[800px] overflow-y-auto pr-1 scrollbar-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-10">
                    {availableItems.map((item) => (
                        <div key={item._id} className="bg-white p-2.5 sm:p-3 rounded-[1.5rem] sm:rounded-3xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="relative shrink-0">
                                    <img src={item.image || `https://ui-avatars.com/api/?name=${item.name}`} loading="lazy" className="w-14 h-14 sm:w-16 h-16 rounded-xl sm:rounded-2xl object-cover border shadow-sm" alt="" />
                                    <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[6px] sm:text-[7px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-md mb-1 inline-block">{item.subCategory}</span>
                                    <h4 className="font-black uppercase text-[10px] sm:text-[11px] italic text-slate-800 leading-tight truncate">{item.name}</h4>
                                    <p className="text-base sm:text-lg font-black text-blue-600 italic mt-0.5">₹{item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border shrink-0">
                                <button onClick={() => removeFromCart(item)} className="p-1"><Minus className="w-3 h-3 sm:w-3.5 h-3.5 text-slate-400" /></button>
                                <span className="text-[10px] sm:text-[11px] font-black min-w-[12px] text-center">{cart[item._id]?.qty || 0}</span>
                                <button onClick={() => addToCart(item)} className="p-1"><Plus className="w-3 h-3 sm:w-3.5 h-3.5 text-slate-400" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      {/* Right Sidebar: Mobile-First Order */}
<div className="order-1 lg:order-2 lg:col-span-4">
  <div className="bg-white p-4 rounded-2xl lg:sticky lg:top-32 shadow-lg border border-slate-100">
    
    {/* 🚀 1. Summary Hide Condition: ఆ రెండు హోటల్స్ కి ఇది కనిపించదు */}
    {owner?.name !== "Amaravathi Hotel" && owner?.name !== "Ruchi Hotel" && (
      <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
        <span className="text-[9px] font-black uppercase text-blue-600 italic tracking-widest">Order Summary</span>
        <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto scrollbar-hide">
          {Object.values(cart).map((i) => (
            <div key={i._id} className="flex justify-between text-[10px] font-bold italic text-slate-600">
              <span>{i.qty} x {i.name}</span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-blue-100 pt-3 space-y-1">
          <div className="flex justify-between text-sm font-black italic text-blue-600">
            <span>Pay Advance (50%):</span>
            <span>₹{halfAmount}</span>
          </div>
        </div>
      </div>
    )}

    {/* 🚀 2. Buttons & Count Logic: ఇక్కడ కౌంట్స్ అన్నీ పక్కాగా వస్తాయి */}
    <div className="flex flex-col gap-2.5 sm:gap-3">
      {(() => {
        // 🏨 Amaravathi Hotel Logic
        if (owner?.name === "Amaravathi Hotel") {
          return (
            <>
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-center">
                <p className="text-[10px] font-black text-orange-600 uppercase italic leading-tight">
                  Only Parcels Available! <br/> No pre-Booking & delivery services 🥡
                </p>
                <p className="text-[8px] font-bold text-orange-400 mt-1 uppercase">* ₹10 Extra parcel cost</p>
              </div>
              {/* 📞 Call Count: trackCallInterest పక్కాగా పనిచేస్తుంది */}
              <a href={`tel:${owner?.phone}`} onClick={trackCallInterest} className="w-full py-3.5 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 shadow-lg tracking-widest bg-blue-600 text-white border-blue-600">
                <PhoneCall className="w-4 h-4" /> Call & Order Now
              </a>
            </>
          );
        }
        
        // 🏨 Ruchi Hotel Logic
        if (owner?.name === "Ruchi Hotel") {
          return (
            <>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p className="text-[9px] font-black text-blue-600 uppercase italic">
                  Pre-book & Orders must be <br/> confirmed by calling owner! 📞
                </p>
              </div>
              <a href={`tel:${owner?.phone}`} onClick={trackCallInterest} className="w-full py-3.5 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 shadow-lg tracking-widest bg-blue-600 text-white border-blue-600">
                <PhoneCall className="w-4 h-4" /> Call to Pre-Book/Order
              </a>
            </>
          );
        }

        // 🏨 Normal Flow for Other Hotels (viti count kuda vasthundi)
        return (
          <>
            {/* ✅ Pre-Book Count: handleConfirmOrder ద్వారా వస్తుంది */}
            <button onClick={() => totalAmount > 0 ? setShowPayWarning(true) : alert("Select items!")} className={`w-full py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${owner?.isStoreOpen && totalAmount > 0 ? 'bg-slate-900 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300'}`}>
              Pre-Book Now
            </button>
            <a href={`tel:${owner?.phone}`} onClick={trackCallInterest} className="w-full py-3.5 rounded-xl font-black uppercase text-[10px] bg-blue-600 text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 border-blue-600">
              <PhoneCall className="w-4 h-4" /> Call to Owner
            </a>
          </>
        );
      })()}
    </div>
  </div>
</div>
      </main>

      {/* Responsive Modals */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" />
            <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full backdrop-blur-md"><X /></button>
          </motion.div>
        )}
      </AnimatePresence>

{/* 💎 Final Premium & Responsive Checkout Modal */}
<AnimatePresence>
  {showOrderForm && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* Backdrop Close logic */}
      <div className="absolute inset-0" onClick={() => setShowOrderForm(false)}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-[400px] p-6 sm:p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-100"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"></div>

        {/* ❌ Close Button - High Z-Index Fix */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            setShowOrderForm(false);
          }}
          className="absolute top-5 right-5 z-[310] p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="mb-6 mt-2">
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Checkout Menu
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Finalize your pre-order</p>
        </div>

        {/* 📋 Bill Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl text-center">
            <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Pay Advance</p>
            <p className="text-lg font-black text-blue-700 italic leading-none">₹{halfAmount}</p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-center">
            <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Pay at Hotel</p>
            <p className="text-lg font-black text-emerald-700 italic leading-none">₹{halfAmount}</p>
          </div>
        </div>

        {/* 🚀 Step 1: Secure Warning & Payment Button */}
        <div className="space-y-4 mb-6">
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl">
            <div className="flex items-center gap-2 mb-1 justify-center text-orange-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase italic tracking-widest">Verification Steps</span>
            </div>
            <p className="text-[8px] font-bold text-orange-700 leading-tight uppercase text-center italic">
              1. Fill Below Details ➜ 2. Send to Owner ➜ 3. After arrival tell Txn ID last 5 digits at restaurant counter for order verification! 📞
            </p>
          </div>
          <div className="w-full h-px bg-slate-100 relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[8px] font-black text-slate-300 uppercase italic">Then Fill Details</span>
          </div>

          {/* 📝 Step 2: Details Form */}
          <div className="grid grid-cols-1 gap-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={orderData.name} 
              onChange={(e)=>setOrderData({...orderData, name:e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
            />
            <input 
              type="number" 
              placeholder="WhatsApp Number" 
              value={orderData.phone} 
              onChange={(e)=>setOrderData({...orderData, phone:e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[11px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Arrival Time you take to reach" 
                value={orderData.arrivalTime} 
                onChange={(e)=>setOrderData({...orderData, arrivalTime:e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
              />
              <input 
                type="number" 
                placeholder="Txn ID (Last 5)" 
                value={orderData.txId} 
                onChange={(e)=>setOrderData({...orderData, txId:e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10px] font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>

        {/* ✅ Step 3: Final Send Action */}
        <button 
          onClick={handleConfirmOrder} 
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
        >
          <Send className="w-4 h-4" /> Send to Owner via WhatsApp
        </button>

        <p className="mt-4 text-[7px] font-bold text-slate-400 uppercase text-center italic leading-relaxed px-4">
          * Order verified only after advanced <span className="text-slate-900 font-black">₹{halfAmount}</span> is paid.
        </p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Payment Warning Modal: Responsive Layout */}
      <AnimatePresence>
        {showPayWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="bg-slate-50 px-6 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-blue-600 italic">Secure Payment</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => <div key={i} className={`w-3 sm:w-4 h-1 rounded-full ${i <= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>)}
                </div>
              </div>
              <div className="p-6 sm:p-8 text-center">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-black uppercase italic text-slate-900 mb-1">Step 1: Confirm First 📞</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Call <span className="text-blue-600 underline">{owner?.name}</span> to check food availability and please dont pay before confirmation.</p>
                  <a href={`tel:${owner?.phone}`} onClick={trackCallInterest} className="mt-3 sm:mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    <PhoneCall className="w-3.5 h-3.5" /> Call Owner
                  </a>
                </div>
                <div className="w-full h-px bg-slate-100 my-4 sm:my-6 relative"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[7px] font-black text-slate-300 uppercase italic">And Then</span></div>
                <div className="mb-4 sm:mb-6 text-center">
                  <h3 className="text-lg sm:text-xl font-black uppercase italic text-slate-900 mb-3">Step 2: Pay Advance 💸</h3>
                  <div className="bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
                      <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Advance: ₹{halfAmount}</p>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tighter mb-4">{owner?.phone}</h2>
                      <button onClick={() => { navigator.clipboard.writeText(owner?.phone); alert(`Copied!`); }} className="w-full py-2.5 bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 active:scale-95">
                        <Plus className="w-3 h-3 rotate-45" /> Copy & Pay
                      </button>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 mb-1 justify-center text-orange-600">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 h-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase italic">Step 3: Copy ID</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] font-bold text-orange-700 leading-tight uppercase italic">Paste the <span className="underline">Last 5 Digits</span> of Txn ID in form.</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <button 
                onClick={() => {
                  setShowPayWarning(false); // వార్నింగ్ క్లోజ్ అవుతుంది
                  setShowOrderForm(true);   // చెక్ అవుట్ ఫామ్ ఓపెన్ అవుతుంది
                }} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] shadow-xl active:scale-95"
              >
                I Paid, Continue
              </button>
                  <button onClick={() => setShowPayWarning(false)} className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 tracking-widest">Cancel Payment</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
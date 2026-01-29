import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Clock, MapPin, Search, Camera, CreditCard, X, PhoneCall, Plus, Minus, ShoppingBag, UtensilsCrossed , MessageSquare, Star} from "lucide-react"; // ✅ Added Icons & UtensilsCrossed

export default function RestaurantProfile() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [itemSearch, setItemSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null); 
  const [showQRModal, setShowQRModal] = useState(false); 

  // ✨ NEW: Smart Calculator State
  const [cart, setCart] = useState({}); 
const [showReviews, setShowReviews] = useState(false); // Toggle logic కోసం
const [newComment, setNewComment] = useState(""); // కొత్త కామెంట్ కోసం
const [isSubmitting, setIsSubmitting] = useState(false); // సబ్మిట్ లోడింగ్ కోసం
  // లైన్ 25 నుండి 45 మధ్యలో కరెక్షన్ చేసాను రాజు..
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const oRes = await api.get(`/owner/${id}`);
        setOwner(oRes.data);

        // 1. అన్ని ఐటమ్స్ తెచ్చుకుంటున్నాం
        const iRes = await api.get("/items/all");

        // 2. పక్కా ఫిల్టర్ లాజిక్ ఇక్కడ ఉంది ✅
        const filteredItems = iRes.data.filter(i => {
          const itemOwnerId = i.ownerId?._id || i.ownerId;
          return itemOwnerId?.toString() === id?.toString();
        });

        // 3. ఫిల్టర్ అయిన ఐటమ్స్ ని సెట్ చేస్తున్నాం
        setItems(filteredItems);
        
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
const handlePostReview = async () => {
  if (!newComment.trim()) return;
  try {
    setIsSubmitting(true);
    const res = await api.post(`/owner/rate-restaurant/${id}`, { 
      comment: newComment,
      rating: 5 // Default గా 5 ఇస్తున్నాం, లేదా నువ్వు రేటింగ్ సెలెక్టర్ పెట్టొచ్చు
    });
    if (res.data.success) {
      alert("Review posted successfully! 🍲");
      setNewComment("");
      // రెస్టారెంట్ డేటా మళ్ళీ లోడ్ చేయడానికి లేదా స్టేట్ అప్‌డేట్ చేయడానికి
      window.location.reload(); 
    }
  } catch (err) {
    console.error("Post Review Error:", err);
  } finally {
    setIsSubmitting(false);
  }
};
  // ✨ Calculator Functions
  const addToCart = (item) => {
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

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
    if (isFavorite) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem("favRestaurants", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const getWaitTime = (status) => {
    if (status === "High") return "30-45 Mins";
    if (status === "Medium") return "15-20 Mins";
    return "5-10 Mins";
  };

  const searchFiltered = items.filter(item => {
    const matchesFilter = filter === "All" ? true : item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableItems = searchFiltered.filter(item => item.isAvailable);
  const soldOutItems = searchFiltered.filter(item => !item.isAvailable);

  const handleGetDirections = () => {
    if (!owner) return;
    const destination = owner.latitude && owner.longitude 
      ? `${owner.latitude},${owner.longitude}` 
      : encodeURIComponent(`${owner.name} ${owner.collegeName}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
  };

  const handleWhatsAppShare = () => {
    const text = `అరేయ్, ఈ మెనూ చూడు: ${owner.name} (${owner.collegeName}). లింక్: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-black animate-pulse uppercase tracking-widest transition-colors duration-500">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#3b82f6]"></div>
      Scanning Menu...
    </div>
  );

  if (!owner) return (
    <div className="h-screen bg-[#020617] text-white flex items-center justify-center font-black uppercase tracking-tighter">
      Restaurant Not Found ❌
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-500">
      <Navbar />
      
      {/* 🏗️ Header Section */}
      <div className="h-[280px] sm:h-[350px] md:h-[450px] flex flex-col items-center justify-center border-b border-indigo-500/20 relative px-4 text-center overflow-hidden">
          {/* ✅ Fixed src="" bug with conditional rendering */}
          {owner.hotelImage ? (
            <div className="absolute inset-0 opacity-30 blur-md overflow-hidden scale-110">
                <img src={owner.hotelImage} className="w-full h-full object-cover" alt="" />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-blue-600/10 blur-[80px] md:blur-[150px] animate-pulse"></div>
          
          <button onClick={toggleFavorite} className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-10 md:right-10 z-20 bg-black/40 p-2.5 sm:p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 transition-all">
            <Heart className={`w-4 h-4 sm:w-5 h-5 md:w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter relative z-10 break-words max-w-full sm:max-w-5xl drop-shadow-2xl px-2">
             {owner.name}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 mt-4 relative z-10">
             <span className="w-6 sm:w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
             <p className="text-indigo-200/60 font-black uppercase tracking-[0.2em] sm:tracking-[0.6em] text-[7px] sm:text-[10px] italic">
                {owner.collegeName} • Exclusive Menu
             </p>
             <span className="w-6 sm:w-10 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
        
        {/* 🥗 Left Content */}
        <div className="order-2 lg:order-1 lg:col-span-8">
            
            {/* ✨ Interior Gallery Section */}
            {owner.interiorImages?.length > 0 && (
              <div className="mb-6 sm:mb-10 bg-[#0f172a]/40 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg sm:rounded-xl">
                    <Camera className="w-4 h-4 sm:w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-white italic">Inside Ambience</h3>
                    <span className="text-[6px] sm:text-[8px] font-bold text-indigo-400/60 uppercase">Check the vibes before you arrive</span>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {owner.interiorImages.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      className="shrink-0 group relative cursor-zoom-in"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedImg(img)}
                    >
                      {/* ✅ Fixed src="" bug */}
                      <img 
                        src={img ? img : null} 
                        className="w-48 h-32 sm:w-56 sm:h-36 md:w-72 md:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] border-2 border-white/5 shadow-2xl transition-all group-hover:border-blue-500/50" 
                        alt="Interior" 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 🔍 Food Search Input */}
            <div className="relative mb-6 group">
                <input 
                    type="text" 
                    placeholder="Search for biryani, pizza, drinks..." 
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-4 sm:py-5 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm font-bold italic outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-2xl backdrop-blur-md"
                />
                <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Search className="h-5 w-5 sm:h-6 w-6" />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-4 scrollbar-hide sticky top-16 sm:top-20 z-20 bg-[#020617]/95 backdrop-blur-xl py-3 sm:py-4 border-b border-indigo-500/20">
              {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border shrink-0 ${
                    filter === cat 
                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                    : "bg-[#1e293b]/40 border-white/10 text-indigo-300/60 hover:border-blue-500/50"
                  }`}
                >
                  {cat === "Veg" ? "🥦 Veg" : cat === "Non-Veg" ? "🥩 Non-Veg" : "🔥 All"}
                </button>
              ))}
            </div>

            {/* 🥗 Live Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {availableItems.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex items-center justify-between gap-3 sm:gap-4 group relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-blue-500/30"
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="relative flex-shrink-0">
                        {/* ✅ Fixed src="" bug with placeholder */}
                        <img 
                          src={item.image ? item.image : "https://via.placeholder.com/150"} 
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1rem] sm:rounded-[1.5rem] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                          alt={item.name} 
                        />
                        <div className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full border-2 border-[#020617] shadow-lg ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black uppercase text-[10px] sm:text-[12px] md:text-sm mb-0.5 truncate text-white tracking-tight">{item.name}</h4>
                         <p className="text-sm sm:text-xl md:text-2xl font-black text-blue-500 italic">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 bg-black/40 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/10 shrink-0">
                      <button onClick={() => removeFromCart(item)} className="p-1 hover:text-red-500 transition-colors">
                        <Minus className="w-3 h-3 sm:w-4 h-4" />
                      </button>
                      <span className="text-[10px] sm:text-xs font-black min-w-[15px] sm:min-w-[20px] text-center">{cart[item._id]?.qty || 0}</span>
                      <button onClick={() => addToCart(item)} className="p-1 hover:text-green-500 transition-colors">
                        <Plus className="w-3 h-3 sm:w-4 h-4" />
                      </button>
                    </div>
                </div>
              ))}
            </div>

            {/* 🔍 NOT FOUND SECTION ✅ */}
            {itemSearch && availableItems.length === 0 && soldOutItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 mt-8"
              >
                <UtensilsCrossed className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-black italic uppercase text-slate-500 tracking-[0.2em]">
                  "{itemSearch}" Not Found
                </h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase mt-3 tracking-widest">
                  This item isn't on the menu today
                </p>
                <button 
                  onClick={() => setItemSearch("")}
                  className="mt-8 px-8 py-3 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-500 font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                >
                  Show Full Menu
                </button>
              </motion.div>
            )}

            {/* 🌑 Sold Out Items Section */}
            {soldOutItems.length > 0 && (
                <>
                    <div className="flex items-center gap-4 mt-8 sm:mt-12 mb-4 sm:mb-6 opacity-40">
                        <h3 className="font-black uppercase italic text-[9px] sm:text-xs tracking-[0.3em] shrink-0">Sold Out</h3>
                        <div className="h-[1px] w-full bg-white/10"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {soldOutItems.map((item) => (
                            <div key={item._id} className="bg-white/5 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex items-center justify-between gap-4 opacity-50 grayscale">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="relative flex-shrink-0">
                                        <img src={item.image ? item.image : "https://via.placeholder.com/150"} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1rem] sm:rounded-[1.5rem] object-cover" alt={item.name} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black uppercase text-[10px] sm:text-xs text-white/60 tracking-tight">{item.name}</h4>
                                        <p className="text-sm sm:text-xl font-black text-slate-600 italic">₹{item.price}</p>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-tighter border bg-red-500/10 text-red-500 border-red-500/20">Empty</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
{/***! reviews section start */}
{/* ⭐ User Reviews Section - Clean Toggle & Input Feature */}
<div className="mt-16 border-t border-indigo-500/10 pt-10">
  
  {/* 🔗 Toggle Link */}
  <button 
    onClick={() => setShowReviews(!showReviews)}
    className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 hover:text-white transition-all group mb-8"
  >
    <MessageSquare className={`w-4 h-4 ${showReviews ? 'fill-blue-500' : ''}`} />
    {showReviews ? "Close Reviews" : "Read & Write Reviews"}
    <Plus className={`w-3 h-3 transition-transform duration-500 ${showReviews ? 'rotate-45' : ''}`} />
  </button>

  <AnimatePresence>
    {showReviews && (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* ✍️ Post a Review Form */}
          <div className="bg-white/5 p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-5 rotate-12">
               <UtensilsCrossed className="w-24 h-24 text-blue-500" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 italic">Share Your Vibe</h4>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="How's the food? Service? Ambience? Type here..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs sm:text-sm font-medium outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none placeholder:text-slate-700"
            />
           <button 
  type="button" // ఫార్మ్ రీలోడ్ అవ్వకుండా
  onClick={handlePostReview} // <--- కచ్చితంగా ఇది ఉండాలి రాజు! ✅
  disabled={!newComment.trim() || isSubmitting}
  className="mt-6 w-full py-4 bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-500/20"
>
  {isSubmitting ? "Syncing..." : "Post Review"}
</button>
          </div>

          {/* ⭐ Review Statistics Summary */}
          <div className="bg-blue-600/5 p-8 rounded-[2rem] border border-blue-500/10 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8 text-blue-500 fill-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-5xl font-black italic">{owner.averageRating?.toFixed(1) || "0.0"}</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 opacity-60">Global Student Rating</p>
             <p className="mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{owner.reviews?.length || 0} Total Feedbacks</p>
          </div>
        </div>

        {/* 📜 Display Reviews List */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide mb-10">
          <div className="flex items-center gap-4 mb-6">
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Recent Stories</span>
             <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          
          {owner.reviews?.length > 0 ? (
            owner.reviews.map((rev, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx} 
                className="bg-[#0f172a]/40 p-6 rounded-[1.8rem] border border-white/5 flex flex-col gap-4 group hover:border-blue-500/20 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 italic">Verified Peer</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed group-hover:text-white transition-colors font-medium">"{rev.comment}"</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-[2.5rem]">
              <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
              <p className="text-slate-600 italic uppercase text-[10px] font-black tracking-widest">The wall is empty. Be the first to shout!</p>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
{/* !! review section close */}
        </div>

        {/* 📞 Right Sidebar */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           <div className="bg-[#0f172a] text-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] lg:sticky lg:top-32 shadow-[0_20px_50px_rgba(59,130,246,0.1)] border-2 sm:border-4 border-indigo-500/10 transition-all duration-500">
             
              {/* ✨ SMART CALCULATOR SUMMARY */}
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-600/10 border-2 border-dashed border-blue-500/30">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 h-4 text-blue-500" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-300 italic">Pre-Order Summary</span>
                </div>
                
                <div className="space-y-2 mb-3 sm:mb-4 max-h-32 sm:max-h-40 overflow-y-auto scrollbar-hide">
                  {Object.values(cart).length > 0 ? (
                    Object.values(cart).map((i) => (
                      <div key={i._id} className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-300">
                        <span className="truncate pr-2">{i.qty} x {i.name}</span>
                        <span className="shrink-0">₹{i.price * i.qty}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[8px] sm:text-[9px] text-slate-500 italic text-center py-2">Select items from menu</p>
                  )}
                </div>

                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="flex justify-between text-[8px] sm:text-[10px] font-black uppercase text-slate-400 mb-1">
                    <span>Grand Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl font-black italic text-blue-500">
                    <span>Advance (50%):</span>
                    <span>₹{halfAmount}</span>
                  </div>
                </div>
              </div>

              {/* Wait Time Display */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 bg-blue-600/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-3.5 h-3.5 sm:w-4 h-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-indigo-300">Wait Time</span>
                    <span className={`text-[7px] font-black uppercase italic ${
                      owner.busyStatus === 'High' ? 'text-red-500' : 
                      owner.busyStatus === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {owner.busyStatus} Rush
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-[12px] font-black text-white italic block">{getWaitTime(owner.busyStatus)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                    onClick={() => {
                      if(totalAmount > 0) setShowQRModal(true);
                      else alert("Please select food Items before Call! 🍲");
                    }}
                    className={`w-full block py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] transition-all shadow-xl ${
                    owner.isStoreOpen && totalAmount > 0
                    ? 'bg-blue-600 text-white hover:bg-indigo-600 shadow-blue-500/20 border border-blue-400/30 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                >
                    {owner.isStoreOpen ? '📞 Call to Order' : 'Offline'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleGetDirections} className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[9px] sm:text-[10px] bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all">
                      📍 Route
                  </button>
                  <button onClick={handleWhatsAppShare} className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[9px] sm:text-[10px] bg-green-600/10 border border-green-500/20 text-green-500 hover:bg-green-600/20 active:scale-95 transition-all">
                      Share
                  </button>
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* 🚀 SMART PAYMENT MODAL */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f172a] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-blue-500/30 relative shadow-2xl text-center scrollbar-hide"
            >
              <button onClick={() => setShowQRModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-500 hover:text-white transition-colors p-2">
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>

              <h2 className="text-lg sm:text-xl font-black italic uppercase text-white mb-1">Pay ₹{halfAmount} Now</h2>
              <p className="text-[7px] sm:text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-4 sm:mb-6 underline decoration-blue-500/30">Scan and complete your pre-order</p>

              <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl inline-block mb-4 sm:mb-6 group">
                {/* ✅ Fixed QR Check */}
                <img src={owner.upiQR ? owner.upiQR : null} className="w-40 h-40 sm:w-56 sm:h-56 object-contain" alt="Payment QR" />
              </div>

              <div className="bg-blue-600/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-500/10 text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0">1</span>
                  <p>Pay <span className="text-blue-500 font-black italic">₹{halfAmount}</span> via QR.</p>
                </div>
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0">2</span>
                  <p>Take a <span className="text-white font-black">Screenshot</span> of payment.</p>
                </div>
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0">3</span>
                  <p className="leading-normal">Call owner & confirm order.</p>
                </div>
              </div>

              <a 
                href={`tel:${owner.phone}`}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-[0.1em] sm:tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                <PhoneCall className="w-4 h-4 sm:w-5 h-5" /> Call Owner Now
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🖼️ Image Zoom Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.img 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              src={selectedImg ? selectedImg : null} className="max-w-full max-h-[85vh] sm:max-h-full rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
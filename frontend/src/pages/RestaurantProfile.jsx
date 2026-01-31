import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Clock, MapPin, Search, Camera, CreditCard, X, PhoneCall, Plus, Minus, ShoppingBag, UtensilsCrossed , MessageSquare, Star} from "lucide-react"; 

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

  const [cart, setCart] = useState({}); 
  const [showReviews, setShowReviews] = useState(false); 
  const [newComment, setNewComment] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const oRes = await api.get(`/owner/${id}`);
        setOwner(oRes.data);

        const iRes = await api.get("/items/all");
        const filteredItems = iRes.data.filter(i => {
          const itemOwnerId = i.ownerId?._id || i.ownerId;
          return itemOwnerId?.toString() === id?.toString();
        });

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
      
      // ✅ రాజు, ఇక్కడ రూట్ మార్చాను. నీ బ్యాకెండ్ లో '/review/:id' అని ఉంది.
      const res = await api.post(`/owner/review/${id}`, { 
        comment: newComment,
        rating: 5 
      });

      if (res.data.success) {
        alert("Review posted successfully! 🍲");
        setNewComment("");
        // పేజీ రిఫ్రెష్ అవ్వకుండానే కొత్త డేటా కనిపించేలా fetchData ని మళ్ళీ పిలవచ్చు
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Post Review Error:", err);
      alert("Review పోస్ట్ అవ్వలేదు బాడీ, ఒక్కసారి బ్యాకెండ్ చెక్ చెయ్!");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="h-screen bg-white text-slate-900 flex flex-col items-center justify-center font-black animate-pulse uppercase tracking-widest">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
      Scanning Menu...
    </div>
  );

  if (!owner) return (
    <div className="h-screen bg-white text-slate-900 flex items-center justify-center font-black uppercase tracking-tighter">
      Restaurant Not Found ❌
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-500">
      <Navbar />
      
      {/* 🏗️ Header Section */}
      <div className="h-[280px] sm:h-[350px] md:h-[450px] flex flex-col items-center justify-center border-b border-slate-100 relative px-4 text-center overflow-hidden bg-slate-50">
          {owner.hotelImage ? (
            <div className="absolute inset-0 opacity-40 blur-md overflow-hidden scale-110">
                <img src={owner.hotelImage} className="w-full h-full object-cover" alt="" />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
          
          <button onClick={toggleFavorite} className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-10 md:right-10 z-20 bg-white shadow-xl p-2.5 sm:p-3 md:p-4 rounded-full border border-slate-100 hover:scale-110 transition-all">
            <Heart className={`w-4 h-4 sm:w-5 h-5 md:w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
          </button>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter relative z-10 text-slate-900 drop-shadow-sm px-2">
             {owner.name}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 mt-4 relative z-10">
             <span className="w-6 sm:w-10 h-[2px] bg-blue-600 shadow-sm"></span>
             <p className="text-slate-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.6em] text-[7px] sm:text-[10px] italic">
                {owner.collegeName} • Exclusive Menu
             </p>
             <span className="w-6 sm:w-10 h-[2px] bg-blue-600 shadow-sm"></span>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
        
        {/* 🥗 Left Content */}
        <div className="order-2 lg:order-1 lg:col-span-8">
            
            {/* ✨ Interior Gallery Section */}
            {owner.interiorImages?.length > 0 && (
              <div className="mb-6 sm:mb-10 bg-slate-50 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                    <Camera className="w-4 h-4 sm:w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-slate-900 italic">Inside Ambience</h3>
                    <span className="text-[6px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tight">Check the vibes before you arrive</span>
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
                      <img 
                        src={img ? img : null} 
                        className="w-48 h-32 sm:w-56 sm:h-36 md:w-72 md:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm transition-all group-hover:border-blue-300" 
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
                    className="w-full bg-slate-50 border border-slate-200 py-4 sm:py-5 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm font-bold italic outline-none focus:border-blue-300 transition-all placeholder:text-slate-300 shadow-sm"
                />
                <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Search className="h-5 w-5 sm:h-6 w-6" />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-4 scrollbar-hide sticky top-16 sm:top-20 z-20 bg-white/90 backdrop-blur-xl py-3 sm:py-4 border-b border-slate-100">
              {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                    filter === cat 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300"
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
                  className="bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex items-center justify-between gap-3 sm:gap-4 group relative overflow-hidden transition-all hover:shadow-xl hover:border-blue-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image ? item.image : "https://via.placeholder.com/150"} 
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1rem] sm:rounded-[1.5rem] object-cover border border-slate-50 shadow-sm transition-transform duration-500 group-hover:scale-105" 
                          alt={item.name} 
                        />
                        <div className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-black uppercase text-[10px] sm:text-[12px] md:text-sm mb-0.5 truncate text-slate-900 tracking-tight italic">{item.name}</h4>
                         <p className="text-sm sm:text-xl md:text-2xl font-black text-blue-600 italic">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200 shrink-0 shadow-sm">
                      <button onClick={() => removeFromCart(item)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                        <Minus className="w-3 h-3 sm:w-4 h-4" />
                      </button>
                      <span className="text-[10px] sm:text-xs font-black min-w-[15px] sm:min-w-[20px] text-center text-slate-700">{cart[item._id]?.qty || 0}</span>
                      <button onClick={() => addToCart(item)} className="p-1 text-slate-400 hover:text-green-600 transition-colors">
                        <Plus className="w-3 h-3 sm:w-4 h-4" />
                      </button>
                    </div>
                </div>
              ))}
            </div>

            {/* 🔍 NOT FOUND SECTION */}
            {itemSearch && availableItems.length === 0 && soldOutItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 mt-8"
              >
                <UtensilsCrossed className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-[0.2em]">
                  "{itemSearch}" Not Found
                </h3>
                <p className="text-[10px] font-bold text-slate-300 uppercase mt-3 tracking-widest">
                  This item isn't on the menu today
                </p>
                <button 
                  onClick={() => setItemSearch("")}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full text-blue-500 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Show Full Menu
                </button>
              </motion.div>
            )}

            {/* 🌑 Sold Out Items Section */}
            {soldOutItems.length > 0 && (
                <>
                    <div className="flex items-center gap-4 mt-8 sm:mt-12 mb-4 sm:mb-6 opacity-40">
                        <h3 className="font-black uppercase italic text-[9px] sm:text-xs tracking-[0.3em] shrink-0 text-slate-500">Sold Out</h3>
                        <div className="h-[1px] w-full bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {soldOutItems.map((item) => (
                            <div key={item._id} className="bg-slate-50 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex items-center justify-between gap-4 opacity-50 grayscale">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="relative flex-shrink-0">
                                        <img src={item.image ? item.image : "https://via.placeholder.com/150"} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1rem] sm:rounded-[1.5rem] object-cover" alt={item.name} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black uppercase text-[10px] sm:text-xs text-slate-500 tracking-tight italic">{item.name}</h4>
                                        <p className="text-sm sm:text-xl font-black text-slate-400 italic">₹{item.price}</p>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-tighter border bg-slate-200 text-slate-400 border-slate-300">Empty</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ⭐ User Reviews Section */}
<div className="mt-16 border-t border-slate-100 pt-10 relative">
  <button 
    onClick={() => setShowReviews(!showReviews)}
    className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-slate-900 transition-all group mb-8 relative z-10"
  >
    <MessageSquare className={`w-4 h-4 transition-all duration-300 ${showReviews ? 'fill-blue-600' : ''}`} />
    {showReviews ? "Close Reviews" : "Read & Write Reviews"}
    <Plus className={`w-3 h-3 transition-transform duration-500 ${showReviews ? 'rotate-45 text-red-500' : ''}`} />
  </button>

  <AnimatePresence>
    {showReviews && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 italic">Share Your Vibe</h4>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="How's the food? Service? Ambience?"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm font-medium outline-none focus:border-blue-400 transition-all min-h-[120px] resize-none shadow-sm"
            />
            <button 
              type="button" 
              onClick={handlePostReview}
              disabled={!newComment.trim() || isSubmitting}
              className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 disabled:opacity-30 active:scale-95 transition-all"
            >
              {isSubmitting ? "Syncing..." : "Post Review"}
            </button>
          </motion.div>

          {/* <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
             <Star className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-100 rotate-12" />
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <Star className="w-8 h-8 text-blue-600 fill-blue-600 drop-shadow-sm" />
                <span className="text-5xl font-black italic text-slate-900">{owner.averageRating?.toFixed(1) || "5.0"}</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 opacity-60 relative z-10">Campus Rating</p>
          </div> */}
        </div>

        {/* --- Scrollable Review List with Masking --- */}
        <div className="relative mt-10">
          <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white z-20 py-4">
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Recent Stories</span>
             <div className="h-[1px] flex-1 bg-slate-50"></div>
          </div>
          
          {/* ✅ Masking container to hide reviews while scrolling outside the box */}
          <div className="relative max-h-[450px] overflow-hidden rounded-[2rem]">
            <div className="max-h-[450px] overflow-y-auto pr-4 scrollbar-custom space-y-6 pb-10">
              {owner.reviews?.length > 0 ? (
                owner.reviews.map((rev, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="bg-slate-50/50 p-6 rounded-[1.8rem] border border-slate-100 flex flex-col gap-4 group hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 italic">Student Peer</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 italic leading-relaxed font-medium">"{rev.comment}"</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-slate-100 rounded-[2.5rem]">
                  <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-300 italic uppercase text-[10px] font-black tracking-widest">The wall is empty.</p>
                </div>
              )}
            </div>
            
            {/* ✅ Bottom Fade Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

        </div>

        {/* 📞 Right Sidebar */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] lg:sticky lg:top-32 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-500">
             
              {/* ✨ SMART CALCULATOR SUMMARY */}
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-50 border-2 border-dashed border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 h-4 text-blue-600" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Pre-Order Summary</span>
                </div>
                
                <div className="space-y-2 mb-3 sm:mb-4 max-h-32 sm:max-h-40 overflow-y-auto scrollbar-hide">
                  {Object.values(cart).length > 0 ? (
                    Object.values(cart).map((i) => (
                      <div key={i._id} className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-700">
                        <span className="truncate pr-2 italic">{i.qty} x {i.name}</span>
                        <span className="shrink-0 font-black">₹{i.price * i.qty}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[8px] sm:text-[9px] text-slate-300 italic text-center py-2">Select items from menu</p>
                  )}
                </div>

                <div className="border-t border-blue-100 pt-3 mt-3">
                  <div className="flex justify-between text-[8px] sm:text-[10px] font-black uppercase text-slate-400 mb-1">
                    <span>Grand Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl font-black italic text-slate-900">
                    <span>Advance (50%):</span>
                    <span className="text-blue-600">₹{halfAmount}</span>
                  </div>
                </div>
              </div>

              {/* Wait Time Display */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-3.5 h-3.5 sm:w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Wait Time</span>
                    <span className={`text-[7px] font-black uppercase italic ${
                      owner.busyStatus === 'High' ? 'text-red-500' : 
                      owner.busyStatus === 'Medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {owner.busyStatus} Rush
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-[12px] font-black text-slate-900 italic block">{getWaitTime(owner.busyStatus)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                    onClick={() => {
                      if(totalAmount > 0) setShowQRModal(true);
                      else alert("Please select food Items before Call! 🍲");
                    }}
                    className={`w-full block py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[10px] sm:text-[11px] tracking-[0.1em] transition-all shadow-xl ${
                    owner.isStoreOpen && totalAmount > 0
                    ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200 active:scale-95' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                    }`}
                >
                    {owner.isStoreOpen ? '📞 Call to Order' : 'Offline'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleGetDirections} className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[9px] sm:text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                      📍 Route
                  </button>
                  <button onClick={handleWhatsAppShare} className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-center text-[9px] sm:text-[10px] bg-green-50 border border-green-100 text-green-600 hover:bg-green-100 transition-all shadow-sm">
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
            className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 relative shadow-2xl text-center scrollbar-hide"
            >
              <button onClick={() => setShowQRModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-slate-300 hover:text-slate-900 transition-colors p-2">
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>

              <h2 className="text-lg sm:text-xl font-black italic uppercase text-slate-900 mb-1">Pay ₹{halfAmount} Now</h2>
              <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">Scan and complete your pre-order</p>

              <div className="bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl inline-block mb-4 sm:mb-6 border border-slate-50">
                <img src={owner.upiQR ? owner.upiQR : null} className="w-40 h-40 sm:w-56 sm:h-56 object-contain" alt="Payment QR" />
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8 shadow-sm">
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">1</span>
                  <p>Pay <span className="text-blue-600 font-black italic">₹{halfAmount}</span> via QR.</p>
                </div>
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">2</span>
                  <p>Take a <span className="text-slate-900 font-black">Screenshot</span> of payment.</p>
                </div>
                <div className="flex items-start gap-3 text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">
                  <span className="w-4 h-4 sm:w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">3</span>
                  <p className="leading-normal">Call owner & tell your items with transaction ID last 5 digits and tell your arrival time, confirm order.</p>
                </div>
              </div>

              <a 
                href={`tel:${owner.phone}`}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-slate-900 hover:bg-blue-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-widest shadow-xl transition-all active:scale-95 shadow-slate-200"
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
            className="fixed inset-0 z-[120] bg-white/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.img 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              src={selectedImg ? selectedImg : null} className="max-w-full max-h-[85vh] sm:max-h-full rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
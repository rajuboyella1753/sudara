import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Clock, MapPin, Search, Camera, CreditCard, X, PhoneCall, Plus, Minus, ShoppingBag, UtensilsCrossed , MessageSquare, Star, Send, Navigation} from "lucide-react"; 

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
  const [showQRModal, setShowQRModal] = useState(false); 
  const [cart, setCart] = useState({}); 
  const [showReviews, setShowReviews] = useState(false); 
  const [newComment, setNewComment] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({ name: "", phone: "", txId: "", arrivalTime: "" });
  const [showPayWarning, setShowPayWarning] = useState(false); // 🚀 కొత్తగా ఇది యాడ్ చెయ్
  // const subCategories = ["Biryanis", "Starters","Soups", "Noodles", "Gravys", "Rice", "Breads", "Sea Food"];
  const availableSubCats = useMemo(() => {
  const catsInMenu = items.map(item => item.subCategory);
  return ["Biryanis", "Starters", "Soups", "Noodles", "Gravys", "Rice", "Breads", "Sea Food"].filter(cat => 
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
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "call_click",
      date: today 
    });
  } catch (err) {
    console.log("Call tracking failed");
  }
};
// RestaurantProfile.jsx లో సుమారు 63వ లైన్
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
      // 🚀 రాజు, ఇక్కడ సెకన్ల వ్యవధిలో లోడింగ్ ఆగిపోతుంది
      setLoading(false);
    }
  };

  if (id) fetchData();
}, [id]);

  const handlePostReview = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await api.post(`/owner/review/${id}`, { comment: newComment, rating: 5 });
      if (res.data.success) {
        alert("Review posted successfully! 🍲");
        setNewComment("");
        window.location.reload(); 
      }
    } catch (err) { console.error("Error:", err); } 
    finally { setIsSubmitting(false); }
  };

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
// ✅ ఈ ఫంక్షన్‌ని ఇక్కడ యాడ్ చెయ్ రాజు
const handleGetDirections = () => {
  if (!owner?.latitude || !owner?.longitude) return alert("Location not set!");
  // ఇక్కడ 1 తీసేసి saddr=My+Location వాడాను, ఇది నీ కరెంట్ ప్లేస్ నుండి రూట్ చూపిస్తుంది
  const url = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${owner.latitude},${owner.longitude}&travelmode=walking`;
  window.open(url, "_blank");
};
  
  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
    if (isFavorite) favorites = favorites.filter(favId => favId !== id);
    else favorites.push(id);
    localStorage.setItem("favRestaurants", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const handleShareRestaurant = () => {
    const shareText = `అరేయ్, ఈ హోటల్ చూడు సూపర్ ఉంది! 😍\n\n🏨 *${owner?.name}*\n📍 ${owner?.collegeName}\n\nమెనూ చూడటానికి ఇక్కడ క్లిక్ చేయి: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: owner?.name, text: shareText, url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

 const handleDirectUPI = () => {
  const upiID = owner?.upiID; 
  if(!upiID) return alert("Owner UPI ID not found! ❌");
  const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(owner?.name)}&cu=INR&tn=PreOrder_${encodeURIComponent(owner?.name)}`;
  window.location.href = upiUrl;
};

const handleConfirmOrder = async () => {
  if (!orderData.name || !orderData.phone || !orderData.txId) return alert("Please fill details! 📝");
  
  // 🚀 తేడా ఇక్కడ ఉంది: యూజర్ కి ఇన్స్ట్రక్షన్ ఇస్తున్నాం
  const userReady = window.confirm(
    "ORDER READY! ✅\n\nNext Step: We will open WhatsApp. After sending the message, please CALL THE OWNER immediately to confirm if your food/table is ready.\n\nProceed to WhatsApp?"
  );

  if (!userReady) return;

  try {
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/');
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "pre_order_click", 
      date: today 
    });
  } catch (err) {
    console.log("Analytics error");
  }

  const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`).join(", ");
  
  // 🚀 తేడా ఇక్కడ ఉంది: ఓనర్ కి ముందే కాల్ వస్తుందని హింట్ ఇస్తున్నాం
  const message = `*NEW PRE-ORDER - SUDARA HUB*\n\n*Name:* ${orderData.name}\n*Phone:* ${orderData.phone}\n*Items:* ${itemList}\n\n*Total Bill:* ₹${totalAmount}\n*Advance Paid (50%):* ₹${halfAmount}\n*Remaining to Pay:* ₹${halfAmount}\n*Txn ID:* ${orderData.txId}\n*Arrival Time:* ${orderData.arrivalTime}\n\n_Note: I am calling you now for instant confirmation!_`;
  
  window.open(`https://wa.me/${owner?.phone}?text=${encodeURIComponent(message)}`, "_blank");
  setShowOrderForm(false);
};

  // ✅ Performance Fix: Using useMemo for filtering logic
  const searchFiltered = useMemo(() => {
    return items.filter(item => {
      const matchesFilter = filter === "All" ? true : item.category === filter;
      const matchesSubCat = activeSubCat === "All" ? true : item.subCategory === activeSubCat;
      const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
      return matchesFilter && matchesSubCat && matchesSearch;
    });
  }, [items, filter, activeSubCat, itemSearch]);

  const availableItems = searchFiltered.filter(item => item.isAvailable);
  const soldOutItems = searchFiltered.filter(item => !item.isAvailable);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest text-[10px]">Scanning Menu...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      
      {/* --- HEADER SECTION --- */}
      <div className="relative h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden bg-slate-100">
          {owner?.hotelImage && <img src={owner.hotelImage} loading="eager" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[1px]" alt="" />}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10"></div>
          <div className="relative z-10 text-center px-4">
              <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{owner?.name}</h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-xs mt-3">{owner?.collegeName} • Exclusive Menu</p>
          </div>
          <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button onClick={handleShareRestaurant} className="bg-white p-2.5 rounded-full shadow-md text-slate-600 border"><Share2 className="w-4 h-4" /></button>
              
              {/* ✅ Directions Fix: Show route from user to restaurant */}
              {/* <button 
  onClick={handleGetDirections} 
  className="bg-white p-2.5 rounded-full shadow-md text-blue-600 border"
>
  <Navigation className="w-4 h-4" />
</button> */}
              {/* <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${owner.latitude},${owner.longitude}`)} className="bg-white p-2.5 rounded-full shadow-md text-blue-600 border"><Navigation className="w-4 h-4" /></button> */}
              <button onClick={toggleFavorite} className="bg-white p-2.5 rounded-full shadow-md border"><Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} /></button>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT CONTENT --- */}
        <div className="order-2 lg:order-1 lg:col-span-8 space-y-8">
            {owner?.interiorImages?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3"><h3 className="text-xs font-black uppercase text-slate-800 tracking-widest italic">Restaurant Ambience</h3></div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {owner.interiorImages.map((img, idx) => (
                    <img key={idx} src={img} loading="lazy" onClick={() => setSelectedImg(img)} className="w-72 h-48 object-cover rounded-[2rem] border shadow-sm shrink-0 cursor-zoom-in" alt="" />
                  ))}
                </div>
              </div>
            )}

            {/* Sticky Search & Filter Section */}
            <div className="sticky top-20 z-30 bg-white/95 py-2 border-b space-y-4 backdrop-blur-md">
                <div className="relative">
                    <input type="text" placeholder="Search dish..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="w-full bg-slate-50 border py-3 px-10 rounded-full text-xs font-bold outline-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {["All", "Veg", "Non-Veg"].map((cat) => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all shrink-0 ${filter === cat ? "bg-slate-900 text-white" : "bg-white text-slate-400"}`}>{cat}</button>
                  ))}
                </div>

                {/* <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setActiveSubCat("All")} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === "All" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}>All Menu</button>
                    {subCategories.map(sub => (
                      <button key={sub} onClick={() => setActiveSubCat(sub)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === sub ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}>{sub}</button>
                    ))}
                </div> */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button 
      onClick={() => setActiveSubCat("All")} 
      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === "All" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}
    >
      All Menu
    </button>

    {/* ✅ ఇక్కడ అందుబాటులో ఉన్న కేటగిరీలు మాత్రమే లూప్ అవుతాయి */}
    {availableSubCats.map(sub => (
      <button 
        key={sub} 
        onClick={() => setActiveSubCat(sub)} 
        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === sub ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}
      >
        {sub}
      </button>
    ))}
</div>
            </div>

            {/* Items Grid */}
            <div className="max-h-[800px] overflow-y-auto pr-1 scrollbar-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                    {availableItems.map((item) => (
                        <div key={item._id} className="bg-white p-3 rounded-3xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative shrink-0">
                                    <img src={item.image || `https://ui-avatars.com/api/?name=${item.name}`} loading="lazy" className="w-16 h-16 rounded-2xl object-cover border shadow-sm" alt="" />
                                    <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[7px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-md mb-1 inline-block">{item.subCategory}</span>
                                    <h4 className="font-black uppercase text-[11px] italic text-slate-800 leading-tight break-words">{item.name}</h4>
                                    <p className="text-lg font-black text-blue-600 italic mt-1">₹{item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border shrink-0">
                                <button onClick={() => removeFromCart(item)} className="p-1"><Minus className="w-3.5 h-3.5 text-slate-400" /></button>
                                <span className="text-[11px] font-black min-w-[15px] text-center">{cart[item._id]?.qty || 0}</span>
                                <button onClick={() => addToCart(item)} className="p-1"><Plus className="w-3.5 h-3.5 text-slate-400" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ✅ Campus Stories Section - Commented as requested */}
            {/* <div className="mt-8 border-t pt-6">
                <button onClick={() => setShowReviews(!showReviews)} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 mb-6">{showReviews ? "Close Reviews" : "Campus Stories"} <Plus className={`w-3 h-3 transition-all ${showReviews ? 'rotate-45 text-red-500' : ''}`} /></button>
                <AnimatePresence>
                    {showReviews && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border">
                                <textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="How was it?" className="w-full bg-white p-3 rounded-xl text-xs outline-none h-20 mb-3" />
                                <button onClick={handlePostReview} disabled={isSubmitting} className="w-full bg-slate-900 text-white py-3 rounded-lg font-black uppercase text-[9px]">{isSubmitting ? "..." : "Post Review"}</button>
                            </div>
                            {owner?.reviews?.map((rev, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl mb-3 border shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-blue-600 uppercase">Student Peer • {new Date(rev.createdAt).toLocaleDateString()}</span>
                                    <p className="text-xs italic font-medium">"{rev.comment}"</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div> 
            */}
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        
<div className="order-1 lg:order-2 lg:col-span-4">
  <div className="bg-white p-4 rounded-2xl lg:sticky lg:top-32 shadow-lg border border-slate-100">
    <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
      <span className="text-[9px] font-black uppercase text-blue-600 italic">Order Summary</span>
      <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto">
        {Object.values(cart).map((i) => (
          <div key={i._id} className="flex justify-between text-[10px] font-bold italic text-slate-600">
            <span>{i.qty} x {i.name}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
      </div>

    {/* సుమారు లైన్ 255 దగ్గర vethuku */}
          <div className="border-t border-blue-100 pt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-black italic text-slate-500">
              <span>Total Bill Amount:</span>
              <span>₹{totalAmount}</span>
            </div>
            
            {/* ఇక్కడ Advance అని క్లియర్ గా పెట్టాను */}
            <div className="flex justify-between text-base font-black italic text-blue-600">
              <span>Pay Advance (50%):</span>
              <span>₹{halfAmount}</span>
            </div>

            {/* కింద ఈ లైన్ కొత్తగా యాడ్ చెయ్ */}
            <p className="text-[8px] font-bold text-slate-400 uppercase text-right italic">
              *Pay remaining ₹{halfAmount} at restaurant
            </p>
          </div>

    </div>
    
    <div className="flex flex-col gap-3">
      <button onClick={() => totalAmount > 0 ? setShowOrderForm(true) : alert("Select items!")} className={`w-full py-3 rounded-lg font-black uppercase text-[10px] tracking-widest ${owner?.isStoreOpen && totalAmount > 0 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>Pre-Book Now</button>
      <a 
        href={`tel:${owner?.phone}`} 
        onClick={trackCallInterest} // 🎯 ఇక్కడ ఫంక్షన్ పిలుస్తున్నాం
        className="w-full py-3 rounded-lg font-black uppercase text-[10px] tracking-widest bg-blue-600 text-white shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
      >
        <PhoneCall className="w-3.5 h-3.5" /> Call to Owner for Order
      </a>
    </div>
  </div>
</div>

      </main>

      {/* ✅ RESTORED IMAGE SELECTION MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
            <button className="absolute top-10 right-10 text-white bg-white/10 p-4 rounded-full backdrop-blur-md hover:bg-white/20 transition-all"><X /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER MODAL */}
{/* ORDER MODAL */}
<AnimatePresence>
  {showOrderForm && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-2xl relative">
        <button onClick={() => setShowOrderForm(false)} className="absolute top-4 right-4 text-slate-300"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-black italic uppercase mb-6">Checkout</h2>

        {/* ✅ Adding only this feature as requested */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 space-y-2">
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 animate-pulse"></div>
            <p className="text-[10px] text-blue-700 font-bold leading-tight uppercase">
              Pay <span className="text-blue-900 underline">₹{halfAmount}</span> now as an advance to confirm your booking food.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-600 mt-1"></div>
            <p className="text-[10px] text-green-700 font-bold leading-tight uppercase">
              Pay remaining <span className="text-green-900">₹{halfAmount}</span> at the restaurant.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
  {/* 🚀 Modern Payment Button */}
  <button 
    onClick={() => setShowPayWarning(true)} 
    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800"
  >
    <span className="flex items-center gap-2">
      <CreditCard className="w-4 h-4" /> Pay Advance ₹{halfAmount}
    </span>
    <span className="text-[7px] opacity-70 normal-case tracking-normal">Secured via UPI Transfer</span>
  </button>

  {/* Form Fields with Floating-like Style */}
  <div className="grid grid-cols-1 gap-3">
    {/* Name Input */}
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <Clock className="w-4 h-4" /> {/* You can use User icon if imported */}
      </div>
      <input 
        type="text" 
        placeholder="Full Name" 
        value={orderData.name} 
        onChange={(e)=>setOrderData({...orderData, name:e.target.value})} 
        className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
      />
    </div>

    {/* WhatsApp No */}
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <MessageSquare className="w-4 h-4" />
      </div>
      <input 
        type="number" 
        placeholder="WhatsApp Number" 
        value={orderData.phone} 
        onChange={(e)=>setOrderData({...orderData, phone:e.target.value})} 
        className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      {/* Arrival Time */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Clock className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder="Arrival Time" 
          value={orderData.arrivalTime} 
          onChange={(e)=>setOrderData({...orderData, arrivalTime:e.target.value})} 
          className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 rounded-2xl text-[10px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
        />
      </div>

      {/* Txn ID */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Star className="w-4 h-4" />
        </div>
        <input 
          type="number" 
          placeholder="Last 5 digits" 
          value={orderData.txId} 
          onChange={(e)=>setOrderData({...orderData, txId:e.target.value})} 
          className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 rounded-2xl text-[10px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
        />
      </div>
    </div>
  </div>
</div>

        <button onClick={handleConfirmOrder} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send to owner</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* 🚀 Modern Student-Focused Security Modal */}
<AnimatePresence>
  {showPayWarning && (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 relative"
      >
        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>

        <div className="p-8 text-center">
          {/* Animated Icon Container */}
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-orange-100 relative">
            <PhoneCall className="w-10 h-10 text-orange-600 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter">Required</div>
          </div>
          
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-3">
            Wait! Did you check? 🛑
          </h3>
          
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase mb-8">
            To avoid payment issues, please <span className="text-slate-900 underline">Call the Owner</span> first to confirm if the restaurant is <span className="text-green-600">Open</span> and your food is <span className="text-green-600">Available</span>.
          </p>

          <div className="space-y-3">
            {/* Primary Action: Call */}
            <a 
              href={`tel:${owner?.phone}`} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4" /> Call Owner Now
            </a>
            
            {/* Secondary Action: Already Called */}
            <button 
              onClick={() => {
                setShowPayWarning(false);
                handleDirectUPI(); 
              }} 
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Yes, I've Confirmed
            </button>
            
            {/* Cancel Link */}
            <button 
              onClick={() => setShowPayWarning(false)} 
              className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors pt-2 tracking-widest"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Pro Tip Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase text-center italic">
            * Sudara Hub is not responsible for payments made to closed stores.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      <Footer />
      
      <style>{`
        .scrollbar-custom::-webkit-scrollbar { height: 4px; width: 3px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
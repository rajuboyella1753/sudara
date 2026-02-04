import { useEffect, useState } from "react";
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
  const [itemSearch, setItemSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null); 
  const [showQRModal, setShowQRModal] = useState(false); 

  const [cart, setCart] = useState({}); 
  const [showReviews, setShowReviews] = useState(false); 
  const [newComment, setNewComment] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // ఆర్డర్ ఫామ్ స్టేట్స్
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({ name: "", phone: "", txId: "", arrivalTime: "" });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const oRes = await api.get(`/owner/${id}`);
        setOwner(oRes.data);

        const iRes = await api.get("/items/all");
        const filteredItems = iRes.data.filter(i => (i.ownerId?._id || i.ownerId)?.toString() === id?.toString());

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

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
    if (isFavorite) favorites = favorites.filter(favId => favId !== id);
    else favorites.push(id);
    localStorage.setItem("favRestaurants", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  // ✅ షేర్ ఫంక్షన్: రెస్టారెంట్ వివరాలను ఫ్రెండ్స్ కి పంపడానికి
  const handleShareRestaurant = () => {
    const shareText = `అరేయ్, ఈ హోటల్ చూడు సూపర్ ఉంది! 😍\n\n🏨 *${owner.name}*\n📍 ${owner.collegeName}\n\nమెనూ చూడటానికి ఇక్కడ క్లిక్ చేయి: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: owner.name, text: shareText, url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

  const handleDirectUPI = () => {
    const upiID = owner.upiID; 
    if(!upiID) return alert("Owner UPI ID not found! ❌");
    const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(owner.name)}&am=${halfAmount}&cu=INR&tn=PreOrder_${encodeURIComponent(owner.name)}`;
    window.location.href = upiUrl;
  };

  const handleConfirmOrder = () => {
    if (!orderData.name || !orderData.phone || !orderData.txId) return alert("Please fill details! 📝");
    const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`).join(", ");
    const message = `*NEW PRE-ORDER - SUDARA HUB*\n\n*Name:* ${orderData.name}\n*Phone:* ${orderData.phone}\n*Items:* ${itemList}\n*Paid:* ₹${halfAmount}\n*Txn ID (Last 5):* ${orderData.txId}\n*Arrival Time:* ${orderData.arrivalTime}\n\n_Confirm order and start cooking!_`;
    
    window.open(`https://wa.me/${owner.phone}?text=${encodeURIComponent(message)}`, "_blank");
    setShowOrderForm(false);
  };

  const searchFiltered = items.filter(item => {
    const matchesFilter = filter === "All" ? true : item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableItems = searchFiltered.filter(item => item.isAvailable);
  const soldOutItems = searchFiltered.filter(item => !item.isAvailable);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest text-[10px]">Scanning Menu...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      
      {/* --- HEADER SECTION --- */}
      <div className="relative h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden bg-slate-100">
          {owner.hotelImage && <img src={owner.hotelImage} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[1px]" alt="" />}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10"></div>
          
          <div className="relative z-10 text-center px-4">
              <h1 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                {owner.name}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-xs mt-3">
                {owner.collegeName} • Exclusive Menu
              </p>
          </div>

          <div className="absolute top-4 right-4 flex gap-2 z-20">
             <button onClick={handleShareRestaurant} className="bg-white p-2.5 rounded-full shadow-md text-slate-600 border"><Share2 className="w-4 h-4" /></button>
             <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${owner.latitude},${owner.longitude}`)} className="bg-white p-2.5 rounded-full shadow-md text-blue-600 border"><Navigation className="w-4 h-4" /></button>
             <button onClick={toggleFavorite} className="bg-white p-2.5 rounded-full shadow-md border"><Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} /></button>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT CONTENT --- */}
        <div className="order-2 lg:order-1 lg:col-span-8 space-y-8">
            {/* Gallery Section */}
            {owner.interiorImages?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3"><h3 className="text-xs font-black uppercase text-slate-800 tracking-widest italic">Restaurant Ambience</h3></div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {owner.interiorImages.map((img, idx) => (
                    <img key={idx} src={img} onClick={() => setSelectedImg(img)} className="w-72 h-48 object-cover rounded-[2rem] border shadow-sm shrink-0 cursor-zoom-in" alt="" />
                  ))}
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="sticky top-20 z-30 bg-white/95 py-2 border-b space-y-4">
                <div className="relative">
                    <input type="text" placeholder="Search dish..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="w-full bg-slate-50 border py-3 px-10 rounded-full text-xs font-bold outline-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {["All", "Veg", "Non-Veg"].map((cat) => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all shrink-0 ${filter === cat ? "bg-slate-900 text-white" : "bg-white text-slate-400"}`}>{cat}</button>
                  ))}
                </div>
            </div>

            {/* ✅ ఐటమ్స్ బాక్స్ - మొబైల్‌లో ఫుల్ నేమ్ కనిపించేలా సింపుల్ లేఅవుట్ */}
            <div className="max-h-[800px] overflow-y-auto pr-1 scrollbar-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                    {availableItems.map((item) => (
                        <div key={item._id} className="bg-white p-3 rounded-3xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative shrink-0">
                                    <img src={item.image || `https://ui-avatars.com/api/?name=${item.name}`} className="w-16 h-16 rounded-2xl object-cover border shadow-sm" alt="" />
                                    <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div className="min-w-0 flex-1">
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

            {/* Reviews Section - పాత ఫీచర్స్ తీసేయలేదు రాజు */}
            <div className="mt-8 border-t pt-6">
                <button onClick={() => setShowReviews(!showReviews)} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 mb-6">{showReviews ? "Close Reviews" : "Campus Stories"} <Plus className={`w-3 h-3 transition-all ${showReviews ? 'rotate-45 text-red-500' : ''}`} /></button>
                <AnimatePresence>
                    {showReviews && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border">
                                <textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="How was it?" className="w-full bg-white p-3 rounded-xl text-xs outline-none h-20 mb-3" />
                                <button onClick={handlePostReview} disabled={isSubmitting} className="w-full bg-slate-900 text-white py-3 rounded-lg font-black uppercase text-[9px]">{isSubmitting ? "..." : "Post Review"}</button>
                            </div>
                            {owner.reviews?.map((rev, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl mb-3 border shadow-sm flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-blue-600 uppercase">Student Peer • {new Date(rev.createdAt).toLocaleDateString()}</span>
                                    <p className="text-xs italic font-medium">"{rev.comment}"</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div className="order-1 lg:order-2 lg:col-span-4">
           <div className="bg-white p-4 rounded-2xl lg:sticky lg:top-32 shadow-lg border border-slate-100">
             <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
               <span className="text-[9px] font-black uppercase text-blue-600 italic">Order Summary</span>
               <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto">
                 {Object.values(cart).map((i) => (<div key={i._id} className="flex justify-between text-[10px] font-bold italic"><span>{i.qty} x {i.name}</span><span>₹{i.price * i.qty}</span></div>))}
               </div>
               <div className="border-t border-blue-100 pt-2 flex justify-between text-base font-black italic"><span>Pay (50%):</span><span className="text-blue-600">₹{halfAmount}</span></div>
             </div>
             
             {/* 🚀 BUTTONS CONTAINER */}
             <div className="flex flex-col gap-3">
               <button onClick={() => totalAmount > 0 ? setShowOrderForm(true) : alert("Select items!")} className={`w-full py-3 rounded-lg font-black uppercase text-[10px] tracking-widest ${owner.isStoreOpen && totalAmount > 0 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                 Pre-Order Now
               </button>

               {/* ✅ రాజు, ఇక్కడ కొత్తగా "Call to Owner" బటన్ యాడ్ చేశాను */}
               <a 
                 href={`tel:${owner.phone}`} 
                 className="w-full py-3 rounded-lg font-black uppercase text-[10px] tracking-widest bg-blue-600 text-white shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
               >
                 <PhoneCall className="w-3.5 h-3.5" /> Call to Owner
               </a>
             </div>
           </div>
        </div>
      </main>

      {/* ✅ ORDER MODAL (Compact Design) */}
      <AnimatePresence>
        {showOrderForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-2xl relative">
              <button onClick={() => setShowOrderForm(false)} className="absolute top-4 right-4 text-slate-300"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-black italic uppercase mb-6">Checkout</h2>
              <div className="space-y-2.5 mb-6">
                <button onClick={handleDirectUPI} className="w-full py-3 bg-blue-600 text-white rounded-lg font-black uppercase text-[10px] flex items-center justify-center gap-2 mb-2">Pay ₹{halfAmount} via UPI</button>
                <input type="text" placeholder="Name" value={orderData.name} onChange={(e)=>setOrderData({...orderData, name:e.target.value})} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
                <input type="number" placeholder="WhatsApp No" value={orderData.phone} onChange={(e)=>setOrderData({...orderData, phone:e.target.value})} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
                <input type="text" placeholder="Arrival Time" value={orderData.arrivalTime} onChange={(e)=>setOrderData({...orderData, arrivalTime:e.target.value})} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
                <input type="number" placeholder="Txn ID (Last 5)" value={orderData.txId} onChange={(e)=>setOrderData({...orderData, txId:e.target.value})} className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs" />
              </div>
              <button onClick={handleConfirmOrder} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send to owner</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      
      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 3px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}